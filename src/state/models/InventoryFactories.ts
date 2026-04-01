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

export const createInventoryPlateItemData = (params: {
  plateIds: number[];
  rarityId: number;
  patchLevelId: number;
  plateNameId: number;
  plate3rdStatId: number | null;
}): InventoryPlateItemData => {
  return {
    uuid: createUuid(),
    plateIds: [...params.plateIds],
    rarityId: params.rarityId,
    patchLevelId: params.patchLevelId,
    plateNameId: params.plateNameId,
    plate3rdStatId: params.plate3rdStatId,
  };
};

export const createInventoryPlateSlot = (params: {
  inventoryList: InventorySlot[];
  itemTypeId: number;
  plateIds: number[];
  rarityId: number;
  patchLevelId: number;
  plateNameId: number;
  plate3rdStatId: number | null;
}): InventorySlot => {
  return {
    slotIndex: getNextSlotIndex(params.inventoryList),
    itemTypeId: params.itemTypeId,
    itemData: createInventoryPlateItemData({
      plateIds: params.plateIds,
      rarityId: params.rarityId,
      patchLevelId: params.patchLevelId,
      plateNameId: params.plateNameId,
      plate3rdStatId: params.plate3rdStatId,
    }),
  };
};