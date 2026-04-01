import { GameDataLoader } from "../data/GameDataLoader";
import { appMemory } from "./AppMemory";
import type { AppMemoryState } from "./models/AppMemoryState";
import type {
  ShareAppMemoryState,
  ShareEquippedHeraldrySlot,
  ShareInventoryPlateItemData,
  ShareInventorySlot,
} from "./models/AppMemoryShareState";
import type {
  EquippedHeraldrySlot,
  HeraldrySlotType,
  InventorySlot,
} from "./models/InventoryModels";

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

const isHeraldrySlotType = (value: unknown): value is HeraldrySlotType => {
  return (
    value === "stat" ||
    value === "skill" ||
    value === "corner" ||
    value === "special"
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

const isShareEquippedHeraldrySlot = (
  value: unknown,
): value is ShareEquippedHeraldrySlot => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.slotKey === "string" &&
    isHeraldrySlotType(value.slotType) &&
    typeof value.itemTypeId === "number" &&
    isShareInventoryPlateItemData(value.itemData)
  );
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
        return isShareEquippedHeraldrySlot(item);
      })
    : [];

  const runeList = Array.isArray(runeListRaw)
    ? runeListRaw.filter((item: unknown) => {
        return isRecord(item);
      })
    : [];

  return {
    inventoryList,
    equipmentList,
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
          plateIds: [...slot.itemData.plateIds],
          rarityId: slot.itemData.rarityId,
          patchLevelId: slot.itemData.patchLevelId,
          plateNameId: slot.itemData.plateNameId,
          plate3rdStatId: slot.itemData.plate3rdStatId,
        },
      };
    }),
    equipmentList: state.equipmentList.map((slot) => {
      return {
        slotKey: slot.slotKey,
        slotType: slot.slotType,
        itemTypeId: slot.itemTypeId,
        itemData: {
          kind: "plate",
          plateIds: [...slot.itemData.plateIds],
          rarityId: slot.itemData.rarityId,
          patchLevelId: slot.itemData.patchLevelId,
          plateNameId: slot.itemData.plateNameId,
          plate3rdStatId: slot.itemData.plate3rdStatId,
        },
      };
    }),
    runeList: [...state.runeList],
  };
};

const fromShareState = (shareState: ShareAppMemoryState): AppMemoryState => {
  const gameData = GameDataLoader.load();

  const itemTypeIdSet = new Set<number>(
    gameData.itemTypes.map((itemType) => {
      return itemType.typeId;
    }),
  );

  const plateIdSet = new Set<number>(
    gameData.plates.map((plate) => {
      return plate.id;
    }),
  );

  const rarityIdSet = new Set<number>(
    gameData.rarities.map((rarity) => {
      return rarity.rarityId;
    }),
  );

  const patchLevelIdSet = new Set<number>(
    gameData.patchLevels.map((patchLevel) => {
      return patchLevel.id;
    }),
  );

  const plateNameIdSet = new Set<number>(
    gameData.plateNames.map((plateName) => {
      return plateName.id;
    }),
  );

  const plate3rdStatIdSet = new Set<number>(
    gameData.plate3rdStats.map((plate3rdStat) => {
      return plate3rdStat.id;
    }),
  );

  const inventoryList: InventorySlot[] = shareState.inventoryList
    .map((slot) => {
      if (!itemTypeIdSet.has(slot.itemTypeId)) {
        return null;
      }

      if (slot.itemData === null) {
        return {
          slotIndex: slot.slotIndex,
          itemTypeId: slot.itemTypeId,
          itemData: null,
        };
      }

      const allPlateIdsValid =
        slot.itemData.plateIds.length > 0 &&
        slot.itemData.plateIds.every((plateId) => {
          return plateIdSet.has(plateId);
        });

      const isRarityValid = rarityIdSet.has(slot.itemData.rarityId);
      const isPatchLevelValid = patchLevelIdSet.has(slot.itemData.patchLevelId);
      const isPlateNameValid = plateNameIdSet.has(slot.itemData.plateNameId);
      const isPlate3rdStatValid =
        slot.itemData.plate3rdStatId === null ||
        plate3rdStatIdSet.has(slot.itemData.plate3rdStatId);

      if (
        !allPlateIdsValid ||
        !isRarityValid ||
        !isPatchLevelValid ||
        !isPlateNameValid ||
        !isPlate3rdStatValid
      ) {
        return null;
      }

      return {
        slotIndex: slot.slotIndex,
        itemTypeId: slot.itemTypeId,
        itemData: {
          kind: "plate",
          uuid: createUuid(),
          plateIds: [...slot.itemData.plateIds],
          rarityId: slot.itemData.rarityId,
          patchLevelId: slot.itemData.patchLevelId,
          plateNameId: slot.itemData.plateNameId,
          plate3rdStatId: slot.itemData.plate3rdStatId,
        },
      };
    })
    .filter((slot): slot is InventorySlot => {
      return slot !== null;
    });

  const equipmentList: EquippedHeraldrySlot[] = shareState.equipmentList
    .map((slot) => {
      if (!itemTypeIdSet.has(slot.itemTypeId)) {
        return null;
      }

      const allPlateIdsValid =
        slot.itemData.plateIds.length > 0 &&
        slot.itemData.plateIds.every((plateId) => {
          return plateIdSet.has(plateId);
        });

      const isRarityValid = rarityIdSet.has(slot.itemData.rarityId);
      const isPatchLevelValid = patchLevelIdSet.has(slot.itemData.patchLevelId);
      const isPlateNameValid = plateNameIdSet.has(slot.itemData.plateNameId);
      const isPlate3rdStatValid =
        slot.itemData.plate3rdStatId === null ||
        plate3rdStatIdSet.has(slot.itemData.plate3rdStatId);

      if (
        !allPlateIdsValid ||
        !isRarityValid ||
        !isPatchLevelValid ||
        !isPlateNameValid ||
        !isPlate3rdStatValid
      ) {
        return null;
      }

      return {
        slotKey: slot.slotKey,
        slotType: slot.slotType,
        itemTypeId: slot.itemTypeId,
        itemData: {
          kind: "plate",
          uuid: createUuid(),
          plateIds: [...slot.itemData.plateIds],
          rarityId: slot.itemData.rarityId,
          patchLevelId: slot.itemData.patchLevelId,
          plateNameId: slot.itemData.plateNameId,
          plate3rdStatId: slot.itemData.plate3rdStatId,
        },
      };
    })
    .filter((slot): slot is EquippedHeraldrySlot => {
      return slot !== null;
    });

  return {
    inventoryList,
    equipmentList,
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