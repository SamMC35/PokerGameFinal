package org.sambiswas.pokergame.common.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Table(name = "poker_rooms")
@Entity
@Data
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
}
