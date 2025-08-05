import { useEffect } from 'react';
import { keyMatch } from './key-match.ts';
import type { KeyMatchCallbacks, KeyMatchCallbacksStrict } from './types.ts';

export function useKeyMatch(callbacks: KeyMatchCallbacksStrict): void;
export function useKeyMatch(callbacks: KeyMatchCallbacks): void;
export function useKeyMatch(callbacks: KeyMatchCallbacksStrict | KeyMatchCallbacks): void {
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
