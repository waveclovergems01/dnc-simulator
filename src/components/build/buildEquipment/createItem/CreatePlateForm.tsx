import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { GameDataLoader } from "../../../../data/GameDataLoader";
import type * as GameDataModels from "../../../../model/GameDataModels";
import { appMemory } from "../../../../state/AppMemory";
import {
  createInventoryPlateItemData,
  createInventoryPlateSlot,
} from "../../../../state/models/InventoryFactories";
import type { CreateItemMode } from "./createItemTypes";

interface PreviewRow {
  key: string;
  text: string;
}

interface PlateGroupOption {
  groupId: number;
  plates: GameDataModels.Plate[];
  label: string;
}

interface ThirdStatOption {
  key: string;
  plateThirdStat: GameDataModels.PlateThirdStat;
  statLabel: string;
  valueLabel: string;
  rarityLabel: string;
}

interface PlateFormInitialState {
  selectedPlateTypeId: number;
  selectedPlateNameId: number;
  selectedRarityId: number;
  selectedPlateLevelId: number;
  selectedPlateGroupId: number;
  selectedThirdStatKey: string;
}

interface CreatePlateFormProps {
  mode?: CreateItemMode;
  editingSlotIndex?: number | null;
  onRegisterSubmit?: (submitHandler: (() => boolean) | null) => void;
  onCanSubmitChange?: (canSubmit: boolean) => void;
  onFinishEdit?: () => void;
}

const PLATE_ENHANCEMENT_TYPE_ID = 30001;
const PLATE_SKILL_TYPE_ID = 30002;
const PLATE_SPECIAL_SKILL_TYPE_ID = 30003;
const PLATE_FELLOWSHIP_TYPE_ID = 30004;

const STAT_DISPLAY_PRIORITY = new Map<number, number>(
  [
    7,
    8,
    3,
    4,
    5,
    6,
    9,
    10,
    11,
    13,
    12,
    14,
    20,
    21,
    18,
    19,
    15,
    17,
    16,
    24,
    25,
    22,
    23,
  ].map((statId, index) => {
    return [statId, index] as const;
  }),
);

const getStatPriority = (statId: number): number => {
  return STAT_DISPLAY_PRIORITY.get(statId) ?? 1000 + statId;
};

const sortPlatesByStatPriority = (
  plates: GameDataModels.Plate[],
): GameDataModels.Plate[] => {
  return [...plates].sort((left, right) => {
    const priorityDiff =
      getStatPriority(left.statId) - getStatPriority(right.statId);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return left.id - right.id;
  });
};

const resolveAssetUrl = (pathFile: string): string => {
  const normalizedPath = pathFile.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

const getStatLabel = (
  statId: number,
  stats: GameDataModels.StatDefinition[],
): string => {
  const statDefinition =
    stats.find((stat: GameDataModels.StatDefinition) => {
      return stat.statId === statId;
    }) ?? null;

  if (!statDefinition) {
    return `Stat ${statId}`;
  }

  return statDefinition.displayName || statDefinition.statName;
};

const getRarityLabel = (
  rarityId: number,
  rarities: GameDataModels.Rarity[],
): string => {
  const rarity =
    rarities.find((item: GameDataModels.Rarity) => {
      return item.rarityId === rarityId;
    }) ?? null;

  return rarity ? rarity.rarityName : `Rarity ${rarityId}`;
};

const formatThirdStatValue = (
  thirdStat: GameDataModels.PlateThirdStat,
): string => {
  if (thirdStat.isPercentage) {
    return `${thirdStat.value}%`;
  }

  return `${thirdStat.value}`;
};

const buildThirdStatKey = (
  thirdStat: GameDataModels.PlateThirdStat | null,
): string => {
  if (!thirdStat) {
    return "";
  }

  return `${thirdStat.id}`;
};

const buildPlateGroupLabel = (
  plates: GameDataModels.Plate[],
  stats: GameDataModels.StatDefinition[],
): string => {
  return sortPlatesByStatPriority(plates)
    .map((plate: GameDataModels.Plate) => {
      const statLabel = getStatLabel(plate.statId, stats);

      if (plate.statValue > 0) {
        return `${statLabel} : ${plate.statValue}`;
      }

      if (plate.statPercent > 0) {
        return `${statLabel} : ${plate.statPercent}%`;
      }

      return "";
    })
    .filter(Boolean)
    .join(" / ");
};

const getAllowedRarityIdsForItemType = (
  itemTypeId: number,
  gameData: GameDataModels.GameDataBundle,
): number[] => {
  const itemTypeRule = gameData.rarityRules.itemTypes[itemTypeId];

  if (itemTypeRule && itemTypeRule.length > 0) {
    return itemTypeRule;
  }

  const itemType =
    gameData.itemTypes.find((entry: GameDataModels.ItemType) => {
      return entry.typeId === itemTypeId;
    }) ?? null;

  if (!itemType) {
    return [];
  }

  const categoryRule = gameData.rarityRules.categories[itemType.categoryId];

  if (categoryRule && categoryRule.length > 0) {
    return categoryRule;
  }

  return Array.from(
    new Set(
      gameData.plates
        .filter((plate: GameDataModels.Plate) => {
          return plate.plateTypeId === itemTypeId;
        })
        .map((plate: GameDataModels.Plate) => {
          return plate.rarityId;
        }),
    ),
  ).sort((left, right) => {
    return left - right;
  });
};

const CreatePlateForm: React.FC<CreatePlateFormProps> = ({
  mode = "new",
  editingSlotIndex = null,
  onRegisterSubmit,
  onCanSubmitChange,
  onFinishEdit,
}) => {
  const gameData = useMemo(() => {
    return GameDataLoader.load();
  }, []);

  const plateThirdStatMap = useMemo<Map<number, GameDataModels.PlateThirdStat>>(() => {
    return new Map(
      gameData.plate3rdStats.map((plateThirdStat: GameDataModels.PlateThirdStat) => {
        return [plateThirdStat.id, plateThirdStat] as const;
      }),
    );
  }, [gameData]);

  const heraldryItemTypes = useMemo<GameDataModels.ItemType[]>(() => {
    return gameData.itemTypes
      .filter((itemType: GameDataModels.ItemType) => {
        return itemType.categoryId === 30000;
      })
      .sort((left, right) => {
        return left.typeId - right.typeId;
      });
  }, [gameData]);

  const plateLevelOptions = useMemo<GameDataModels.PatchLevel[]>(() => {
    return [...gameData.patchLevels].sort((left, right) => {
      return left.level - right.level;
    });
  }, [gameData]);

  const initialFormState = useMemo<PlateFormInitialState>(() => {
    const defaultPlateTypeId = heraldryItemTypes[0]?.typeId ?? 0;
    const defaultAllowedRarityIds = getAllowedRarityIdsForItemType(
      defaultPlateTypeId,
      gameData,
    );
    const defaultRarityId = defaultAllowedRarityIds[0] ?? 0;

    const defaultState: PlateFormInitialState = {
      selectedPlateTypeId: defaultPlateTypeId,
      selectedPlateNameId: 0,
      selectedRarityId: defaultRarityId,
      selectedPlateLevelId: plateLevelOptions[0]?.id ?? 0,
      selectedPlateGroupId: 0,
      selectedThirdStatKey: "",
    };

    if (mode !== "edit" || editingSlotIndex === null) {
      return defaultState;
    }

    const editingSlot = appMemory.getInventorySlot(editingSlotIndex);

    if (
      !editingSlot ||
      !editingSlot.itemData ||
      editingSlot.itemData.kind !== "plate"
    ) {
      return defaultState;
    }

    const itemData = editingSlot.itemData;
    const selectedThirdStat =
      itemData.plate3rdStatId === null
        ? null
        : (plateThirdStatMap.get(itemData.plate3rdStatId) ?? null);
    const firstPlateId = itemData.plateIds[0] ?? 0;
    const selectedPlate =
      gameData.plates.find((plate: GameDataModels.Plate) => {
        return plate.id === firstPlateId;
      }) ?? null;

    return {
      selectedPlateTypeId: editingSlot.itemTypeId,
      selectedPlateNameId: itemData.plateNameId,
      selectedRarityId: itemData.rarityId,
      selectedPlateLevelId: itemData.patchLevelId,
      selectedPlateGroupId: selectedPlate?.plateGroupId ?? 0,
      selectedThirdStatKey: buildThirdStatKey(selectedThirdStat),
    };
  }, [
    editingSlotIndex,
    gameData,
    heraldryItemTypes,
    mode,
    plateLevelOptions,
    plateThirdStatMap,
  ]);

  const [selectedPlateTypeId, setSelectedPlateTypeId] = useState<number>(
    initialFormState.selectedPlateTypeId,
  );
  const [selectedPlateNameId, setSelectedPlateNameId] = useState<number>(
    initialFormState.selectedPlateNameId,
  );
  const [selectedRarityId, setSelectedRarityId] = useState<number>(
    initialFormState.selectedRarityId,
  );
  const [selectedPlateLevelId, setSelectedPlateLevelId] = useState<number>(
    initialFormState.selectedPlateLevelId,
  );
  const [selectedPlateGroupId, setSelectedPlateGroupId] = useState<number>(
    initialFormState.selectedPlateGroupId,
  );
  const [selectedThirdStatKey, setSelectedThirdStatKey] = useState<string>(
    initialFormState.selectedThirdStatKey,
  );
  const [isPlateNameDropdownOpen, setIsPlateNameDropdownOpen] =
    useState<boolean>(false);
  const [isBulkCreateOpen, setIsBulkCreateOpen] = useState<boolean>(false);
  const [bulkPlateTypeId, setBulkPlateTypeId] = useState<number>(0);
  const [bulkRarityId, setBulkRarityId] = useState<number>(0);
  const [bulkPlateLevelId, setBulkPlateLevelId] = useState<number>(0);

  const plateNameDropdownRef = useRef<HTMLDivElement | null>(null);

  const isEnhancementPlate = selectedPlateTypeId === PLATE_ENHANCEMENT_TYPE_ID;
  const isSkillPlate = selectedPlateTypeId === PLATE_SKILL_TYPE_ID;
  const isSpecialSkillPlate =
    selectedPlateTypeId === PLATE_SPECIAL_SKILL_TYPE_ID;
  const isFellowshipPlate = selectedPlateTypeId === PLATE_FELLOWSHIP_TYPE_ID;
  const isStatPlate = isEnhancementPlate || isFellowshipPlate;

  // --- Bulk create derived data ---
  const effectiveBulkPlateTypeId = useMemo<number>(() => {
    if (heraldryItemTypes.some((t) => t.typeId === bulkPlateTypeId)) return bulkPlateTypeId;
    return heraldryItemTypes[0]?.typeId ?? 0;
  }, [bulkPlateTypeId, heraldryItemTypes]);

  const bulkRarityOptions = useMemo<GameDataModels.Rarity[]>(() => {
    if (!effectiveBulkPlateTypeId) return [];
    const ids = new Set<number>(
      gameData.plates
        .filter((p: GameDataModels.Plate) => p.plateTypeId === effectiveBulkPlateTypeId)
        .map((p: GameDataModels.Plate) => p.rarityId),
    );
    return gameData.rarities
      .filter((r: GameDataModels.Rarity) => ids.has(r.rarityId))
      .sort((a: GameDataModels.Rarity, b: GameDataModels.Rarity) => a.rarityId - b.rarityId);
  }, [effectiveBulkPlateTypeId, gameData]);

  const effectiveBulkRarityId = useMemo<number>(() => {
    if (bulkRarityOptions.some((r) => r.rarityId === bulkRarityId)) return bulkRarityId;
    return bulkRarityOptions[0]?.rarityId ?? 0;
  }, [bulkRarityId, bulkRarityOptions]);

  const bulkLevelOptions = useMemo<GameDataModels.PatchLevel[]>(() => {
    if (!effectiveBulkPlateTypeId || !effectiveBulkRarityId) return [];
    const ids = new Set<number>(
      gameData.plates
        .filter((p: GameDataModels.Plate) =>
          p.plateTypeId === effectiveBulkPlateTypeId && p.rarityId === effectiveBulkRarityId)
        .map((p: GameDataModels.Plate) => p.plateLevelId),
    );
    return plateLevelOptions.filter((l) => ids.has(l.id));
  }, [effectiveBulkPlateTypeId, effectiveBulkRarityId, gameData.plates, plateLevelOptions]);

  const effectiveBulkPlateLevelId = useMemo<number>(() => {
    if (bulkLevelOptions.some((l) => l.id === bulkPlateLevelId)) return bulkPlateLevelId;
    return bulkLevelOptions[0]?.id ?? 0;
  }, [bulkPlateLevelId, bulkLevelOptions]);

  const bulkPreviewCount = useMemo<number>(() => {
    if (!effectiveBulkPlateTypeId || !effectiveBulkRarityId || !effectiveBulkPlateLevelId) return 0;
    const comboSet = new Set<string>();
    gameData.plates
      .filter((p: GameDataModels.Plate) =>
        p.plateTypeId === effectiveBulkPlateTypeId &&
        p.rarityId === effectiveBulkRarityId &&
        p.plateLevelId === effectiveBulkPlateLevelId)
      .forEach((p: GameDataModels.Plate) => comboSet.add(`${p.plateNameId}|${p.plateGroupId}`));
    return comboSet.size;
  }, [effectiveBulkPlateTypeId, effectiveBulkRarityId, effectiveBulkPlateLevelId, gameData.plates]);

  const handleBulkCreate = (): void => {
    if (!effectiveBulkPlateTypeId || !effectiveBulkRarityId || !effectiveBulkPlateLevelId) return;
    const comboMap = new Map<string, { plateNameId: number; plateIds: number[] }>();
    gameData.plates
      .filter((p: GameDataModels.Plate) =>
        p.plateTypeId === effectiveBulkPlateTypeId &&
        p.rarityId === effectiveBulkRarityId &&
        p.plateLevelId === effectiveBulkPlateLevelId)
      .forEach((p: GameDataModels.Plate) => {
        const key = `${p.plateNameId}|${p.plateGroupId}`;
        if (!comboMap.has(key)) comboMap.set(key, { plateNameId: p.plateNameId, plateIds: [] });
        comboMap.get(key)!.plateIds.push(p.id);
      });
    comboMap.forEach((combo) => {
      appMemory.addInventorySlot(createInventoryPlateSlot({
        inventoryList: appMemory.getInventoryList(),
        itemTypeId: effectiveBulkPlateTypeId,
        plateIds: combo.plateIds,
        rarityId: effectiveBulkRarityId,
        patchLevelId: effectiveBulkPlateLevelId,
        plateNameId: combo.plateNameId,
        plate3rdStatId: null,
      }));
    });
    setIsBulkCreateOpen(false);
  };

  const shouldShowRarity = isStatPlate || isSkillPlate;
  const shouldShowPlateLevel = isStatPlate;
  const shouldShowPlateStats = isStatPlate;
  const shouldShowThirdStat = isStatPlate;

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent): void => {
      if (!plateNameDropdownRef.current) {
        return;
      }

      const targetNode = event.target;

      if (!(targetNode instanceof Node)) {
        return;
      }

      if (!plateNameDropdownRef.current.contains(targetNode)) {
        setIsPlateNameDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  const rarityOptions = useMemo<GameDataModels.Rarity[]>(() => {
    if (selectedPlateTypeId === 0) {
      return [];
    }

    const allowedRarityIds = getAllowedRarityIdsForItemType(
      selectedPlateTypeId,
      gameData,
    );
    const allowedRarityIdSet = new Set<number>(allowedRarityIds);

    return gameData.rarities
      .filter((rarity: GameDataModels.Rarity) => {
        return allowedRarityIdSet.has(rarity.rarityId);
      })
      .sort((left, right) => {
        return left.rarityId - right.rarityId;
      });
  }, [gameData, selectedPlateTypeId]);

  const effectiveSelectedRarityId = useMemo<number>(() => {
    if (!shouldShowRarity) {
      return 0;
    }

    if (rarityOptions.length === 0) {
      return 0;
    }

    const hasSelectedRarity = rarityOptions.some(
      (rarity: GameDataModels.Rarity) => {
        return rarity.rarityId === selectedRarityId;
      },
    );

    if (hasSelectedRarity) {
      return selectedRarityId;
    }

    return rarityOptions[0].rarityId;
  }, [rarityOptions, selectedRarityId, shouldShowRarity]);

  const availablePlateLevelOptions = useMemo<GameDataModels.PatchLevel[]>(() => {
    if (!shouldShowPlateLevel) {
      return [];
    }

    const levelIdSet = new Set<number>();

    gameData.plates.forEach((plate: GameDataModels.Plate) => {
      if (plate.plateTypeId !== selectedPlateTypeId) {
        return;
      }

      if (
        effectiveSelectedRarityId !== 0 &&
        plate.rarityId !== effectiveSelectedRarityId
      ) {
        return;
      }

      levelIdSet.add(plate.plateLevelId);
    });

    return plateLevelOptions.filter((level: GameDataModels.PatchLevel) => {
      return levelIdSet.has(level.id);
    });
  }, [
    effectiveSelectedRarityId,
    gameData.plates,
    plateLevelOptions,
    selectedPlateTypeId,
    shouldShowPlateLevel,
  ]);

  const effectiveSelectedPlateLevelId = useMemo<number>(() => {
    if (!shouldShowPlateLevel) {
      return 0;
    }

    if (availablePlateLevelOptions.length === 0) {
      return 0;
    }

    const hasSelectedPlateLevel = availablePlateLevelOptions.some(
      (level: GameDataModels.PatchLevel) => {
        return level.id === selectedPlateLevelId;
      },
    );

    if (hasSelectedPlateLevel) {
      return selectedPlateLevelId;
    }

    return availablePlateLevelOptions[0].id;
  }, [
    availablePlateLevelOptions,
    selectedPlateLevelId,
    shouldShowPlateLevel,
  ]);

  const plateNameOptions = useMemo<GameDataModels.PlateName[]>(() => {
    if (selectedPlateTypeId === 0) {
      return [];
    }

    const plateNameIds = new Set<number>();

    gameData.plates.forEach((plate: GameDataModels.Plate) => {
      if (plate.plateTypeId !== selectedPlateTypeId) {
        return;
      }

      if (isStatPlate) {
        if (
          effectiveSelectedRarityId === 0 ||
          effectiveSelectedPlateLevelId === 0
        ) {
          return;
        }

        if (plate.rarityId !== effectiveSelectedRarityId) {
          return;
        }

        if (plate.plateLevelId !== effectiveSelectedPlateLevelId) {
          return;
        }
      }

      if (isSkillPlate) {
        if (effectiveSelectedRarityId === 0) {
          return;
        }

        if (plate.rarityId !== effectiveSelectedRarityId) {
          return;
        }
      }

      if (isSpecialSkillPlate) {
        // use only plate type
      }

      plateNameIds.add(plate.plateNameId);
    });

    return gameData.plateNames
      .filter((plateName: GameDataModels.PlateName) => {
        return plateNameIds.has(plateName.id);
      })
      .sort((left, right) => {
        return left.name.localeCompare(right.name);
      });
  }, [
    effectiveSelectedPlateLevelId,
    effectiveSelectedRarityId,
    gameData,
    isStatPlate,
    isSkillPlate,
    isSpecialSkillPlate,
    selectedPlateTypeId,
  ]);

  const isPlateNameSelectable = useMemo<boolean>(() => {
    return plateNameOptions.length > 0;
  }, [plateNameOptions]);

  const shouldRenderPlateNameDropdown = useMemo<boolean>(() => {
    return isPlateNameDropdownOpen && isPlateNameSelectable;
  }, [isPlateNameDropdownOpen, isPlateNameSelectable]);

  const effectiveSelectedPlateNameId = useMemo<number>(() => {
    if (plateNameOptions.length === 0) {
      return 0;
    }

    const hasSelectedPlateName = plateNameOptions.some(
      (plateName: GameDataModels.PlateName) => {
        return plateName.id === selectedPlateNameId;
      },
    );

    if (hasSelectedPlateName) {
      return selectedPlateNameId;
    }

    return plateNameOptions[0].id;
  }, [plateNameOptions, selectedPlateNameId]);

  const selectedPlateName = useMemo<GameDataModels.PlateName | null>(() => {
    if (effectiveSelectedPlateNameId === 0) {
      return null;
    }

    return (
      plateNameOptions.find((plateName: GameDataModels.PlateName) => {
        return plateName.id === effectiveSelectedPlateNameId;
      }) ?? null
    );
  }, [effectiveSelectedPlateNameId, plateNameOptions]);

  const matchedPlateCandidates = useMemo<GameDataModels.Plate[]>(() => {
    if (selectedPlateTypeId === 0 || effectiveSelectedPlateNameId === 0) {
      return [];
    }

    return gameData.plates
      .filter((plate: GameDataModels.Plate) => {
        if (plate.plateTypeId !== selectedPlateTypeId) {
          return false;
        }

        if (plate.plateNameId !== effectiveSelectedPlateNameId) {
          return false;
        }

        if (isStatPlate) {
          return (
            plate.rarityId === effectiveSelectedRarityId &&
            plate.plateLevelId === effectiveSelectedPlateLevelId
          );
        }

        if (isSkillPlate) {
          return plate.rarityId === effectiveSelectedRarityId;
        }

        if (isSpecialSkillPlate) {
          return true;
        }

        return false;
      })
      .sort((left, right) => {
        if (left.plateLevelId !== right.plateLevelId) {
          return left.plateLevelId - right.plateLevelId;
        }

        if (left.rarityId !== right.rarityId) {
          return left.rarityId - right.rarityId;
        }

        return left.id - right.id;
      });
  }, [
    effectiveSelectedPlateLevelId,
    effectiveSelectedPlateNameId,
    effectiveSelectedRarityId,
    gameData,
    isStatPlate,
    isSkillPlate,
    isSpecialSkillPlate,
    selectedPlateTypeId,
  ]);

  const plateGroupOptions = useMemo<PlateGroupOption[]>(() => {
    const groupMap = new Map<number, GameDataModels.Plate[]>();

    matchedPlateCandidates.forEach((plate: GameDataModels.Plate) => {
      const group = groupMap.get(plate.plateGroupId) ?? [];
      group.push(plate);
      groupMap.set(plate.plateGroupId, group);
    });

    return Array.from(groupMap.entries())
      .map(([groupId, plates]) => {
        return {
          groupId,
          plates: sortPlatesByStatPriority(plates),
          label: buildPlateGroupLabel(plates, gameData.stats),
        };
      })
      .sort((left, right) => {
        return left.groupId - right.groupId;
      });
  }, [gameData.stats, matchedPlateCandidates]);

  const effectiveSelectedPlateGroupId = useMemo<number>(() => {
    if (plateGroupOptions.length === 0) {
      return 0;
    }

    const hasSelectedGroup = plateGroupOptions.some((option) => {
      return option.groupId === selectedPlateGroupId;
    });

    if (hasSelectedGroup) {
      return selectedPlateGroupId;
    }

    return plateGroupOptions[0].groupId;
  }, [plateGroupOptions, selectedPlateGroupId]);

  const matchedPlates = useMemo<GameDataModels.Plate[]>(() => {
    if (effectiveSelectedPlateGroupId === 0) {
      return [];
    }

    return (
      plateGroupOptions.find((option: PlateGroupOption) => {
        return option.groupId === effectiveSelectedPlateGroupId;
      })?.plates ?? []
    );
  }, [effectiveSelectedPlateGroupId, plateGroupOptions]);

  const previewRows = useMemo<PreviewRow[]>(() => {
    if (!isStatPlate || matchedPlates.length === 0) {
      return [];
    }

    const rows: PreviewRow[] = [];
    const seen = new Set<string>();

    sortPlatesByStatPriority(matchedPlates)
      .forEach((plate: GameDataModels.Plate) => {
      const statLabel = getStatLabel(plate.statId, gameData.stats);

      if (plate.statValue > 0) {
        const key = `${plate.statId}-value-${plate.statValue}`;

        if (!seen.has(key)) {
          seen.add(key);
          rows.push({
            key,
            text: `${statLabel} : ${plate.statValue}`,
          });
        }
      }

      if (plate.statPercent > 0) {
        const key = `${plate.statId}-percent-${plate.statPercent}`;

        if (!seen.has(key)) {
          seen.add(key);
          rows.push({
            key,
            text: `${statLabel} : ${plate.statPercent}%`,
          });
        }
      }
      });

    return rows;
  }, [gameData.stats, isStatPlate, matchedPlates]);

  const mainStatIdSet = useMemo<Set<number>>(() => {
    return new Set<number>(
      matchedPlates.map((plate: GameDataModels.Plate) => {
        return plate.statId;
      }),
    );
  }, [matchedPlates]);

  const thirdStatOptions = useMemo<ThirdStatOption[]>(() => {
    if (
      !isStatPlate ||
      effectiveSelectedRarityId === 0 ||
      effectiveSelectedPlateLevelId === 0 ||
      matchedPlates.length === 0
    ) {
      return [];
    }

    const uniqueMap = new Map<string, ThirdStatOption>();

    gameData.plate3rdStats.forEach(
      (thirdStat: GameDataModels.PlateThirdStat) => {
        if (thirdStat.patchLevelId !== effectiveSelectedPlateLevelId) {
          return;
        }

        if (thirdStat.rarityId !== effectiveSelectedRarityId) {
          return;
        }

        if (mainStatIdSet.has(thirdStat.statId)) {
          return;
        }

        const statLabel = getStatLabel(thirdStat.statId, gameData.stats);
        const valueLabel = formatThirdStatValue(thirdStat);
        const rarityLabel = getRarityLabel(
          thirdStat.rarityId,
          gameData.rarities,
        );
        const key = buildThirdStatKey(thirdStat);

        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, {
            key,
            plateThirdStat: thirdStat,
            statLabel,
            valueLabel,
            rarityLabel,
          });
        }
      },
    );

    return Array.from(uniqueMap.values()).sort((left, right) => {
      const priorityDiff =
        getStatPriority(left.plateThirdStat.statId) -
        getStatPriority(right.plateThirdStat.statId);

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      const leftText = `${left.statLabel} ${left.valueLabel} ${left.rarityLabel}`;
      const rightText = `${right.statLabel} ${right.valueLabel} ${right.rarityLabel}`;

      return leftText.localeCompare(rightText);
    });
  }, [
    effectiveSelectedPlateLevelId,
    effectiveSelectedRarityId,
    gameData.plate3rdStats,
    gameData.rarities,
    gameData.stats,
    isStatPlate,
    mainStatIdSet,
    matchedPlates.length,
  ]);

  const effectiveSelectedThirdStatKey = useMemo<string>(() => {
    if (!shouldShowThirdStat) {
      return "";
    }

    if (selectedThirdStatKey === "") {
      return "";
    }

    const hasSelectedThirdStat = thirdStatOptions.some(
      (option: ThirdStatOption) => {
        return option.key === selectedThirdStatKey;
      },
    );

    if (hasSelectedThirdStat) {
      return selectedThirdStatKey;
    }

    return "";
  }, [selectedThirdStatKey, shouldShowThirdStat, thirdStatOptions]);

  const selectedItemType = useMemo<GameDataModels.ItemType | null>(() => {
    return (
      heraldryItemTypes.find((itemType: GameDataModels.ItemType) => {
        return itemType.typeId === selectedPlateTypeId;
      }) ?? null
    );
  }, [heraldryItemTypes, selectedPlateTypeId]);

  const selectedRarity = useMemo<GameDataModels.Rarity | null>(() => {
    if (!shouldShowRarity) {
      return null;
    }

    return (
      rarityOptions.find((rarity: GameDataModels.Rarity) => {
        return rarity.rarityId === effectiveSelectedRarityId;
      }) ?? null
    );
  }, [effectiveSelectedRarityId, rarityOptions, shouldShowRarity]);

  const selectedPatchLevel = useMemo<GameDataModels.PatchLevel | null>(() => {
    if (!shouldShowPlateLevel) {
      return null;
    }

    return (
      availablePlateLevelOptions.find((level: GameDataModels.PatchLevel) => {
        return level.id === effectiveSelectedPlateLevelId;
      }) ?? null
    );
  }, [
    availablePlateLevelOptions,
    effectiveSelectedPlateLevelId,
    shouldShowPlateLevel,
  ]);

  const selectedThirdStat = useMemo<GameDataModels.PlateThirdStat | null>(() => {
    if (!shouldShowThirdStat || effectiveSelectedThirdStatKey === "") {
      return null;
    }

    const foundOption =
      thirdStatOptions.find((option: ThirdStatOption) => {
        return option.key === effectiveSelectedThirdStatKey;
      }) ?? null;

    return foundOption ? foundOption.plateThirdStat : null;
  }, [effectiveSelectedThirdStatKey, shouldShowThirdStat, thirdStatOptions]);

  const resolvedSubmitRarityId = useMemo<number>(() => {
    if (isStatPlate || isSkillPlate) {
      return selectedRarity?.rarityId ?? 0;
    }

    return matchedPlates[0]?.rarityId ?? 0;
  }, [isSkillPlate, isStatPlate, matchedPlates, selectedRarity]);

  const resolvedSubmitPatchLevelId = useMemo<number>(() => {
    if (isStatPlate) {
      return selectedPatchLevel?.id ?? 0;
    }

    return matchedPlates[0]?.plateLevelId ?? 0;
  }, [isStatPlate, matchedPlates, selectedPatchLevel]);

  const canCreatePlate = useMemo<boolean>(() => {
    if (!selectedItemType || !selectedPlateName || matchedPlates.length === 0) {
      return false;
    }

    if (isStatPlate) {
      return (
        selectedRarity !== null &&
        selectedPatchLevel !== null &&
        previewRows.length > 0
      );
    }

    if (isSkillPlate) {
      return selectedRarity !== null;
    }

    if (isSpecialSkillPlate) {
      return true;
    }

    return false;
  }, [
    isStatPlate,
    isSkillPlate,
    isSpecialSkillPlate,
    matchedPlates.length,
    previewRows.length,
    selectedItemType,
    selectedPatchLevel,
    selectedPlateName,
    selectedRarity,
  ]);

  const handleSubmitPlate = useCallback((): boolean => {
    if (!selectedItemType || !selectedPlateName || matchedPlates.length === 0) {
      return false;
    }

    if (isStatPlate) {
      if (
        !selectedRarity ||
        !selectedPatchLevel ||
        previewRows.length === 0
      ) {
        return false;
      }
    }

    if (isSkillPlate && !selectedRarity) {
      return false;
    }

    if (resolvedSubmitRarityId === 0 || resolvedSubmitPatchLevelId === 0) {
      return false;
    }

    const plateIds = matchedPlates.map((plate: GameDataModels.Plate) => {
      return plate.id;
    });

    const nextThirdStatId =
      shouldShowThirdStat && selectedThirdStat ? selectedThirdStat.id : null;

    if (mode === "edit" && editingSlotIndex !== null) {
      const currentSlot = appMemory.getInventorySlot(editingSlotIndex);

      if (!currentSlot) {
        return false;
      }

      const currentUuid =
        currentSlot.itemData?.kind === "plate" ? currentSlot.itemData.uuid : null;

      const nextItemData = createInventoryPlateItemData({
        plateIds,
        rarityId: resolvedSubmitRarityId,
        patchLevelId: resolvedSubmitPatchLevelId,
        plateNameId: selectedPlateName.id,
        plate3rdStatId: nextThirdStatId,
      });

      appMemory.updateInventorySlot({
        slotIndex: currentSlot.slotIndex,
        itemTypeId: selectedItemType.typeId,
        itemData: {
          ...nextItemData,
          uuid: currentUuid ?? nextItemData.uuid,
        },
      });

      if (onFinishEdit) {
        onFinishEdit();
      }

      return true;
    }

    const nextSlot = createInventoryPlateSlot({
      inventoryList: appMemory.getInventoryList(),
      itemTypeId: selectedItemType.typeId,
      plateIds,
      rarityId: resolvedSubmitRarityId,
      patchLevelId: resolvedSubmitPatchLevelId,
      plateNameId: selectedPlateName.id,
      plate3rdStatId: nextThirdStatId,
    });

    appMemory.addInventorySlot(nextSlot);
    return true;
  }, [
    editingSlotIndex,
    isStatPlate,
    isSkillPlate,
    matchedPlates,
    mode,
    onFinishEdit,
    previewRows.length,
    resolvedSubmitPatchLevelId,
    resolvedSubmitRarityId,
    selectedItemType,
    selectedPatchLevel,
    selectedPlateName,
    selectedRarity,
    selectedThirdStat,
    shouldShowThirdStat,
  ]);

  useEffect(() => {
    if (onRegisterSubmit) {
      onRegisterSubmit(handleSubmitPlate);
    }

    return () => {
      if (onRegisterSubmit) {
        onRegisterSubmit(null);
      }
    };
  }, [handleSubmitPlate, onRegisterSubmit]);

  useEffect(() => {
    if (onCanSubmitChange) {
      onCanSubmitChange(canCreatePlate);
    }

    return () => {
      if (onCanSubmitChange) {
        onCanSubmitChange(false);
      }
    };
  }, [canCreatePlate, onCanSubmitChange]);

  const handlePlateTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const nextPlateTypeId = Number(event.target.value);
    const nextAllowedRarityIds = getAllowedRarityIdsForItemType(
      nextPlateTypeId,
      gameData,
    );

    setSelectedPlateTypeId(nextPlateTypeId);
    setSelectedPlateNameId(0);
    setSelectedPlateGroupId(0);
    setSelectedThirdStatKey("");
    setIsPlateNameDropdownOpen(false);

    if (nextPlateTypeId === PLATE_SPECIAL_SKILL_TYPE_ID) {
      setSelectedRarityId(0);
      return;
    }

    setSelectedRarityId(nextAllowedRarityIds[0] ?? 0);

    if (plateLevelOptions.length > 0) {
      setSelectedPlateLevelId((previous) => {
        const hasPrevious = plateLevelOptions.some((level) => {
          return level.id === previous;
        });

        return hasPrevious ? previous : plateLevelOptions[0].id;
      });
    }
  };

  const handlePlateNameSelect = (plateNameId: number): void => {
    setSelectedPlateNameId(plateNameId);
    setSelectedPlateGroupId(0);
    setSelectedThirdStatKey("");
    setIsPlateNameDropdownOpen(false);
  };

  const handleRarityChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setSelectedRarityId(Number(event.target.value));
    setSelectedPlateNameId(0);
    setSelectedPlateGroupId(0);
    setSelectedThirdStatKey("");
    setIsPlateNameDropdownOpen(false);
  };

  const handlePlateLevelChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setSelectedPlateLevelId(Number(event.target.value));
    setSelectedPlateNameId(0);
    setSelectedPlateGroupId(0);
    setSelectedThirdStatKey("");
    setIsPlateNameDropdownOpen(false);
  };

  const handlePlateGroupChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setSelectedPlateGroupId(Number(event.target.value));
    setSelectedThirdStatKey("");
  };

  const handleThirdStatChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setSelectedThirdStatKey(event.target.value);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px minmax(0, 1fr)",
        gap: "12px 16px",
        alignItems: "center",
      }}
    >
      {mode !== "edit" ? (
        <>
          <div />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => {
                setBulkPlateTypeId(selectedPlateTypeId);
                setBulkRarityId(0);
                setBulkPlateLevelId(0);
                setIsBulkCreateOpen(true);
              }}
              style={{
                minHeight: "38px",
                borderRadius: "6px",
                border: "1px solid #f59e0b66",
                backgroundColor: "#451a03",
                color: "#fde68a",
                padding: "0 14px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              Create All Plates
            </button>
          </div>
        </>
      ) : null}

      <div
        style={{
          color: "#e5e7eb",
          fontWeight: 500,
          fontSize: "13px",
        }}
      >
        Plate Type
      </div>
      <select
        value={selectedPlateTypeId}
        onChange={handlePlateTypeChange}
        style={{
          height: "40px",
          borderRadius: "6px",
          border: "1px solid #374151",
          backgroundColor: "#0f172a",
          color: "#f3f4f6",
          padding: "0 12px",
          outline: "none",
          fontSize: "13px",
        }}
      >
        {heraldryItemTypes.map((itemType: GameDataModels.ItemType) => {
          return (
            <option key={itemType.typeId} value={itemType.typeId}>
              {itemType.typeName}
            </option>
          );
        })}
      </select>

      {shouldShowRarity ? (
        <>
          <div
            style={{
              color: "#e5e7eb",
              fontWeight: 500,
              fontSize: "13px",
            }}
          >
            Rarity
          </div>
          <select
            value={effectiveSelectedRarityId}
            onChange={handleRarityChange}
            style={{
              height: "40px",
              borderRadius: "6px",
              border: "1px solid #374151",
              backgroundColor: "#0f172a",
              color: "#f3f4f6",
              padding: "0 12px",
              outline: "none",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {rarityOptions.map((rarity: GameDataModels.Rarity) => {
              return (
                <option
                  key={rarity.rarityId}
                  value={rarity.rarityId}
                  style={{
                    color: rarity.color,
                    backgroundColor: "#0f172a",
                  }}
                >
                  {rarity.rarityName}
                </option>
              );
            })}
          </select>
        </>
      ) : null}

      {shouldShowPlateLevel ? (
        <>
          <div
            style={{
              color: "#e5e7eb",
              fontWeight: 500,
              fontSize: "13px",
            }}
          >
            Plate Level
          </div>
          <select
            value={effectiveSelectedPlateLevelId}
            onChange={handlePlateLevelChange}
            style={{
              height: "40px",
              borderRadius: "6px",
              border: "1px solid #374151",
              backgroundColor: "#0f172a",
              color: "#f3f4f6",
              padding: "0 12px",
              outline: "none",
              fontSize: "13px",
            }}
          >
            {availablePlateLevelOptions.map((level: GameDataModels.PatchLevel) => {
              return (
                <option key={level.id} value={level.id}>
                  Lv. {level.level}
                </option>
              );
            })}
          </select>
        </>
      ) : null}

      <div
        style={{
          color: "#e5e7eb",
          fontWeight: 500,
          fontSize: "13px",
          alignSelf: "start",
          paddingTop: "10px",
        }}
      >
        Plate Name
      </div>
      <div
        ref={plateNameDropdownRef}
        style={{
          position: "relative",
        }}
      >
        <button
          type="button"
          disabled={!isPlateNameSelectable}
          onClick={() => {
            if (!isPlateNameSelectable) {
              return;
            }

            setIsPlateNameDropdownOpen((previous) => !previous);
          }}
          style={{
            width: "100%",
            minHeight: "58px",
            borderRadius: "6px",
            border: "1px solid #374151",
            backgroundColor: "#0f172a",
            color: "#f3f4f6",
            padding: "8px 12px",
            outline: "none",
            cursor: isPlateNameSelectable ? "pointer" : "not-allowed",
            opacity: isPlateNameSelectable ? 1 : 0.7,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            textAlign: "left",
          }}
        >
          {selectedPlateName ? (
            <div
              style={{
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <img
                src={resolveAssetUrl(selectedPlateName.pathFile)}
                alt={selectedPlateName.name}
                style={{
                  width: "34px",
                  height: "34px",
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />

              <div
                style={{
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <div
                  style={{
                    color: "#f3f4f6",
                    fontSize: "13px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {selectedPlateName.name}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              {isPlateNameSelectable ? "Select Plate Name" : "No data"}
            </div>
          )}

          <div
            style={{
              color: "#94a3b8",
              fontSize: "12px",
              flexShrink: 0,
            }}
          >
            ▼
          </div>
        </button>

        {shouldRenderPlateNameDropdown ? (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              zIndex: 20,
              border: "1px solid #374151",
              borderRadius: "8px",
              backgroundColor: "#0f172a",
              boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
              overflow: "hidden",
              maxHeight: "280px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                maxHeight: "280px",
                overflowY: "auto",
              }}
            >
              {plateNameOptions.map((plateName: GameDataModels.PlateName) => {
                const isSelected = plateName.id === effectiveSelectedPlateNameId;

                return (
                  <button
                    key={plateName.id}
                    type="button"
                    onClick={() => handlePlateNameSelect(plateName.id)}
                    style={{
                      width: "100%",
                      border: "none",
                      borderBottom: "1px solid #1f2937",
                      backgroundColor: isSelected ? "#1f2937" : "#0f172a",
                      color: "#f3f4f6",
                      padding: "10px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      textAlign: "left",
                    }}
                  >
                    <img
                      src={resolveAssetUrl(plateName.pathFile)}
                      alt={plateName.name}
                      style={{
                        width: "34px",
                        height: "34px",
                        objectFit: "contain",
                        flexShrink: 0,
                      }}
                    />

                    <div
                      style={{
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {plateName.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {isFellowshipPlate && plateGroupOptions.length > 1 ? (
        <>
          <div
            style={{
              color: "#e5e7eb",
              fontWeight: 500,
              fontSize: "13px",
            }}
          >
            Plate Stats
          </div>
          <select
            value={effectiveSelectedPlateGroupId}
            onChange={handlePlateGroupChange}
            style={{
              height: "40px",
              borderRadius: "6px",
              border: "1px solid #374151",
              backgroundColor: "#0f172a",
              color: "#f3f4f6",
              padding: "0 12px",
              outline: "none",
              fontSize: "13px",
              minWidth: 0,
            }}
          >
            {plateGroupOptions.map((option: PlateGroupOption) => {
              return (
                <option key={option.groupId} value={option.groupId}>
                  {option.label || `Plate ${option.groupId}`}
                </option>
              );
            })}
          </select>
        </>
      ) : null}

      {shouldShowPlateStats ? (
        <>
          <div
            style={{
              color: "#e5e7eb",
              fontWeight: 500,
              fontSize: "13px",
              alignSelf: "start",
              paddingTop: "8px",
            }}
          >
            Plate Stats
          </div>
          <div
            style={{
              border: "1px solid #374151",
              borderRadius: "8px",
              backgroundColor: "#0f172a",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              minHeight: "84px",
              fontSize: "13px",
            }}
          >
            {previewRows.length > 0 ? (
              previewRows.map((row: PreviewRow) => {
                return <div key={row.key}>{row.text}</div>;
              })
            ) : (
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "13px",
                }}
              >
                No plate stats
              </div>
            )}
          </div>
        </>
      ) : null}

      {shouldShowThirdStat ? (
        <>
          <div
            style={{
              color: "#e5e7eb",
              fontWeight: 500,
              fontSize: "13px",
            }}
          >
            3rd Stat
          </div>
          <select
            value={effectiveSelectedThirdStatKey}
            onChange={handleThirdStatChange}
            style={{
              height: "40px",
              borderRadius: "6px",
              border: "1px solid #374151",
              backgroundColor: "#0f172a",
              color: "#f3f4f6",
              padding: "0 12px",
              outline: "none",
              fontSize: "13px",
            }}
          >
            <option value="">No 3rd stat</option>
            {thirdStatOptions.map((option: ThirdStatOption) => {
              return (
                <option key={option.key} value={option.key}>
                  {option.statLabel} : {option.valueLabel}
                </option>
              );
            })}
          </select>
        </>
      ) : null}

      {isBulkCreateOpen ? createPortal(
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed", inset: 0, zIndex: 10000,
            backgroundColor: "rgba(2, 6, 23, 0.72)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
          }}
        >
          <div
            style={{
              width: "min(460px, 100%)", borderRadius: "10px",
              border: "1px solid #374151", backgroundColor: "#111827",
              boxShadow: "0 18px 48px rgba(0,0,0,0.5)", color: "#e5e7eb",
              padding: "18px", display: "flex", flexDirection: "column", gap: "14px",
            }}
          >
            <div style={{ fontSize: "17px", fontWeight: 800 }}>Create All Plates</div>
            <div style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.45 }}>
              Select criteria. Every plate matching Plate Type + Rarity + Level will be added to Inventory.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "110px minmax(0,1fr)", gap: "10px", alignItems: "center" }}>
              <div style={{ fontSize: "13px", fontWeight: 700 }}>Plate Type</div>
              <select
                value={effectiveBulkPlateTypeId}
                onChange={(e) => { setBulkPlateTypeId(Number(e.target.value)); setBulkRarityId(0); setBulkPlateLevelId(0); }}
                style={{ height: "36px", borderRadius: "6px", border: "1px solid #374151", backgroundColor: "#0f172a", color: "#f3f4f6", padding: "0 10px", outline: "none", fontSize: "13px" }}
              >
                {heraldryItemTypes.map((t: GameDataModels.ItemType) => (
                  <option key={t.typeId} value={t.typeId}>{t.typeName}</option>
                ))}
              </select>

              {bulkRarityOptions.length > 0 ? (
                <>
                  <div style={{ fontSize: "13px", fontWeight: 700 }}>Rarity</div>
                  <select
                    value={effectiveBulkRarityId}
                    onChange={(e) => { setBulkRarityId(Number(e.target.value)); setBulkPlateLevelId(0); }}
                    style={{ height: "36px", borderRadius: "6px", border: "1px solid #374151", backgroundColor: "#0f172a", color: gameData.rarities.find((r: GameDataModels.Rarity) => r.rarityId === effectiveBulkRarityId)?.color ?? "#f3f4f6", padding: "0 10px", outline: "none", fontSize: "13px", fontWeight: 700 }}
                  >
                    {bulkRarityOptions.map((r: GameDataModels.Rarity) => (
                      <option key={r.rarityId} value={r.rarityId} style={{ color: r.color, backgroundColor: "#0f172a" }}>{r.rarityName}</option>
                    ))}
                  </select>
                </>
              ) : null}

              {bulkLevelOptions.length > 0 ? (
                <>
                  <div style={{ fontSize: "13px", fontWeight: 700 }}>Plate Level</div>
                  <select
                    value={effectiveBulkPlateLevelId}
                    onChange={(e) => setBulkPlateLevelId(Number(e.target.value))}
                    style={{ height: "36px", borderRadius: "6px", border: "1px solid #374151", backgroundColor: "#0f172a", color: "#f3f4f6", padding: "0 10px", outline: "none", fontSize: "13px" }}
                  >
                    {bulkLevelOptions.map((l: GameDataModels.PatchLevel) => (
                      <option key={l.id} value={l.id}>Lv. {l.level}</option>
                    ))}
                  </select>
                </>
              ) : null}
            </div>

            <div style={{ color: "#cbd5e1", fontSize: "13px" }}>
              Plates to create: <strong style={{ color: "#f3f4f6" }}>{bulkPreviewCount}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => setIsBulkCreateOpen(false)}
                style={{ height: "38px", borderRadius: "6px", border: "1px solid #374151", backgroundColor: "#111827", color: "#e5e7eb", padding: "0 14px", cursor: "pointer", fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={bulkPreviewCount === 0}
                onClick={handleBulkCreate}
                style={{
                  height: "38px", borderRadius: "6px", border: "1px solid #f59e0b66",
                  backgroundColor: bulkPreviewCount > 0 ? "#b45309" : "#374151",
                  color: "#fff7ed", padding: "0 14px",
                  cursor: bulkPreviewCount > 0 ? "pointer" : "not-allowed",
                  fontWeight: 800, opacity: bulkPreviewCount > 0 ? 1 : 0.65,
                }}
              >
                Create All
              </button>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
};

export default CreatePlateForm;
