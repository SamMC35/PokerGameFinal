package org.sambiswas.pokergame.service;

import org.sambiswas.pokergame.common.entity.Card;
import org.sambiswas.pokergame.common.entity.Player;
import org.sambiswas.pokergame.common.enums.Hand;

import java.util.List;

public interface HandService {
    Hand calculateHandWithTable(List<Card> cardList);
    Player findWinner(List<Player> activePlayers, List<Card> communityCards);
}
