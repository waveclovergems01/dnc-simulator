import type * as GameDataModels from "../../model/GameDataModels";

export interface InventoryPlateItemData {
  uuid: string;
  itemType: GameDataModels.ItemType;
  plates: GameDataModels.Plate[];
  rarity: GameDataModels.Rarity;
  patchLevel: GameDataModels.PatchLevel;
  plateName: GameDataModels.PlateName;
  plate3rdStat: GameDataModels.PlateThirdStat | null;
}

export type InventoryItemData = InventoryPlateItemData | null;

export interface InventorySlot {
  slotIndex: number;
  itemTypeId: number;
  itemData: InventoryItemData;
}