package org.sambiswas.pokergame.controller;

import org.sambiswas.pokergame.common.entity.Room;
import org.sambiswas.pokergame.common.entity.Table;
import org.sambiswas.pokergame.common.entity.User;
import org.sambiswas.pokergame.common.request.PlayerActionRequestDTO;
import org.sambiswas.pokergame.common.request.RoomRequestDTO;
import org.sambiswas.pokergame.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
public class RoomController {
    @Autowired
    private RoomService roomService;

    @GetMapping("/room")
    public ResponseEntity<Room> getRoom(@RequestParam String roomId) {
        return ResponseEntity.ok(roomService.getRoom(roomId));
    }

    @PostMapping("/room")
    public ResponseEntity<Room> createRoom(@RequestBody RoomRequestDTO roomRequestDTO) {
        return ResponseEntity.ok(roomService.createRoom(roomRequestDTO));
    }

    @PostMapping("/addPlayerToRoom")
    public ResponseEntity<List<User>> addPlayerToRoom(@RequestParam String roomId, @RequestParam String playerId) {
        List<User> players = roomService.addPlayerToRoom(roomId, UUID.fromString(playerId));
        return ResponseEntity.ok(players);
    }

    @PostMapping("/startRoom")
    public void startRoom(@RequestParam String roomId) {
        roomService.startRoom(roomId);
    }

    @PostMapping("/action")
    public void playerAction(@RequestBody PlayerActionRequestDTO dto) {
        roomService.playerAction(dto);
    }

    @PostMapping("/nextHand")
    public void nextHand(@RequestParam String roomId) {
        roomService.nextHand(roomId);
    }

    @PostMapping("/closeRoom")
    public void closeRoom(@RequestParam String roomId) {
        roomService.closeRoom(roomId);
    }

    // Polled by useRoomState on mount to catch late-joiners
    @GetMapping("/state")
    public ResponseEntity<Map<String, Object>> getRoomState(@RequestParam String roomId) {
        Room room = roomService.getRoom(roomId);
        return ResponseEntity.ok(Map.of("isGameOn", room.isGameOn()));
    }

    // Fetched by GamePage on mount to get current table without waiting for next broadcast
    @GetMapping("/tableState")
    public ResponseEntity<Table> getTableState(@RequestParam String roomId) {
        Table table = roomService.getTableDetails(roomId);
        if (table == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(table);
    }
}
