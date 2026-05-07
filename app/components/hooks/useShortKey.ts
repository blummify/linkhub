'use client';

import { useEffect, useRef } from 'react';

interface UseShortKeyOptions {
    modifier?: 'ctrl' | 'cmd';
    key?: string;
    enabled?: boolean;
}

export function useShortKey(
    onTrigger: () => void,
    options: UseShortKeyOptions = {}
) {
    const { modifier: manualModifier, key = 'k', enabled = true } = options;
    const onTriggerRef = useRef(onTrigger);

    const modifierDisplay = (() => {
    if (manualModifier) {
        return manualModifier === 'cmd' ? '⌘' : 'Ctrl';
    }
    const usesMetaKey = /mac|ipad|iphone/i.test(navigator.userAgent);
    return usesMetaKey ? '⌘' : 'Ctrl';
    })();

    useEffect(() => {
    onTriggerRef.current = onTrigger;
    }, [onTrigger]);

    useEffect(() => {
    if (!enabled) return;

    const usesMetaKey = /mac|ipad|iphone/i.test(navigator.userAgent);
    const effectiveModifier = manualModifier ?? (usesMetaKey ? 'cmd' : 'ctrl');

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key.toLowerCase() !== key.toLowerCase()) return;

        const isModifierPressed = effectiveModifier === 'cmd' 
        ? event.metaKey 
        : event.ctrlKey;

        if (isModifierPressed) {
        event.preventDefault();
        onTriggerRef.current();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enabled, key, manualModifier]);

    return { modifier: modifierDisplay };
}