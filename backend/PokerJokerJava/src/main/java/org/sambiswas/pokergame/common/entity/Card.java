package org.sambiswas.pokergame.common.entity;

import org.sambiswas.pokergame.common.enums.Rank;
import org.sambiswas.pokergame.common.enums.Suit;

public class Card {
    private Suit suit;
    private Rank rank;

    public Card(Suit suit, Rank rank) {
        this.suit = suit;
        this.rank = rank;
    }

    public Suit getSuit() { return suit; }
    public void setSuit(Suit suit) { this.suit = suit; }
    public Rank getRank() { return rank; }
    public void setRank(Rank rank) { this.rank = rank; }
}
