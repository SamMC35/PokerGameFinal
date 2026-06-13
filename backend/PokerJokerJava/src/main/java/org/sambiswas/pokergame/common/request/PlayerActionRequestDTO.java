package org.sambiswas.pokergame.common.request;

import lombok.Data;
import org.sambiswas.pokergame.common.enums.PlayerAction;

import java.util.UUID;

@Data
public class PlayerActionRequestDTO {
    private String roomId;
    private UUID playerId;
    private PlayerAction action;
    private int raiseAmount; // total bet amount when raising (0 otherwise)
}
