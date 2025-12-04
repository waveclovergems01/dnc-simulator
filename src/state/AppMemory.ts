// src/state/AppMemory.ts

// ---------------------------
// STRUCTURE OF MEMORY STATE
// ---------------------------

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

// ---------------------------
// DEFAULT STATE
// ---------------------------

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

// ---------------------------
// IN-MEMORY STORAGE
// ---------------------------

let MEMORY_STATE: AppMemoryState = { ...DEFAULT_STATE };

// ---------------------------
// MEMORY CONTROLLER
// ---------------------------

export const AppMemory = {
    /** อ่านค่าปัจจุบัน */
    load(): AppMemoryState {
        return MEMORY_STATE;
    },

    /** แก้ไข memory เฉพาะบาง field */
    patch(update: Partial<AppMemoryState>) {
        MEMORY_STATE = {
            ...MEMORY_STATE,
            ...update,
        };
    },

    /** reset memory */
    clear() {
        MEMORY_STATE = { ...DEFAULT_STATE };
    },
};
