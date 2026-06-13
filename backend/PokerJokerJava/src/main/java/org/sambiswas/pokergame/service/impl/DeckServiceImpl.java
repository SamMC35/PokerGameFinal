package org.sambiswas.pokergame.service.impl;

import org.sambiswas.pokergame.common.entity.Card;
import org.sambiswas.pokergame.common.enums.Rank;
import org.sambiswas.pokergame.common.enums.Suit;
import org.sambiswas.pokergame.service.DeckService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.IntStream;

@Service
public class DeckServiceImpl implements DeckService {

    @Override
    public List<Card> generateDeck() {
        List<Card> deck = new ArrayList<>();
        for(Rank rank : Rank.values()) {
            for(Suit suit : Suit.values()) {
                deck.add(new Card(suit, rank));
            }
        }
        return deck;
    }

    @Override
    public void shuffleDeck(List<Card> deck) {
        IntStream.range(0,5).forEach(i -> Collections.shuffle(deck));
    }
    
}
