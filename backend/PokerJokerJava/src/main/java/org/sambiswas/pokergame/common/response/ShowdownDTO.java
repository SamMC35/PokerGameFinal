package org.sambiswas.pokergame.common.response;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ShowdownDTO {
    private UUID winnerId;
    private String winnerName;
    private int winAmount;
    private List<PlayerHandDTO> playerHands;
    private boolean gameOver;
    private UUID gameWinnerId;
    private String gameWinnerName;
}
