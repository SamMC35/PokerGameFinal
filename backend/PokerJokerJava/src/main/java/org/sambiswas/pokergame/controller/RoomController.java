package org.sambiswas.pokergame.controller;

import org.sambiswas.pokergame.common.entity.Room;
import org.sambiswas.pokergame.common.request.RoomRequestDTO;
import org.sambiswas.pokergame.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
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
    public void addPlayerToRoom(@RequestParam String roomId, @RequestParam String playerId) {
        roomService.addPlayerToRoom(roomId, UUID.fromString(playerId));
    }

    @PostMapping("/startRoom")
    public void startRoom(@RequestParam String roomId) {
        roomService.startRoom(roomId);
    }
}
