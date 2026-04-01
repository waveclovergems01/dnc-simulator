import { GameDataLoader } from "../../data/GameDataLoader";
import type * as GameDataModels from "../../model/GameDataModels";
import type { InventorySlot } from "../../state/models/InventoryModels";
import type {
  InventoryTooltipData,
  PlateTooltipPrimaryStat,
} from "./tooltipModels";
import { formatStatValue, getStatLabel } from "./tooltipUtils";

const buildPlateTooltipData = (
  slot: InventorySlot,
  gameData: GameDataModels.GameDataBundle,
): InventoryTooltipData | null => {
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

  const primaryStats: PlateTooltipPrimaryStat[] = [];
  const seenStatKeys = new Set<string>();

  matchedPlates.forEach((plate: GameDataModels.Plate) => {
    if (plate.statValue > 0) {
      const statKey = `${plate.statId}-value-${plate.statValue}`;

      if (!seenStatKeys.has(statKey)) {
        seenStatKeys.add(statKey);
        primaryStats.push({
          statId: plate.statId,
          label: getStatLabel(plate.statId, gameData.stats),
          valueText: formatStatValue(plate.statValue, false),
        });
      }
    }

    if (plate.statPercent > 0) {
      const statKey = `${plate.statId}-percent-${plate.statPercent}`;

      if (!seenStatKeys.has(statKey)) {
        seenStatKeys.add(statKey);
        primaryStats.push({
          statId: plate.statId,
          label: getStatLabel(plate.statId, gameData.stats),
          valueText: formatStatValue(plate.statPercent, true),
        });
      }
    }
  });

  const thirdStatText =
    thirdStat === null
      ? null
      : `${getStatLabel(thirdStat.statId, gameData.stats)}: ${formatStatValue(
          thirdStat.value,
          thirdStat.isPercentage,
        )}`;

  const effectStatLabels = Array.from(
    new Set<string>(
      primaryStats.map((stat: PlateTooltipPrimaryStat) => {
        return stat.label;
      }),
    ),
  );

  const effectText =
    effectStatLabels.length > 0
      ? `Increases [${effectStatLabels.join(", ")}].`
      : "Increases stats.";

  return {
    kind: "plate",
    title: plateName.name,
    bindText: "Binds when Obtained",
    levelReqText: `Level Req: ${patchLevel.level} or more`,
    itemLevelText: `Item Level: ${rarity.rarityName}`,
    tradableText: "(Cannot be traded)",
    primaryStats,
    thirdStatText,
    categoryLabel: "Heraldry",
    description: "A heraldry with mystical powers.",
    effectText,
    rarityColor: rarity.color,
  };
};

export const resolveInventoryTooltip = (
  slot: InventorySlot | null,
): InventoryTooltipData | null => {
  if (!slot || slot.itemData === null) {
    return null;
  }

  const gameData = GameDataLoader.load();

  if (slot.itemTypeId >= 30001 && slot.itemTypeId <= 30004) {
    return buildPlateTooltipData(slot, gameData);
  }

  return null;
};