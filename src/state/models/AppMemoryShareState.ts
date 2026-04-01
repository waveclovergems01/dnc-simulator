export interface ShareInventoryPlateItemData {
  kind: "plate";
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

export type ShareHeraldrySlotType = "stat" | "skill" | "corner" | "special";

export interface ShareEquippedHeraldrySlot {
  slotKey: string;
  slotType: ShareHeraldrySlotType;
  itemTypeId: number;
  itemData: ShareInventoryPlateItemData;
}

export interface ShareAppMemoryState {
  inventoryList: ShareInventorySlot[];
  equipmentList: ShareEquippedHeraldrySlot[];
  runeList: Record<string, never>[];
}