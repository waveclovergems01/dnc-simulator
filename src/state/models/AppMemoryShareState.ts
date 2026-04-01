export interface ShareInventoryPlateItemData {
  kind: "plate";
  itemTypeId: number;
  plateIds: number[];
  rarityId: number;
  patchLevelId: number;
  plateNameId: number;
  plate3rdStatId: number | null;
}

export type ShareInventoryItemData = ShareInventoryPlateItemData | null;

export interface ShareInventorySlot {
  slotIndex: number;
  itemTypeId: number;
  itemData: ShareInventoryItemData;
}

export interface ShareAppMemoryState {
  inventoryList: ShareInventorySlot[];
  equipmentList: Record<string, never>[];
  runeList: Record<string, never>[];
}