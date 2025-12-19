// src/state/AppMemory.ts

export interface CharacterSelectionState {
    baseId: string;
    class1Id: string;
    class2Id: string;
    level: string;
}

export interface EquippedSelections {
    equippedEquipmentSelections: Record<string, string>;
    equippedCostumeSelections: Record<string, string>;
    equippedHeraldrySelections: Record<string, string>;
    equippedCardSelections: Record<string, string>;
    equippedMountSelections: Record<string, string>;
    equippedMinionsSelections: Record<string, string>;
    equippedRuneSelections: Record<string, string>;
}

export interface AppMemoryState extends EquippedSelections {
    character: CharacterSelectionState;
}

/* ---------------- DEFAULT ---------------- */

const DEFAULT_STATE: AppMemoryState = {
    character: {
        level: "",
        baseId: "",
        class1Id: "",
        class2Id: "",
    },

    equippedEquipmentSelections: {},
    equippedCostumeSelections: {},
    equippedHeraldrySelections: {},
    equippedCardSelections: {},
    equippedMountSelections: {},
    equippedMinionsSelections: {},
    equippedRuneSelections: {},
};

/* ---------------- STORE ---------------- */

let MEMORY_STATE: AppMemoryState = { ...DEFAULT_STATE };
let listeners: (() => void)[] = [];

export const AppMemory = {
    load(): AppMemoryState {
        return MEMORY_STATE;
    },

    patch(update: Partial<AppMemoryState>) {
        MEMORY_STATE = {
            ...MEMORY_STATE,
            ...update,
        };
        listeners.forEach((fn) => fn());
    },

    clear() {
        MEMORY_STATE = { ...DEFAULT_STATE };
        listeners.forEach((fn) => fn());
    },

    subscribe(fn: () => void) {
        listeners.push(fn);
        return () => {
            listeners = listeners.filter((x) => x !== fn);
        };
    },
};
