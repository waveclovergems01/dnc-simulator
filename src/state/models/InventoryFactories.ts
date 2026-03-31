import type * as GameDataModels from "../../model/GameDataModels";
import type {
  InventoryPlateItemData,
  InventorySlot,
} from "../models/InventoryModels";

const createUuid = (): string => {
  if (
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `inv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const getNextSlotIndex = (inventoryList: InventorySlot[]): number => {
  if (inventoryList.length === 0) {
    return 1;
  }

  return (
    Math.max(
      ...inventoryList.map((slot: InventorySlot) => {
        return slot.slotIndex;
      }),
    ) + 1
  );
};

export const createInventoryPlateItemData = (params: {
  itemType: GameDataModels.ItemType;
  plates: GameDataModels.Plate[];
  rarity: GameDataModels.Rarity;
  patchLevel: GameDataModels.PatchLevel;
  plateName: GameDataModels.PlateName;
  plate3rdStat: GameDataModels.PlateThirdStat | null;
}): InventoryPlateItemData => {
  return {
    uuid: createUuid(),
    itemType: params.itemType,
    plates: [...params.plates],
    rarity: params.rarity,
    patchLevel: params.patchLevel,
    plateName: params.plateName,
    plate3rdStat: params.plate3rdStat,
  };
};

export const createInventoryPlateSlot = (params: {
  inventoryList: InventorySlot[];
  itemType: GameDataModels.ItemType;
  plates: GameDataModels.Plate[];
  rarity: GameDataModels.Rarity;
  patchLevel: GameDataModels.PatchLevel;
  plateName: GameDataModels.PlateName;
  plate3rdStat: GameDataModels.PlateThirdStat | null;
}): InventorySlot => {
  return {
    slotIndex: getNextSlotIndex(params.inventoryList),
    itemTypeId: params.itemType.typeId,
    itemData: createInventoryPlateItemData({
      itemType: params.itemType,
      plates: params.plates,
      rarity: params.rarity,
      patchLevel: params.patchLevel,
      plateName: params.plateName,
      plate3rdStat: params.plate3rdStat,
    }),
  };
};