package org.sambiswas.pokergame.common.entity;

import org.sambiswas.pokergame.common.enums.PlayerPosition;
import org.sambiswas.pokergame.common.enums.PlayerState;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class Player {
    private UUID userId;
    private String userName;
    private Map<String, Object> characterJson;
    private int bet = 0;
    private PlayerState currentState = PlayerState.WAITING;
    private PlayerPosition playerPosition = PlayerPosition.NORMAL;
    private List<Card> hand = new ArrayList<>(2);
    private int wallet;
    private boolean currentPlayer = false;

    public static Player from(User user, int startingMoney) {
        Player player = new Player();
        player.userId = user.getId();
        player.userName = user.getUserName();
        player.characterJson = user.getCharacterJson();
        player.wallet = startingMoney;
        return player;
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public Map<String, Object> getCharacterJson() { return characterJson; }
    public void setCharacterJson(Map<String, Object> characterJson) { this.characterJson = characterJson; }
    public int getBet() { return bet; }
    public void setBet(int bet) { this.bet = bet; }
    public PlayerState getCurrentState() { return currentState; }
    public void setCurrentState(PlayerState currentState) { this.currentState = currentState; }
    public PlayerPosition getPlayerPosition() { return playerPosition; }
    public void setPlayerPosition(PlayerPosition playerPosition) { this.playerPosition = playerPosition; }
    public List<Card> getHand() { return hand; }
    public void setHand(List<Card> hand) { this.hand = hand; }
    public int getWallet() { return wallet; }
    public void setWallet(int wallet) { this.wallet = wallet; }
    public boolean isCurrentPlayer() { return currentPlayer; }
    public void setCurrentPlayer(boolean currentPlayer) { this.currentPlayer = currentPlayer; }
}
