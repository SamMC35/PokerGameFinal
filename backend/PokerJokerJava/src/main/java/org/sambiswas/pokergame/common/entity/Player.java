package org.sambiswas.pokergame.common.entity;

import lombok.Data;
import org.sambiswas.pokergame.common.enums.PlayerState;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class Player {
    private UUID userId;

    private int bet = 0;
    private PlayerState currentState = PlayerState.WAITING;

    private List<Card> hand = new ArrayList<>(2);

    private int wallet;

    public static Player from(User user, int startingMoney) {
        Player player = new Player();

        player.userId = user.getId();
        player.wallet = startingMoney;

        return player;
    }
}
