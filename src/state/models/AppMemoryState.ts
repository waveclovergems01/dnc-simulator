import type { EquippedHeraldrySlot, InventorySlot } from "./InventoryModels";

export interface AppMemoryState {
  inventoryList: InventorySlot[];
  equipmentList: EquippedHeraldrySlot[];
  runeList: Record<string, never>[];
}