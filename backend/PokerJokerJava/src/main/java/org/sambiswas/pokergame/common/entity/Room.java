package org.sambiswas.pokergame.common.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@jakarta.persistence.Table(name = "poker_rooms")
@Entity
public class Room {
    @Id
    private String roomId;

    private String roomName;
    private int startingMoney;
    private boolean isGameOn;
    private UUID adminPlayerId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "room_players",
            joinColumns = @JoinColumn(name = "room_id")
    )
    @Column(name = "player_id")
    private List<UUID> playerIds = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.roomId = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
    }

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }
    public int getStartingMoney() { return startingMoney; }
    public void setStartingMoney(int startingMoney) { this.startingMoney = startingMoney; }
    public boolean isGameOn() { return isGameOn; }
    public void setGameOn(boolean gameOn) { this.isGameOn = gameOn; }
    public UUID getAdminPlayerId() { return adminPlayerId; }
    public void setAdminPlayerId(UUID adminPlayerId) { this.adminPlayerId = adminPlayerId; }
    public List<UUID> getPlayerIds() { return playerIds; }
    public void setPlayerIds(List<UUID> playerIds) { this.playerIds = playerIds; }
}
