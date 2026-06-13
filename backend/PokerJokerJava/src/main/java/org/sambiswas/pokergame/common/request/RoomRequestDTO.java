package org.sambiswas.pokergame.common.request;

import java.util.UUID;

public class RoomRequestDTO {
    private String roomName;
    private int startingMoney;
    private UUID adminPlayerId;

    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }
    public int getStartingMoney() { return startingMoney; }
    public void setStartingMoney(int startingMoney) { this.startingMoney = startingMoney; }
    public UUID getAdminPlayerId() { return adminPlayerId; }
    public void setAdminPlayerId(UUID adminPlayerId) { this.adminPlayerId = adminPlayerId; }
}
