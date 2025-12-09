import React, { useMemo, useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";

import type { CreatedItem, EquipmentItem } from "./TabItemsEditorCreateItemTypes";

// local data sources
import rarityData from "../data/m.rarities.json";
import statsJson from "../data/m.stats.json";
import jobsJson from "../data/m.jobs.json";
import setBonusData from "../data/m.set_bonuses.json";

/* ------------------------------------------------------------
   LOCAL TYPES (ของระบบ Create Item เอง)
------------------------------------------------------------ */
interface CreateTooltipStat {
    label: string;
    valueMin: number;
    valueMax: number;
    isPercentage: boolean;
}

interface CreateTooltipBlock {
    label: string;
    stats: CreateTooltipStat[];
}

interface CreateTooltipItem {
    name: string;
    rarityColor: string;

    levelRequired: number;
    jobName: string;
    typeName: string;
    rarityName: string;
    durability: number;

    baseBlock: CreateTooltipBlock;

    setName?: string;
    setItemNames?: string[];
    setBonuses?: {
        count: number;
        stats: CreateTooltipStat[];
    }[];
}

/* ------------------------------------------------------------
   PROPS TYPE (แก้ error)
------------------------------------------------------------ */
interface Props {
    theme: ThemeKey;
    item: CreatedItem;
    baseItems: EquipmentItem[];
}

/* ------------------------------------------------------------
   MAPPERS
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

/* ------------------------------------------------------------
   NORMALIZER: EquipmentItem → CreateTooltipItem
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

    const setInfo = raw.set_id
        ? setBonusData.set_bonuses.find((b) => b.set_id === raw.set_id)
        : undefined;

    let setBonuses:
        | {
            count: number;
            stats: CreateTooltipStat[];
        }[]
        | undefined;

    if (setInfo) {
        setBonuses = setInfo.set_bonus.map((b) => ({
            count: b.count,
            stats: b.stats.map((ss) => ({
                label: STAT_MAP.get(ss.stat_id)?.label ?? `Stat ${ss.stat_id}`,
                valueMin: ss.value_min,
                valueMax: ss.value_max,
                isPercentage:
                    ss.is_percentage ?? STAT_MAP.get(ss.stat_id)?.isPercentage ?? false,
            })),
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

        baseBlock: {
            label: "Stats",
            stats: baseStats,
        },

        setName: setInfo?.set_name,
        setItemNames: setInfo ? [`Part of ${setInfo.set_name}`] : undefined,
        setBonuses,
    };
}

/* ------------------------------------------------------------
   Tooltip UI — เหมือน TabItemsPresetTooltip 100%
------------------------------------------------------------ */

const Divider = () => (
    <div className="h-px w-full bg-[#E0C15A]/40 my-1" />
);

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
    <div className="text-[#FFE066] text-[12px] font-bold mt-3 mb-1">
        {children}
    </div>
);

const TooltipRenderer = ({ item }: { item: CreateTooltipItem }) => (
    <div
        className="
        w-full
        h-full
        px-3 py-2
        rounded-lg
        border border-[#4E4630]
        bg-[rgba(0,0,0,0.96)]
        text-[12px]
        text-gray-200
        shadow-[0_0_25px_rgba(0,0,0,0.8)]
    "
    >
        {/* NAME */}
        <div
            className="text-center text-[14px] font-bold mb-1"
            style={{ color: item.rarityColor }}
        >
            {item.name}
        </div>

        <div className="text-center text-[11px] text-[#FFE066] mb-1">
            Binds when Obtained
        </div>

        <Divider />

        {/* BASIC INFO */}
        <div className="space-y-0.5 mb-2 leading-tight">
            <div>
                <span className="text-[#FFE066]">Level Req:</span> {item.levelRequired} or
                more
            </div>

            <div>
                <span className="text-[#FFE066]">Class:</span> {item.jobName}
            </div>

            <div>
                <span className="text-[#FFE066]">Type:</span> {item.typeName}
            </div>

            <div>
                <span className="text-[#FFE066]">Item Level:</span> {item.rarityName}
            </div>

            <div>
                <span className="text-[#FFE066]">Durability:</span>{" "}
                {item.durability}/{item.durability}
            </div>
        </div>

        {/* MAIN STATS */}
        <div className="space-y-0.5">
            {item.baseBlock.stats.map((s, idx) => {
                const v =
                    s.valueMin === s.valueMax
                        ? s.valueMin
                        : `${s.valueMin}-${s.valueMax}`;
                return (
                    <div key={idx} className="flex">
                        <span className="text-gray-300">{s.label}</span>
                        <span className="ml-auto text-gray-100">
                            {v}
                            {s.isPercentage ? "%" : ""}
                        </span>
                    </div>
                );
            })}
        </div>

        {/* SET ITEMS */}
        {item.setItemNames && (
            <>
                <SectionHeader>Set Items</SectionHeader>
                {item.setItemNames.map((name) => (
                    <div key={name}>{name}</div>
                ))}
            </>
        )}

        {/* SET BONUS */}
        {item.setBonuses && (
            <>
                <SectionHeader>Set Bonus</SectionHeader>
                {item.setBonuses.map((b, idx) => (
                    <div key={idx} className="space-y-0.5">
                        {b.stats.map((s, i2) => {
                            const v =
                                s.valueMin === s.valueMax
                                    ? s.valueMin
                                    : `${s.valueMin}-${s.valueMax}`;
                            return (
                                <div key={i2} className="flex">
                                    <span className="text-[#FFE066] mr-1">
                                        {b.count}-Set:
                                    </span>
                                    <span>{s.label}</span>
                                    <span className="ml-auto">
                                        {v}
                                        {s.isPercentage ? "%" : ""}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </>
        )}
    </div>
);

/* ------------------------------------------------------------
   MAIN COMPONENT (Full width + height 100%)
------------------------------------------------------------ */
const TabItemsEditorCreateItemDetails: React.FC<Props> = ({
    theme,
    baseItems,
}) => {
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
                p-3 rounded border ${cfg.sectionBorder}
                flex flex-col
                h-full w-full
                min-h-0
            `}
        >
            <div className={`${cfg.accentText} font-bold text-sm mb-2`}>
                Select Base Item
            </div>

            <select
                className={`w-full rounded p-1 mb-3 ${cfg.popupDropdown}`}
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

            <div className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden">
                {tooltipItem && <TooltipRenderer item={tooltipItem} />}
            </div>
        </div>
    );
};

export default TabItemsEditorCreateItemDetails;
