package org.sambiswas.pokergame.common.entity;

import lombok.Data;
import org.sambiswas.pokergame.common.enums.PlayerPosition;
import org.sambiswas.pokergame.common.enums.PlayerState;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class Player {
    private UUID userId;
    private String userName;
    private Map<String, Object> characterJson;

    private int bet = 0;

    private PlayerState currentState = PlayerState.WAITING;
    private PlayerPosition playerPosition = PlayerPosition.NORMAL;

    private List<Card> hand = new ArrayList<>(2);

    private int wallet;

    private boolean currentPlayer = false;

    public static Player from(User user, int startingMoney) {
        Player player = new Player();
        player.userId = user.getId();
        player.userName = user.getUserName();
        player.characterJson = user.getCharacterJson();
        player.wallet = startingMoney;
        return player;
    }
}
