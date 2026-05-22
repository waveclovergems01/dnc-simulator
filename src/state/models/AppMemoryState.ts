import type {
  EquippedGeneralEquipmentSlot,
  EquippedHeraldrySlot,
  InventorySlot,
} from "./InventoryModels";

export interface AppMemoryState {
  inventoryList: InventorySlot[];
  equipmentList: EquippedHeraldrySlot[];
  generalEquipmentList: EquippedGeneralEquipmentSlot[];
  runeList: Record<string, never>[];
}
