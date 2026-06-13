package org.sambiswas.pokergame.common.request;

import org.sambiswas.pokergame.common.enums.PlayerAction;

import java.util.UUID;

public class PlayerActionRequestDTO {
    private String roomId;
    private UUID playerId;
    private PlayerAction action;
    private int raiseAmount;

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    public UUID getPlayerId() { return playerId; }
    public void setPlayerId(UUID playerId) { this.playerId = playerId; }
    public PlayerAction getAction() { return action; }
    public void setAction(PlayerAction action) { this.action = action; }
    public int getRaiseAmount() { return raiseAmount; }
    public void setRaiseAmount(int raiseAmount) { this.raiseAmount = raiseAmount; }
}
