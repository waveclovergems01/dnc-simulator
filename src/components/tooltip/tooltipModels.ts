export interface TooltipPosition {
  x: number;
  y: number;
}

export type PlateTooltipDiffTone = "up" | "down" | null;

export interface PlateTooltipPrimaryStat {
  key: string;
  statId: number;
  label: string;
  valueText: string;
  numericValue: number;
  isPercentage: boolean;
  diffText: string | null;
  diffTone: PlateTooltipDiffTone;
}

export interface EquipmentTooltipStat {
  key: string;
  statId: number;
  label: string;
  valueText: string;
  numericValue: number;
  isPercentage: boolean;
  diffText: string | null;
  diffTone: PlateTooltipDiffTone;
}

export interface EquipmentTooltipAbility {
  title: string;
  text: string;
}

export interface EquipmentTooltipSetBonusStep {
  key: string;
  count: number;
  text: string;
  isActive: boolean;
}

export interface PlateTooltipPanelData {
  title: string;
  bindText: string;
  levelReqText: string;
  itemLevelText: string;
  tradableText: string;
  primaryStats: PlateTooltipPrimaryStat[];
  thirdStatText: string | null;
  thirdStatDiffText: string | null;
  thirdStatDiffTone: PlateTooltipDiffTone;
  categoryLabel: string;
  description: string;
  effectText: string;
  rarityColor: string;
}

export interface PlateTooltipData extends PlateTooltipPanelData {
  kind: "plate";
  comparePanel: PlateTooltipPanelData | null;
}

export interface EquipmentTooltipPanelData {
  title: string;
  subtitle: string | null;
  bindText: string;
  levelReqText: string;
  classText: string;
  typeText: string;
  itemLevelText: string;
  durabilityText: string;
  tradableText: string;
  primaryStats: EquipmentTooltipStat[];
  equipAbility: EquipmentTooltipAbility | null;
  enhanceStats: EquipmentTooltipStat[];
  hiddenPotentialStats: EquipmentTooltipStat[];
  setItemNames: string[];
  setBonusSteps: EquipmentTooltipSetBonusStep[];
  categoryLabel: string;
  description: string;
  rarityColor: string;
}

export interface EquipmentTooltipData extends EquipmentTooltipPanelData {
  kind: "equipment";
  comparePanel: EquipmentTooltipPanelData | null;
}

export type InventoryTooltipData = PlateTooltipData | EquipmentTooltipData;

export interface InventoryTooltipProps {
  data: InventoryTooltipData;
  position: TooltipPosition;
}
