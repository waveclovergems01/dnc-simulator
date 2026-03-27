// src/state/AppMemory.ts

/* ---------------- TYPES ---------------- */

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

export interface InventoryItem {
    id: string;          // runtime id
    item_id: number;     // base equipment id
    name: string;
    category_id: number;
    type_id: number;
    rarity_id: number;
    job_id: number;
    created_at: number;
}

export interface InventoryEditTarget {
    inventoryId: string;
    item_id: number;
}

export interface AppMemoryState extends EquippedSelections {
    character: CharacterSelectionState;
    inventoryItems: InventoryItem[];
    inventoryEditTarget: InventoryEditTarget | null;
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

    inventoryItems: [],
    inventoryEditTarget: null,
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

    /* ---------------- INVENTORY API ---------------- */

    addInventoryItem(item: InventoryItem) {
        MEMORY_STATE = {
            ...MEMORY_STATE,
            inventoryItems: [...MEMORY_STATE.inventoryItems, item],
        };
        listeners.forEach((fn) => fn());
    },

    removeInventoryItem(inventoryId: string) {
        MEMORY_STATE = {
            ...MEMORY_STATE,
            inventoryItems: MEMORY_STATE.inventoryItems.filter(
                (i) => i.id !== inventoryId
            ),
        };
        listeners.forEach((fn) => fn());
    },

    setInventoryEditTarget(target: InventoryEditTarget | null) {
        MEMORY_STATE = {
            ...MEMORY_STATE,
            inventoryEditTarget: target,
        };
        listeners.forEach((fn) => fn());
    },
};
