package org.sambiswas.pokergame.service.impl;

import org.sambiswas.pokergame.common.entity.Card;
import org.sambiswas.pokergame.common.entity.Player;
import org.sambiswas.pokergame.common.entity.Room;
import org.sambiswas.pokergame.common.entity.Table;
import org.sambiswas.pokergame.common.entity.User;
import org.sambiswas.pokergame.common.enums.Hand;
import org.sambiswas.pokergame.common.enums.PlayerAction;
import org.sambiswas.pokergame.common.enums.PlayerPosition;
import org.sambiswas.pokergame.common.enums.PlayerState;
import org.sambiswas.pokergame.common.enums.TableState;
import org.sambiswas.pokergame.common.exception.RoomException;
import org.sambiswas.pokergame.common.request.PlayerActionRequestDTO;
import org.sambiswas.pokergame.common.request.RoomRequestDTO;
import org.sambiswas.pokergame.common.response.PlayerHandDTO;
import org.sambiswas.pokergame.common.response.ShowdownDTO;
import org.sambiswas.pokergame.repository.RoomRepository;
import org.sambiswas.pokergame.repository.UserRepository;
import org.sambiswas.pokergame.service.DeckService;
import org.sambiswas.pokergame.service.HandService;
import org.sambiswas.pokergame.service.RoomService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final DeckService deckService;
    private final HandService handService;

    // roomId → active Table (in-memory; resets on server restart)
    private final Map<String, Table> roomVsTable = new HashMap<>();

    public RoomServiceImpl(
            RoomRepository roomRepository,
            UserRepository userRepository,
            SimpMessagingTemplate simpMessagingTemplate,
            DeckService deckService,
            HandService handService) {
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.simpMessagingTemplate = simpMessagingTemplate;
        this.deckService = deckService;
        this.handService = handService;
    }

    // ── Room management ──────────────────────────────────────────────────────

    @Override
    public Room createRoom(RoomRequestDTO roomRequestDTO) {
        if (!roomRepository.existsByRoomName(roomRequestDTO.getRoomName())) {
            Room room = new Room();
            room.setRoomName(roomRequestDTO.getRoomName());
            room.setStartingMoney(roomRequestDTO.getStartingMoney());
            room.setPlayerIds(new ArrayList<>());
            room.getPlayerIds().add(roomRequestDTO.getAdminPlayerId());
            room.setAdminPlayerId(roomRequestDTO.getAdminPlayerId());
            room.setGameOn(false);
            Room saved = roomRepository.save(room);
            userRepository.findById(saved.getAdminPlayerId()).ifPresent(user ->
                    simpMessagingTemplate.convertAndSend(
                            "/topic/room/" + saved.getRoomId() + "/players", user));
            return saved;
        }
        throw new RoomException("Room with name " + roomRequestDTO.getRoomName() + " already exists");
    }

    @Override
    public Room getRoom(String roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new RoomException("Room not found"));
    }

    @Override
    public List<User> addPlayerToRoom(String roomId, UUID userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RoomException("Room " + roomId + " does not exist"));
        userRepository.findById(userId)
                .orElseThrow(() -> new RoomException("User " + userId + " does not exist"));
        if (!room.getPlayerIds().contains(userId)) {
            room.getPlayerIds().add(userId);
            roomRepository.save(room);
        }
        List<User> allPlayers = userRepository.findAllById(room.getPlayerIds());
        // Broadcast for late-joiners still listening on WebSocket
        simpMessagingTemplate.convertAndSend("/topic/room/" + roomId + "/players", allPlayers);
        // Also return in HTTP response so the caller doesn't race the WebSocket
        return allPlayers;
    }

    // ── Game start ───────────────────────────────────────────────────────────

    @Override
    public void startRoom(String roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RoomException("Room " + roomId + " does not exist"));
        room.setGameOn(true);
        roomRepository.save(room);

        List<Player> players = new ArrayList<>(
                userRepository.findAllById(room.getPlayerIds())
                        .stream().map(u -> Player.from(u, room.getStartingMoney())).toList());
        Collections.shuffle(players);

        List<Card> deck = deckService.generateDeck();
        deckService.shuffleDeck(deck);

        Table table = new Table();
        table.setPlayerList(players);
        table.setDeck(deck);
        table.setCommunityCards(new ArrayList<>());

        initHand(table, 0);  // dealer starts at index 0

        roomVsTable.put(roomId, table);

        simpMessagingTemplate.convertAndSend("/topic/room/" + roomId + "/state",
                Map.of("isGameOn", true));
        broadcastGameState(roomId, table);
    }

    // ── Next hand ────────────────────────────────────────────────────────────

    @Override
    public synchronized void nextHand(String roomId) {
        Table table = requireTable(roomId);

        // Rotate dealer
        int n = table.getPlayerList().size();
        int nextDealer = (table.getDealerIndex() + 1) % n;

        // Remove busted players (wallet == 0)
        table.getPlayerList().removeIf(p -> p.getWallet() == 0);
        if (table.getPlayerList().size() < 2) {
            simpMessagingTemplate.convertAndSend("/topic/room/" + roomId + "/gameOver",
                    Map.of("message", "Not enough players to continue"));
            return;
        }

        // Reset for new hand
        List<Card> deck = deckService.generateDeck();
        deckService.shuffleDeck(deck);
        table.setDeck(deck);
        table.setCommunityCards(new ArrayList<>());
        table.setPot(0);

        // Clamp dealer index if players were removed
        nextDealer = nextDealer % table.getPlayerList().size();
        initHand(table, nextDealer);

        broadcastGameState(roomId, table);
    }

    // ── Close room ──────────────────────────────────────────────────────────

    @Override
    public synchronized void closeRoom(String roomId) {
        roomVsTable.remove(roomId);
        roomRepository.findById(roomId).ifPresent(room -> {
            room.setGameOn(false);
            roomRepository.delete(room);
        });
        simpMessagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/closed",
                Map.of("message", "Room closed"));
    }

    // ── Player action ────────────────────────────────────────────────────────

    @Override
    public synchronized void playerAction(PlayerActionRequestDTO dto) {
        Table table = requireTable(dto.getRoomId());
        List<Player> players = table.getPlayerList();

        Player current = players.get(table.getCurrentPlayerIndex());
        if (!current.getUserId().equals(dto.getPlayerId())) {
            throw new RoomException("Not your turn");
        }
        if (table.getTableState() == TableState.SHOWDOWN) {
            throw new RoomException("Hand is over, start next hand");
        }

        applyAction(table, current, dto.getAction(), dto.getRaiseAmount());

        // Check for single active player — early win
        List<Player> active = activePlayers(players);
        if (active.size() == 1) {
            doShowdown(dto.getRoomId(), table);
            return;
        }

        advanceCurrentPlayer(table);
        markCurrentPlayer(table);

        if (isRoundOver(table)) {
            advanceStreet(dto.getRoomId(), table);
        } else {
            broadcastGameState(dto.getRoomId(), table);
        }
    }

    // ── Private: hand init ───────────────────────────────────────────────────

    private void initHand(Table table, int dealerIndex) {
        List<Player> players = table.getPlayerList();
        int n = players.size();

        table.setDealerIndex(dealerIndex);
        table.setSmallBlind(10);
        table.setBigBlind(20);
        table.setCurrentBet(table.getBigBlind());
        table.setTableState(TableState.PRE_FLOP);

        // Reset all player states / bets / hands
        for (Player p : players) {
            p.setBet(0);
            p.setHand(new ArrayList<>());
            p.setCurrentState(PlayerState.WAITING);
            p.setCurrentPlayer(false);
            p.setPlayerPosition(PlayerPosition.NORMAL);
        }

        // Assign positions
        int sbIdx, bbIdx, firstActIdx;
        if (n == 2) {
            // Heads-up: dealer = SB
            sbIdx = dealerIndex;
            bbIdx = (dealerIndex + 1) % n;
            firstActIdx = dealerIndex; // SB acts first pre-flop in HU
        } else {
            sbIdx = (dealerIndex + 1) % n;
            bbIdx = (dealerIndex + 2) % n;
            firstActIdx = (dealerIndex + 3) % n;
        }

        players.get(dealerIndex).setPlayerPosition(PlayerPosition.DEALER);
        players.get(sbIdx).setPlayerPosition(PlayerPosition.SMALL_BLIND);
        players.get(bbIdx).setPlayerPosition(PlayerPosition.BIG_BLIND);

        table.setBigBlindIndex(bbIdx);

        // Post blinds
        postBlind(table, players.get(sbIdx), table.getSmallBlind());
        postBlind(table, players.get(bbIdx), table.getBigBlind());

        // SB needs to respond to BB; BB gets option to check/raise
        players.get(sbIdx).setCurrentState(PlayerState.WAITING_FOR_RAISE);
        // BB stays WAITING — they act last pre-flop

        // Deal hole cards
        for (Player p : players) {
            p.setHand(List.of(drawCard(table), drawCard(table)));
        }

        table.setCurrentPlayerIndex(firstActIdx);
        markCurrentPlayer(table);
    }

    // ── Private: action application ──────────────────────────────────────────

    private void applyAction(Table table, Player player, PlayerAction action, int raiseAmount) {
        switch (action) {
            case FOLD:
                player.setCurrentState(PlayerState.FOLDED);
                break;

            case CHECK:
                if (table.getCurrentBet() != player.getBet()) {
                    throw new RoomException("Cannot check — there is a bet to call");
                }
                player.setCurrentState(PlayerState.CHECKED);
                break;

            case CALL: {
                int toCall = Math.min(table.getCurrentBet() - player.getBet(), player.getWallet());
                player.setWallet(player.getWallet() - toCall);
                player.setBet(player.getBet() + toCall);
                table.setPot(table.getPot() + toCall);
                player.setCurrentState(PlayerState.CALLED);
                break;
            }

            case RAISE: {
                if (raiseAmount <= table.getCurrentBet()) {
                    throw new RoomException("Raise must exceed current bet of " + table.getCurrentBet());
                }
                int toAdd = raiseAmount - player.getBet();
                if (toAdd > player.getWallet()) {
                    throw new RoomException("Insufficient chips");
                }
                player.setWallet(player.getWallet() - toAdd);
                player.setBet(raiseAmount);
                table.setPot(table.getPot() + toAdd);
                table.setCurrentBet(raiseAmount);
                player.setCurrentState(PlayerState.RAISED);

                // All other active players must respond to the raise
                table.getPlayerList().stream()
                        .filter(p -> !p.getUserId().equals(player.getUserId())
                                && p.getCurrentState() != PlayerState.FOLDED)
                        .forEach(p -> p.setCurrentState(PlayerState.WAITING_FOR_RAISE));
                break;
            }
        }
    }

    // ── Private: street advancement ──────────────────────────────────────────

    private void advanceStreet(String roomId, Table table) {
        // Reset per-street bets and mark all active players as WAITING
        table.getPlayerList().stream()
                .filter(p -> p.getCurrentState() != PlayerState.FOLDED)
                .forEach(p -> {
                    p.setBet(0);
                    p.setCurrentState(PlayerState.WAITING);
                });
        table.setCurrentBet(0);

        switch (table.getTableState()) {
            case PRE_FLOP:
                table.setTableState(TableState.FLOP);
                table.getCommunityCards().add(drawCard(table));
                table.getCommunityCards().add(drawCard(table));
                table.getCommunityCards().add(drawCard(table));
                break;
            case FLOP:
                table.setTableState(TableState.TURN);
                table.getCommunityCards().add(drawCard(table));
                break;
            case TURN:
                table.setTableState(TableState.RIVER);
                table.getCommunityCards().add(drawCard(table));
                break;
            case RIVER:
                doShowdown(roomId, table);
                return;
            default:
                break;
        }

        setFirstPlayerForStreet(table);
        markCurrentPlayer(table);
        broadcastGameState(roomId, table);
    }

    // ── Private: showdown ────────────────────────────────────────────────────

    private void doShowdown(String roomId, Table table) {
        table.setTableState(TableState.SHOWDOWN);

        List<Player> active = activePlayers(table.getPlayerList());

        Player winner;
        Map<UUID, Hand> bestHands = new HashMap<>();

        if (active.size() == 1) {
            winner = active.get(0);
        } else {
            for (Player p : active) {
                List<Card> combined = new ArrayList<>(p.getHand());
                combined.addAll(table.getCommunityCards());
                bestHands.put(p.getUserId(), handService.calculateHandWithTable(combined));
            }
            winner = active.stream()
                    .max(Comparator.comparingInt(p ->
                            bestHands.getOrDefault(p.getUserId(), Hand.HIGH_CARD).getValue()))
                    .orElse(active.get(0));
        }

        int pot = table.getPot();
        winner.setWallet(winner.getWallet() + pot);
        table.setPot(0);

        // Build showdown payload
        List<PlayerHandDTO> handDTOs = table.getPlayerList().stream().map(p -> {
            PlayerHandDTO dto = new PlayerHandDTO();
            dto.setPlayerId(p.getUserId());
            dto.setPlayerName(p.getUserName());
            dto.setCharacterJson(p.getCharacterJson());
            dto.setHoleCards(p.getHand());
            dto.setFolded(p.getCurrentState() == PlayerState.FOLDED);
            dto.setWinner(p.getUserId().equals(winner.getUserId()));
            dto.setFinalWallet(p.getWallet());
            dto.setBestHand(bestHands.getOrDefault(p.getUserId(), null));
            return dto;
        }).collect(Collectors.toList());

        ShowdownDTO showdown = new ShowdownDTO();
        showdown.setWinnerId(winner.getUserId());
        showdown.setWinnerName(winner.getUserName());
        showdown.setWinAmount(pot);
        showdown.setPlayerHands(handDTOs);

        // Check if the game is over: only one player still has chips
        List<Player> stillAlive = table.getPlayerList().stream()
                .filter(p -> p.getWallet() > 0)
                .collect(Collectors.toList());
        if (stillAlive.size() <= 1) {
            Player gameWinner = stillAlive.isEmpty() ? winner : stillAlive.get(0);
            showdown.setGameOver(true);
            showdown.setGameWinnerId(gameWinner.getUserId());
            showdown.setGameWinnerName(gameWinner.getUserName());
        }

        broadcastGameState(roomId, table);
        simpMessagingTemplate.convertAndSend("/topic/room/" + roomId + "/showdown", showdown);
    }

    // ── Private: helpers ─────────────────────────────────────────────────────

    private void postBlind(Table table, Player player, int amount) {
        int actual = Math.min(amount, player.getWallet());
        player.setWallet(player.getWallet() - actual);
        player.setBet(actual);
        table.setPot(table.getPot() + actual);
    }

    private Card drawCard(Table table) {
        List<Card> deck = table.getDeck();
        if (deck.isEmpty()) throw new RoomException("Deck is empty");
        return deck.remove(deck.size() - 1);
    }

    private boolean isRoundOver(Table table) {
        // Round ends when no active player is still waiting to act
        return table.getPlayerList().stream()
                .filter(p -> p.getCurrentState() != PlayerState.FOLDED)
                .noneMatch(p -> p.getCurrentState() == PlayerState.WAITING
                             || p.getCurrentState() == PlayerState.WAITING_FOR_RAISE);
    }

    private void advanceCurrentPlayer(Table table) {
        List<Player> players = table.getPlayerList();
        int size = players.size();
        int next = (table.getCurrentPlayerIndex() + 1) % size;
        int safety = 0;
        while (players.get(next).getCurrentState() == PlayerState.FOLDED) {
            next = (next + 1) % size;
            if (++safety > size) break;
        }
        table.setCurrentPlayerIndex(next);
    }

    private void setFirstPlayerForStreet(Table table) {
        List<Player> players = table.getPlayerList();
        int size = players.size();
        // Post-flop action begins with first active player left of dealer
        int start = (table.getDealerIndex() + 1) % size;
        for (int i = 0; i < size; i++) {
            int idx = (start + i) % size;
            if (players.get(idx).getCurrentState() != PlayerState.FOLDED) {
                table.setCurrentPlayerIndex(idx);
                return;
            }
        }
    }

    private void markCurrentPlayer(Table table) {
        List<Player> players = table.getPlayerList();
        for (int i = 0; i < players.size(); i++) {
            players.get(i).setCurrentPlayer(i == table.getCurrentPlayerIndex());
        }
    }

    private List<Player> activePlayers(List<Player> players) {
        return players.stream()
                .filter(p -> p.getCurrentState() != PlayerState.FOLDED)
                .collect(Collectors.toList());
    }

    private Table requireTable(String roomId) {
        Table table = roomVsTable.get(roomId);
        if (table == null) throw new RoomException("No active game for room " + roomId);
        return table;
    }

    @Override
    public Table getTableDetails(String roomId) {
        return roomVsTable.get(roomId);
    }

    private void broadcastGameState(String roomId, Table table) {
        simpMessagingTemplate.convertAndSend("/topic/room/" + roomId + "/gameState", table);
    }
}
