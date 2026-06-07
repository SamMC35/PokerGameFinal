package org.sambiswas.pokergame.service.impl;

import org.sambiswas.pokergame.common.entity.Player;
import org.sambiswas.pokergame.common.entity.Room;
import org.sambiswas.pokergame.common.entity.User;
import org.sambiswas.pokergame.common.exception.RoomException;
import org.sambiswas.pokergame.common.request.RoomRequestDTO;
import org.sambiswas.pokergame.repository.RoomRepository;
import org.sambiswas.pokergame.repository.UserRepository;
import org.sambiswas.pokergame.service.RoomService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;


@Service
public class RoomServiceImpl implements RoomService {
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    private final SimpMessagingTemplate simpMessagingTemplate;

    public RoomServiceImpl(RoomRepository roomRepository, UserRepository userRepository, SimpMessagingTemplate simpMessagingTemplate) {
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    //Table vs pot value
    Map<String, Integer> tableVsPotMap = new HashMap<>();

    //Table vs player list
    Map<String, List<Player>> tableVsPlayerMap = new HashMap<>();

    @Override
    public Room createRoom(RoomRequestDTO roomRequestDTO) {
        if(!roomRepository.existsByRoomName(roomRequestDTO.getRoomName())){
            Room room = new Room();
            room.setRoomName(roomRequestDTO.getRoomName());
            room.setStartingMoney(roomRequestDTO.getStartingMoney());
            room.setPlayerIds(new ArrayList<>());

            room.getPlayerIds().add(roomRequestDTO.getAdminPlayerId());
            room.setAdminPlayerId(roomRequestDTO.getAdminPlayerId());

            room.setGameOn(false);

            Room save = roomRepository.save(room);

            simpMessagingTemplate.convertAndSend(
                    "/topic/room/" + save.getRoomId() + "/players",
                    userRepository.findById(save.getAdminPlayerId()).get()
            );
            return save;
        }

        throw new RoomException("Room with name " + roomRequestDTO.getRoomName() + " already exists");
    }

    @Override
    public Room getRoom(String roomId) {
        Optional<Room> room = roomRepository.findById(roomId);
        if(room.isPresent()) {
            return room.get();
        }
        throw new RoomException("Room not found");
    }

    @Override
    public void addPlayerToRoom(String roomId, UUID userId) {
        Optional<Room> room = roomRepository.findById(roomId);
        Optional<User> user = userRepository.findById(userId);
        if(room.isEmpty()) {
            throw new RoomException("Room with id " + roomId + " does not exist");
        }
        if(user.isEmpty()) {
            throw new RoomException("User with id " + userId + " does not exist");
        }
        Room room1 = room.get();
        room1.getPlayerIds().add(userId);
        roomRepository.save(room1);
        List<User> allPlayers = userRepository.findAllById(room1.getPlayerIds());
        simpMessagingTemplate.convertAndSend("/topic/room/" + roomId + "/players", allPlayers);
    }

    @Override
    public void startRoom(String roomId) {
        Optional<Room> room = roomRepository.findById(roomId);
        if(room.isEmpty()) {
            throw new RoomException("Room with id " + roomId + " does not exist");
        }

        Room room1 = room.get();
        room1.setGameOn(true);

        roomRepository.save(room1);

        List<User> allPlayers = userRepository.findAllById(room1.getPlayerIds());

        tableVsPotMap.put(room1.getRoomId(), 0);
        tableVsPlayerMap.put(room1.getRoomId(), allPlayers.stream()
                .map(user -> Player.from(user, room1.getStartingMoney())).toList());

        simpMessagingTemplate.convertAndSend("/topic/room/" + roomId + "/state",
                Map.of("isGameOn", room1.isGameOn()));
    }
}
