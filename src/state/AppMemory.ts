import type { AppMemoryState } from "./models/AppMemoryState";
import type {
  EquippedGeneralEquipmentSlot,
  EquippedHeraldrySlot,
  HeraldrySlotType,
  InventoryEquipmentItemData,
  InventoryItemData,
  InventoryPlateItemData,
  InventorySlot,
} from "./models/InventoryModels";

type AppMemoryListener = (state: AppMemoryState) => void;

const PLATE_ENHANCEMENT_TYPE_ID = 30001;
const PLATE_SKILL_TYPE_ID = 30002;
const PLATE_SPECIAL_SKILL_TYPE_ID = 30003;
const PLATE_EXPEDITION_TYPE_ID = 30004;

const FALLBACK_STAT_SLOT_KEYS = ["stat-9", "stat-10", "stat-11"];

const GENERAL_EQUIPMENT_SLOT_KEYS_BY_ITEM_TYPE_ID: Record<number, string[]> = {
  10001: ["helm"],
  10002: ["upper"],
  10003: ["lower"],
  10004: ["gloves"],
  10005: ["shoes"],
  10006: ["main_weapon"],
  10007: ["secondary_weapon"],
  10008: ["ring-1", "ring-2"],
  10009: ["earrings-1"],
  10010: ["necklace"],
};

const clonePlateItemData = (
  itemData: InventoryPlateItemData,
): InventoryPlateItemData => {
  return {
    kind: "plate",
    uuid: itemData.uuid,
    plateIds: [...itemData.plateIds],
    rarityId: itemData.rarityId,
    patchLevelId: itemData.patchLevelId,
    plateNameId: itemData.plateNameId,
    plate3rdStatId: itemData.plate3rdStatId,
  };
};

const cloneEquipmentItemData = (
  itemData: InventoryEquipmentItemData,
): InventoryEquipmentItemData => {
  return {
    kind: "equipment",
    uuid: itemData.uuid,
    itemId: itemData.itemId,
    rarityId: itemData.rarityId,
    jobId: itemData.jobId,
    requiredLevel: itemData.requiredLevel,
    enhancementLevel: itemData.enhancementLevel,
    suffixTypeId: itemData.suffixTypeId,
    suffixTier: itemData.suffixTier,
    customEnhanceStats: (itemData.customEnhanceStats ?? []).map((stat) => {
      return { ...stat };
    }),
    customHiddenPotentialStats: (itemData.customHiddenPotentialStats ?? []).map(
      (stat) => {
        return { ...stat };
      },
    ),
  };
};

const cloneInventoryItemData = (
  itemData: InventoryItemData,
): InventoryItemData => {
  if (itemData === null) {
    return null;
  }

  if (itemData.kind === "plate") {
    return clonePlateItemData(itemData);
  }

  return cloneEquipmentItemData(itemData);
};

const cloneInventorySlot = (slot: InventorySlot): InventorySlot => {
  return {
    slotIndex: slot.slotIndex,
    itemTypeId: slot.itemTypeId,
    itemData: cloneInventoryItemData(slot.itemData),
  };
};

const cloneEquipmentSlot = (
  slot: EquippedHeraldrySlot,
): EquippedHeraldrySlot => {
  return {
    slotKey: slot.slotKey,
    slotType: slot.slotType,
    itemTypeId: slot.itemTypeId,
    itemData: clonePlateItemData(slot.itemData),
  };
};

const cloneGeneralEquipmentSlot = (
  slot: EquippedGeneralEquipmentSlot,
): EquippedGeneralEquipmentSlot => {
  return {
    slotKey: slot.slotKey,
    itemTypeId: slot.itemTypeId,
    itemData: cloneEquipmentItemData(slot.itemData),
  };
};

const createEmptyState = (): AppMemoryState => {
  return {
    inventoryList: [],
    equipmentList: [],
    generalEquipmentList: [],
    runeList: [],
  };
};

const cloneState = (state: AppMemoryState): AppMemoryState => {
  return {
    inventoryList: state.inventoryList.map((slot: InventorySlot) => {
      return cloneInventorySlot(slot);
    }),
    equipmentList: state.equipmentList.map((slot: EquippedHeraldrySlot) => {
      return cloneEquipmentSlot(slot);
    }),
    generalEquipmentList: (state.generalEquipmentList ?? []).map(
      (slot: EquippedGeneralEquipmentSlot) => {
        return cloneGeneralEquipmentSlot(slot);
      },
    ),
    runeList: [...state.runeList],
  };
};

const getSlotTypeFromKey = (slotKey: string): HeraldrySlotType | null => {
  if (slotKey.startsWith("stat-")) {
    return "stat";
  }

  if (slotKey.startsWith("skill-")) {
    return "skill";
  }

  if (slotKey.startsWith("corner-")) {
    return "corner";
  }

  if (slotKey === "special") {
    return "special";
  }

  return null;
};

const getNextInventorySlotIndex = (inventoryList: InventorySlot[]): number => {
  if (inventoryList.length === 0) {
    return 1;
  }

  const usedSlotIndexSet = new Set<number>(
    inventoryList.map((slot: InventorySlot) => {
      return slot.slotIndex;
    }),
  );

  let nextSlotIndex = 1;

  while (usedSlotIndexSet.has(nextSlotIndex)) {
    nextSlotIndex += 1;
  }

  return nextSlotIndex;
};

const getCompatibleHeraldrySlotKeys = (itemTypeId: number): string[] => {
  if (itemTypeId === PLATE_ENHANCEMENT_TYPE_ID) {
    return [
      "stat-1",
      "stat-2",
      "stat-3",
      "stat-4",
      "stat-5",
      "stat-6",
      "stat-7",
      "stat-8",
      ...FALLBACK_STAT_SLOT_KEYS,
    ];
  }

  if (itemTypeId === PLATE_SKILL_TYPE_ID) {
    return [
      "skill-1",
      "skill-2",
      "skill-3",
      "skill-4",
      ...FALLBACK_STAT_SLOT_KEYS,
    ];
  }

  if (itemTypeId === PLATE_SPECIAL_SKILL_TYPE_ID) {
    return ["special", ...FALLBACK_STAT_SLOT_KEYS];
  }

  if (itemTypeId === PLATE_EXPEDITION_TYPE_ID) {
    return [];
  }

  return [];
};

const getCompatibleGeneralEquipmentSlotKeys = (itemTypeId: number): string[] => {
  return GENERAL_EQUIPMENT_SLOT_KEYS_BY_ITEM_TYPE_ID[itemTypeId] ?? [];
};

const isSamePlateType = (
  left: InventoryPlateItemData,
  right: InventoryPlateItemData,
): boolean => {
  return left.plateNameId === right.plateNameId;
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

  public getEquipmentList(): EquippedHeraldrySlot[] {
    return this.state.equipmentList.map((slot: EquippedHeraldrySlot) => {
      return cloneEquipmentSlot(slot);
    });
  }

  public getGeneralEquipmentList(): EquippedGeneralEquipmentSlot[] {
    return this.state.generalEquipmentList.map(
      (slot: EquippedGeneralEquipmentSlot) => {
        return cloneGeneralEquipmentSlot(slot);
      },
    );
  }

  public getInventorySlot(slotIndex: number): InventorySlot | null {
    const foundSlot =
      this.state.inventoryList.find((slot: InventorySlot) => {
        return slot.slotIndex === slotIndex;
      }) ?? null;

    return foundSlot ? cloneInventorySlot(foundSlot) : null;
  }

  public getEquipmentSlot(slotKey: string): EquippedHeraldrySlot | null {
    const foundSlot =
      this.state.equipmentList.find((slot: EquippedHeraldrySlot) => {
        return slot.slotKey === slotKey;
      }) ?? null;

    return foundSlot ? cloneEquipmentSlot(foundSlot) : null;
  }

  public getGeneralEquipmentSlot(
    slotKey: string,
  ): EquippedGeneralEquipmentSlot | null {
    const foundSlot =
      this.state.generalEquipmentList.find(
        (slot: EquippedGeneralEquipmentSlot) => {
          return slot.slotKey === slotKey;
        },
      ) ?? null;

    return foundSlot ? cloneGeneralEquipmentSlot(foundSlot) : null;
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

  public moveInventorySlotToHeraldry(slotIndex: number): boolean {
    const inventorySlot = this.getInventorySlot(slotIndex);

    if (!inventorySlot || inventorySlot.itemData === null) {
      return false;
    }

    if (inventorySlot.itemData.kind !== "plate") {
      return false;
    }

    const inventoryItemData: InventoryPlateItemData = inventorySlot.itemData;

    const compatibleSlotKeys = getCompatibleHeraldrySlotKeys(
      inventorySlot.itemTypeId,
    );

    if (compatibleSlotKeys.length === 0) {
      return false;
    }

    const sameTypeEquippedSlot =
      this.state.equipmentList.find((slot: EquippedHeraldrySlot) => {
        if (slot.itemTypeId !== inventorySlot.itemTypeId) {
          return false;
        }

        return isSamePlateType(slot.itemData, inventoryItemData);
      }) ?? null;

    if (sameTypeEquippedSlot) {
      this.state = {
        ...this.state,
        inventoryList: this.state.inventoryList.map((slot: InventorySlot) => {
          if (slot.slotIndex !== slotIndex) {
            return slot;
          }

          return {
            slotIndex: slot.slotIndex,
            itemTypeId: sameTypeEquippedSlot.itemTypeId,
            itemData: clonePlateItemData(sameTypeEquippedSlot.itemData),
          };
        }),
        equipmentList: this.state.equipmentList.map(
          (slot: EquippedHeraldrySlot) => {
            if (slot.slotKey !== sameTypeEquippedSlot.slotKey) {
              return slot;
            }

            return {
              slotKey: slot.slotKey,
              slotType: slot.slotType,
              itemTypeId: inventorySlot.itemTypeId,
              itemData: clonePlateItemData(inventoryItemData),
            };
          },
        ),
      };

      this.emit();
      return true;
    }

    const duplicateByName = this.state.equipmentList.some(
      (slot: EquippedHeraldrySlot) => {
        return slot.itemData.plateNameId === inventoryItemData.plateNameId;
      },
    );

    if (duplicateByName) {
      return false;
    }

    const occupiedSlotKeySet = new Set<string>(
      this.state.equipmentList.map((slot: EquippedHeraldrySlot) => {
        return slot.slotKey;
      }),
    );

    const targetSlotKey =
      compatibleSlotKeys.find((slotKey: string) => {
        return !occupiedSlotKeySet.has(slotKey);
      }) ?? null;

    if (!targetSlotKey) {
      return false;
    }

    const slotType = getSlotTypeFromKey(targetSlotKey);

    if (!slotType) {
      return false;
    }

    this.state = {
      ...this.state,
      inventoryList: this.state.inventoryList.filter((slot: InventorySlot) => {
        return slot.slotIndex !== slotIndex;
      }),
      equipmentList: [
        ...this.state.equipmentList,
        {
          slotKey: targetSlotKey,
          slotType,
          itemTypeId: inventorySlot.itemTypeId,
          itemData: clonePlateItemData(inventoryItemData),
        },
      ],
    };

    this.emit();
    return true;
  }

  public moveInventorySlotToGeneralEquipment(slotIndex: number): boolean {
    const inventorySlot = this.getInventorySlot(slotIndex);

    if (!inventorySlot || inventorySlot.itemData === null) {
      return false;
    }

    if (inventorySlot.itemData.kind !== "equipment") {
      return false;
    }

    const compatibleSlotKeys = getCompatibleGeneralEquipmentSlotKeys(
      inventorySlot.itemTypeId,
    );

    if (compatibleSlotKeys.length === 0) {
      return false;
    }

    const occupiedSlotKeySet = new Set<string>(
      this.state.generalEquipmentList.map(
        (slot: EquippedGeneralEquipmentSlot) => {
          return slot.slotKey;
        },
      ),
    );

    const targetSlotKey =
      compatibleSlotKeys.find((slotKey: string) => {
        return !occupiedSlotKeySet.has(slotKey);
      }) ?? compatibleSlotKeys[0];

    const equippedSlot =
      this.state.generalEquipmentList.find(
        (slot: EquippedGeneralEquipmentSlot) => {
          return slot.slotKey === targetSlotKey;
        },
      ) ?? null;

    const nextEquippedSlot: EquippedGeneralEquipmentSlot = {
      slotKey: targetSlotKey,
      itemTypeId: inventorySlot.itemTypeId,
      itemData: cloneEquipmentItemData(inventorySlot.itemData),
    };

    const nextInventoryList = this.state.inventoryList
      .filter((slot: InventorySlot) => {
        return slot.slotIndex !== slotIndex;
      })
      .concat(
        equippedSlot
          ? [
              {
                slotIndex,
                itemTypeId: equippedSlot.itemTypeId,
                itemData: cloneEquipmentItemData(equippedSlot.itemData),
              },
            ]
          : [],
      )
      .sort((left: InventorySlot, right: InventorySlot) => {
        return left.slotIndex - right.slotIndex;
      });

    this.state = {
      ...this.state,
      inventoryList: nextInventoryList,
      generalEquipmentList: [
        ...this.state.generalEquipmentList.filter(
          (slot: EquippedGeneralEquipmentSlot) => {
            return slot.slotKey !== targetSlotKey;
          },
        ),
        nextEquippedSlot,
      ],
    };

    this.emit();
    return true;
  }

  public moveHeraldryToInventory(slotKey: string): boolean {
    const equipmentSlot = this.getEquipmentSlot(slotKey);

    if (!equipmentSlot) {
      return false;
    }

    const nextSlotIndex = getNextInventorySlotIndex(this.state.inventoryList);

    this.state = {
      ...this.state,
      inventoryList: [
        ...this.state.inventoryList,
        {
          slotIndex: nextSlotIndex,
          itemTypeId: equipmentSlot.itemTypeId,
          itemData: clonePlateItemData(equipmentSlot.itemData),
        },
      ].sort((left: InventorySlot, right: InventorySlot) => {
        return left.slotIndex - right.slotIndex;
      }),
      equipmentList: this.state.equipmentList.filter(
        (slot: EquippedHeraldrySlot) => {
          return slot.slotKey !== slotKey;
        },
      ),
    };

    this.emit();
    return true;
  }

  public moveGeneralEquipmentToInventory(slotKey: string): boolean {
    const equipmentSlot = this.getGeneralEquipmentSlot(slotKey);

    if (!equipmentSlot) {
      return false;
    }

    const nextSlotIndex = getNextInventorySlotIndex(this.state.inventoryList);

    this.state = {
      ...this.state,
      inventoryList: [
        ...this.state.inventoryList,
        {
          slotIndex: nextSlotIndex,
          itemTypeId: equipmentSlot.itemTypeId,
          itemData: cloneEquipmentItemData(equipmentSlot.itemData),
        },
      ].sort((left: InventorySlot, right: InventorySlot) => {
        return left.slotIndex - right.slotIndex;
      }),
      generalEquipmentList: this.state.generalEquipmentList.filter(
        (slot: EquippedGeneralEquipmentSlot) => {
          return slot.slotKey !== slotKey;
        },
      ),
    };

    this.emit();
    return true;
  }

  private emit(): void {
    const snapshot = this.getState();

    this.listeners.forEach((listener: AppMemoryListener) => {
      listener(snapshot);
    });
  }
}

export const appMemory = AppMemory.getInstance();
