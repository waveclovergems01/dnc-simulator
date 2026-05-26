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

export interface ShareInventoryRuneStat {
  statId: number;
  valueRarityId: number;
  value: number;
  isPercentage: boolean;
}

export interface ShareInventoryRuneItemData {
  kind: "rune";
  runeId: number;
  rarityId: number;
  runeLevelId: number;
  stats: ShareInventoryRuneStat[];
}

export interface ShareInventoryCardItemData {
  kind: "card";
  cardNameId: number;
  cardId: number;
  rarityId: number;
  cardLevelId: number;
  slotNumber: number;
}

export type ShareInventoryItemData =
  | ShareInventoryPlateItemData
  | ShareInventoryEquipmentItemData
  | ShareInventoryRuneItemData
  | ShareInventoryCardItemData
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

export interface ShareEquippedRuneSlot {
  slotKey: string;
  itemTypeId: number;
  itemData: ShareInventoryRuneItemData;
}

export interface ShareEquippedCardSlot {
  slotKey: string;
  itemTypeId: number;
  itemData: ShareInventoryCardItemData;
}

export interface ShareAppMemoryState {
  characterLevel: number;
  characterJobId: number;
  cardMasteryLevels: Record<number, number>;
  collectionLevel: number;
  titleId: string | null;
  inventoryList: ShareInventorySlot[];
  equipmentList: ShareEquippedHeraldrySlot[];
  generalEquipmentList: ShareEquippedGeneralEquipmentSlot[];
  runeList: ShareEquippedRuneSlot[];
  cardList: ShareEquippedCardSlot[];
}
