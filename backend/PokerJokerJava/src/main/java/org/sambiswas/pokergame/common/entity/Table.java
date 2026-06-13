package org.sambiswas.pokergame.common.entity;

import lombok.Data;
import org.sambiswas.pokergame.common.enums.TableState;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
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
}
