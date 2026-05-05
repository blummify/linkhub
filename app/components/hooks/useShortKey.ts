'use client';

import { platform } from "os"; 
import {useEffect, useState } from "react"

export function useShortKey(onTriger: () => void) {
    const [modifier, setModifier] = useState<string>("Ctrl");

    useEffect( ()=> {
        const isMac = /mac/i.test(navigator.platform);
        setModifier(isMac ? "⌘" : "Ctrl");

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key.toLocaleLowerCase() !== "k") return;

            const isModifierPressed = isMac ? event.metaKey : event.ctrlKey;

            if (isModifierPressed) {
                event.preventDefault();
                onTriger();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onTriger]);

    return {modifier}
}