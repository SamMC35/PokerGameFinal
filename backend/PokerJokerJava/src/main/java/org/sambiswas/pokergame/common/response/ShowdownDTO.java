package org.sambiswas.pokergame.common.response;

import java.util.List;
import java.util.UUID;

public class ShowdownDTO {
    private UUID winnerId;
    private String winnerName;
    private int winAmount;
    private List<PlayerHandDTO> playerHands;
    private boolean gameOver;
    private UUID gameWinnerId;
    private String gameWinnerName;

    public UUID getWinnerId() { return winnerId; }
    public void setWinnerId(UUID winnerId) { this.winnerId = winnerId; }
    public String getWinnerName() { return winnerName; }
    public void setWinnerName(String winnerName) { this.winnerName = winnerName; }
    public int getWinAmount() { return winAmount; }
    public void setWinAmount(int winAmount) { this.winAmount = winAmount; }
    public List<PlayerHandDTO> getPlayerHands() { return playerHands; }
    public void setPlayerHands(List<PlayerHandDTO> playerHands) { this.playerHands = playerHands; }
    public boolean isGameOver() { return gameOver; }
    public void setGameOver(boolean gameOver) { this.gameOver = gameOver; }
    public UUID getGameWinnerId() { return gameWinnerId; }
    public void setGameWinnerId(UUID gameWinnerId) { this.gameWinnerId = gameWinnerId; }
    public String getGameWinnerName() { return gameWinnerName; }
    public void setGameWinnerName(String gameWinnerName) { this.gameWinnerName = gameWinnerName; }
}
