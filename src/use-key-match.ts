import { useEffect } from 'react';
import { keyMatch } from './key-match.ts';

export const useKeyMatch = (callbacks: Record<string, () => void>): void => {
    useEffect(() => {
        const abortController = new AbortController();

        const handleKeyDown = (event: KeyboardEvent) => {
            const matchStrings = Object.keys(callbacks)
                .filter(key => keyMatch(event, key));

            if (matchStrings.length > 0) {
                matchStrings.forEach(matchString => callbacks[matchString]?.());
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
};
