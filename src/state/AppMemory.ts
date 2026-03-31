import type { AppMemoryState } from "./models/AppMemoryState";
import type { InventorySlot } from "./models/InventoryModels";

type AppMemoryListener = (state: AppMemoryState) => void;

const cloneInventorySlot = (slot: InventorySlot): InventorySlot => {
  return {
    slotIndex: slot.slotIndex,
    itemTypeId: slot.itemTypeId,
    itemData:
      slot.itemData === null
        ? null
        : {
            ...slot.itemData,
            itemType: slot.itemData.itemType,
            plates: [...slot.itemData.plates],
            rarity: slot.itemData.rarity,
            patchLevel: slot.itemData.patchLevel,
            plateName: slot.itemData.plateName,
            plate3rdStat: slot.itemData.plate3rdStat,
          },
  };
};

const createEmptyState = (): AppMemoryState => {
  return {
    inventoryList: [],
    equipmentList: [],
    runeList: [],
  };
};

const cloneState = (state: AppMemoryState): AppMemoryState => {
  return {
    inventoryList: state.inventoryList.map((slot: InventorySlot) => {
      return cloneInventorySlot(slot);
    }),
    equipmentList: [...state.equipmentList],
    runeList: [...state.runeList],
  };
};

export class AppMemory {
  private static instance: AppMemory | null = null;

  private state: AppMemoryState = createEmptyState();

  private listeners: Set<AppMemoryListener> = new Set<AppMemoryListener>();

  private constructor() {}

  public static getInstance(): AppMemory {
    if (!AppMemory.instance) {
      AppMemory.instance = new AppMemory();
    }

    return AppMemory.instance;
  }

  public getState(): AppMemoryState {
    return cloneState(this.state);
  }

  public replaceState(nextState: AppMemoryState): void {
    this.state = cloneState(nextState);
    this.emit();
  }

  public resetState(): void {
    this.state = createEmptyState();
    this.emit();
  }

  public subscribe(listener: AppMemoryListener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  public getInventoryList(): InventorySlot[] {
    return this.state.inventoryList.map((slot: InventorySlot) => {
      return cloneInventorySlot(slot);
    });
  }

  public getInventorySlot(slotIndex: number): InventorySlot | null {
    const foundSlot =
      this.state.inventoryList.find((slot: InventorySlot) => {
        return slot.slotIndex === slotIndex;
      }) ?? null;

    return foundSlot ? cloneInventorySlot(foundSlot) : null;
  }

  public addInventorySlot(slot: InventorySlot): void {
    this.state = {
      ...this.state,
      inventoryList: [
        ...this.state.inventoryList,
        cloneInventorySlot(slot),
      ].sort((left: InventorySlot, right: InventorySlot) => {
        return left.slotIndex - right.slotIndex;
      }),
    };

    this.emit();
  }

  public updateInventorySlot(slot: InventorySlot): void {
    const hasExistingSlot = this.state.inventoryList.some(
      (currentSlot: InventorySlot) => {
        return currentSlot.slotIndex === slot.slotIndex;
      },
    );

    if (!hasExistingSlot) {
      return;
    }

    this.state = {
      ...this.state,
      inventoryList: this.state.inventoryList
        .map((currentSlot: InventorySlot) => {
          if (currentSlot.slotIndex !== slot.slotIndex) {
            return currentSlot;
          }

          return cloneInventorySlot(slot);
        })
        .sort((left: InventorySlot, right: InventorySlot) => {
          return left.slotIndex - right.slotIndex;
        }),
    };

    this.emit();
  }

  public removeInventorySlot(slotIndex: number): void {
    const nextInventoryList = this.state.inventoryList.filter(
      (slot: InventorySlot) => {
        return slot.slotIndex !== slotIndex;
      },
    );

    if (nextInventoryList.length === this.state.inventoryList.length) {
      return;
    }

    this.state = {
      ...this.state,
      inventoryList: nextInventoryList,
    };

    this.emit();
  }

  private emit(): void {
    const snapshot = this.getState();

    this.listeners.forEach((listener: AppMemoryListener) => {
      listener(snapshot);
    });
  }
}

export const appMemory = AppMemory.getInstance();