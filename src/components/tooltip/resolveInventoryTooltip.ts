import { GameDataLoader } from "../../data/GameDataLoader";
import type * as GameDataModels from "../../model/GameDataModels";
import { appMemory } from "../../state/AppMemory";
import type { InventorySlot } from "../../state/models/InventoryModels";
import type {
  EquipmentTooltipData,
  EquipmentTooltipPanelData,
  InventoryTooltipData,
  PlateTooltipPanelData,
  PlateTooltipPrimaryStat,
  PlateTooltipDiffTone,
  RuneTooltipData,
  RuneTooltipPanelData,
  RuneTooltipStat,
  CardTooltipData,
  CardTooltipPanelData,
  CardTooltipStat,
} from "./tooltipModels";
import { formatStatValue, getStatLabel } from "./tooltipUtils";

interface RawPlateStat {
  key: string;
  statId: number;
  label: string;
  numericValue: number;
  isPercentage: boolean;
  valueText?: string;
}

const STAT_DISPLAY_PRIORITY = new Map<number, number>(
  [
    7, // P.ATK
    8, // M.ATK
    3, // STR
    4, // AGI
    5, // INT
    6, // VIT
    9, // P.DEF
    10, // M.DEF
    11, // Critical Rate
    13, // Paralyze Rate
    12, // Stun Rate
    14, // Final Damage
    20, // Light ATK
    21, // Dark ATK
    18, // Fire ATK
    19, // Ice ATK
    15, // Critical Resist
    17, // Paralyze Resist
    16, // Stun Resist
    24, // Light Resist
    25, // Dark Resist
    22, // Fire Resist
    23, // Ice Resist
  ].map((statId, index) => {
    return [statId, index] as const;
  }),
);

const getStatPriority = (statId: number): number => {
  return STAT_DISPLAY_PRIORITY.get(statId) ?? 1000 + statId;
};

const sortStatsByDisplayPriority = <T extends { statId: number }>(
  stats: T[],
): T[] => {
  return [...stats].sort((left, right) => {
    return getStatPriority(left.statId) - getStatPriority(right.statId);
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

const buildRawEquipmentStats = (
  equipmentItem: GameDataModels.EquipmentItem,
  stats: GameDataModels.StatDefinition[],
): RawPlateStat[] => {
  return sortStatsByDisplayPriority(equipmentItem.baseStats).map((stat) => {
    const statKind = stat.isPercentage ? "percent" : "value";

    return {
      key: `${stat.statId}-${statKind}`,
      statId: stat.statId,
      label: getStatLabel(stat.statId, stats),
      numericValue: stat.valueMax,
      isPercentage: stat.isPercentage,
      valueText: formatStatRange(stat.valueMin, stat.valueMax, stat.isPercentage),
    };
  });
};

const buildRawItemBaseStats = (
  itemStats: GameDataModels.ItemBaseStat[],
  stats: GameDataModels.StatDefinition[],
): RawPlateStat[] => {
  return sortStatsByDisplayPriority(itemStats).map((stat) => {
    const statKind = stat.isPercentage ? "percent" : "value";

    return {
      key: `${stat.statId}-${statKind}`,
      statId: stat.statId,
      label: getStatLabel(stat.statId, stats),
      numericValue: stat.valueMax,
      isPercentage: stat.isPercentage,
      valueText: formatStatRange(stat.valueMin, stat.valueMax, stat.isPercentage),
    };
  });
};

const buildRawRuneStats = (
  runeStats: {
    statId: number;
    valueRarityId: number;
    value: number;
    isPercentage: boolean;
  }[],
  stats: GameDataModels.StatDefinition[],
): Array<RawPlateStat & { valueRarityId: number }> => {
  return sortStatsByDisplayPriority(runeStats).map((stat, index) => {
    const statKind = stat.isPercentage ? "percent" : "value";

    return {
      key: `${stat.statId}-${statKind}-${index}`,
      statId: stat.statId,
      valueRarityId: stat.valueRarityId,
      label: getStatLabel(stat.statId, stats),
      numericValue: stat.value,
      isPercentage: stat.isPercentage,
      valueText: formatStatValue(stat.value, stat.isPercentage),
    };
  });
};

const buildRawCardStats = (
  cardStats: GameDataModels.CardStat[],
  stats: GameDataModels.StatDefinition[],
): RawPlateStat[] => {
  return sortStatsByDisplayPriority(cardStats).map((stat) => {
    const statKind = stat.isPercentage ? "percent" : "value";

    return {
      key: `${stat.statId}-${statKind}`,
      statId: stat.statId,
      label: getStatLabel(stat.statId, stats),
      numericValue: stat.valueMax,
      isPercentage: stat.isPercentage,
      valueText: formatStatRange(stat.valueMin, stat.valueMax, stat.isPercentage),
    };
  });
};

interface RawThirdStat {
  statId: number;
  label: string;
  numericValue: number;
  isPercentage: boolean;
}

const buildRawPrimaryStats = (
  matchedPlates: GameDataModels.Plate[],
  stats: GameDataModels.StatDefinition[],
): RawPlateStat[] => {
  const primaryStats: RawPlateStat[] = [];
  const seenStatKeys = new Set<string>();

  matchedPlates.forEach((plate: GameDataModels.Plate) => {
    if (plate.statValue > 0) {
      const statKey = `${plate.statId}-value`;

      if (!seenStatKeys.has(statKey)) {
        seenStatKeys.add(statKey);
        primaryStats.push({
          key: statKey,
          statId: plate.statId,
          label: getStatLabel(plate.statId, stats),
          numericValue: plate.statValue,
          isPercentage: false,
        });
      }
    }

    if (plate.statPercent > 0) {
      const statKey = `${plate.statId}-percent`;

      if (!seenStatKeys.has(statKey)) {
        seenStatKeys.add(statKey);
        primaryStats.push({
          key: statKey,
          statId: plate.statId,
          label: getStatLabel(plate.statId, stats),
          numericValue: plate.statPercent,
          isPercentage: true,
        });
      }
    }
  });

  return primaryStats;
};

const buildRawThirdStat = (
  thirdStat: GameDataModels.PlateThirdStat | null,
  stats: GameDataModels.StatDefinition[],
): RawThirdStat | null => {
  if (thirdStat === null) {
    return null;
  }

  return {
    statId: thirdStat.statId,
    label: getStatLabel(thirdStat.statId, stats),
    numericValue: thirdStat.value,
    isPercentage: thirdStat.isPercentage,
  };
};

const formatDiffValue = (value: number, isPercentage: boolean): string => {
  if (isPercentage) {
    return `${value.toFixed(2)}%`;
  }

  return `${value}`;
};

const resolveDiffTone = (diffValue: number): PlateTooltipDiffTone => {
  if (diffValue > 0) {
    return "up";
  }

  if (diffValue < 0) {
    return "down";
  }

  return null;
};

const applyCompareToPrimaryStats = (
  currentStats: RawPlateStat[],
  compareStats: RawPlateStat[],
): PlateTooltipPrimaryStat[] => {
  const compareMap = new Map<string, RawPlateStat>(
    compareStats.map((stat: RawPlateStat) => {
      return [stat.key, stat] as const;
    }),
  );

  return currentStats.map((stat: RawPlateStat) => {
    const compareStat = compareMap.get(stat.key) ?? null;

    if (!compareStat) {
      return {
        key: stat.key,
        statId: stat.statId,
        label: stat.label,
        valueText: stat.valueText ?? formatStatValue(stat.numericValue, stat.isPercentage),
        numericValue: stat.numericValue,
        isPercentage: stat.isPercentage,
        diffText: null,
        diffTone: null,
      };
    }

    const diffValue = stat.numericValue - compareStat.numericValue;
    const diffTone = resolveDiffTone(diffValue);

    return {
      key: stat.key,
      statId: stat.statId,
      label: stat.label,
      valueText: stat.valueText ?? formatStatValue(stat.numericValue, stat.isPercentage),
      numericValue: stat.numericValue,
      isPercentage: stat.isPercentage,
      diffText:
        diffTone === null
          ? null
          : formatDiffValue(Math.abs(diffValue), stat.isPercentage),
      diffTone,
    };
  });
};

const applyCompareToThirdStat = (
  currentThirdStat: RawThirdStat | null,
  compareThirdStat: RawThirdStat | null,
): {
  thirdStatText: string | null;
  thirdStatDiffText: string | null;
  thirdStatDiffTone: PlateTooltipDiffTone;
} => {
  if (currentThirdStat === null) {
    return {
      thirdStatText: null,
      thirdStatDiffText: null,
      thirdStatDiffTone: null,
    };
  }

  const thirdStatText = `${currentThirdStat.label}: ${formatStatValue(
    currentThirdStat.numericValue,
    currentThirdStat.isPercentage,
  )}`;

  if (
    compareThirdStat === null ||
    compareThirdStat.statId !== currentThirdStat.statId ||
    compareThirdStat.isPercentage !== currentThirdStat.isPercentage
  ) {
    return {
      thirdStatText,
      thirdStatDiffText: null,
      thirdStatDiffTone: null,
    };
  }

  const diffValue = currentThirdStat.numericValue - compareThirdStat.numericValue;
  const diffTone = resolveDiffTone(diffValue);

  return {
    thirdStatText,
    thirdStatDiffText:
      diffTone === null
        ? null
        : formatDiffValue(Math.abs(diffValue), currentThirdStat.isPercentage),
    thirdStatDiffTone: diffTone,
  };
};

const buildPlateTooltipPanelData = (
  slot: InventorySlot,
  gameData: GameDataModels.GameDataBundle,
  compareSlot?: InventorySlot | null,
): PlateTooltipPanelData | null => {
  const itemData = slot.itemData;

  if (itemData === null || itemData.kind !== "plate") {
    return null;
  }

  const plateName =
    gameData.plateNames.find((item: GameDataModels.PlateName) => {
      return item.id === itemData.plateNameId;
    }) ?? null;

  const rarity =
    gameData.rarities.find((item: GameDataModels.Rarity) => {
      return item.rarityId === itemData.rarityId;
    }) ?? null;

  const patchLevel =
    gameData.patchLevels.find((item: GameDataModels.PatchLevel) => {
      return item.id === itemData.patchLevelId;
    }) ?? null;

  const matchedPlates = itemData.plateIds
    .map((plateId: number) => {
      return (
        gameData.plates.find((plate: GameDataModels.Plate) => {
          return plate.id === plateId;
        }) ?? null
      );
    })
    .filter((plate): plate is GameDataModels.Plate => {
      return plate !== null;
    });

  const thirdStat =
    itemData.plate3rdStatId === null
      ? null
      : (gameData.plate3rdStats.find((item: GameDataModels.PlateThirdStat) => {
          return item.id === itemData.plate3rdStatId;
        }) ?? null);

  if (!plateName || !rarity || !patchLevel || matchedPlates.length === 0) {
    return null;
  }

  const rawPrimaryStats = buildRawPrimaryStats(matchedPlates, gameData.stats);
  const rawThirdStat = buildRawThirdStat(thirdStat, gameData.stats);

  let compareRawPrimaryStats: RawPlateStat[] = [];
  let compareRawThirdStat: RawThirdStat | null = null;

  if (compareSlot && compareSlot.itemData !== null && compareSlot.itemData.kind === "plate") {
    const compareItemData = compareSlot.itemData;
    const compareMatchedPlates = compareItemData.plateIds
      .map((plateId: number) => {
        return (
          gameData.plates.find((plate: GameDataModels.Plate) => {
            return plate.id === plateId;
          }) ?? null
        );
      })
      .filter((plate): plate is GameDataModels.Plate => {
        return plate !== null;
      });

    const compareThirdStatSource =
      compareItemData.plate3rdStatId === null
        ? null
        : (gameData.plate3rdStats.find((item: GameDataModels.PlateThirdStat) => {
            return item.id === compareItemData.plate3rdStatId;
          }) ?? null);

    compareRawPrimaryStats = buildRawPrimaryStats(compareMatchedPlates, gameData.stats);
    compareRawThirdStat = buildRawThirdStat(compareThirdStatSource, gameData.stats);
  }

  const primaryStats = applyCompareToPrimaryStats(
    rawPrimaryStats,
    compareRawPrimaryStats,
  );

  const thirdStatCompare = applyCompareToThirdStat(
    rawThirdStat,
    compareRawThirdStat,
  );

  const effectStatLabels = Array.from(
    new Set<string>(
      rawPrimaryStats.map((stat: RawPlateStat) => {
        return stat.label;
      }),
    ),
  );

  const effectText =
    effectStatLabels.length > 0
      ? `Increases [${effectStatLabels.join(", ")}].`
      : "Increases stats.";

  return {
    title: plateName.name,
    bindText: "Binds when Obtained",
    levelReqText: `Level Req: ${patchLevel.level} or more`,
    itemLevelText: `Item Level: ${rarity.rarityName}`,
    tradableText: "(Cannot be traded)",
    primaryStats,
    thirdStatText: thirdStatCompare.thirdStatText,
    thirdStatDiffText: thirdStatCompare.thirdStatDiffText,
    thirdStatDiffTone: thirdStatCompare.thirdStatDiffTone,
    categoryLabel: "Heraldry",
    description: "A heraldry with mystical powers.",
    effectText,
    rarityColor: rarity.color,
  };
};

const buildPlateTooltipData = (
  slot: InventorySlot,
  gameData: GameDataModels.GameDataBundle,
  compareSlot?: InventorySlot | null,
): InventoryTooltipData | null => {
  const panelData = buildPlateTooltipPanelData(slot, gameData, compareSlot);

  if (!panelData) {
    return null;
  }

  let comparePanel: PlateTooltipPanelData | null = null;

  if (compareSlot) {
    comparePanel = buildPlateTooltipPanelData(compareSlot, gameData, null);
  }

  return {
    kind: "plate",
    ...panelData,
    comparePanel,
  };
};

const buildEquipmentTooltipData = (
  slot: InventorySlot,
  gameData: GameDataModels.GameDataBundle,
  compareSlot?: InventorySlot | null,
): EquipmentTooltipData | null => {
  const itemData = slot.itemData;

  if (itemData === null || itemData.kind !== "equipment") {
    return null;
  }

  const equipmentItem =
    gameData.items.find((item: GameDataModels.EquipmentItem) => {
      return item.itemId === itemData.itemId;
    }) ?? null;
  const rarity =
    gameData.rarities.find((item: GameDataModels.Rarity) => {
      return item.rarityId === itemData.rarityId;
    }) ?? null;
  const itemType =
    gameData.itemTypes.find((item: GameDataModels.ItemType) => {
      return item.typeId === slot.itemTypeId;
    }) ?? null;
  const job =
    gameData.jobs.find((item: GameDataModels.JobDefinition) => {
      return item.id === equipmentItem?.jobId;
    }) ?? null;

  if (!equipmentItem || !rarity || !itemType) {
    return null;
  }

  const suffixItem =
    itemData.suffixTypeId === null || itemData.suffixTier === null
      ? null
      : (gameData.suffixItems.find((item: GameDataModels.SuffixItem) => {
          return (
            item.itemId === itemData.itemId &&
            item.suffixTypeId === itemData.suffixTypeId &&
            item.tier === itemData.suffixTier
          );
        }) ?? null);
  const suffixType =
    suffixItem === null
      ? null
      : (gameData.suffixTypes.find((item: GameDataModels.SuffixType) => {
          return item.suffixId === suffixItem.suffixTypeId;
        }) ?? null);

  const rawPrimaryStats = suffixItem
    ? buildRawItemBaseStats(suffixItem.extraStats, gameData.stats)
    : buildRawEquipmentStats(equipmentItem, gameData.stats);
  let compareRawPrimaryStats: RawPlateStat[] = [];

  if (
    compareSlot &&
    compareSlot.itemData !== null &&
    compareSlot.itemData.kind === "equipment"
  ) {
    const compareItemData = compareSlot.itemData;
    const compareEquipmentItem =
      gameData.items.find((item: GameDataModels.EquipmentItem) => {
        return item.itemId === compareItemData.itemId;
      }) ?? null;

    if (compareEquipmentItem) {
      const compareSuffixItem =
        compareItemData.suffixTypeId === null ||
        compareItemData.suffixTier === null
          ? null
          : (gameData.suffixItems.find((item: GameDataModels.SuffixItem) => {
              return (
                item.itemId === compareItemData.itemId &&
                item.suffixTypeId === compareItemData.suffixTypeId &&
                item.tier === compareItemData.suffixTier
              );
            }) ?? null);

      compareRawPrimaryStats = compareSuffixItem
        ? buildRawItemBaseStats(compareSuffixItem.extraStats, gameData.stats)
        : buildRawEquipmentStats(compareEquipmentItem, gameData.stats);
    }
  }

  const primaryStats = applyCompareToPrimaryStats(
    rawPrimaryStats,
    compareRawPrimaryStats,
  );

  const comparePanel =
    compareSlot && compareSlot.itemData?.kind === "equipment"
      ? buildEquipmentTooltipPanelData(compareSlot, gameData, null)
      : null;
  const enhanceStats =
    itemData.enhancementLevel > 0
      ? applyCompareToPrimaryStats(
          buildRawItemBaseStats(
            itemData.customEnhanceStats ?? [],
            gameData.stats,
          ),
          [],
        )
      : [];
  const hiddenPotentialStats = applyCompareToPrimaryStats(
    buildRawItemBaseStats(
      itemData.customHiddenPotentialStats ?? [],
      gameData.stats,
    ),
    [],
  );
  const equippedSetCount = equipmentItem.setId
    ? appMemory.getGeneralEquipmentList().filter((equippedSlot) => {
        const equippedItem =
          gameData.items.find((item: GameDataModels.EquipmentItem) => {
            return item.itemId === equippedSlot.itemData.itemId;
          }) ?? null;

        return equippedItem?.setId === equipmentItem.setId;
      }).length
    : 0;
  const setBonus =
    equipmentItem.setId === null
      ? null
      : (gameData.setBonuses.find((item: GameDataModels.SetBonus) => {
          return item.setId === equipmentItem.setId;
        }) ?? null);
  const setItemNames =
    equipmentItem.setId === null
      ? []
      : gameData.items
          .filter((item: GameDataModels.EquipmentItem) => {
            return item.setId === equipmentItem.setId;
          })
          .map((item: GameDataModels.EquipmentItem) => {
            return item.name;
          });
  const setBonusSteps = setBonus
    ? setBonus.setBonus.flatMap((step: GameDataModels.SetBonusStep) => {
        return sortStatsByDisplayPriority(step.stats).map((stat, index) => {
          return {
            key: `${step.count}-${stat.statId}-${index}`,
            count: step.count,
            text: `${step.count}- Increases ${getStatLabel(
              stat.statId,
              gameData.stats,
            )} : ${formatStatRange(
              stat.valueMin,
              stat.valueMax,
              stat.isPercentage,
            )}`,
            isActive: equippedSetCount >= step.count,
          };
        });
      })
    : [];
  const suffixLabel =
    suffixType && suffixItem
      ? `${suffixType.suffixName}${formatSuffixTier(suffixItem.tier)}`
      : null;

  return {
    kind: "equipment",
    title:
      itemData.enhancementLevel > 0
        ? `+${itemData.enhancementLevel} ${equipmentItem.name}`
        : equipmentItem.name,
    subtitle: suffixLabel,
    bindText: "Binds when Obtained",
    levelReqText: `Level Req: ${equipmentItem.requiredLevel} or more`,
    classText: `Class: ${job ? job.name : "All"}`,
    typeText: `Type: ${itemType.typeName}`,
    itemLevelText: `Item Level: ${rarity.rarityName}`,
    durabilityText: `Durability: ${equipmentItem.durability}/${equipmentItem.durability}`,
    tradableText: "(Cannot be traded)",
    primaryStats,
    equipAbility: suffixItem?.equipAbility
      ? {
          title: "[Equipment Ability]",
          text: suffixItem.equipAbility.rawText,
        }
      : null,
    enhanceStats,
    hiddenPotentialStats,
    setItemNames,
    setBonusSteps,
    categoryLabel: itemType.typeName,
    description: "An equipment item.",
    rarityColor: rarity.color,
    comparePanel,
  };
};

const buildEquipmentTooltipPanelData = (
  slot: InventorySlot,
  gameData: GameDataModels.GameDataBundle,
  compareSlot?: InventorySlot | null,
): EquipmentTooltipPanelData | null => {
  const tooltipData = buildEquipmentTooltipData(slot, gameData, compareSlot);

  if (!tooltipData) {
    return null;
  }

  return {
    title: tooltipData.title,
    subtitle: tooltipData.subtitle,
    bindText: tooltipData.bindText,
    levelReqText: tooltipData.levelReqText,
    classText: tooltipData.classText,
    typeText: tooltipData.typeText,
    itemLevelText: tooltipData.itemLevelText,
    durabilityText: tooltipData.durabilityText,
    tradableText: tooltipData.tradableText,
    primaryStats: tooltipData.primaryStats,
    equipAbility: tooltipData.equipAbility,
    enhanceStats: tooltipData.enhanceStats,
    hiddenPotentialStats: tooltipData.hiddenPotentialStats,
    setItemNames: tooltipData.setItemNames,
    setBonusSteps: tooltipData.setBonusSteps,
    categoryLabel: tooltipData.categoryLabel,
    description: tooltipData.description,
    rarityColor: tooltipData.rarityColor,
  };
};

const buildRuneTooltipPanelData = (
  slot: InventorySlot,
  gameData: GameDataModels.GameDataBundle,
  compareSlot?: InventorySlot | null,
): RuneTooltipPanelData | null => {
  const itemData = slot.itemData;

  if (itemData === null || itemData.kind !== "rune") {
    return null;
  }

  const rune =
    gameData.runes.find((item: GameDataModels.Rune) => {
      return item.runeId === itemData.runeId;
    }) ?? null;
  const rarity =
    gameData.rarities.find((item: GameDataModels.Rarity) => {
      return item.rarityId === itemData.rarityId;
    }) ?? null;
  const itemType =
    gameData.itemTypes.find((item: GameDataModels.ItemType) => {
      return item.typeId === slot.itemTypeId;
    }) ?? null;

  if (!rune || !rarity || !itemType) {
    return null;
  }

  const rawPrimaryStats = buildRawRuneStats(itemData.stats, gameData.stats);
  let compareRawPrimaryStats: Array<RawPlateStat & { valueRarityId: number }> = [];

  if (
    compareSlot &&
    compareSlot.itemData !== null &&
    compareSlot.itemData.kind === "rune"
  ) {
    compareRawPrimaryStats = buildRawRuneStats(
      compareSlot.itemData.stats,
      gameData.stats,
    );
  }

  const rarityMap = new Map(
    gameData.rarities.map((item: GameDataModels.Rarity) => {
      return [item.rarityId, item] as const;
    }),
  );
  const comparedStats = applyCompareToPrimaryStats(
    rawPrimaryStats,
    compareRawPrimaryStats,
  );
  const primaryStats: RuneTooltipStat[] = comparedStats.map((stat, index) => {
    const sourceStat = rawPrimaryStats[index] ?? null;
    const valueRarity = sourceStat ? rarityMap.get(sourceStat.valueRarityId) : null;

    return {
      ...stat,
      rarityColor: valueRarity?.color ?? rarity.color,
    };
  });

  return {
    title: rune.runeName,
    bindText: "Binds when Obtained",
    levelReqText: `Level Req: ${itemData.runeLevelId * 10} or more`,
    typeText: `Type: ${itemType.typeName}`,
    itemLevelText: `Item Level: ${rarity.rarityName}`,
    resealText: "(Reseal Count: 3)",
    enhanceText: "Cannot be enhanced",
    primaryStats,
    categoryLabel: "Rune Stats",
    rarityColor: rarity.color,
  };
};

const buildRuneTooltipData = (
  slot: InventorySlot,
  gameData: GameDataModels.GameDataBundle,
  compareSlot?: InventorySlot | null,
): RuneTooltipData | null => {
  const panelData = buildRuneTooltipPanelData(slot, gameData, compareSlot);

  if (!panelData) {
    return null;
  }

  const comparePanel =
    compareSlot && compareSlot.itemData?.kind === "rune"
      ? buildRuneTooltipPanelData(compareSlot, gameData, null)
      : null;

  return {
    kind: "rune",
    ...panelData,
    comparePanel,
  };
};

const buildCardTooltipPanelData = (
  slot: InventorySlot,
  gameData: GameDataModels.GameDataBundle,
  compareSlot?: InventorySlot | null,
): CardTooltipPanelData | null => {
  const itemData = slot.itemData;

  if (itemData === null || itemData.kind !== "card") {
    return null;
  }

  const card =
    gameData.cards.find((item: GameDataModels.Card) => {
      return item.cardNameId === itemData.cardNameId;
    }) ?? null;
  const rarity =
    gameData.rarities.find((item: GameDataModels.Rarity) => {
      return item.rarityId === itemData.rarityId;
    }) ?? null;
  const itemType =
    gameData.itemTypes.find((item: GameDataModels.ItemType) => {
      return item.typeId === slot.itemTypeId;
    }) ?? null;
  const cardRarity =
    card?.rarities.find((item: GameDataModels.CardRarity) => {
      return item.cardId === itemData.cardId;
    }) ?? null;

  if (!card || !rarity || !itemType || !cardRarity) {
    return null;
  }

  const patchLevel =
    gameData.patchLevels.find((item: GameDataModels.PatchLevel) => {
      return item.id === card.cardLevelId;
    }) ?? null;

  const rawPrimaryStats = buildRawCardStats(cardRarity.stats, gameData.stats);
  let compareRawPrimaryStats: RawPlateStat[] = [];

  if (
    compareSlot &&
    compareSlot.itemData !== null &&
    compareSlot.itemData.kind === "card"
  ) {
    const compareItemData = compareSlot.itemData;
    const compareCard =
      gameData.cards.find((item: GameDataModels.Card) => {
        return item.cardNameId === compareItemData.cardNameId;
      }) ?? null;
    const compareCardRarity =
      compareCard?.rarities.find((item: GameDataModels.CardRarity) => {
        return item.cardId === compareItemData.cardId;
      }) ?? null;

    if (compareCardRarity) {
      compareRawPrimaryStats = buildRawCardStats(
        compareCardRarity.stats,
        gameData.stats,
      );
    }
  }

  const primaryStats: CardTooltipStat[] = applyCompareToPrimaryStats(
    rawPrimaryStats,
    compareRawPrimaryStats,
  );

  return {
    title: card.cardName,
    bindText: "Binds when Obtained",
    levelText: `Card Level: ${patchLevel?.level ?? card.cardLevelId}`,
    typeText: `Type: ${itemType.typeName}`,
    slotText: `Slot Number: ${card.slotNumber}`,
    itemLevelText: `Item Level: ${rarity.rarityName}`,
    primaryStats,
    categoryLabel: "Card Stats",
    description: "A monster card with collected power.",
    rarityColor: rarity.color,
  };
};

const buildCardTooltipData = (
  slot: InventorySlot,
  gameData: GameDataModels.GameDataBundle,
  compareSlot?: InventorySlot | null,
): CardTooltipData | null => {
  const panelData = buildCardTooltipPanelData(slot, gameData, compareSlot);

  if (!panelData) {
    return null;
  }

  const comparePanel =
    compareSlot && compareSlot.itemData?.kind === "card"
      ? buildCardTooltipPanelData(compareSlot, gameData, null)
      : null;

  return {
    kind: "card",
    ...panelData,
    comparePanel,
  };
};

export const resolveInventoryTooltip = (
  slot: InventorySlot | null,
  compareSlot?: InventorySlot | null,
): InventoryTooltipData | null => {
  if (!slot || slot.itemData === null) {
    return null;
  }

  const gameData = GameDataLoader.load();

  if (slot.itemData.kind === "equipment") {
    return buildEquipmentTooltipData(slot, gameData, compareSlot);
  }

  if (slot.itemData.kind === "rune") {
    return buildRuneTooltipData(slot, gameData, compareSlot);
  }

  if (slot.itemData.kind === "card") {
    return buildCardTooltipData(slot, gameData, compareSlot);
  }

  if (slot.itemTypeId >= 30001 && slot.itemTypeId <= 30004) {
    return buildPlateTooltipData(slot, gameData, compareSlot);
  }

  return null;
};
