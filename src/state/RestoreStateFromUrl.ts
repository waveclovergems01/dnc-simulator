import { GameDataLoader } from "../data/GameDataLoader";
import { appMemory } from "./AppMemory";
import type { AppMemoryState } from "./models/AppMemoryState";
import type {
  ShareAppMemoryState,
  ShareInventoryPlateItemData,
  ShareInventorySlot,
} from "./models/AppMemoryShareState";
import type { InventorySlot } from "./models/InventoryModels";

const STATE_HASH_KEY = "state=";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isNumberArray = (value: unknown): value is number[] => {
  return (
    Array.isArray(value) &&
    value.every((item: unknown) => {
      return typeof item === "number";
    })
  );
};

const isShareInventoryPlateItemData = (
  value: unknown,
): value is ShareInventoryPlateItemData => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.kind === "plate" &&
    typeof value.itemTypeId === "number" &&
    isNumberArray(value.plateIds) &&
    typeof value.rarityId === "number" &&
    typeof value.patchLevelId === "number" &&
    typeof value.plateNameId === "number" &&
    (typeof value.plate3rdStatId === "number" || value.plate3rdStatId === null)
  );
};

const isShareInventorySlot = (value: unknown): value is ShareInventorySlot => {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value.slotIndex !== "number") {
    return false;
  }

  if (typeof value.itemTypeId !== "number") {
    return false;
  }

  if (value.itemData === null) {
    return true;
  }

  return isShareInventoryPlateItemData(value.itemData);
};

const sanitizeShareAppMemoryState = (
  value: unknown,
): ShareAppMemoryState | null => {
  if (!isRecord(value)) {
    return null;
  }

  const inventoryListRaw = value.inventoryList;
  const equipmentListRaw = value.equipmentList;
  const runeListRaw = value.runeList;

  const inventoryList = Array.isArray(inventoryListRaw)
    ? inventoryListRaw.filter((item: unknown) => {
        return isShareInventorySlot(item);
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

const getStateValueFromHash = (hash: string): string | null => {
  const normalizedHash = hash.startsWith("#") ? hash.slice(1) : hash;

  if (!normalizedHash) {
    return null;
  }

  const parts = normalizedHash.split("&");

  for (const part of parts) {
    if (part.startsWith(STATE_HASH_KEY)) {
      return part.slice(STATE_HASH_KEY.length);
    }
  }

  return null;
};

const createUuid = (): string => {
  if (
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `inv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const toShareState = (state: AppMemoryState): ShareAppMemoryState => {
  return {
    inventoryList: state.inventoryList.map((slot) => {
      if (slot.itemData === null) {
        return {
          slotIndex: slot.slotIndex,
          itemTypeId: slot.itemTypeId,
          itemData: null,
        };
      }

      return {
        slotIndex: slot.slotIndex,
        itemTypeId: slot.itemTypeId,
        itemData: {
          kind: "plate",
          itemTypeId: slot.itemData.itemType.typeId,
          plateIds: slot.itemData.plates.map((plate) => {
            return plate.id;
          }),
          rarityId: slot.itemData.rarity.rarityId,
          patchLevelId: slot.itemData.patchLevel.id,
          plateNameId: slot.itemData.plateName.id,
          plate3rdStatId: slot.itemData.plate3rdStat
            ? slot.itemData.plate3rdStat.id
            : null,
        },
      };
    }),
    equipmentList: [...state.equipmentList],
    runeList: [...state.runeList],
  };
};

const fromShareState = (shareState: ShareAppMemoryState): AppMemoryState => {
  const gameData = GameDataLoader.load();

  const itemTypeMap = new Map(
    gameData.itemTypes.map((itemType) => {
      return [itemType.typeId, itemType] as const;
    }),
  );

  const plateMap = new Map(
    gameData.plates.map((plate) => {
      return [plate.id, plate] as const;
    }),
  );

  const rarityMap = new Map(
    gameData.rarities.map((rarity) => {
      return [rarity.rarityId, rarity] as const;
    }),
  );

  const patchLevelMap = new Map(
    gameData.patchLevels.map((patchLevel) => {
      return [patchLevel.id, patchLevel] as const;
    }),
  );

  const plateNameMap = new Map(
    gameData.plateNames.map((plateName) => {
      return [plateName.id, plateName] as const;
    }),
  );

  const plate3rdStatMap = new Map(
    gameData.plate3rdStats.map((plate3rdStat) => {
      return [plate3rdStat.id, plate3rdStat] as const;
    }),
  );

  const inventoryList: InventorySlot[] = shareState.inventoryList
    .map((slot) => {
      if (slot.itemData === null) {
        return {
          slotIndex: slot.slotIndex,
          itemTypeId: slot.itemTypeId,
          itemData: null,
        };
      }

      const itemType = itemTypeMap.get(slot.itemData.itemTypeId) ?? null;
      const rarity = rarityMap.get(slot.itemData.rarityId) ?? null;
      const patchLevel =
        patchLevelMap.get(slot.itemData.patchLevelId) ?? null;
      const plateName = plateNameMap.get(slot.itemData.plateNameId) ?? null;

      const plates = slot.itemData.plateIds
        .map((plateId) => {
          return plateMap.get(plateId) ?? null;
        })
        .filter((plate): plate is NonNullable<typeof plate> => {
          return plate !== null;
        });

      const plate3rdStat =
        slot.itemData.plate3rdStatId === null
          ? null
          : (plate3rdStatMap.get(slot.itemData.plate3rdStatId) ?? null);

      if (
        itemType === null ||
        rarity === null ||
        patchLevel === null ||
        plateName === null ||
        plates.length === 0
      ) {
        return null;
      }

      return {
        slotIndex: slot.slotIndex,
        itemTypeId: slot.itemTypeId,
        itemData: {
          uuid: createUuid(),
          itemType,
          plates,
          rarity,
          patchLevel,
          plateName,
          plate3rdStat,
        },
      };
    })
    .filter((slot): slot is InventorySlot => {
      return slot !== null;
    });

  return {
    inventoryList,
    equipmentList: [...shareState.equipmentList],
    runeList: [...shareState.runeList],
  };
};

export const buildMemoryStateUrl = async (
  state: AppMemoryState,
  baseUrl?: string,
): Promise<string> => {
  const resolvedBaseUrl =
    baseUrl ?? `${window.location.origin}${window.location.pathname}`;

  const url = new URL(resolvedBaseUrl);
  const shareState = toShareState(state);
  const serializedState = JSON.stringify(shareState);
  const encodedState = encodeURIComponent(serializedState);

  url.search = "";
  url.hash = STATE_HASH_KEY + encodedState;

  return url.toString();
};

export const getShareStateFromUrl = async (
  urlString?: string,
): Promise<ShareAppMemoryState | null> => {
  try {
    const resolvedUrl =
      urlString ??
      `${window.location.origin}${window.location.pathname}${window.location.hash}`;

    const url = new URL(resolvedUrl);
    const stateValue = getStateValueFromHash(url.hash);

    if (!stateValue) {
      return null;
    }

    const decodedText = decodeURIComponent(stateValue);
    const parsedState = JSON.parse(decodedText) as unknown;

    return sanitizeShareAppMemoryState(parsedState);
  } catch (error: unknown) {
    console.error("getShareStateFromUrl failed.", error);
    return null;
  }
};

export const restoreStateFromUrl = async (
  urlString?: string,
): Promise<boolean> => {
  try {
    const shareState = await getShareStateFromUrl(urlString);

    if (!shareState) {
      return false;
    }

    const runtimeState = fromShareState(shareState);

    appMemory.replaceState(runtimeState);

    return true;
  } catch (error: unknown) {
    console.error("restoreStateFromUrl failed.", error);
    return false;
  }
};