export interface InventoryPlateItemData {
  uuid: string;
  plateIds: number[];
  rarityId: number;
  patchLevelId: number;
  plateNameId: number;
  plate3rdStatId: number | null;
}

export type InventoryItemData = InventoryPlateItemData | null;

export interface InventorySlot {
  slotIndex: number;
  itemTypeId: number;
  itemData: InventoryItemData;
}