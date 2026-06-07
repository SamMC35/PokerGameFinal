package org.sambiswas.pokergame.common.request;

import lombok.Data;

import java.util.UUID;

@Data
public class RoomRequestDTO {
    private String roomName;
    private int startingMoney;

    private UUID adminPlayerId;
}
