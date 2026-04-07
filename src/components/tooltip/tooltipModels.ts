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

export type InventoryTooltipData = PlateTooltipData;

export interface InventoryTooltipProps {
  data: InventoryTooltipData;
  position: TooltipPosition;
}