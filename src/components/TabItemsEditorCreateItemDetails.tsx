import React, { useMemo, useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";

import type { EquipmentItem } from "./TabItemsEditorCreateItemTypes";

// JSON data
import rarityData from "../data/m.rarities.json";
import statsJson from "../data/m.stats.json";
import jobsJson from "../data/m.jobs.json";
import setBonusData from "../data/m.set_bonuses.json";

// Suffix JSON
import suffixGroups from "../data/m.suffix_groups.json";
import suffixTypes from "../data/m.suffix_types.json";

// LOAD ALL EQUIPMENT FILES (for Set Items)
import eqCerberus from "../data/m.equipment_cerberus.json";
import eqApocalypse from "../data/m.equipment_apocalypse.json";
import eqManticore from "../data/m.equipment_manticore.json";
import eqImmortal from "../data/m.equipment_immortal.json";
import eqSeaDragon from "../data/m.equipment_sea_dragon.json";
import eqRedSeaDragon from "../data/m.equipment_red_sea_dragon.json";
import eqAncientTotem from "../data/m.equipment_ancient_totem.json";

const ALL_EQUIPMENTS: EquipmentItem[] = [
    ...eqCerberus.items,
    ...eqApocalypse.items,
    ...eqManticore.items,
    ...eqImmortal.items,
    ...eqSeaDragon.items,
    ...eqRedSeaDragon.items,
    ...eqAncientTotem.items,
];

/* ------------------------------------------------------------
   LOCAL TYPES
------------------------------------------------------------ */
interface RawStat {
    stat_id: number;
    value_min?: number;
    value_max?: number;
    is_percentage?: boolean;
}

interface CreateTooltipStat {
    label: string;
    valueMin: number;
    valueMax: number;
    isPercentage: boolean;
}

interface CreateTooltipItem {
    name: string;
    rarityColor: string;

    levelRequired: number;
    jobName: string;
    typeName: string;
    rarityName: string;
    durability: number;

    baseStats: CreateTooltipStat[];

    hasEquipAbility: boolean;
    hasEnhanceStats: boolean;
    hasHiddenPotential: boolean;

    setName?: string;
    setItemNames?: string[];
    setBonuses?: {
        count: number;
        stats: CreateTooltipStat[];
    }[];
}

interface Props {
    theme: ThemeKey;
    baseItems: EquipmentItem[];
}

/* ------------------------------------------------------------
   MAPS
------------------------------------------------------------ */
const STAT_MAP = new Map<number, { label: string; isPercentage: boolean }>();
statsJson.stats.forEach((s) => {
    STAT_MAP.set(s.stat_id, {
        label: s.display_name,
        isPercentage: s.is_percentage,
    });
});

const RARITY_MAP = new Map<number, { name: string; color: string }>();
rarityData.rarities.forEach((r) =>
    RARITY_MAP.set(r.rarity_id, {
        name: r.rarity_name,
        color: r.color,
    })
);

const JOB_MAP = new Map<number, string>();
jobsJson.jobs.forEach((j) => JOB_MAP.set(j.id, j.name));

const TYPE_MAP = new Map<number, string>([
    [10001, "Helm"],
    [10002, "Upper Body"],
    [10003, "Lower Body"],
    [10004, "Gloves"],
    [10005, "Shoes"],
    [10006, "Main Weapon"],
    [10007, "Secondary Weapon"],
]);

const SLOT_ORDER: Record<number, number> = {
    10001: 1,
    10002: 2,
    10003: 3,
    10004: 4,
    10005: 5,
    10006: 6,
    10007: 7,
};

/* ------------------------------------------------------------
   SUFFIX MAPS
------------------------------------------------------------ */
const SUFFIX_TYPE_MAP = new Map<number, string>();
suffixTypes.suffix_types.forEach((s) => {
    SUFFIX_TYPE_MAP.set(s.suffix_id, s.suffix_name);
});

/* ฟังก์ชันหา suffix group ตาม type_id */
function getSuffixGroupByTypeId(typeId: number) {
    return suffixGroups.suffix_groups.find((g) =>
        g.item_type_ids.includes(typeId)
    );
}

/* ------------------------------------------------------------
   TYPE GUARDS
------------------------------------------------------------ */
function hasEnhancedStats(obj: unknown): obj is { enhanced_stats: RawStat[] } {
    return (
        typeof obj === "object" &&
        obj !== null &&
        Array.isArray((obj as Record<string, unknown>).enhanced_stats)
    );
}

function hasHiddenPotential(obj: unknown): obj is { hidden_potential: RawStat[] } {
    return (
        typeof obj === "object" &&
        obj !== null &&
        Array.isArray((obj as Record<string, unknown>).hidden_potential)
    );
}

/* ------------------------------------------------------------
   NORMALIZER
------------------------------------------------------------ */
function normalizeItem(raw: EquipmentItem): CreateTooltipItem {
    const rarity = RARITY_MAP.get(raw.rarity_id);

    const baseStats: CreateTooltipStat[] = raw.base_stats.map((s) => {
        const info = STAT_MAP.get(s.stat_id);
        return {
            label: info?.label ?? `Stat ${s.stat_id}`,
            valueMin: s.value_min ?? 0,
            valueMax: s.value_max ?? s.value_min ?? 0,
            isPercentage: info?.isPercentage ?? false,
        };
    });

    const hasEA = hasEnhancedStats(raw);
    const hasHP = hasHiddenPotential(raw);

    const setInfo = raw.set_id
        ? setBonusData.set_bonuses.find((b) => b.set_id === raw.set_id)
        : undefined;

    let setItemNames: string[] | undefined = undefined;
    let setBonuses:
        | {
            count: number;
            stats: CreateTooltipStat[];
        }[]
        | undefined;

    if (setInfo) {
        setItemNames = ALL_EQUIPMENTS.filter((eq) => eq.set_id === raw.set_id)
            .sort(
                (a, b) =>
                    (SLOT_ORDER[a.type_id] ?? 99) -
                    (SLOT_ORDER[b.type_id] ?? 99)
            )
            .map((eq) => eq.name);

        setBonuses = setInfo.set_bonus.map((b) => ({
            count: b.count,
            stats: b.stats.map((ss) => {
                const info = STAT_MAP.get(ss.stat_id);
                return {
                    label: info?.label ?? `Stat ${ss.stat_id}`,
                    valueMin: ss.value_min,
                    valueMax: ss.value_max,
                    isPercentage: ss.is_percentage ?? info?.isPercentage ?? false,
                };
            }),
        }));
    }

    return {
        name: raw.name,
        rarityColor: rarity?.color ?? "#FFFFFF",
        levelRequired: raw.required_level,
        jobName: JOB_MAP.get(raw.job_id) ?? `Job ${raw.job_id}`,
        typeName: TYPE_MAP.get(raw.type_id) ?? `Type ${raw.type_id}`,
        rarityName: rarity?.name ?? "Unknown",
        durability: raw.durability,

        baseStats,

        hasEquipAbility: hasEA,
        hasEnhanceStats: true,
        hasHiddenPotential: hasHP,

        setName: setInfo?.set_name,
        setItemNames,
        setBonuses,
    };
}

/* ------------------------------------------------------------
   TOOLTIP UI
------------------------------------------------------------ */

const Divider = () => <div className="h-px w-full bg-[#E0C15A]/40 my-2" />;

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
    <div className="text-[#FFE066] text-[12px] font-bold mt-2 mb-1">
        {children}
    </div>
);

// Helper: map typeName → typeId
function resolveTypeId(typeName: string): number | null {
    for (const [id, name] of TYPE_MAP.entries()) {
        if (name === typeName) return id;
    }
    return null;
}


const TooltipRenderer = ({ item, theme }: { item: CreateTooltipItem; theme: ThemeKey }) => {
    const cfg = themeConfigs[theme];

    const [enhanceLevel, setEnhanceLevel] = useState<number>(0);
    const [selectedSuffix, setSelectedSuffix] = useState<number | null>(null);

    const dropdownClass = `
        px-2 py-1 rounded border text-[12px]
        ${cfg.popupDropdown}
    `;

    return (
        <div
            className="
                w-full px-3 py-2 rounded-lg border border-[#4E4630]
                bg-[rgba(0,0,0,0.96)] text-[12px] text-gray-200
                shadow-[0_0_25px_rgba(0,0,0,0.8)]
            "
        >
            {/* NAME */}
            <div
                className="text-center text-[14px] font-bold mb-1"
                style={{ color: item.rarityColor }}
            >
                {selectedSuffix
                    ? `${item.name} (${SUFFIX_TYPE_MAP.get(selectedSuffix)})`
                    : item.name}
            </div>

            <Divider />

            {/* BASIC INFO */}
            <SectionHeader>Basic Info</SectionHeader>
            <div className="space-y-0.5 mb-2">
                <div><span className={cfg.accentText}>Level Req:</span> {item.levelRequired}</div>
                <div><span className={cfg.accentText}>Class:</span> {item.jobName.charAt(0).toUpperCase() + item.jobName.slice(1)}</div>
                <div><span className={cfg.accentText}>Type:</span> {item.typeName}</div>
                <div><span className={cfg.accentText}>Rarity:</span> {item.rarityName}</div>
                <div><span className={cfg.accentText}>Durability:</span> {item.durability}/{item.durability}</div>
            </div>

            <Divider />

            {/* BASE STATS */}
            <SectionHeader>Stats</SectionHeader>
            {item.baseStats.map((s, idx) => (
                <div key={idx} className="flex">
                    <span>{s.label}</span>
                    <span className="ml-auto">
                        {s.valueMin === s.valueMax ? s.valueMin : `${s.valueMin}-${s.valueMax}`}
                        {s.isPercentage ? "%" : ""}
                    </span>
                </div>
            ))}

            {/* EQUIP ABILITY (SUFFIX RADIO BUTTONS) */}
            <Divider />
            <SectionHeader>Equip Ability</SectionHeader>

            {(() => {
                const typeId = resolveTypeId(item.typeName);
                if (!typeId) {
                    return <div className={cfg.mutedText + " ml-2"}>None</div>;
                }

                const group = getSuffixGroupByTypeId(typeId);
                if (!group) {
                    return <div className={cfg.mutedText + " ml-2"}>No Suffix Available</div>;
                }

                const normalIds = group.normal;
                const pvpIds = group.pvp;

                // Helper: split array into rows of 2
                const chunkPairs = (arr: number[]) => {
                    const result: number[][] = [];
                    for (let i = 0; i < arr.length; i += 2) {
                        result.push(arr.slice(i, i + 2));
                    }
                    return result;
                };

                const normalRows = chunkPairs(normalIds);
                const pvpRows = chunkPairs(pvpIds);

                return (
                    <div className="ml-2 flex flex-col gap-4">

                        {/* NORMAL GROUP */}
                        <div>
                            <div className={`${cfg.accentText} font-bold text-xs mb-1`}>Normal:</div>

                            <div className="flex flex-col gap-1">
                                {normalRows.map((pair, idx) => (
                                    <div key={idx} className="grid grid-cols-2 gap-4">
                                        {pair.map(id => (
                                            <label
                                                key={id}
                                                className={`flex items-center gap-2 cursor-pointer ${cfg.bodyText}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="suffix"
                                                    value={id}
                                                    checked={selectedSuffix === id}
                                                    onChange={() => setSelectedSuffix(id)}
                                                    className="accent-current"
                                                />
                                                <span>{SUFFIX_TYPE_MAP.get(id)}</span>
                                            </label>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PVP GROUP */}
                        {pvpIds.length > 0 && (
                            <div>
                                <div className={`${cfg.accentText} font-bold text-xs mb-1`}>PVP:</div>

                                <div className="flex flex-col gap-1">
                                    {pvpRows.map((pair, idx) => (
                                        <div key={idx} className="grid grid-cols-2 gap-4">
                                            {pair.map(id => (
                                                <label
                                                    key={id}
                                                    className={`flex items-center gap-2 cursor-pointer ${cfg.bodyText}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="suffix"
                                                        value={id}
                                                        checked={selectedSuffix === id}
                                                        onChange={() => setSelectedSuffix(id)}
                                                        className="accent-current"
                                                    />
                                                    <span>{SUFFIX_TYPE_MAP.get(id)}</span>
                                                </label>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                );
            })()}

            {/* ENHANCE DROPDOWN (THEME BASED) */}
            <Divider />
            <div className="flex items-center gap-2">
                <SectionHeader>Enhance Stats</SectionHeader>

                <select
                    className={dropdownClass}
                    value={enhanceLevel}
                    onChange={(e) => setEnhanceLevel(Number(e.target.value))}
                >
                    {Array.from({ length: 16 }).map((_, i) => (
                        <option key={i} value={i}>
                            +{i}
                        </option>
                    ))}
                </select>
            </div>

            {/* Hidden Potential */}
            <Divider />
            <SectionHeader>Hidden Potential</SectionHeader>
            <div className="text-gray-500 ml-2">
                {item.hasHiddenPotential ? "(Available)" : "(None)"}
            </div>

            {/* SET ITEMS */}
            {item.setItemNames && (
                <>
                    <Divider />
                    <SectionHeader>Set Items</SectionHeader>
                    {item.setItemNames.map((name) => (
                        <div key={name}>{name}</div>
                    ))}
                </>
            )}

            {/* SET BONUS */}
            {item.setBonuses && (
                <>
                    <Divider />
                    <SectionHeader>Set Bonus</SectionHeader>
                    {item.setBonuses.map((b, idx) => (
                        <div key={idx}>
                            {b.stats.map((s, i2) => (
                                <div key={i2} className="flex">
                                    <span className={cfg.accentText}>{b.count}-Set:</span>
                                    <span className="ml-2">{s.label}</span>
                                    <span className="ml-auto">
                                        {s.valueMin === s.valueMax ? s.valueMin : `${s.valueMin}-${s.valueMax}`}
                                        {s.isPercentage ? "%" : ""}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};


/* ------------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------------ */

const TabItemsEditorCreateItemDetails: React.FC<Props> = ({ theme, baseItems }) => {
    const cfg = themeConfigs[theme];

    const [selectedBaseId, setSelectedBaseId] = useState<number | null>(null);

    const selectedEquip =
        baseItems.find((b: EquipmentItem) => b.item_id === selectedBaseId) || null;

    const tooltipItem = useMemo(() => {
        if (!selectedEquip) return null;
        return normalizeItem(selectedEquip);
    }, [selectedEquip]);

    return (
        <div
            className={`
                p-4 rounded border ${cfg.sectionBorder}
                flex flex-col
                h-full w-full
                min-h-0
            `}
        >
            <div className={`${cfg.accentText} font-bold text-sm mb-2`}>
                Select Base Item
            </div>

            <select
                className={`w-full p-1 mb-3 ${cfg.popupDropdown}`}
                value={selectedBaseId ?? ""}
                onChange={(e) => setSelectedBaseId(Number(e.target.value))}
            >
                <option value="">-- Select Item --</option>
                {baseItems.map((e) => {
                    const rarity = RARITY_MAP.get(e.rarity_id);
                    return (
                        <option
                            key={e.item_id}
                            value={e.item_id}
                            style={{ color: rarity?.color ?? "#FFF" }}
                        >
                            {e.name} (Lv{e.required_level})
                        </option>
                    );
                })}
            </select>

            <div className="flex-1 min-h-0 overflow-hidden">
                {tooltipItem && (
                    <div className="h-full w-full overflow-y-auto pr-1">
                        <TooltipRenderer item={tooltipItem} theme={theme} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TabItemsEditorCreateItemDetails;
