// src/state/AppMemory.ts

export interface CharacterSelectionState {
  level: string;
  baseId: string;
  class1Id: string;
  class2Id: string;
}

export interface AppMemoryState {
  character: CharacterSelectionState;
}

const DEFAULT_STATE: AppMemoryState = {
  character: {
    level: "",
    baseId: "",
    class1Id: "",
    class2Id: "",
  },
};

// อ่านค่าจาก URL ถ้ามี ?state=...
function getInitialStateFromUrl(): AppMemoryState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("state");
    if (!encoded) return null;

    const decoded = decodeURIComponent(encoded);
    const parsed = JSON.parse(decoded);

    // เช็คว่ามีโครงสร้าง character คร่าว ๆ
    if (
      parsed &&
      typeof parsed === "object" &&
      "character" in parsed &&
      typeof parsed.character === "object"
    ) {
      // merge กับ default กัน field หาย
      return {
        ...DEFAULT_STATE,
        ...parsed,
        character: {
          ...DEFAULT_STATE.character,
          ...parsed.character,
        },
      };
    }

    return null;
  } catch (e) {
    console.warn("Failed to parse state from URL:", e);
    return null;
  }
}

const initialState: AppMemoryState =
  getInitialStateFromUrl() ?? DEFAULT_STATE;

export class AppMemory {
  private static _state: AppMemoryState = initialState;

  /** โหลด state ปัจจุบัน (clone ใหม่กัน mutate ตรง ๆ) */
  static load(): AppMemoryState {
    return JSON.parse(JSON.stringify(this._state));
  }

  /** เซฟ state ทั้งก้อน */
  static saveAll(next: AppMemoryState): AppMemoryState {
    this._state = JSON.parse(JSON.stringify(next));
    return this.load();
  }

  /** patch บางส่วนของ state (เช่น character) */
  static patch(patch: Partial<AppMemoryState>): AppMemoryState {
    this._state = { ...this._state, ...patch };
    return this.load();
  }

  /** reset กลับ default */
  static reset(): AppMemoryState {
    this._state = { ...DEFAULT_STATE };
    return this.load();
  }
}
