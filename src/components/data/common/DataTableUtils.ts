import type React from "react";
import type * as GameDataModels from "../../../model/GameDataModels";

export type PageSize = 10 | 50 | 100;

export const rarityColumns = [
  { rarityId: 2, label: "Magic" },
  { rarityId: 3, label: "Rare" },
  { rarityId: 4, label: "Epic" },
  { rarityId: 5, label: "Unique" },
  { rarityId: 6, label: "Legendary" },
];

export const resolveAssetUrl = (pathFile: string): string => {
  const normalizedPath = pathFile.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

export const formatNumber = (value: number): string => {
  return value.toFixed(1);
};

export const formatRangeValue = (stat: {
  valueMin: number;
  valueMax: number;
  isPercentage: boolean;
}): string => {
  const suffix = stat.isPercentage ? "%" : "";

  if (stat.valueMin === stat.valueMax) {
    return `${formatNumber(stat.valueMin)}${suffix}`;
  }

  return `${formatNumber(stat.valueMin)}${suffix} - ${formatNumber(stat.valueMax)}${suffix}`;
};

export const getStatLabel = (
  statId: number,
  statMap: Map<number, GameDataModels.StatDefinition>,
): string => {
  return statMap.get(statId)?.displayName ?? `Stat ${statId}`;
};

export const getRarity = (
  rarityId: number,
  rarityMap: Map<number, GameDataModels.Rarity>,
): GameDataModels.Rarity | null => {
  return rarityMap.get(rarityId) ?? null;
};

export const buttonStyle: React.CSSProperties = {
  height: "34px",
  borderRadius: "6px",
  border: "1px solid #374151",
  backgroundColor: "#111827",
  color: "#e5e7eb",
  cursor: "pointer",
  padding: "0 10px",
  fontWeight: 700,
};

export const iconFrameStyle: React.CSSProperties = {
  width: "50px",
  height: "50px",
  border: "1px solid #475569",
  borderRadius: "8px",
  backgroundColor: "#020617",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const iconImageStyle: React.CSSProperties = {
  width: "42px",
  height: "42px",
  objectFit: "contain",
};

export const copyNameToClipboard = async (name: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(name);
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = name;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
};
