import { appMemory } from "./AppMemory";
import type { AppMemoryState } from "./models/AppMemoryState";
import type { InventorySlot } from "./models/InventoryModels";

const STATE_QUERY_KEY = "state";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isInventorySlot = (value: unknown): value is InventorySlot => {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value.slotIndex !== "number") {
    return false;
  }

  if (typeof value.itemTypeId !== "number") {
    return false;
  }

  if (!("itemData" in value)) {
    return false;
  }

  return true;
};

const sanitizeAppMemoryState = (value: unknown): AppMemoryState | null => {
  if (!isRecord(value)) {
    return null;
  }

  const inventoryListRaw = value.inventoryList;
  const equipmentListRaw = value.equipmentList;
  const runeListRaw = value.runeList;

  const inventoryList = Array.isArray(inventoryListRaw)
    ? inventoryListRaw.filter((item: unknown) => {
        return isInventorySlot(item);
      })
    : [];

  const equipmentList = Array.isArray(equipmentListRaw)
    ? equipmentListRaw.filter((item: unknown) => {
        return isRecord(item);
      })
    : [];

  const runeList = Array.isArray(runeListRaw)
    ? runeListRaw.filter((item: unknown) => {
        return isRecord(item);
      })
    : [];

  return {
    inventoryList,
    equipmentList: equipmentList as Record<string, never>[],
    runeList: runeList as Record<string, never>[],
  };
};

export const buildMemoryStateUrl = (
  state: AppMemoryState,
  baseUrl?: string,
): string => {
  const url = new URL(baseUrl ?? window.location.href);
  const serializedState = JSON.stringify(state);

  url.searchParams.set(STATE_QUERY_KEY, encodeURIComponent(serializedState));

  return url.toString();
};

export const getAppMemoryStateFromUrl = (
  urlString?: string,
): AppMemoryState | null => {
  try {
    const url = new URL(urlString ?? window.location.href);
    const encodedState = url.searchParams.get(STATE_QUERY_KEY);

    if (!encodedState) {
      return null;
    }

    const decodedState = decodeURIComponent(encodedState);
    const parsedState = JSON.parse(decodedState) as unknown;

    return sanitizeAppMemoryState(parsedState);
  } catch {
    return null;
  }
};

export const restoreStateFromUrl = (urlString?: string): boolean => {
  const nextState = getAppMemoryStateFromUrl(urlString);

  if (!nextState) {
    return false;
  }

  appMemory.replaceState(nextState);
  return true;
};