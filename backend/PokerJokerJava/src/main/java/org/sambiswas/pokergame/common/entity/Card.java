package org.sambiswas.pokergame.common.entity;
import lombok.Data;
import org.sambiswas.pokergame.common.enums.Rank;
import org.sambiswas.pokergame.common.enums.Suit;

@Data
public class Card {
    private Suit suit;
    private Rank rank;
}
