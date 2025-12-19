// src/state/useAppMemory.ts
import { useSyncExternalStore } from "react";
import { AppMemory } from "./AppMemory";
import type { AppMemoryState } from "./AppMemory";

export const useAppMemory = (): AppMemoryState => {
    return useSyncExternalStore(
        AppMemory.subscribe,
        AppMemory.load
    );
};
