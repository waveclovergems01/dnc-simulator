export interface ShareInventoryPlateItemData {
  kind: "plate";
  plateIds: number[];
  rarityId: number;
  patchLevelId: number;
  plateNameId: number;
  plate3rdStatId: number | null;
}

export interface ShareInventoryEquipmentItemData {
  kind: "equipment";
  itemId: number;
  rarityId: number;
  jobId: number;
  requiredLevel: number;
  enhancementLevel: number;
  suffixTypeId: number | null;
  suffixTier: number | null;
  customEnhanceStats?: ShareInventoryEquipmentCustomStat[];
  customHiddenPotentialStats?: ShareInventoryEquipmentCustomStat[];
}

export interface ShareInventoryEquipmentCustomStat {
  statId: number;
  valueMin: number;
  valueMax: number;
  isPercentage: boolean;
}

export type ShareInventoryItemData =
  | ShareInventoryPlateItemData
  | ShareInventoryEquipmentItemData
  | null;

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

export interface ShareEquippedGeneralEquipmentSlot {
  slotKey: string;
  itemTypeId: number;
  itemData: ShareInventoryEquipmentItemData;
}

export interface ShareAppMemoryState {
  inventoryList: ShareInventorySlot[];
  equipmentList: ShareEquippedHeraldrySlot[];
  generalEquipmentList: ShareEquippedGeneralEquipmentSlot[];
  runeList: Record<string, never>[];
}
