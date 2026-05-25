import type {
  EquippedGeneralEquipmentSlot,
  EquippedHeraldrySlot,
  EquippedRuneSlot,
  EquippedCardSlot,
  InventorySlot,
} from "./InventoryModels";

export interface AppMemoryState {
  characterLevel: number;
  characterJobId: number;
  inventoryList: InventorySlot[];
  equipmentList: EquippedHeraldrySlot[];
  generalEquipmentList: EquippedGeneralEquipmentSlot[];
  runeList: EquippedRuneSlot[];
  cardList: EquippedCardSlot[];
}
