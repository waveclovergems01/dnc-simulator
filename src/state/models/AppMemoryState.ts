import type { InventorySlot } from "./InventoryModels";

export interface AppMemoryState {
  inventoryList: InventorySlot[];
  equipmentList: Record<string, never>[];
  runeList: Record<string, never>[];
}