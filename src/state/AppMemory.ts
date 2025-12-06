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
// REACTIVE SUBSCRIBERS
// ---------------------------

let listeners: (() => void)[] = [];

// ---------------------------
// MEMORY CONTROLLER (SAFE)
// ---------------------------

export const AppMemory = {
    /** อ่านค่า memory ปัจจุบัน */
    load(): AppMemoryState {
        return MEMORY_STATE;
    },

    /** แก้ไข memory ทีละส่วน โดยรักษา structure เดิม */
    patch(update: Partial<AppMemoryState>) {
        MEMORY_STATE = {
            ...MEMORY_STATE,
            ...update,
        };

        // notify subscribers
        listeners.forEach((fn) => fn());
    },

    /** เคลียร์ memory ทั้งหมดกลับเป็นค่า default */
    clear() {
        MEMORY_STATE = { ...DEFAULT_STATE };
        listeners.forEach((fn) => fn());
    },

    /** Subscribe เพื่อ reactive UI */
    subscribe(fn: () => void) {
        listeners.push(fn);
        return () => {
            listeners = listeners.filter((x) => x !== fn);
        };
    },
};
