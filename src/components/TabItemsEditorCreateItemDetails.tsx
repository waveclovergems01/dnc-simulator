import React, { useMemo, useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";

import type { EquipmentItem } from "./TabItemsEditorCreateItemTypes";

// JSON data
import rarityData from "../data/m.rarities.json";
import statsJson from "../data/m.stats.json";
import jobsJson from "../data/m.jobs.json";
import setBonusData from "../data/m.set_bonuses.json";

// Equipment (ALL IN ONE)
import equipmentsJson from "../data/m.equipments.json";

// Suffix JSON
import suffixGroups from "../data/m.suffix_groups.json";
import suffixTypes from "../data/m.suffix_types.json";

/* ------------------------------------------------------------
   ALL EQUIPMENTS
------------------------------------------------------------ */
const ALL_EQUIPMENTS: EquipmentItem[] = equipmentsJson.items;

/* ------------------------------------------------------------
   LOCAL TYPES
------------------------------------------------------------ */
interface RawStat {
    stat_id: number;
    value_min?: number;
    value_max?: number;
    is_percentage?: 0 | 1;
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

function getSuffixGroupByTypeId(typeId: number) {
    return suffixGroups.suffix_groups.find(
        (g) => g.item_type_id === typeId
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

    let setItemNames: string[] | undefined;
    let setBonuses:
        | {
            count: number;
            stats: CreateTooltipStat[];
        }[]
        | undefined;

    if (setInfo) {
        setItemNames = ALL_EQUIPMENTS
            .filter((eq) => eq.set_id === raw.set_id)
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
                    isPercentage:
                        ss.is_percentage === 1
                            ? true
                            : info?.isPercentage ?? false,
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

function resolveTypeId(typeName: string): number | null {
    for (const [id, name] of TYPE_MAP.entries()) {
        if (name === typeName) return id;
    }
    return null;
}

const TooltipRenderer = ({
    item,
    theme,
}: {
    item: CreateTooltipItem;
    theme: ThemeKey;
}) => {
    const cfg = themeConfigs[theme];
    console.log(cfg);
    const [selectedSuffix, setSelectedSuffix] = useState<number | null>(null);

    return (
        <div className="w-full px-3 py-2 rounded-lg border border-[#4E4630] bg-[rgba(0,0,0,0.96)] text-[12px] text-gray-200">
            <div className="text-center text-[14px] font-bold mb-1" style={{ color: item.rarityColor }}>
                {selectedSuffix
                    ? `${item.name} (${SUFFIX_TYPE_MAP.get(selectedSuffix)})`
                    : item.name}
            </div>

            <Divider />

            <SectionHeader>Equip Ability</SectionHeader>

            {(() => {
                const typeId = resolveTypeId(item.typeName);
                if (!typeId) return null;

                const group = getSuffixGroupByTypeId(typeId);
                if (!group) return null;

                const normalIds = group.normal.map((n) => n.suffix_id);
                const pvpIds = group.pvp.map((p) => p.suffix_id);

                return (
                    <div className="ml-2">
                        {[...normalIds, ...pvpIds].map((id) => (
                            <label key={id} className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="suffix"
                                    checked={selectedSuffix === id}
                                    onChange={() => setSelectedSuffix(id)}
                                />
                                {SUFFIX_TYPE_MAP.get(id)}
                            </label>
                        ))}
                    </div>
                );
            })()}
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
        baseItems.find((b) => b.item_id === selectedBaseId) || null;

    const tooltipItem = useMemo(() => {
        if (!selectedEquip) return null;
        return normalizeItem(selectedEquip);
    }, [selectedEquip]);

    return (
        <div className={`p-4 rounded border ${cfg.sectionBorder} flex flex-col h-full`}>
            <select
                className={`w-full p-1 mb-3 ${cfg.popupDropdown}`}
                value={selectedBaseId ?? ""}
                onChange={(e) => setSelectedBaseId(Number(e.target.value))}
            >
                <option value="">-- Select Item --</option>
                {baseItems.map((e) => (
                    <option key={e.item_id} value={e.item_id}>
                        {e.name}
                    </option>
                ))}
            </select>

            {tooltipItem && (
                <div className="flex-1 overflow-y-auto">
                    <TooltipRenderer item={tooltipItem} theme={theme} />
                </div>
            )}
        </div>
    );
};

export default TabItemsEditorCreateItemDetails;
