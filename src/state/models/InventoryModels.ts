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

export interface InventoryRuneStat {
  statId: number;
  valueRarityId: number;
  value: number;
  isPercentage: boolean;
}

export interface InventoryRuneItemData {
  kind: "rune";
  uuid: string;
  runeId: number;
  rarityId: number;
  runeLevelId: number;
  stats: InventoryRuneStat[];
}

export interface InventoryCardItemData {
  kind: "card";
  uuid: string;
  cardNameId: number;
  cardId: number;
  rarityId: number;
  cardLevelId: number;
  slotNumber: number;
}

export type InventoryItemData =
  | InventoryPlateItemData
  | InventoryEquipmentItemData
  | InventoryRuneItemData
  | InventoryCardItemData
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

export interface EquippedRuneSlot {
  slotKey: string;
  itemTypeId: number;
  itemData: InventoryRuneItemData;
}

export interface EquippedCardSlot {
  slotKey: string;
  itemTypeId: number;
  itemData: InventoryCardItemData;
}
