import React, { useCallback, useMemo, useState } from "react";
import type * as GameDataModels from "../../../model/GameDataModels";
import {
  HighlightText,
  PaginationControls,
} from "../common/DataTableShared";
import {
  buttonStyle,
  copyNameToClipboard,
  formatNumber,
  getRarity,
  getStatLabel,
  iconFrameStyle,
  iconImageStyle,
  rarityColumns,
  resolveAssetUrl,
  type PageSize,
} from "../common/DataTableUtils";

interface PlateTableRow {
  plateName: GameDataModels.PlateName;
  plateLevelId: number;
  plateTypeId: number;
  plateTypeSortId: number;
  plates: GameDataModels.Plate[];
  statIds: Set<number>;
}

interface PlateDataTableProps {
  itemTypes: GameDataModels.ItemType[];
  patchLevels: GameDataModels.PatchLevel[];
  plateNames: GameDataModels.PlateName[];
  plates: GameDataModels.Plate[];
  plateTypes: GameDataModels.PlateType[];
  rarities: GameDataModels.Rarity[];
  stats: GameDataModels.StatDefinition[];
}

const formatPlateValue = (plate: GameDataModels.Plate): string => {
  return [
    plate.statValue > 0 ? formatNumber(plate.statValue) : null,
    plate.statPercent > 0 ? `${formatNumber(plate.statPercent)}%` : null,
  ].filter(Boolean).join(" / ") || "-";
};

const formatEnhancementPlateValues = (plate: GameDataModels.Plate): string[] => {
  const values = [
    plate.statValue > 0 ? formatNumber(plate.statValue) : null,
    plate.statPercent > 0 ? `${formatNumber(plate.statPercent)}%` : null,
  ].filter(Boolean) as string[];

  return values.length > 0 ? values : ["-"];
};

const PlateDataTable: React.FC<PlateDataTableProps> = ({
  itemTypes,
  patchLevels,
  plateNames,
  plates,
  plateTypes,
  rarities,
  stats,
}) => {
  const [nameFilter, setNameFilter] = useState("");
  const [plateTypeFilterId, setPlateTypeFilterId] = useState<number | "all">("all");
  const [statFilterId, setStatFilterId] = useState<number | "all">("all");
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [currentPage, setCurrentPage] = useState(1);

  const statMap = useMemo(() => new Map(stats.map((stat) => [stat.statId, stat] as const)), [stats]);
  const rarityMap = useMemo(() => new Map(rarities.map((rarity) => [rarity.rarityId, rarity] as const)), [rarities]);
  const patchLevelMap = useMemo(() => new Map(patchLevels.map((level) => [level.id, level.level] as const)), [patchLevels]);
  const itemTypeMap = useMemo(() => new Map(itemTypes.map((itemType) => [itemType.typeId, itemType] as const)), [itemTypes]);
  const plateTypeNameByItemTypeId = useMemo(() => new Map(plateTypes.map((plateType) => [30000 + plateType.id, plateType.name] as const)), [plateTypes]);
  const plateTypeSortIdByItemTypeId = useMemo(() => new Map(plateTypes.map((plateType) => [30000 + plateType.id, plateType.id] as const)), [plateTypes]);

  const getPlateTypeName = useCallback((itemTypeId: number): string => {
    return itemTypeMap.get(itemTypeId)?.typeName ?? plateTypeNameByItemTypeId.get(itemTypeId) ?? `Type ${itemTypeId}`;
  }, [itemTypeMap, plateTypeNameByItemTypeId]);

  const getPlateTypeSortId = useCallback((itemTypeId: number): number => {
    return plateTypeSortIdByItemTypeId.get(itemTypeId) ?? itemTypeId;
  }, [plateTypeSortIdByItemTypeId]);

  const rows = useMemo<PlateTableRow[]>(() => {
    return plateNames.flatMap((plateName) => {
      const grouped = new Map<string, GameDataModels.Plate[]>();

      plates
        .filter((plate) => plate.plateNameId === plateName.id)
        .forEach((plate) => {
          const key = `${plate.plateLevelId}-${plate.plateTypeId}`;
          grouped.set(key, [...(grouped.get(key) ?? []), plate]);
        });

      return Array.from(grouped.values()).map((groupedPlates) => {
        const sortedPlates = [...groupedPlates].sort((left, right) => {
          if (left.rarityId !== right.rarityId) {
            return left.rarityId - right.rarityId;
          }

          return left.statId - right.statId;
        });
        const firstPlate = sortedPlates[0];

        return {
          plateName,
          plateLevelId: firstPlate.plateLevelId,
          plateTypeId: firstPlate.plateTypeId,
          plateTypeSortId: getPlateTypeSortId(firstPlate.plateTypeId),
          plates: sortedPlates,
          statIds: new Set(
            sortedPlates
              .map((plate) => plate.statId)
              .filter((statId) => typeof statId === "number"),
          ),
        };
      });
    }).sort((left, right) => {
      if (left.plateTypeSortId !== right.plateTypeSortId) {
        return left.plateTypeSortId - right.plateTypeSortId;
      }

      const leftLevel = patchLevelMap.get(left.plateLevelId) ?? left.plateLevelId;
      const rightLevel = patchLevelMap.get(right.plateLevelId) ?? right.plateLevelId;

      if (leftLevel !== rightLevel) {
        return leftLevel - rightLevel;
      }

      return left.plateName.name.localeCompare(right.plateName.name);
    });
  }, [getPlateTypeSortId, patchLevelMap, plateNames, plates]);

  const availableStatIds = useMemo(() => {
    return Array.from(new Set(rows.flatMap((row) => Array.from(row.statIds)))).sort(
      (left, right) => getStatLabel(left, statMap).localeCompare(getStatLabel(right, statMap)),
    );
  }, [rows, statMap]);

  const filteredRows = useMemo(() => {
    const query = nameFilter.trim().toLowerCase();

    return rows.filter((row) => {
      const statLabels = Array.from(row.statIds).map((statId) =>
        getStatLabel(statId, statMap).toLowerCase(),
      );
      const matchesSearch =
        query.length === 0 ||
        row.plateName.name.toLowerCase().includes(query) ||
        getPlateTypeName(row.plateTypeId).toLowerCase().includes(query) ||
        statLabels.some((label) => label.includes(query));
      const matchesStat = statFilterId === "all" || row.statIds.has(statFilterId);
      const matchesPlateType =
        plateTypeFilterId === "all" ||
        row.plateTypeSortId === plateTypeFilterId;

      return matchesSearch && matchesStat && matchesPlateType;
    });
  }, [getPlateTypeName, nameFilter, plateTypeFilterId, rows, statFilterId, statMap]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageRows = filteredRows.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );
  const selectedStatLabel = statFilterId === "all" ? null : getStatLabel(statFilterId, statMap);
  const selectedPlateTypeLabel =
    plateTypeFilterId === "all"
      ? null
      : plateTypes.find((plateType) => plateType.id === plateTypeFilterId)?.name ?? null;

  const handleCopyName = async (name: string): Promise<void> => {
    setCopiedName(name);
    await copyNameToClipboard(name);
    window.setTimeout(() => {
      setCopiedName((current) => (current === name ? null : current));
    }, 1200);
  };

  const renderRarityStats = (row: PlateTableRow, rarityId: number): React.ReactNode => {
    const rarityInfo = getRarity(rarityId, rarityMap);
    const plateTypeName = getPlateTypeName(row.plateTypeId);
    const isEnhancement = plateTypeName === "Enhancement Heraldry";
    const rarityPlates = row.plates.filter((plate) => plate.rarityId === rarityId);

    if (rarityPlates.length === 0) {
      return <span style={{ color: "#4b5563" }}>-</span>;
    }

    return (
      <div style={{ display: "grid", gap: "8px" }}>
        {rarityPlates.map((plate) => (
          <div
            key={plate.id}
            style={{ backgroundColor: statFilterId === plate.statId ? "#1f2937" : "transparent", borderRadius: "4px", padding: statFilterId === plate.statId ? "3px 4px" : 0 }}
          >
            {isEnhancement ? (
              formatEnhancementPlateValues(plate).map((value) => (
                <div key={`${plate.id}-${value}`}>
                  <span style={{ color: "#9ca3af" }}><HighlightText text={getStatLabel(plate.statId, statMap)} query={nameFilter} />:</span>{" "}
                  <span style={{ color: rarityInfo?.color ?? "#e5e7eb", fontWeight: 700 }}>{value}</span>
                </div>
              ))
            ) : (
              <div style={{ display: "grid", gap: "4px" }}>
                <div style={{ color: "#93c5fd", fontWeight: 700 }}>[{plateTypeName}]</div>
                <div>Description: <span style={{ color: "#9ca3af" }}>Not defined</span></div>
                <div>
                  <span style={{ color: "#9ca3af" }}>Stats:</span>{" "}
                  <span style={{ color: rarityInfo?.color ?? "#e5e7eb", fontWeight: 700 }}>
                    {typeof plate.statId === "number" ? `${getStatLabel(plate.statId, statMap)}: ${formatPlateValue(plate)}` : "Not defined"}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <section style={{ border: "1px solid #374151", borderRadius: "8px", overflow: "hidden", display: "grid", gridTemplateRows: selectedStatLabel || selectedPlateTypeLabel || nameFilter.trim() ? "auto auto auto minmax(0, 1fr) auto" : "auto auto minmax(0, 1fr) auto", minHeight: 0 }}>
      <div style={{ minHeight: "56px", borderBottom: "1px solid #374151", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        <div style={{ fontSize: "18px", fontWeight: 700 }}>Plates Data Table</div>
        <div style={{ color: "#9ca3af", fontSize: "13px" }}>Showing {filteredRows.length} / {rows.length} rows</div>
      </div>
      <div style={{ borderBottom: "1px solid #374151", display: "grid", gridTemplateColumns: "minmax(220px, 1fr) 240px 220px", gap: "12px", padding: "12px 16px" }}>
        <input value={nameFilter} onChange={(event) => { setNameFilter(event.target.value); setCurrentPage(1); }} placeholder="Search plate name, type, or stat" style={{ height: "38px", borderRadius: "6px", border: "1px solid #374151", backgroundColor: "#111827", color: "#e5e7eb", padding: "0 12px", outline: "none" }} />
        <select value={plateTypeFilterId} onChange={(event) => { setPlateTypeFilterId(event.target.value === "all" ? "all" : Number(event.target.value)); setCurrentPage(1); }} style={{ height: "38px", borderRadius: "6px", border: "1px solid #374151", backgroundColor: "#111827", color: "#e5e7eb", padding: "0 10px" }}>
          <option value="all">All Plate Types</option>
          {plateTypes
            .slice()
            .sort((left, right) => left.id - right.id)
            .map((plateType) => (
              <option key={plateType.id} value={plateType.id}>
                {plateType.name}
              </option>
            ))}
        </select>
        <select value={statFilterId} onChange={(event) => { setStatFilterId(event.target.value === "all" ? "all" : Number(event.target.value)); setCurrentPage(1); }} style={{ height: "38px", borderRadius: "6px", border: "1px solid #374151", backgroundColor: "#111827", color: "#e5e7eb", padding: "0 10px" }}>
          <option value="all">All Stats</option>
          {availableStatIds.map((statId) => <option key={statId} value={statId}>{getStatLabel(statId, statMap)}</option>)}
        </select>
      </div>
      {nameFilter.trim() || selectedPlateTypeLabel || selectedStatLabel ? (
        <div style={{ borderBottom: "1px solid #374151", display: "flex", gap: "8px", flexWrap: "wrap", padding: "10px 16px", fontSize: "13px" }}>
          {nameFilter.trim() ? <span style={{ border: "1px solid #374151", borderRadius: "999px", backgroundColor: "#111827", padding: "5px 10px" }}>Search: <strong style={{ color: "#fde68a" }}>{nameFilter.trim()}</strong></span> : null}
          {selectedPlateTypeLabel ? <span style={{ border: "1px solid #374151", borderRadius: "999px", backgroundColor: "#111827", padding: "5px 10px" }}>Plate type: <strong style={{ color: "#93c5fd" }}>{selectedPlateTypeLabel}</strong></span> : null}
          {selectedStatLabel ? <span style={{ border: "1px solid #374151", borderRadius: "999px", backgroundColor: "#111827", padding: "5px 10px" }}>Stat filter: <strong style={{ color: "#93c5fd" }}>{selectedStatLabel}</strong></span> : null}
        </div>
      ) : null}
      <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", minWidth: "1080px", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              {["Icon", "Name", "Type", "Level", ...rarityColumns.map((column) => column.rarityId)].map((header) => (
                <th key={header} style={{ position: "sticky", top: 0, zIndex: 1, height: "42px", backgroundColor: "#111827", borderBottom: "1px solid #374151", color: typeof header === "number" ? getRarity(header, rarityMap)?.color ?? "#9ca3af" : "#9ca3af", fontSize: "12px", textAlign: "left", padding: "0 12px", textTransform: "uppercase" }}>
                  {typeof header === "number" ? getRarity(header, rarityMap)?.rarityName ?? `Rarity ${header}` : header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr key={`${row.plateName.id}-${row.plateLevelId}-${row.plateTypeId}`}>
                <td style={{ borderBottom: "1px solid #1f2937", padding: "12px" }}><div style={iconFrameStyle}><img src={resolveAssetUrl(row.plateName.pathFile)} alt={row.plateName.name} style={iconImageStyle} /></div></td>
                <td style={{ borderBottom: "1px solid #1f2937", padding: "12px", minWidth: "280px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "10px", alignItems: "center" }}>
                    <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 800 }} title={row.plateName.name}><HighlightText text={row.plateName.name} query={nameFilter} /></span>
                    <button type="button" onClick={() => void handleCopyName(row.plateName.name)} style={{ ...buttonStyle, height: "30px", color: copiedName === row.plateName.name ? "#86efac" : "#e5e7eb" }}>{copiedName === row.plateName.name ? "Copied" : "Copy"}</button>
                  </div>
                </td>
                <td style={{ borderBottom: "1px solid #1f2937", padding: "12px", color: "#93c5fd", fontWeight: 700 }}><HighlightText text={getPlateTypeName(row.plateTypeId)} query={nameFilter} /></td>
                <td style={{ borderBottom: "1px solid #1f2937", padding: "12px", fontWeight: 700 }}>{patchLevelMap.get(row.plateLevelId) ?? row.plateLevelId}</td>
                {rarityColumns.map((column) => <td key={`${row.plateName.id}-${row.plateLevelId}-${row.plateTypeId}-${column.rarityId}`} style={{ borderBottom: "1px solid #1f2937", borderLeft: "1px solid #111827", padding: "12px", verticalAlign: "top", fontSize: "13px", minWidth: "150px" }}>{renderRarityStats(row, column.rarityId)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRows.length === 0 ? <div style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>No data matched the current filter.</div> : null}
      </div>
      <PaginationControls currentPage={safeCurrentPage} pageSize={pageSize} totalRows={filteredRows.length} onPageChange={setCurrentPage} onPageSizeChange={(nextPageSize) => { setPageSize(nextPageSize); setCurrentPage(1); }} />
    </section>
  );
};

export default PlateDataTable;
