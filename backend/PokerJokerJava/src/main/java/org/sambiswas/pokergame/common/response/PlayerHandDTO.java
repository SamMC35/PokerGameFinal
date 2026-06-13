package org.sambiswas.pokergame.common.response;

import org.sambiswas.pokergame.common.entity.Card;
import org.sambiswas.pokergame.common.enums.Hand;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public class PlayerHandDTO {
    private UUID playerId;
    private String playerName;
    private Map<String, Object> characterJson;
    private List<Card> holeCards;
    private Hand bestHand;
    private boolean folded;
    private boolean winner;
    private int finalWallet;

    public UUID getPlayerId() { return playerId; }
    public void setPlayerId(UUID playerId) { this.playerId = playerId; }
    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }
    public Map<String, Object> getCharacterJson() { return characterJson; }
    public void setCharacterJson(Map<String, Object> characterJson) { this.characterJson = characterJson; }
    public List<Card> getHoleCards() { return holeCards; }
    public void setHoleCards(List<Card> holeCards) { this.holeCards = holeCards; }
    public Hand getBestHand() { return bestHand; }
    public void setBestHand(Hand bestHand) { this.bestHand = bestHand; }
    public boolean isFolded() { return folded; }
    public void setFolded(boolean folded) { this.folded = folded; }
    public boolean isWinner() { return winner; }
    public void setWinner(boolean winner) { this.winner = winner; }
    public int getFinalWallet() { return finalWallet; }
    public void setFinalWallet(int finalWallet) { this.finalWallet = finalWallet; }
}
