import { GameDataLoader } from "../../data/GameDataLoader";
import type * as GameDataModels from "../../model/GameDataModels";
import type { InventorySlot } from "../../state/models/InventoryModels";
import type {
  InventoryTooltipData,
  PlateTooltipPanelData,
  PlateTooltipPrimaryStat,
  PlateTooltipDiffTone,
} from "./tooltipModels";
import { formatStatValue, getStatLabel } from "./tooltipUtils";

interface RawPlateStat {
  key: string;
  statId: number;
  label: string;
  numericValue: number;
  isPercentage: boolean;
}

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
        valueText: formatStatValue(stat.numericValue, stat.isPercentage),
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
      valueText: formatStatValue(stat.numericValue, stat.isPercentage),
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

  if (itemData === null) {
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

  if (compareSlot && compareSlot.itemData !== null) {
    const compareMatchedPlates = compareSlot.itemData.plateIds
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
      compareSlot.itemData.plate3rdStatId === null
        ? null
        : (gameData.plate3rdStats.find((item: GameDataModels.PlateThirdStat) => {
            return item.id === compareSlot.itemData?.plate3rdStatId;
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

export const resolveInventoryTooltip = (
  slot: InventorySlot | null,
  compareSlot?: InventorySlot | null,
): InventoryTooltipData | null => {
  if (!slot || slot.itemData === null) {
    return null;
  }

  const gameData = GameDataLoader.load();

  if (slot.itemTypeId >= 30001 && slot.itemTypeId <= 30004) {
    return buildPlateTooltipData(slot, gameData, compareSlot);
  }

  return null;
};