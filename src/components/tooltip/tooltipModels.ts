export interface TooltipPosition {
  x: number;
  y: number;
}

export interface PlateTooltipPrimaryStat {
  statId: number;
  label: string;
  valueText: string;
}

export interface PlateTooltipPanelData {
  title: string;
  bindText: string;
  levelReqText: string;
  itemLevelText: string;
  tradableText: string;
  primaryStats: PlateTooltipPrimaryStat[];
  thirdStatText: string | null;
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