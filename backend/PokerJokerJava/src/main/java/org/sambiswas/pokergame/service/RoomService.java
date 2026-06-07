package org.sambiswas.pokergame.service;

import org.sambiswas.pokergame.common.entity.Room;
import org.sambiswas.pokergame.common.request.RoomRequestDTO;

import java.util.UUID;

public interface RoomService {
    Room createRoom(RoomRequestDTO roomRequestDTO);

    Room getRoom(String roomId);

    void addPlayerToRoom(String roomId, UUID userId);

    void startRoom(String roomId);
}
