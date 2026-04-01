export interface InventoryPlateItemData {
  kind: "plate";
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

export type HeraldrySlotType = "stat" | "skill" | "corner" | "special";

export interface EquippedHeraldrySlot {
  slotKey: string;
  slotType: HeraldrySlotType;
  itemTypeId: number;
  itemData: InventoryPlateItemData;
}