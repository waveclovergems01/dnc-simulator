import React, { useMemo, useState } from "react";
import type * as GameDataModels from "../../../model/GameDataModels";
import {
  HighlightText,
  PaginationControls,
} from "../common/DataTableShared";
import {
  buttonStyle,
  copyNameToClipboard,
  formatRangeValue,
  getRarity,
  getStatLabel,
  iconFrameStyle,
  iconImageStyle,
  rarityColumns,
  resolveAssetUrl,
  type PageSize,
} from "../common/DataTableUtils";

interface CardTableRow {
  card: GameDataModels.Card;
  statIds: Set<number>;
}

interface CardDataTableProps {
  cards: GameDataModels.Card[];
  patchLevels: GameDataModels.PatchLevel[];
  rarities: GameDataModels.Rarity[];
  stats: GameDataModels.StatDefinition[];
}

const CardDataTable: React.FC<CardDataTableProps> = ({
  cards,
  patchLevels,
  rarities,
  stats,
}) => {
  const [nameFilter, setNameFilter] = useState("");
  const [statFilterId, setStatFilterId] = useState<number | "all">("all");
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [currentPage, setCurrentPage] = useState(1);

  const statMap = useMemo(() => new Map(stats.map((stat) => [stat.statId, stat] as const)), [stats]);
  const rarityMap = useMemo(() => new Map(rarities.map((rarity) => [rarity.rarityId, rarity] as const)), [rarities]);
  const patchLevelMap = useMemo(() => new Map(patchLevels.map((level) => [level.id, level.level] as const)), [patchLevels]);

  const rows = useMemo<CardTableRow[]>(() => {
    return cards.map((card) => ({
      card,
      statIds: new Set(
        card.rarities.flatMap((rarity) => rarity.stats.map((stat) => stat.statId)),
      ),
    }));
  }, [cards]);

  const availableStatIds = useMemo(() => {
    return Array.from(new Set(rows.flatMap((row) => Array.from(row.statIds)))).sort(
      (left, right) => getStatLabel(left, statMap).localeCompare(getStatLabel(right, statMap)),
    );
  }, [rows, statMap]);

  const filteredRows = useMemo(() => {
    const query = nameFilter.trim().toLowerCase();

    return rows.filter((row) => {
      const searchableTexts = [
        row.card.cardName,
        String(row.card.slotNumber),
        String(patchLevelMap.get(row.card.cardLevelId) ?? row.card.cardLevelId),
        ...row.card.rarities.flatMap((rarity) => {
          return [
            getRarity(rarity.rarityId, rarityMap)?.rarityName ?? `Rarity ${rarity.rarityId}`,
            ...rarity.stats.flatMap((stat) => {
              return [
                getStatLabel(stat.statId, statMap),
                formatRangeValue(stat),
              ];
            }),
          ];
        }),
      ].map((text) => text.toLowerCase());
      const matchesSearch =
        query.length === 0 ||
        searchableTexts.some((text) => {
          return text.includes(query);
        });
      const matchesStat = statFilterId === "all" || row.statIds.has(statFilterId);

      return matchesSearch && matchesStat;
    });
  }, [nameFilter, patchLevelMap, rarityMap, rows, statFilterId, statMap]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageRows = filteredRows.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );
  const selectedStatLabel = statFilterId === "all" ? null : getStatLabel(statFilterId, statMap);

  const handleCopyName = async (name: string): Promise<void> => {
    setCopiedName(name);
    await copyNameToClipboard(name);
    window.setTimeout(() => {
      setCopiedName((current) => (current === name ? null : current));
    }, 1200);
  };

  const renderRarityStats = (card: GameDataModels.Card, rarityId: number): React.ReactNode => {
    const rarityInfo = getRarity(rarityId, rarityMap);
    const rarity = card.rarities.find((item) => item.rarityId === rarityId);

    if (!rarity) {
      return <span style={{ color: "#4b5563" }}>-</span>;
    }

    return (
      <div style={{ display: "grid", gap: "4px" }}>
        {rarity.stats.map((stat) => (
          <div
            key={`${rarity.cardId}-${stat.statId}`}
            style={{
              backgroundColor: statFilterId === stat.statId ? "#1f2937" : "transparent",
              borderRadius: "4px",
              padding: statFilterId === stat.statId ? "1px 4px" : 0,
            }}
          >
            <span style={{ color: "#9ca3af" }}>
              <HighlightText text={getStatLabel(stat.statId, statMap)} query={nameFilter} />:
            </span>{" "}
            <span style={{ color: rarityInfo?.color ?? "#e5e7eb", fontWeight: 700 }}>
              <HighlightText text={formatRangeValue(stat)} query={nameFilter} />
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section style={{ border: "1px solid #374151", borderRadius: "8px", overflow: "hidden", backgroundColor: "rgba(13,18,30,0.3)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "grid", gridTemplateRows: selectedStatLabel || nameFilter.trim() ? "auto auto auto minmax(0, 1fr) auto" : "auto auto minmax(0, 1fr) auto", minHeight: 0 }}>
      <div style={{ minHeight: "56px", borderBottom: "1px solid #374151", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        <div style={{ fontSize: "18px", fontWeight: 700 }}>Cards Data Table</div>
        <div style={{ color: "#9ca3af", fontSize: "13px" }}>Showing {filteredRows.length} / {rows.length} rows</div>
      </div>
      <div style={{ borderBottom: "1px solid #374151", display: "grid", gridTemplateColumns: "minmax(220px, 1fr) 220px", gap: "12px", padding: "12px 16px" }}>
        <input value={nameFilter} onChange={(event) => { setNameFilter(event.target.value); setCurrentPage(1); }} placeholder="Search card name or stat" style={{ height: "38px", borderRadius: "6px", border: "1px solid #374151", backgroundColor: "#111827", color: "#e5e7eb", padding: "0 12px", outline: "none" }} />
        <select value={statFilterId} onChange={(event) => { setStatFilterId(event.target.value === "all" ? "all" : Number(event.target.value)); setCurrentPage(1); }} style={{ height: "38px", borderRadius: "6px", border: "1px solid #374151", backgroundColor: "#111827", color: "#e5e7eb", padding: "0 10px" }}>
          <option value="all">All Stats</option>
          {availableStatIds.map((statId) => <option key={statId} value={statId}>{getStatLabel(statId, statMap)}</option>)}
        </select>
      </div>
      {nameFilter.trim() || selectedStatLabel ? (
        <div style={{ borderBottom: "1px solid #374151", display: "flex", gap: "8px", flexWrap: "wrap", padding: "10px 16px", fontSize: "13px" }}>
          {nameFilter.trim() ? <span style={{ border: "1px solid #374151", borderRadius: "999px", backgroundColor: "#111827", padding: "5px 10px" }}>Search: <strong style={{ color: "#fde68a" }}>{nameFilter.trim()}</strong></span> : null}
          {selectedStatLabel ? <span style={{ border: "1px solid #374151", borderRadius: "999px", backgroundColor: "#111827", padding: "5px 10px" }}>Stat filter: <strong style={{ color: "#93c5fd" }}>{selectedStatLabel}</strong></span> : null}
        </div>
      ) : null}
      <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", minWidth: "1180px", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              {["Slot Number", "Icon", "Name", "Level", ...rarityColumns.map((column) => column.rarityId)].map((header) => (
                <th key={header} style={{ position: "sticky", top: 0, zIndex: 1, height: "42px", backgroundColor: "rgba(17,24,39,0.7)", borderBottom: "1px solid #374151", color: typeof header === "number" ? getRarity(header, rarityMap)?.color ?? "#9ca3af" : "#9ca3af", fontSize: "12px", textAlign: "left", padding: "0 12px", textTransform: "uppercase" }}>
                  {typeof header === "number" ? (
                    <HighlightText
                      text={getRarity(header, rarityMap)?.rarityName ?? `Rarity ${header}`}
                      query={nameFilter}
                    />
                  ) : (
                    <HighlightText text={header} query={nameFilter} />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map(({ card }) => (
              <tr key={card.cardNameId}>
                <td style={{ borderBottom: "1px solid #1f2937", padding: "12px", fontWeight: 700 }}><HighlightText text={String(card.slotNumber)} query={nameFilter} /></td>
                <td style={{ borderBottom: "1px solid #1f2937", padding: "12px" }}><div style={iconFrameStyle}><img src={resolveAssetUrl(card.pathFile)} alt={card.cardName} style={iconImageStyle} /></div></td>
                <td style={{ borderBottom: "1px solid #1f2937", padding: "12px", minWidth: "260px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "10px", alignItems: "center" }}>
                    <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 800 }} title={card.cardName}><HighlightText text={card.cardName} query={nameFilter} /></span>
                    <button type="button" onClick={() => void handleCopyName(card.cardName)} style={{ ...buttonStyle, height: "30px", color: copiedName === card.cardName ? "#86efac" : "#e5e7eb" }}>{copiedName === card.cardName ? "Copied" : "Copy"}</button>
                  </div>
                </td>
                <td style={{ borderBottom: "1px solid #1f2937", padding: "12px", fontWeight: 700 }}><HighlightText text={String(patchLevelMap.get(card.cardLevelId) ?? card.cardLevelId)} query={nameFilter} /></td>
                {rarityColumns.map((column) => <td key={`${card.cardNameId}-${column.rarityId}`} style={{ borderBottom: "1px solid #1f2937", borderLeft: "1px solid #111827", padding: "12px", verticalAlign: "top", fontSize: "13px", minWidth: "150px" }}>{renderRarityStats(card, column.rarityId)}</td>)}
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

export default CardDataTable;
