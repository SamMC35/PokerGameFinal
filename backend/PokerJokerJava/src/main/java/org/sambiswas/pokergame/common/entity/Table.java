package org.sambiswas.pokergame.common.entity;

import org.sambiswas.pokergame.common.enums.TableState;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Table {
    private UUID id = UUID.randomUUID();
    private List<Player> playerList = new ArrayList<>();
    private int pot = 0;
    private TableState tableState = TableState.WAITING_FOR_PLAYERS;
    private List<Card> deck;
    private List<Card> communityCards = new ArrayList<>();
    private int currentPlayerIndex = 0;
    private int currentBet = 0;
    private int smallBlind = 10;
    private int bigBlind = 20;
    private int dealerIndex = 0;
    private int bigBlindIndex = 0;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public List<Player> getPlayerList() { return playerList; }
    public void setPlayerList(List<Player> playerList) { this.playerList = playerList; }
    public int getPot() { return pot; }
    public void setPot(int pot) { this.pot = pot; }
    public TableState getTableState() { return tableState; }
    public void setTableState(TableState tableState) { this.tableState = tableState; }
    public List<Card> getDeck() { return deck; }
    public void setDeck(List<Card> deck) { this.deck = deck; }
    public List<Card> getCommunityCards() { return communityCards; }
    public void setCommunityCards(List<Card> communityCards) { this.communityCards = communityCards; }
    public int getCurrentPlayerIndex() { return currentPlayerIndex; }
    public void setCurrentPlayerIndex(int currentPlayerIndex) { this.currentPlayerIndex = currentPlayerIndex; }
    public int getCurrentBet() { return currentBet; }
    public void setCurrentBet(int currentBet) { this.currentBet = currentBet; }
    public int getSmallBlind() { return smallBlind; }
    public void setSmallBlind(int smallBlind) { this.smallBlind = smallBlind; }
    public int getBigBlind() { return bigBlind; }
    public void setBigBlind(int bigBlind) { this.bigBlind = bigBlind; }
    public int getDealerIndex() { return dealerIndex; }
    public void setDealerIndex(int dealerIndex) { this.dealerIndex = dealerIndex; }
    public int getBigBlindIndex() { return bigBlindIndex; }
    public void setBigBlindIndex(int bigBlindIndex) { this.bigBlindIndex = bigBlindIndex; }
}
