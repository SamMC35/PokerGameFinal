package org.sambiswas.pokergame.service;

import org.sambiswas.pokergame.common.entity.Room;
import org.sambiswas.pokergame.common.entity.Table;
import org.sambiswas.pokergame.common.entity.User;
import org.sambiswas.pokergame.common.request.PlayerActionRequestDTO;
import org.sambiswas.pokergame.common.request.RoomRequestDTO;

import java.util.List;
import java.util.UUID;

public interface RoomService {
    Room createRoom(RoomRequestDTO roomRequestDTO);

    Room getRoom(String roomId);

    List<User> addPlayerToRoom(String roomId, UUID userId);

    void startRoom(String roomId);

    void playerAction(PlayerActionRequestDTO dto);

    void nextHand(String roomId);

    void closeRoom(String roomId);

    Table getTableDetails(String roomId);
}
