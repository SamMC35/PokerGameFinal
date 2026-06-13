package org.sambiswas.pokergame.common.entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.sambiswas.pokergame.common.enums.Rank;
import org.sambiswas.pokergame.common.enums.Suit;

@Data
@AllArgsConstructor
public class Card {
    private Suit suit;
    private Rank rank;
}
