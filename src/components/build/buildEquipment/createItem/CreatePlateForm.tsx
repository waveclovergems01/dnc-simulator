import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

  return [];
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
      selectedThirdStatKey: "",
    };

    if (mode !== "edit" || editingSlotIndex === null) {
      return defaultState;
    }

    const editingSlot = appMemory.getInventorySlot(editingSlotIndex);

    if (!editingSlot || !editingSlot.itemData) {
      return defaultState;
    }

    const itemData = editingSlot.itemData;
    const selectedThirdStat =
      itemData.plate3rdStatId === null
        ? null
        : (plateThirdStatMap.get(itemData.plate3rdStatId) ?? null);

    return {
      selectedPlateTypeId: editingSlot.itemTypeId,
      selectedPlateNameId: itemData.plateNameId,
      selectedRarityId: itemData.rarityId,
      selectedPlateLevelId: itemData.patchLevelId,
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
  const [selectedThirdStatKey, setSelectedThirdStatKey] = useState<string>(
    initialFormState.selectedThirdStatKey,
  );
  const [isPlateNameDropdownOpen, setIsPlateNameDropdownOpen] =
    useState<boolean>(false);

  const plateNameDropdownRef = useRef<HTMLDivElement | null>(null);

  const isEnhancementPlate = selectedPlateTypeId === PLATE_ENHANCEMENT_TYPE_ID;
  const isSkillPlate = selectedPlateTypeId === PLATE_SKILL_TYPE_ID;
  const isSpecialSkillPlate =
    selectedPlateTypeId === PLATE_SPECIAL_SKILL_TYPE_ID;

  const shouldShowRarity = isEnhancementPlate || isSkillPlate;
  const shouldShowPlateLevel = isEnhancementPlate;
  const shouldShowPlateStats = isEnhancementPlate;
  const shouldShowThirdStat = isEnhancementPlate;

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

  const effectiveSelectedPlateLevelId = useMemo<number>(() => {
    if (!shouldShowPlateLevel) {
      return 0;
    }

    if (plateLevelOptions.length === 0) {
      return 0;
    }

    const hasSelectedPlateLevel = plateLevelOptions.some(
      (level: GameDataModels.PatchLevel) => {
        return level.id === selectedPlateLevelId;
      },
    );

    if (hasSelectedPlateLevel) {
      return selectedPlateLevelId;
    }

    return plateLevelOptions[0].id;
  }, [plateLevelOptions, selectedPlateLevelId, shouldShowPlateLevel]);

  const plateNameOptions = useMemo<GameDataModels.PlateName[]>(() => {
    if (selectedPlateTypeId === 0) {
      return [];
    }

    const plateNameIds = new Set<number>();

    gameData.plates.forEach((plate: GameDataModels.Plate) => {
      if (plate.plateTypeId !== selectedPlateTypeId) {
        return;
      }

      if (isEnhancementPlate) {
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
    isEnhancementPlate,
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

  const matchedPlates = useMemo<GameDataModels.Plate[]>(() => {
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

        if (isEnhancementPlate) {
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
    isEnhancementPlate,
    isSkillPlate,
    isSpecialSkillPlate,
    selectedPlateTypeId,
  ]);

  const previewRows = useMemo<PreviewRow[]>(() => {
    if (!isEnhancementPlate || matchedPlates.length === 0) {
      return [];
    }

    const rows: PreviewRow[] = [];
    const seen = new Set<string>();

    matchedPlates.forEach((plate: GameDataModels.Plate) => {
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
  }, [gameData.stats, isEnhancementPlate, matchedPlates]);

  const mainStatIdSet = useMemo<Set<number>>(() => {
    return new Set<number>(
      matchedPlates.map((plate: GameDataModels.Plate) => {
        return plate.statId;
      }),
    );
  }, [matchedPlates]);

  const thirdStatOptions = useMemo<ThirdStatOption[]>(() => {
    if (
      !isEnhancementPlate ||
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
    isEnhancementPlate,
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
      plateLevelOptions.find((level: GameDataModels.PatchLevel) => {
        return level.id === effectiveSelectedPlateLevelId;
      }) ?? null
    );
  }, [effectiveSelectedPlateLevelId, plateLevelOptions, shouldShowPlateLevel]);

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
    if (isEnhancementPlate || isSkillPlate) {
      return selectedRarity?.rarityId ?? 0;
    }

    return matchedPlates[0]?.rarityId ?? 0;
  }, [isEnhancementPlate, isSkillPlate, matchedPlates, selectedRarity]);

  const resolvedSubmitPatchLevelId = useMemo<number>(() => {
    if (isEnhancementPlate) {
      return selectedPatchLevel?.id ?? 0;
    }

    return matchedPlates[0]?.plateLevelId ?? 0;
  }, [isEnhancementPlate, matchedPlates, selectedPatchLevel]);

  const canCreatePlate = useMemo<boolean>(() => {
    if (!selectedItemType || !selectedPlateName || matchedPlates.length === 0) {
      return false;
    }

    if (isEnhancementPlate) {
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
    isEnhancementPlate,
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

    if (isEnhancementPlate) {
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

      const currentUuid = currentSlot.itemData?.uuid ?? null;

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
    isEnhancementPlate,
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
    setSelectedThirdStatKey("");
    setIsPlateNameDropdownOpen(false);
  };

  const handleRarityChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setSelectedRarityId(Number(event.target.value));
    setSelectedPlateNameId(0);
    setSelectedThirdStatKey("");
    setIsPlateNameDropdownOpen(false);
  };

  const handlePlateLevelChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setSelectedPlateLevelId(Number(event.target.value));
    setSelectedPlateNameId(0);
    setSelectedThirdStatKey("");
    setIsPlateNameDropdownOpen(false);
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
            {plateLevelOptions.map((level: GameDataModels.PatchLevel) => {
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
    </div>
  );
};

export default CreatePlateForm;