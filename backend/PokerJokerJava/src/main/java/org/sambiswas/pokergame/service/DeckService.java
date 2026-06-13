package org.sambiswas.pokergame.service;

import org.sambiswas.pokergame.common.entity.Card;

import java.util.List;

public interface DeckService {
    List<Card> generateDeck();
    void shuffleDeck(List<Card> deck);
}
