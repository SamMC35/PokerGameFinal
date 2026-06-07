package org.sambiswas.pokergame.repository;

import org.sambiswas.pokergame.common.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, String> {
    boolean existsByRoomName(String roomName);
}
