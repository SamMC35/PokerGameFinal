package org.sambiswas.pokergame.common.response;

import lombok.Data;
import org.sambiswas.pokergame.common.entity.Card;
import org.sambiswas.pokergame.common.enums.Hand;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class PlayerHandDTO {
    private UUID playerId;
    private String playerName;
    private Map<String, Object> characterJson;
    private List<Card> holeCards;
    private Hand bestHand;
    private boolean folded;
    private boolean winner;
    private int finalWallet;
}
