import type * as GameDataModels from "../model/GameDataModels";

export const SLOT_FALLBACK_ICON: Record<string, string> = {
  helm: "assets/img/general/slot_helm.svg",
  upper: "assets/img/general/slot_upper.svg",
  lower: "assets/img/general/slot_lower.svg",
  gloves: "assets/img/general/slot_gloves.svg",
  shoes: "assets/img/general/slot_shoes.svg",
  main_weapon: "assets/img/general/slot_main_weapon.svg",
  secondary_weapon: "assets/img/general/slot_secondary_weapon.svg",
  ring: "assets/img/general/slot_ring.svg",
  earrings: "assets/img/general/slot_earrings.svg",
  necklace: "assets/img/general/slot_necklace.svg",
};

/**
 * Get fallback icon path from a slot key string (e.g. "helm", "ring-1", "earrings-1").
 * Strips numeric suffixes like "-1", "-2" before lookup.
 */
export const getFallbackIconBySlotKey = (slotKey: string): string | null => {
  // Strip trailing "-1", "-2" etc. so "ring-1" → "ring"
  const baseKey = slotKey.replace(/-\d+$/, "");
  return SLOT_FALLBACK_ICON[baseKey] ?? null;
};

/**
 * Get fallback icon path from a typeId by looking up the slot string in itemTypes.
 */
export const getFallbackIconByTypeId = (
  typeId: number,
  itemTypes: GameDataModels.ItemType[],
): string | null => {
  const itemType = itemTypes.find((t) => t.typeId === typeId) ?? null;
  if (!itemType) return null;
  return SLOT_FALLBACK_ICON[itemType.slot] ?? null;
};
