export interface InventoryPlateItemData {
  kind: "plate";
  uuid: string;
  plateIds: number[];
  rarityId: number;
  patchLevelId: number;
  plateNameId: number;
  plate3rdStatId: number | null;
}

export interface InventoryEquipmentItemData {
  kind: "equipment";
  uuid: string;
  itemId: number;
  rarityId: number;
  jobId: number;
  requiredLevel: number;
  enhancementLevel: number;
  suffixTypeId: number | null;
  suffixTier: number | null;
  customEnhanceStats: InventoryEquipmentCustomStat[];
  customHiddenPotentialStats: InventoryEquipmentCustomStat[];
}

export interface InventoryEquipmentCustomStat {
  statId: number;
  valueMin: number;
  valueMax: number;
  isPercentage: boolean;
}

export type InventoryItemData =
  | InventoryPlateItemData
  | InventoryEquipmentItemData
  | null;

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

export interface EquippedGeneralEquipmentSlot {
  slotKey: string;
  itemTypeId: number;
  itemData: InventoryEquipmentItemData;
}
