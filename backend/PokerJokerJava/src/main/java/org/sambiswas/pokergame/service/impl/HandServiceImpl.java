package org.sambiswas.pokergame.service.impl;

import org.sambiswas.pokergame.common.entity.Card;
import org.sambiswas.pokergame.common.entity.Player;
import org.sambiswas.pokergame.common.enums.Hand;
import org.sambiswas.pokergame.common.enums.PlayerState;
import org.sambiswas.pokergame.common.enums.Rank;
import org.sambiswas.pokergame.common.exception.PokerGameException;
import org.sambiswas.pokergame.service.HandService;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class HandServiceImpl implements HandService {

    @Override
    public Hand calculateHandWithTable(List<Card> cardList) {
        // Generates all C(n,5) five-card combos and returns the best hand
        List<List<Card>> combos = generateCombinations(cardList);
        return combos.stream()
                .map(this::calculateHand)
                .max(Comparator.comparingInt(Hand::getValue))
                .orElse(Hand.HIGH_CARD);
    }

    @Override
    public Player findWinner(List<Player> activePlayers, List<Card> communityCards) {
        return activePlayers.stream().max(Comparator.comparingInt(p -> {
            List<Card> combined = new ArrayList<>(p.getHand());
            combined.addAll(communityCards);
            return calculateHandWithTable(combined).getValue();
        })).orElse(activePlayers.get(0));
    }


    private Hand calculateHand(List<Card> cardList) {
        cardList = cardList.stream().sorted(Comparator.comparing(Card::getRank)).toList();

        if (cardList.size() != 5) {
            throw new PokerGameException("Card list must be exactly 5 cards");
        }

        if (checkFlush(cardList) && checkStraight(cardList)) {
            if (cardList.getFirst().getRank() == Rank.TEN && cardList.getLast().getRank() == Rank.ACE) {
                return Hand.ROYAL_FLUSH;
            }
            return Hand.STRAIGHT_FLUSH;
        }
        if (checkFourOfAKind(cardList))  return Hand.FOUR_OF_A_KIND;
        if (checkFullHouse(cardList))    return Hand.FULL_HOUSE;
        if (checkFlush(cardList))        return Hand.FLUSH;
        if (checkStraight(cardList))     return Hand.STRAIGHT;
        if (checkThreeOfAKind(cardList)) return Hand.THREE_OF_A_KIND;

        long pairs = getPairs(cardList);
        if (pairs == 2) return Hand.TWO_PAIRS;
        if (pairs == 1) return Hand.ONE_PAIR;

        return Hand.HIGH_CARD;
    }

    private boolean checkFullHouse(List<Card> cards) {
        Map<Rank, Long> counts = cards.stream()
                .collect(Collectors.groupingBy(Card::getRank, Collectors.counting()));
        return counts.containsValue(3L) && counts.containsValue(2L);
    }

    private boolean checkFourOfAKind(List<Card> cards) {
        return cards.stream()
                .collect(Collectors.groupingBy(Card::getRank, Collectors.counting()))
                .values().stream().anyMatch(c -> c == 4);
    }

    private boolean checkFlush(List<Card> cards) {
        return cards.stream().allMatch(c -> c.getSuit().equals(cards.getFirst().getSuit()));
    }

    private boolean checkStraight(List<Card> cards) {
        List<Integer> values = cards.stream()
                .map(c -> c.getRank().getValue())
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        // Ace-low straight: A-2-3-4-5
        if (values.contains(14) && values.contains(2)) {
            values.remove(Integer.valueOf(14));
            values.addFirst(1);
        }

        if (values.size() != 5) return false;
        return values.getLast() - values.getFirst() == 4;
    }

    private boolean checkThreeOfAKind(List<Card> cards) {
        return cards.stream()
                .collect(Collectors.groupingBy(Card::getRank, Collectors.counting()))
                .values().stream().anyMatch(c -> c == 3);
    }

    private long getPairs(List<Card> cards) {
        return cards.stream()
                .collect(Collectors.groupingBy(Card::getRank, Collectors.counting()))
                .values().stream()
                .filter(c -> c == 2)
                .count();
    }

    // ── Combination generation: C(n, 5) ────────────────────────────────────

    private List<List<Card>> generateCombinations(List<Card> cards) {
        List<List<Card>> result = new ArrayList<>();
        gatherCombos(cards, new ArrayList<>(), result, 0);
        return result;
    }

    private void gatherCombos(List<Card> cards, List<Card> current, List<List<Card>> result, int start) {
        if (current.size() == 5) {
            result.add(new ArrayList<>(current));
            return;
        }
        for (int i = start; i < cards.size(); i++) {
            current.add(cards.get(i));
            gatherCombos(cards, current, result, i + 1);
            current.removeLast();
        }
    }
}
