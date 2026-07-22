import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";

/**
 * Like useFocusEffect, but skips the very first focus firing.
 *
 * useFocusEffect's callback also runs on initial mount (in addition to every
 * subsequent focus), which is redundant when the data was already fetched by
 * a useState lazy initializer — and calling a state setter that early can
 * race with the screen's own mount/commit, triggering React's "state update
 * on a component that hasn't mounted yet" warning. Skipping the first call
 * is lossless (the initializer already has fresh data) and avoids the race.
 */
export function useFocusRefresh(callback: () => void) {
    const isFirstFocus = useRef(true);

    useFocusEffect(
        useCallback(() => {
            if (isFirstFocus.current) {
                isFirstFocus.current = false;
                return;
            }
            callback();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [callback])
    );
}
