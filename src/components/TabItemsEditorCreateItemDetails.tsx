import React, { useMemo, useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";

import type { EquipmentItem, BaseStat } from "./TabItemsEditorCreateItemTypes";

import rarityData from "../data/m.rarities.json";
import statsJson from "../data/m.stats.json";
import jobsJson from "../data/m.jobs.json";
import setBonusData from "../data/m.set_bonuses.json";
import equipmentsJson from "../data/m.equipments.json";
import itemTypesJson from "../data/m.item_types.json";
import suffixItemsJson from "../data/m.suffix_items.json";
import suffixTypesJson from "../data/m.suffix_types.json";

/* ------------------------------------------------------------
   DATA
------------------------------------------------------------ */
const ALL_EQUIPMENTS: EquipmentItem[] = equipmentsJson.items;
const ALL_SUFFIX_ITEMS = suffixItemsJson.suffix_items;
const ITEM_TYPES = itemTypesJson.item_types;

/* ------------------------------------------------------------
   MAPS
------------------------------------------------------------ */
const STAT_MAP = new Map<number, { label: string; isPercentage: boolean }>();
statsJson.stats.forEach((s) => {
    STAT_MAP.set(s.stat_id, {
        label: s.display_name,
        isPercentage: s.is_percentage === 1,
    });
});

const RARITY_MAP = new Map<number, { name: string; color: string }>();
rarityData.rarities.forEach((r) => {
    RARITY_MAP.set(r.rarity_id, {
        name: r.rarity_name,
        color: r.color,
    });
});

const JOB_MAP = new Map<number, string>();
jobsJson.jobs.forEach((j) => JOB_MAP.set(j.id, j.name));

const TYPE_NAME_MAP = new Map<number, string>();
ITEM_TYPES.forEach((t) => {
    TYPE_NAME_MAP.set(t.type_id, t.type_name);
});

const SUFFIX_TYPE_NAME_MAP = new Map<number, string>();
suffixTypesJson.suffix_types.forEach((s) => {
    SUFFIX_TYPE_NAME_MAP.set(s.suffix_id, s.suffix_name);
});

/* ------------------------------------------------------------
   HELPERS
------------------------------------------------------------ */
function toTitleCase(text?: string): string {
    if (!text) return "";
    return text
        .split(" ")
        .filter(Boolean)
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
}

function renderStat(stat: BaseStat): string {
    const info = STAT_MAP.get(stat.stat_id);
    const value =
        stat.value_min === stat.value_max
            ? stat.value_min
            : `${stat.value_min}–${stat.value_max}`;
    return `${info?.label ?? "Stat"}: ${value}${info?.isPercentage ? "%" : ""}`;
}

/* ------------------------------------------------------------
   UI PARTS
------------------------------------------------------------ */
const Divider = () => (
    <div className="h-px w-full bg-[#E0C15A]/40 my-2" />
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="text-[#FFE066] text-[12px] font-bold mt-2 mb-1">
        {children}
    </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[#E0C15A]">{children}</span>
);

/* ------------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------------ */
interface Props {
    theme: ThemeKey;
    baseItems: EquipmentItem[];
}

const TabItemsEditorCreateItemDetails: React.FC<Props> = ({
    theme,
    baseItems,
}) => {
    const cfg = themeConfigs[theme];

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [selectedSuffixTypeId, setSelectedSuffixTypeId] =
        useState<number | null>(null);

    const item = baseItems.find((b) => b.item_id === selectedId) || null;
    const rarity = item ? RARITY_MAP.get(item.rarity_id) : null;

    /* ---------------- SET INFO ---------------- */
    const setInfo = item
        ? setBonusData.set_bonuses.find((s) => s.set_id === item.set_id)
        : null;

    const setItems = useMemo(() => {
        if (!item || !item.set_id) return [];
        return ALL_EQUIPMENTS.filter((e) => e.set_id === item.set_id);
    }, [item]);

    /* ---------------- SUFFIX BY TIER ---------------- */
    const suffixByTier = useMemo(() => {
        if (!item) return {};

        const map: Record<number, typeof ALL_SUFFIX_ITEMS> = {};

        ALL_SUFFIX_ITEMS
            .filter((s) => s.item_id === item.item_id)
            .forEach((s) => {
                if (!map[s.tier]) map[s.tier] = [];
                map[s.tier].push(s);
            });

        return map;
    }, [item]);

    const hasSuffix = Object.keys(suffixByTier).length > 0;

    /* ---------------- MOCK ENHANCE / POTENTIAL ---------------- */
    const enhanceStats: BaseStat[] = item
        ? item.base_stats.map((s) => ({
            stat_id: s.stat_id,
            value_min: Math.floor((s.value_min ?? 0) * 0.1),
            value_max: Math.floor((s.value_max ?? 0) * 0.1),
        }))
        : [];

    const potentialStats: BaseStat[] = item
        ? item.base_stats.slice(0, 2).map((s) => ({
            stat_id: s.stat_id,
            value_min: Math.floor((s.value_min ?? 0) * 0.05),
            value_max: Math.floor((s.value_max ?? 0) * 0.05),
        }))
        : [];

    const selectedSuffixName = selectedSuffixTypeId
        ? SUFFIX_TYPE_NAME_MAP.get(selectedSuffixTypeId)
        : null;

    return (
        <div className="h-full flex flex-col min-h-0">
            {/* BASE ITEM SELECT */}
            <div className="shrink-0">
                <select
                    className={`w-full p-2 mb-3 ${cfg.popupDropdown}`}
                    value={selectedId ?? ""}
                    onChange={(e) =>
                        setSelectedId(
                            e.target.value === "" ? null : Number(e.target.value)
                        )
                    }
                >
                    <option value="">-- Select Item --</option>
                    {baseItems.map((b) => (
                        <option key={b.item_id} value={b.item_id}>
                            {b.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* SCROLLABLE DETAILS */}
            <div
                className={`
                    flex-1 min-h-0 overflow-y-auto
                    rounded border ${cfg.sectionBorder}
                    bg-black/90 p-3
                `}
            >
                {!item && <div className="opacity-60">No item selected</div>}

                {item && (
                    <div className="text-[12px] text-gray-200">
                        {/* NAME */}
                        <div
                            className="text-center text-[14px] font-bold"
                            style={{ color: rarity?.color }}
                        >
                            {item.name}
                            {selectedSuffixName &&
                                ` (${toTitleCase(selectedSuffixName)})`}
                        </div>

                        <Divider />

                        {/* BASIC INFO */}
                        <div className="space-y-0.5">
                            <div>
                                <Label>Required Level:</Label>{" "}
                                {item.required_level}
                            </div>
                            <div>
                                <Label>Class:</Label>{" "}
                                {toTitleCase(JOB_MAP.get(item.job_id))}
                            </div>
                            <div>
                                <Label>Type:</Label>{" "}
                                {toTitleCase(
                                    TYPE_NAME_MAP.get(item.type_id)
                                )}
                            </div>
                            <div>
                                <Label>Rarity:</Label>{" "}
                                <span style={{ color: rarity?.color }}>
                                    {rarity?.name}
                                </span>
                            </div>
                        </div>

                        <Divider />

                        {/* STATS */}
                        <SectionTitle>Stats</SectionTitle>
                        {item.base_stats.map((s, i) => (
                            <div key={i}>{renderStat(s)}</div>
                        ))}

                        <Divider />
                        <SectionTitle>Enhance</SectionTitle>
                        {enhanceStats.map((s, i) => (
                            <div key={i}>{renderStat(s)}</div>
                        ))}

                        <Divider />
                        <SectionTitle>Potential</SectionTitle>
                        {potentialStats.map((s, i) => (
                            <div key={i}>{renderStat(s)}</div>
                        ))}

                        {/* EQUIPMENT ABILITY */}
                        <Divider />
                        <SectionTitle>Equipment Ability</SectionTitle>

                        {!hasSuffix && (
                            <div className="ml-2 opacity-60">-</div>
                        )}

                        {hasSuffix &&
                            Object.entries(suffixByTier).map(
                                ([tier, items]) => (
                                    <div key={tier} className="mb-2">
                                        <div className="text-[#E0C15A] text-xs mb-1">
                                            Tier {tier}
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 ml-2">
                                            {items.map((s) => (
                                                <label
                                                    key={s.suffix_type_id}
                                                    className="flex items-center gap-2"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="suffix"
                                                        checked={
                                                            selectedSuffixTypeId ===
                                                            s.suffix_type_id
                                                        }
                                                        onChange={() =>
                                                            setSelectedSuffixTypeId(
                                                                s.suffix_type_id
                                                            )
                                                        }
                                                    />
                                                    {toTitleCase(
                                                        SUFFIX_TYPE_NAME_MAP.get(
                                                            s.suffix_type_id
                                                        )
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )
                            )}

                        {/* SET ITEMS + SET BONUS */}
                        {setInfo && (
                            <>
                                <Divider />
                                <SectionTitle>Set Items</SectionTitle>
                                {setItems.map((si) => (
                                    <div key={si.item_id}>• {si.name}</div>
                                ))}

                                <SectionTitle>Set Bonus</SectionTitle>
                                {setInfo.set_bonus.map((b, i) => (
                                    <div key={i}>
                                        {b.count} Set:
                                        {b.stats.map((st, j) => {
                                            const info = STAT_MAP.get(st.stat_id);
                                            const val =
                                                st.value_min === st.value_max
                                                    ? st.value_min
                                                    : `${st.value_min}–${st.value_max}`;
                                            return (
                                                <div key={j} className="ml-3">
                                                    {info?.label}: {val}
                                                    {st.is_percentage === 1
                                                        ? "%"
                                                        : ""}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TabItemsEditorCreateItemDetails;
