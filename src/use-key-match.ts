import { useEffect } from 'react';
import { keyMatch } from './key-match.ts';
import type { KeyMatchCallbacks, KeyMatchCallbacksFlexible } from './types.ts';

export function useKeyMatch(callbacks: KeyMatchCallbacks): void;
export function useKeyMatch(callbacks: KeyMatchCallbacksFlexible): void;
export function useKeyMatch(callbacks: KeyMatchCallbacks | KeyMatchCallbacksFlexible): void {
    useEffect(() => {
        const abortController = new AbortController();

        const handleKeyDown = (event: KeyboardEvent) => {
            const matchStrings = Object.keys(callbacks)
                .filter(key => keyMatch(event, key));

            if (matchStrings.length > 0) {
                matchStrings.forEach(matchString => callbacks[matchString]?.(event));
            }
        };

        window.addEventListener(
            'keydown',
            handleKeyDown,
            { signal: abortController.signal },
        );

        return () => {
            abortController.abort();
        };
    }, [callbacks]);
}
