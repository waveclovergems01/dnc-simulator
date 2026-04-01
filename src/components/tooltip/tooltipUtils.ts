import type * as GameDataModels from "../../model/GameDataModels";

export const formatStatValue = (
  value: number,
  isPercentage: boolean,
): string => {
  if (isPercentage) {
    return `${value.toFixed(2)}%`;
  }

  return `${value}`;
};

export const getStatLabel = (
  statId: number,
  stats: GameDataModels.StatDefinition[],
): string => {
  const stat =
    stats.find((item: GameDataModels.StatDefinition) => {
      return item.statId === statId;
    }) ?? null;

  if (!stat) {
    return `Stat ${statId}`;
  }

  return stat.displayName || stat.statName;
};

export const getItemTypeLabel = (
  itemTypeId: number,
  itemTypes: GameDataModels.ItemType[],
): string => {
  const itemType =
    itemTypes.find((item: GameDataModels.ItemType) => {
      return item.typeId === itemTypeId;
    }) ?? null;

  if (!itemType) {
    return `Item Type ${itemTypeId}`;
  }

  return itemType.typeName;
};