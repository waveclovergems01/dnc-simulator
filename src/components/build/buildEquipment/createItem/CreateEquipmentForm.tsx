import React, { useEffect, useMemo, useRef, useState } from "react";
import { GameDataLoader } from "../../../../data/GameDataLoader";
import type * as GameDataModels from "../../../../model/GameDataModels";
import { appMemory } from "../../../../state/AppMemory";
import {
  createInventoryEquipmentItemData,
  createInventoryEquipmentSlot,
} from "../../../../state/models/InventoryFactories";
import type { InventoryEquipmentCustomStat } from "../../../../state/models/InventoryModels";
import {
  formatStatValue,
  getStatLabel,
} from "../../../tooltip/tooltipUtils";
import type { CreateItemMode } from "./createItemTypes";
import { getFallbackIconByTypeId } from "../../../../utils/slotIconUtils";

interface CreateEquipmentFormProps {
  mode?: CreateItemMode;
  editingSlotIndex?: number | null;
  onRegisterSubmit?: (submitHandler: (() => boolean) | null) => void;
  onCanSubmitChange?: (canSubmit: boolean) => void;
  onFinishEdit?: () => void;
}

interface JobOption {
  jobId: number;
  label: string;
}

interface ItemTypeOption {
  itemType: GameDataModels.ItemType;
  previewItem: GameDataModels.EquipmentItem | null;
}

interface SuffixOption {
  key: string;
  suffixItem: GameDataModels.SuffixItem;
  suffixType: GameDataModels.SuffixType | null;
}

interface EquipmentFormInitialState {
  selectedJobId: number;
  selectedItemTypeId: number;
  selectedRarityId: number;
  selectedLevel: number;
  selectedEquipmentItemId: number;
  selectedEnhancementLevel: number;
  selectedSuffixKey: string;
  customEnhanceStats: InventoryEquipmentCustomStat[];
  customHiddenPotentialStats: InventoryEquipmentCustomStat[];
}

const EQUIPMENT_CATEGORY_ID = 10000;
const ALL_JOB_ID = 9999;

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

const sortStatsByDisplayPriority = <
  T extends { statId: number; isPercentage: boolean },
>(
  stats: T[],
): T[] => {
  return [...stats].sort((left, right) => {
    const leftPriority = STAT_DISPLAY_PRIORITY.get(left.statId) ?? 1000 + left.statId;
    const rightPriority =
      STAT_DISPLAY_PRIORITY.get(right.statId) ?? 1000 + right.statId;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return Number(left.isPercentage) - Number(right.isPercentage);
  });
};

const formatStatRange = (
  valueMin: number,
  valueMax: number,
  isPercentage: boolean,
): string => {
  if (valueMin === valueMax) {
    return formatStatValue(valueMax, isPercentage);
  }

  return `${formatStatValue(valueMin, isPercentage)}-${formatStatValue(
    valueMax,
    isPercentage,
  )}`;
};

const resolveAssetUrl = (pathFile: string): string => {
  const normalizedPath = pathFile.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

const getRarityColor = (
  rarityId: number,
  rarities: GameDataModels.Rarity[],
): string => {
  return rarities.find((r) => r.rarityId === rarityId)?.color ?? "#374151";
};

const toTitleCase = (value: string): string => {
  return value
    .split(" ")
    .filter((part: string) => {
      return part.length > 0;
    })
    .map((part: string) => {
      return `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`;
    })
    .join(" ");
};

const getRootJobId = (
  jobId: number,
  jobMap: Map<number, GameDataModels.JobDefinition>,
): number => {
  if (jobId === ALL_JOB_ID) {
    return ALL_JOB_ID;
  }

  let currentJob = jobMap.get(jobId) ?? null;
  const seenJobIds = new Set<number>();

  while (currentJob && currentJob.inherit !== -1) {
    if (seenJobIds.has(currentJob.id)) {
      break;
    }

    seenJobIds.add(currentJob.id);
    currentJob = jobMap.get(currentJob.inherit) ?? null;
  }

  return currentJob?.id ?? jobId;
};


const buildSuffixKey = (suffixTypeId: number, suffixTier: number): string => {
  return `${suffixTypeId}:${suffixTier}`;
};

const parseSuffixKey = (
  suffixKey: string,
): { suffixTypeId: number; suffixTier: number } | null => {
  const [suffixTypeIdRaw, suffixTierRaw] = suffixKey.split(":");
  const suffixTypeId = Number(suffixTypeIdRaw);
  const suffixTier = Number(suffixTierRaw);

  if (!Number.isFinite(suffixTypeId) || !Number.isFinite(suffixTier)) {
    return null;
  }

  return {
    suffixTypeId,
    suffixTier,
  };
};

const formatSuffixTier = (tier: number): string => {
  if (tier <= 1) {
    return "";
  }

  if (tier === 2) {
    return " II";
  }

  if (tier === 3) {
    return " III";
  }

  if (tier === 4) {
    return " IV";
  }

  return ` ${tier}`;
};

const CreateEquipmentForm: React.FC<CreateEquipmentFormProps> = ({
  mode = "new",
  editingSlotIndex = null,
  onRegisterSubmit,
  onCanSubmitChange,
  onFinishEdit,
}) => {
  const gameData = useMemo(() => {
    return GameDataLoader.load();
  }, []);

  const equipmentItemTypes = useMemo<GameDataModels.ItemType[]>(() => {
    return gameData.itemTypes
      .filter((itemType: GameDataModels.ItemType) => {
        return itemType.categoryId === EQUIPMENT_CATEGORY_ID;
      })
      .sort((left, right) => {
        return left.typeName.localeCompare(right.typeName);
      });
  }, [gameData]);

  const equipmentTypeIdSet = useMemo<Set<number>>(() => {
    return new Set<number>(
      equipmentItemTypes.map((itemType: GameDataModels.ItemType) => {
        return itemType.typeId;
      }),
    );
  }, [equipmentItemTypes]);

  const equipmentItems = useMemo<GameDataModels.EquipmentItem[]>(() => {
    return gameData.items.filter((item: GameDataModels.EquipmentItem) => {
      return equipmentTypeIdSet.has(item.typeId);
    });
  }, [equipmentTypeIdSet, gameData.items]);

  const jobMap = useMemo<Map<number, GameDataModels.JobDefinition>>(() => {
    return new Map(
      gameData.jobs.map((job: GameDataModels.JobDefinition) => {
        return [job.id, job] as const;
      }),
    );
  }, [gameData.jobs]);

  const jobOptions = useMemo<JobOption[]>(() => {
    return gameData.jobs
      .filter((job: GameDataModels.JobDefinition) => {
        return job.classId === 0;
      })
      .map((job: GameDataModels.JobDefinition) => {
        return {
          jobId: job.id,
          label: toTitleCase(job.name),
        };
      })
      .sort((left, right) => {
        return left.jobId - right.jobId;
      });
  }, [gameData.jobs]);

  const initialFormState = useMemo<EquipmentFormInitialState>(() => {
    const defaultState: EquipmentFormInitialState = {
      selectedJobId: 0,
      selectedItemTypeId: 0,
      selectedRarityId: 0,
      selectedLevel: 0,
      selectedEquipmentItemId: 0,
      selectedEnhancementLevel: 0,
      selectedSuffixKey: "",
      customEnhanceStats: [],
      customHiddenPotentialStats: [],
    };

    if (mode !== "edit" || editingSlotIndex === null) {
      return defaultState;
    }

    const editingSlot = appMemory.getInventorySlot(editingSlotIndex);

    if (
      !editingSlot ||
      !editingSlot.itemData ||
      editingSlot.itemData.kind !== "equipment"
    ) {
      return defaultState;
    }

    const editingItemData = editingSlot.itemData;
    const equipmentItem =
      gameData.items.find((item: GameDataModels.EquipmentItem) => {
        return item.itemId === editingItemData.itemId;
      }) ?? null;

    if (!equipmentItem) {
      return defaultState;
    }

    return {
      selectedJobId: getRootJobId(equipmentItem.jobId, jobMap),
      selectedItemTypeId: equipmentItem.typeId,
      selectedRarityId: equipmentItem.rarityId,
      selectedLevel: equipmentItem.requiredLevel,
      selectedEquipmentItemId: equipmentItem.itemId,
      selectedEnhancementLevel: editingItemData.enhancementLevel,
      selectedSuffixKey:
        editingItemData.suffixTypeId === null ||
        editingItemData.suffixTier === null
          ? ""
          : buildSuffixKey(
              editingItemData.suffixTypeId,
              editingItemData.suffixTier,
            ),
      customEnhanceStats: editingItemData.customEnhanceStats ?? [],
      customHiddenPotentialStats:
        editingItemData.customHiddenPotentialStats ?? [],
    };
  }, [editingSlotIndex, gameData.items, jobMap, mode]);

  const [selectedJobId, setSelectedJobId] = useState<number>(
    initialFormState.selectedJobId,
  );
  const [selectedItemTypeId, setSelectedItemTypeId] = useState<number>(
    initialFormState.selectedItemTypeId,
  );
  const [selectedRarityId, setSelectedRarityId] = useState<number>(
    initialFormState.selectedRarityId,
  );
  const [selectedLevel, setSelectedLevel] = useState<number>(
    initialFormState.selectedLevel,
  );
  const [selectedEquipmentItemId, setSelectedEquipmentItemId] =
    useState<number>(initialFormState.selectedEquipmentItemId);
  const [selectedEnhancementLevel, setSelectedEnhancementLevel] =
    useState<number>(initialFormState.selectedEnhancementLevel);
  const [selectedSuffixKey, setSelectedSuffixKey] = useState<string>(
    initialFormState.selectedSuffixKey,
  );
  const [customEnhanceStats, setCustomEnhanceStats] = useState<
    InventoryEquipmentCustomStat[]
  >(initialFormState.customEnhanceStats);
  const [customHiddenPotentialStats, setCustomHiddenPotentialStats] = useState<
    InventoryEquipmentCustomStat[]
  >(initialFormState.customHiddenPotentialStats);
  const [isItemTypeDropdownOpen, setIsItemTypeDropdownOpen] =
    useState<boolean>(false);
  const [isEquipmentDropdownOpen, setIsEquipmentDropdownOpen] =
    useState<boolean>(false);

  const itemTypeDropdownRef = useRef<HTMLDivElement | null>(null);
  const equipmentDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent): void => {
      const targetNode = event.target;

      if (!(targetNode instanceof Node)) {
        return;
      }

      if (
        itemTypeDropdownRef.current &&
        !itemTypeDropdownRef.current.contains(targetNode)
      ) {
        setIsItemTypeDropdownOpen(false);
      }

      if (
        equipmentDropdownRef.current &&
        !equipmentDropdownRef.current.contains(targetNode)
      ) {
        setIsEquipmentDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  const effectiveSelectedJobId = useMemo<number>(() => {
    if (jobOptions.length === 0) {
      return 0;
    }

    const hasSelectedJob = jobOptions.some((jobOption: JobOption) => {
      return jobOption.jobId === selectedJobId;
    });

    if (hasSelectedJob) {
      return selectedJobId;
    }

    return jobOptions[0].jobId;
  }, [jobOptions, selectedJobId]);

  const jobFilteredItems = useMemo<GameDataModels.EquipmentItem[]>(() => {
    if (effectiveSelectedJobId === 0 && jobOptions.length === 0) {
      return [];
    }

    return equipmentItems.filter((item: GameDataModels.EquipmentItem) => {
      if (item.jobId === ALL_JOB_ID) {
        return true;
      }

      return getRootJobId(item.jobId, jobMap) === effectiveSelectedJobId;
    });
  }, [effectiveSelectedJobId, equipmentItems, jobMap, jobOptions.length]);

  const rarityOptions = useMemo<GameDataModels.Rarity[]>(() => {
    // Collect all rarity IDs from items that pass the job filter (independent of item type)
    const availableRarityIds = new Set<number>(
      jobFilteredItems.map((item: GameDataModels.EquipmentItem) => item.rarityId),
    );

    return gameData.rarities
      .filter((rarity: GameDataModels.Rarity) => {
        return availableRarityIds.has(rarity.rarityId);
      })
      .sort((left, right) => {
        return left.rarityId - right.rarityId;
      });
  }, [jobFilteredItems, gameData.rarities]);

  const effectiveSelectedRarityId = useMemo<number>(() => {
    if (rarityOptions.length === 0) {
      return 0;
    }

    const hasSelectedRarity = rarityOptions.some((rarity: GameDataModels.Rarity) => {
      return rarity.rarityId === selectedRarityId;
    });

    if (hasSelectedRarity) {
      return selectedRarityId;
    }

    return rarityOptions[0].rarityId;
  }, [rarityOptions, selectedRarityId]);

  const levelOptions = useMemo<number[]>(() => {
    // Level depends on job + rarity only (independent of item type)
    return Array.from(
      new Set<number>(
        jobFilteredItems
          .filter((item: GameDataModels.EquipmentItem) => {
            if (effectiveSelectedRarityId !== 0 && item.rarityId !== effectiveSelectedRarityId) return false;
            return true;
          })
          .map((item: GameDataModels.EquipmentItem) => item.requiredLevel),
      ),
    ).sort((left, right) => left - right);
  }, [jobFilteredItems, effectiveSelectedRarityId]);

  const effectiveSelectedLevel = useMemo<number>(() => {
    if (levelOptions.length === 0) {
      return 0;
    }

    const hasSelectedLevel = levelOptions.some((level: number) => {
      return level === selectedLevel;
    });

    if (hasSelectedLevel) {
      return selectedLevel;
    }

    return levelOptions[0];
  }, [levelOptions, selectedLevel]);

  const itemTypeOptions = useMemo<ItemTypeOption[]>(() => {
    // Filter to only item types that have items matching the selected rarity + level (within the job filter)
    const allowedTypeIds = new Set<number>(
      jobFilteredItems
        .filter((item: GameDataModels.EquipmentItem) => {
          if (effectiveSelectedRarityId !== 0 && item.rarityId !== effectiveSelectedRarityId) return false;
          if (effectiveSelectedLevel !== 0 && item.requiredLevel !== effectiveSelectedLevel) return false;
          return true;
        })
        .map((item: GameDataModels.EquipmentItem) => item.typeId),
    );

    return [...equipmentItemTypes]
      .filter((itemType: GameDataModels.ItemType) => {
        return allowedTypeIds.has(itemType.typeId);
      })
      .sort((left, right) => {
        return left.typeId - right.typeId;
      })
      .map((itemType: GameDataModels.ItemType) => {
        return {
          itemType,
          previewItem: null,
        };
      });
  }, [equipmentItemTypes, jobFilteredItems, effectiveSelectedRarityId, effectiveSelectedLevel]);

  const effectiveSelectedItemTypeId = useMemo<number>(() => {
    if (itemTypeOptions.length === 0) {
      return 0;
    }

    const hasSelectedItemType = itemTypeOptions.some((option: ItemTypeOption) => {
      return option.itemType.typeId === selectedItemTypeId;
    });

    if (hasSelectedItemType) {
      return selectedItemTypeId;
    }

    return itemTypeOptions[0].itemType.typeId;
  }, [itemTypeOptions, selectedItemTypeId]);

  const selectedItemTypeOption = useMemo<ItemTypeOption | null>(() => {
    return (
      itemTypeOptions.find((option: ItemTypeOption) => {
        return option.itemType.typeId === effectiveSelectedItemTypeId;
      }) ?? null
    );
  }, [effectiveSelectedItemTypeId, itemTypeOptions]);

  const itemTypeFilteredItems = useMemo<GameDataModels.EquipmentItem[]>(() => {
    if (effectiveSelectedItemTypeId === 0) {
      return [];
    }

    return jobFilteredItems.filter((item: GameDataModels.EquipmentItem) => {
      return item.typeId === effectiveSelectedItemTypeId;
    });
  }, [effectiveSelectedItemTypeId, jobFilteredItems]);

  const rarityFilteredItems = useMemo<GameDataModels.EquipmentItem[]>(() => {
    if (effectiveSelectedRarityId === 0 || effectiveSelectedItemTypeId === 0) {
      return [];
    }

    return itemTypeFilteredItems.filter((item: GameDataModels.EquipmentItem) => {
      return item.rarityId === effectiveSelectedRarityId;
    });
  }, [
    effectiveSelectedRarityId,
    effectiveSelectedItemTypeId,
    itemTypeFilteredItems,
  ]);

  const equipmentOptions = useMemo<GameDataModels.EquipmentItem[]>(() => {
    if (effectiveSelectedLevel === 0) {
      return [];
    }

    return rarityFilteredItems
      .filter((item: GameDataModels.EquipmentItem) => {
        return item.requiredLevel === effectiveSelectedLevel;
      })
      .sort((left, right) => {
        return left.name.localeCompare(right.name);
      });
  }, [effectiveSelectedLevel, rarityFilteredItems]);

  const effectiveSelectedEquipmentItemId = useMemo<number>(() => {
    if (equipmentOptions.length === 0) {
      return 0;
    }

    const hasSelectedEquipment = equipmentOptions.some(
      (item: GameDataModels.EquipmentItem) => {
        return item.itemId === selectedEquipmentItemId;
      },
    );

    if (hasSelectedEquipment) {
      return selectedEquipmentItemId;
    }

    return equipmentOptions[0].itemId;
  }, [equipmentOptions, selectedEquipmentItemId]);

  const selectedEquipment = useMemo<GameDataModels.EquipmentItem | null>(() => {
    return (
      equipmentOptions.find((item: GameDataModels.EquipmentItem) => {
        return item.itemId === effectiveSelectedEquipmentItemId;
      }) ?? null
    );
  }, [effectiveSelectedEquipmentItemId, equipmentOptions]);

  const enhancementLevelOptions = useMemo<number[]>(() => {
    return Array.from({ length: 16 }, (_, index) => {
      return index;
    });
  }, []);

  const suffixOptions = useMemo<SuffixOption[]>(() => {
    if (!selectedEquipment) {
      return [];
    }

    const suffixGroup =
      gameData.suffixGroups.find((group: GameDataModels.SuffixGroup) => {
        return group.itemTypeId === selectedEquipment.typeId;
      }) ?? null;

    const allowedSuffixIdSet = new Set<number>(
      suffixGroup
        ? [...suffixGroup.normal, ...suffixGroup.pvp].map((suffixRef) => {
            return suffixRef.suffixId;
          })
        : [],
    );

    return gameData.suffixItems
      .filter((suffixItem: GameDataModels.SuffixItem) => {
        if (suffixItem.itemId !== selectedEquipment.itemId) {
          return false;
        }

        if (allowedSuffixIdSet.size === 0) {
          return true;
        }

        return allowedSuffixIdSet.has(suffixItem.suffixTypeId);
      })
      .map((suffixItem: GameDataModels.SuffixItem) => {
        const suffixType =
          gameData.suffixTypes.find((type: GameDataModels.SuffixType) => {
            return type.suffixId === suffixItem.suffixTypeId;
          }) ?? null;

        return {
          key: buildSuffixKey(suffixItem.suffixTypeId, suffixItem.tier),
          suffixItem,
          suffixType,
        };
      })
      .sort((left, right) => {
        if (left.suffixItem.tier !== right.suffixItem.tier) {
          return left.suffixItem.tier - right.suffixItem.tier;
        }

        return left.suffixItem.name.localeCompare(right.suffixItem.name);
      });
  }, [gameData, selectedEquipment]);

  const effectiveSelectedSuffixKey = useMemo<string>(() => {
    if (selectedSuffixKey === "") {
      return "";
    }

    const hasSuffix = suffixOptions.some((option: SuffixOption) => {
      return option.key === selectedSuffixKey;
    });

    return hasSuffix ? selectedSuffixKey : "";
  }, [selectedSuffixKey, suffixOptions]);

  const selectedSuffixOption = useMemo<SuffixOption | null>(() => {
    if (effectiveSelectedSuffixKey === "") {
      return null;
    }

    return (
      suffixOptions.find((option: SuffixOption) => {
        return option.key === effectiveSelectedSuffixKey;
      }) ?? null
    );
  }, [effectiveSelectedSuffixKey, suffixOptions]);

  const previewStats = useMemo<GameDataModels.ItemBaseStat[]>(() => {
    if (selectedSuffixOption) {
      return sortStatsByDisplayPriority(selectedSuffixOption.suffixItem.extraStats);
    }

    if (!selectedEquipment) {
      return [];
    }

    return sortStatsByDisplayPriority(selectedEquipment.baseStats);
  }, [selectedEquipment, selectedSuffixOption]);

  const canSubmit = selectedEquipment !== null;

  useEffect(() => {
    if (onCanSubmitChange) {
      onCanSubmitChange(canSubmit);
    }

    return () => {
      if (onCanSubmitChange) {
        onCanSubmitChange(false);
      }
    };
  }, [canSubmit, onCanSubmitChange]);

  useEffect(() => {
    const handleSubmit = (): boolean => {
      if (!selectedEquipment) {
        return false;
      }

      const selectedSuffix = parseSuffixKey(effectiveSelectedSuffixKey);
      const nextCustomEnhanceStats =
        selectedEnhancementLevel > 0 ? customEnhanceStats : [];

      if (mode === "edit" && editingSlotIndex !== null) {
        const currentSlot = appMemory.getInventorySlot(editingSlotIndex);

        if (!currentSlot) {
          return false;
        }

        const currentUuid =
          currentSlot.itemData?.kind === "equipment"
            ? currentSlot.itemData.uuid
            : null;
        const nextItemData = createInventoryEquipmentItemData({
          itemId: selectedEquipment.itemId,
          rarityId: selectedEquipment.rarityId,
          jobId: selectedEquipment.jobId,
          requiredLevel: selectedEquipment.requiredLevel,
          enhancementLevel: selectedEnhancementLevel,
          suffixTypeId: selectedSuffix?.suffixTypeId ?? null,
          suffixTier: selectedSuffix?.suffixTier ?? null,
          customEnhanceStats: nextCustomEnhanceStats,
          customHiddenPotentialStats,
        });

        appMemory.updateInventorySlot({
          slotIndex: currentSlot.slotIndex,
          itemTypeId: selectedEquipment.typeId,
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

      const nextSlot = createInventoryEquipmentSlot({
        inventoryList: appMemory.getInventoryList(),
        itemTypeId: selectedEquipment.typeId,
        itemId: selectedEquipment.itemId,
        rarityId: selectedEquipment.rarityId,
        jobId: selectedEquipment.jobId,
        requiredLevel: selectedEquipment.requiredLevel,
        enhancementLevel: selectedEnhancementLevel,
        suffixTypeId: selectedSuffix?.suffixTypeId ?? null,
        suffixTier: selectedSuffix?.suffixTier ?? null,
        customEnhanceStats: nextCustomEnhanceStats,
        customHiddenPotentialStats,
      });

      appMemory.addInventorySlot(nextSlot);
      return true;
    };

    if (onRegisterSubmit) {
      onRegisterSubmit(handleSubmit);
    }

    return () => {
      if (onRegisterSubmit) {
        onRegisterSubmit(null);
      }
    };
  }, [
    customEnhanceStats,
    customHiddenPotentialStats,
    editingSlotIndex,
    effectiveSelectedSuffixKey,
    mode,
    onRegisterSubmit,
    onFinishEdit,
    selectedEnhancementLevel,
    selectedEquipment,
  ]);

  const handleJobChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedJobId(Number(event.target.value));
    setSelectedRarityId(0);
    setSelectedItemTypeId(0);
    setSelectedLevel(0);
    setSelectedEquipmentItemId(0);
    setSelectedSuffixKey("");
    setIsItemTypeDropdownOpen(false);
    setIsEquipmentDropdownOpen(false);
  };

  const handleRarityChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setSelectedRarityId(Number(event.target.value));
    setSelectedLevel(0);
    setSelectedItemTypeId(0);
    setSelectedEquipmentItemId(0);
    setSelectedSuffixKey("");
    setIsEquipmentDropdownOpen(false);
  };

  const handleLevelChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setSelectedLevel(Number(event.target.value));
    setSelectedItemTypeId(0);
    setSelectedEquipmentItemId(0);
    setSelectedSuffixKey("");
    setIsEquipmentDropdownOpen(false);
  };

  const handleItemTypeSelect = (itemTypeId: number): void => {
    setSelectedItemTypeId(itemTypeId);
    setSelectedEquipmentItemId(0);
    setSelectedSuffixKey("");
    setIsItemTypeDropdownOpen(false);
    setIsEquipmentDropdownOpen(false);
  };

  const handleEquipmentSelect = (itemId: number): void => {
    setSelectedEquipmentItemId(itemId);
    setSelectedSuffixKey("");
    setIsEquipmentDropdownOpen(false);
  };

  const handleEnhancementLevelChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setSelectedEnhancementLevel(Number(event.target.value));
  };

  const handleSuffixChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setSelectedSuffixKey(event.target.value);
  };

  const createDefaultCustomStat = (): InventoryEquipmentCustomStat => {
    return {
      statId: gameData.stats[0]?.statId ?? 0,
      valueMin: 0,
      valueMax: 0,
      isPercentage: false,
    };
  };

  const addCustomEnhanceStat = (): void => {
    setCustomEnhanceStats((previous) => {
      return [...previous, createDefaultCustomStat()];
    });
  };

  const addCustomHiddenPotentialStat = (): void => {
    setCustomHiddenPotentialStats((previous) => {
      return [...previous, createDefaultCustomStat()];
    });
  };

  const updateCustomStat = (
    kind: "enhance" | "hidden",
    index: number,
    patch: Partial<InventoryEquipmentCustomStat>,
  ): void => {
    const updater = (previous: InventoryEquipmentCustomStat[]) => {
      return previous.map((stat, statIndex) => {
        if (statIndex !== index) {
          return stat;
        }

        return {
          ...stat,
          ...patch,
        };
      });
    };

    if (kind === "enhance") {
      setCustomEnhanceStats(updater);
      return;
    }

    setCustomHiddenPotentialStats(updater);
  };

  const removeCustomStat = (
    kind: "enhance" | "hidden",
    index: number,
  ): void => {
    const updater = (previous: InventoryEquipmentCustomStat[]) => {
      return previous.filter((_, statIndex) => {
        return statIndex !== index;
      });
    };

    if (kind === "enhance") {
      setCustomEnhanceStats(updater);
      return;
    }

    setCustomHiddenPotentialStats(updater);
  };

  const renderCustomStatEditor = (
    title: string,
    kind: "enhance" | "hidden",
    stats: InventoryEquipmentCustomStat[],
    onAdd: () => void,
    isDisabled = false,
  ): React.ReactNode => {
    return (
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
          {title}
        </div>
        <div
          style={{
            border: "1px solid #374151",
            borderRadius: "8px",
            backgroundColor: "#0f172a",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            fontSize: "13px",
            minWidth: 0,
            overflowX: "hidden",
            opacity: isDisabled ? 0.65 : 1,
          }}
        >
          <button
            type="button"
            disabled={isDisabled}
            onClick={onAdd}
            style={{
              alignSelf: "flex-start",
              height: "30px",
              borderRadius: "6px",
              border: "1px solid #475569",
              backgroundColor: "#1e293b",
              color: "#f8fafc",
              padding: "0 10px",
              fontSize: "12px",
              cursor: isDisabled ? "not-allowed" : "pointer",
            }}
          >
            Add Stat
          </button>
          {stats.length === 0 ? (
            <div style={{ color: "#94a3b8" }}>No custom stats</div>
          ) : (
            stats.map((stat, index) => {
              return (
                <div
                  key={`${kind}-${index}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) 44px 30px",
                    gap: "8px 6px",
                    alignItems: "center",
                    minWidth: 0,
                    padding: "8px",
                    border: "1px solid rgba(71, 85, 105, 0.65)",
                    borderRadius: "8px",
                    backgroundColor: "rgba(15, 23, 42, 0.72)",
                  }}
                >
                  <select
                    value={stat.statId}
                    disabled={isDisabled}
                    onChange={(event) => {
                      updateCustomStat(kind, index, {
                        statId: Number(event.target.value),
                      });
                    }}
                    style={{
                      height: "32px",
                      borderRadius: "6px",
                      border: "1px solid #374151",
                      backgroundColor: "#111827",
                      color: "#f3f4f6",
                      minWidth: 0,
                      width: "100%",
                      gridColumn: "1 / -1",
                    }}
                  >
                    {gameData.stats.map((statDefinition) => {
                      return (
                        <option
                          key={statDefinition.statId}
                          value={statDefinition.statId}
                        >
                          {statDefinition.displayName ||
                            statDefinition.statName}
                        </option>
                      );
                    })}
                  </select>
                  <input
                    type="number"
                    value={stat.valueMin}
                    disabled={isDisabled}
                    onChange={(event) => {
                      updateCustomStat(kind, index, {
                        valueMin: Number(event.target.value),
                      });
                    }}
                    style={{
                      height: "32px",
                      borderRadius: "6px",
                      border: "1px solid #374151",
                      backgroundColor: "#111827",
                      color: "#f3f4f6",
                      padding: "0 8px",
                      minWidth: 0,
                      width: "100%",
                    }}
                  />
                  <input
                    type="number"
                    value={stat.valueMax}
                    disabled={isDisabled}
                    onChange={(event) => {
                      updateCustomStat(kind, index, {
                        valueMax: Number(event.target.value),
                      });
                    }}
                    style={{
                      height: "32px",
                      borderRadius: "6px",
                      border: "1px solid #374151",
                      backgroundColor: "#111827",
                      color: "#f3f4f6",
                      padding: "0 8px",
                      minWidth: 0,
                      width: "100%",
                    }}
                  />
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      color: "#cbd5e1",
                      minWidth: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={stat.isPercentage}
                      disabled={isDisabled}
                      onChange={(event) => {
                        updateCustomStat(kind, index, {
                          isPercentage: event.target.checked,
                        });
                      }}
                    />
                    %
                  </label>
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => removeCustomStat(kind, index)}
                    style={{
                      height: "30px",
                      width: "30px",
                      borderRadius: "6px",
                      border: "1px solid #7f1d1d",
                      backgroundColor: "#450a0a",
                      color: "#fecaca",
                      padding: 0,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                    }}
                  >
                    x
                  </button>
                </div>
              );
            })
          )}
        </div>
      </>
    );
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
        Job
      </div>
      <select
        value={effectiveSelectedJobId}
        onChange={handleJobChange}
        disabled={jobOptions.length === 0}
        style={{
          height: "40px",
          borderRadius: "6px",
          border: "1px solid #374151",
          backgroundColor: "#0f172a",
          color: "#f3f4f6",
          padding: "0 12px",
          outline: "none",
          fontSize: "13px",
          opacity: jobOptions.length === 0 ? 0.7 : 1,
        }}
      >
        {jobOptions.length > 0 ? (
          jobOptions.map((jobOption: JobOption) => {
            return (
              <option key={jobOption.jobId} value={jobOption.jobId}>
                {jobOption.label}
              </option>
            );
          })
        ) : (
          <option value={0}>No data</option>
        )}
      </select>

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
        disabled={rarityOptions.length === 0}
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
          opacity: rarityOptions.length === 0 ? 0.7 : 1,
        }}
      >
        {rarityOptions.length > 0 ? (
          rarityOptions.map((rarity: GameDataModels.Rarity) => {
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
          })
        ) : (
          <option value={0}>No data</option>
        )}
      </select>

      <div
        style={{
          color: "#e5e7eb",
          fontWeight: 500,
          fontSize: "13px",
        }}
      >
        Level
      </div>
      <select
        value={effectiveSelectedLevel}
        onChange={handleLevelChange}
        disabled={levelOptions.length === 0}
        style={{
          height: "40px",
          borderRadius: "6px",
          border: "1px solid #374151",
          backgroundColor: "#0f172a",
          color: "#f3f4f6",
          padding: "0 12px",
          outline: "none",
          fontSize: "13px",
          opacity: levelOptions.length === 0 ? 0.7 : 1,
        }}
      >
        {levelOptions.length > 0 ? (
          levelOptions.map((level: number) => {
            return (
              <option key={level} value={level}>
                Lv. {level}
              </option>
            );
          })
        ) : (
          <option value={0}>No data</option>
        )}
      </select>

      <div
        style={{
          color: "#e5e7eb",
          fontWeight: 500,
          fontSize: "13px",
          alignSelf: "start",
          paddingTop: "10px",
        }}
      >
        Item Type
      </div>
      <select
        value={effectiveSelectedItemTypeId}
        onChange={(event) => {
          handleItemTypeSelect(Number(event.target.value));
        }}
        disabled={itemTypeOptions.length === 0}
        style={{
          height: "40px",
          borderRadius: "6px",
          border: "1px solid #374151",
          backgroundColor: "#0f172a",
          color: "#f3f4f6",
          padding: "0 12px",
          outline: "none",
          fontSize: "13px",
          opacity: itemTypeOptions.length === 0 ? 0.7 : 1,
        }}
      >
        {itemTypeOptions.length > 0 ? (
          itemTypeOptions.map((option: ItemTypeOption) => {
            return (
              <option key={option.itemType.typeId} value={option.itemType.typeId}>
                {option.itemType.typeName}
              </option>
            );
          })
        ) : (
          <option value={0}>No data</option>
        )}
      </select>
      <div ref={itemTypeDropdownRef} style={{ display: "none" }}>
        <button
          type="button"
          disabled={itemTypeOptions.length === 0}
          onClick={() => {
            if (itemTypeOptions.length === 0) {
              return;
            }

            setIsItemTypeDropdownOpen((previous) => !previous);
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
            cursor: itemTypeOptions.length > 0 ? "pointer" : "not-allowed",
            opacity: itemTypeOptions.length > 0 ? 1 : 0.7,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            textAlign: "left",
          }}
        >
          {selectedItemTypeOption ? (
            <div
              style={{
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {selectedItemTypeOption.previewItem?.pathFile ? (
                <img
                  src={resolveAssetUrl(selectedItemTypeOption.previewItem.pathFile)}
                  alt={selectedItemTypeOption.itemType.typeName}
                  style={{
                    width: "34px",
                    height: "34px",
                    objectFit: "contain",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "6px",
                    border: "1px solid #374151",
                    backgroundColor: "#111827",
                    flexShrink: 0,
                  }}
                />
              )}

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
                  {selectedItemTypeOption.itemType.typeName}
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
              No data
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

        {isItemTypeDropdownOpen && itemTypeOptions.length > 0 ? (
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
              {itemTypeOptions.map((option: ItemTypeOption) => {
                const isSelected =
                  option.itemType.typeId === effectiveSelectedItemTypeId;

                return (
                  <button
                    key={option.itemType.typeId}
                    type="button"
                    onClick={() => handleItemTypeSelect(option.itemType.typeId)}
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
                    {option.previewItem?.pathFile ? (
                      <img
                        src={resolveAssetUrl(option.previewItem.pathFile)}
                        alt={option.itemType.typeName}
                        style={{
                          width: "34px",
                          height: "34px",
                          objectFit: "contain",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "6px",
                          border: "1px solid #374151",
                          backgroundColor: "#111827",
                          flexShrink: 0,
                        }}
                      />
                    )}

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
                        {option.itemType.typeName}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div
        style={{
          color: "#e5e7eb",
          fontWeight: 500,
          fontSize: "13px",
          alignSelf: "start",
          paddingTop: "10px",
        }}
      >
        Equipment
      </div>
      <div ref={equipmentDropdownRef} style={{ position: "relative" }}>
        <button
          type="button"
          disabled={equipmentOptions.length === 0}
          onClick={() => {
            if (equipmentOptions.length === 0) {
              return;
            }

            setIsEquipmentDropdownOpen((previous) => !previous);
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
            cursor: equipmentOptions.length > 0 ? "pointer" : "not-allowed",
            opacity: equipmentOptions.length > 0 ? 1 : 0.7,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            textAlign: "left",
          }}
        >
          {selectedEquipment ? (
            <div
              style={{
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {(() => {
                const iconPath =
                  selectedEquipment.pathFile ??
                  getFallbackIconByTypeId(selectedEquipment.typeId, gameData.itemTypes);
                const rarityColor = getRarityColor(selectedEquipment.rarityId, gameData.rarities);
                return iconPath ? (
                  <div style={{
                    width: "56px",
                    height: "56px",
                    flexShrink: 0,
                    borderRadius: "6px",
                    border: `2px solid ${rarityColor}`,
                    boxShadow: `0 0 6px ${rarityColor}60`,
                    overflow: "hidden",
                    backgroundColor: "#111827",
                  }}>
                    <img
                      src={resolveAssetUrl(iconPath)}
                      alt={selectedEquipment.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "6px",
                      border: `2px solid ${rarityColor}`,
                      backgroundColor: "#111827",
                      flexShrink: 0,
                    }}
                  />
                );
              })()}

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
                  {selectedEquipment.name}
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
              No data
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

        {isEquipmentDropdownOpen && equipmentOptions.length > 0 ? (
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
              {equipmentOptions.map((item: GameDataModels.EquipmentItem) => {
                const isSelected =
                  item.itemId === effectiveSelectedEquipmentItemId;

                return (
                  <button
                    key={item.itemId}
                    type="button"
                    onClick={() => handleEquipmentSelect(item.itemId)}
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
                    {(() => {
                      const iconPath =
                        item.pathFile ??
                        getFallbackIconByTypeId(item.typeId, gameData.itemTypes);
                      const rarityColor = getRarityColor(item.rarityId, gameData.rarities);
                      return iconPath ? (
                        <div style={{
                          width: "56px",
                          height: "56px",
                          flexShrink: 0,
                          borderRadius: "6px",
                          border: `2px solid ${rarityColor}`,
                          boxShadow: `0 0 6px ${rarityColor}60`,
                          overflow: "hidden",
                          backgroundColor: "#111827",
                        }}>
                          <img
                            src={resolveAssetUrl(iconPath)}
                            alt={item.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              display: "block",
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "6px",
                            border: `2px solid ${rarityColor}`,
                            backgroundColor: "#111827",
                            flexShrink: 0,
                          }}
                        />
                      );
                    })()}

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
                        {item.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div
        style={{
          color: "#e5e7eb",
          fontWeight: 500,
          fontSize: "13px",
        }}
      >
        Enhance
      </div>
      <select
        value={selectedEnhancementLevel}
        onChange={handleEnhancementLevelChange}
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
        {enhancementLevelOptions.map((level: number) => {
          return (
            <option key={level} value={level}>
              +{level}
            </option>
          );
        })}
      </select>

      {suffixOptions.length > 0 ? (
        <>
          <div
            style={{
              color: "#e5e7eb",
              fontWeight: 500,
              fontSize: "13px",
            }}
          >
            Suffix
          </div>
          <select
            value={effectiveSelectedSuffixKey}
            onChange={handleSuffixChange}
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
            <option value="">No suffix</option>
            {suffixOptions.map((option: SuffixOption) => {
              return (
                <option key={option.key} value={option.key}>
                  {option.suffixType?.suffixName ??
                    `Suffix ${option.suffixItem.suffixTypeId}`}
                  {formatSuffixTier(option.suffixItem.tier)}
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
          paddingTop: "8px",
        }}
      >
        Stats Value
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
        {selectedEquipment ? (
          previewStats.length > 0 ? (
            previewStats.map((stat) => {
              return (
                <div key={`${selectedEquipment.itemId}-${stat.statId}`}>
                  {getStatLabel(stat.statId, gameData.stats)} :{" "}
                  {formatStatRange(
                    stat.valueMin,
                    stat.valueMax,
                    stat.isPercentage,
                  )}
                </div>
              );
            })
          ) : (
            <div
              style={{
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              No stats data
            </div>
          )
        ) : (
          <div
            style={{
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
          No equipment selected
          </div>
        )}
      </div>

      {renderCustomStatEditor(
        "Enhance Ability",
        "enhance",
        customEnhanceStats,
        addCustomEnhanceStat,
        selectedEnhancementLevel === 0,
      )}

      {renderCustomStatEditor(
        "Hidden Potential",
        "hidden",
        customHiddenPotentialStats,
        addCustomHiddenPotentialStat,
      )}
    </div>
  );
};

export default CreateEquipmentForm;
