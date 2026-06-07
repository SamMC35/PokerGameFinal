package org.sambiswas.pokergame.common.enums;

public enum TableState {
    WAITING_FOR_PLAYERS("WAITING_FOR_PLAYERS"),
    PRE_FLOP("PRE_FLOP"),
    FLOP("FLOP"),
    RIVER("RIVER"),
    TURN("TURN"),
    SHOWDOWN("SHOWDOWN");

    private final String state;

    TableState(String state) {
        this.state = state;
    }

    public String getState() {
        return state;
    }

    // Optional: reverse lookup
    public static TableState fromState(String state) {
        for (TableState ts : TableState.values()) {
            if (ts.state.equals(state)) {
                return ts;
            }
        }
        throw new IllegalArgumentException("Invalid state: " + state);
    }
}
