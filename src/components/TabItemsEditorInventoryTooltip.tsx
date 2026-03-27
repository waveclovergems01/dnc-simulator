// src/components/TabItemsEditorInventoryTooltip.tsx
import React from "react";

import rarityData from "../data/m.rarities.json";
import statsJson from "../data/m.stats.json";
import jobsJson from "../data/m.jobs.json";
import itemTypesJson from "../data/m.item_types.json";
import equipmentsJson from "../data/m.equipments.json";
import setBonusJson from "../data/m.set_bonuses.json";

/* ------------------------------------------------------------
   MAPS
------------------------------------------------------------ */

const RARITY_MAP = new Map<number, { name: string; color: string }>();
rarityData.rarities.forEach((r) =>
    RARITY_MAP.set(r.rarity_id, {
        name: r.rarity_name,
        color: r.color,
    })
);

const STAT_MAP = new Map<number, { label: string; isPercentage: boolean }>();
statsJson.stats.forEach((s) =>
    STAT_MAP.set(s.stat_id, {
        label: s.display_name,
        isPercentage: s.is_percentage === 1,
    })
);

const JOB_MAP = new Map<number, string>();
jobsJson.jobs.forEach((j) => JOB_MAP.set(j.id, j.name));

const TYPE_MAP = new Map<number, string>();
itemTypesJson.item_types.forEach((t) =>
    TYPE_MAP.set(t.type_id, t.type_name)
);

/* ------------------------------------------------------------
   HELPERS
------------------------------------------------------------ */

function toTitleCase(text?: string): string {
    if (!text) return "";
    return text
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

/* ------------------------------------------------------------
   UI PARTS
------------------------------------------------------------ */

const Divider = () => (
    <div className="h-px w-full bg-[#E0C15A]/40 my-1" />
);

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => (
    <div className="text-[#FFE066] text-[12px] font-bold mt-3 mb-1">
        {children}
    </div>
);

/* ------------------------------------------------------------
   TOOLTIP
------------------------------------------------------------ */

interface Props {
    item: typeof equipmentsJson.items[number];
}

const TabItemsEditorInventoryTooltip: React.FC<Props> = ({
    item,
}) => {
    const rarity = RARITY_MAP.get(item.rarity_id);

    const setInfo = item.set_id
        ? setBonusJson.set_bonuses.find(
              (s) => s.set_id === item.set_id
          )
        : null;

    const setItems = item.set_id
        ? equipmentsJson.items
              .filter((e) => e.set_id === item.set_id)
              .map((e) => e.name)
        : [];

    return (
        <div
            className="
                w-[260px]
                px-3 py-2
                rounded-lg
                border border-[#4E4630]
                bg-[rgba(0,0,0,0.96)]
                text-[12px]
                text-gray-200
                shadow-[0_0_25px_rgba(0,0,0,0.8)]
            "
        >
            <div
                className="text-center text-[14px] font-bold mb-1"
                style={{ color: rarity?.color }}
            >
                {item.name}
            </div>

            <div className="text-center text-[#FFE066] text-[11px] mb-1">
                Binds when Obtained
            </div>

            <Divider />

            <div className="space-y-0.5 mb-2">
                <div>
                    <span className="text-[#FFE066]">Level Req:</span>{" "}
                    {item.required_level} or more
                </div>
                <div>
                    <span className="text-[#FFE066]">Class:</span>{" "}
                    <span className="text-[#ff8800]">
                        {toTitleCase(JOB_MAP.get(item.job_id))}
                    </span>
                </div>
                <div>
                    <span className="text-[#FFE066]">Type:</span>{" "}
                    {toTitleCase(TYPE_MAP.get(item.type_id))}
                </div>
                <div>
                    <span className="text-[#FFE066]">Item Level:</span>{" "}
                    {rarity?.name}
                </div>
                <div>
                    <span className="text-[#FFE066]">Durability:</span>{" "}
                    {item.durability}/{item.durability}
                </div>
            </div>

            <Divider />

            <div className="space-y-0.5">
                {item.base_stats.map((s) => {
                    const info = STAT_MAP.get(s.stat_id);
                    const v =
                        s.value_min === s.value_max
                            ? s.value_min
                            : `${s.value_min}-${s.value_max}`;
                    return (
                        <div
                            key={`${s.stat_id}-${v}`}
                            className="flex"
                        >
                            <span>{info?.label}</span>
                            <span className="ml-auto">
                                {v}
                                {info?.isPercentage ? "%" : ""}
                            </span>
                        </div>
                    );
                })}
            </div>

            <SectionHeader>[Equipment Ability]</SectionHeader>
            <div className="text-[11px]">
                You can add suffix abilities at the town&apos;s
                blacksmith with{" "}
                <span className="text-[#FFE066]">
                    [Item Production]
                </span>
                .
            </div>

            <div className="mt-2 text-[11px]">
                You can enhance the stats using the{" "}
                <span className="text-[#FFE066]">
                    [Item Enhancement]
                </span>{" "}
                at the town&apos;s blacksmith.
            </div>

            <SectionHeader>[Hidden Potential]</SectionHeader>
            <div className="text-[11px]">
                You can add potential abilities with{" "}
                <span className="text-[#FFE066]">[Codes]</span>.
            </div>

            {setInfo && (
                <>
                    <SectionHeader>Set Items</SectionHeader>
                    <div className="text-[11px] space-y-0.5">
                        {setItems.map((n) => (
                            <div key={n}>{n}</div>
                        ))}
                    </div>

                    <SectionHeader>Set Bonus</SectionHeader>
                    <div className="space-y-1">
                        {setInfo.set_bonus.map((b) =>
                            b.stats.map((s) => {
                                const info =
                                    STAT_MAP.get(s.stat_id);
                                const v =
                                    s.value_min === s.value_max
                                        ? s.value_min
                                        : `${s.value_min}-${s.value_max}`;
                                return (
                                    <div
                                        key={`${b.count}-${s.stat_id}`}
                                        className="flex"
                                    >
                                        <span className="text-[#FFE066] mr-1">
                                            {b.count}-
                                        </span>
                                        <span>{info?.label}</span>
                                        <span className="ml-auto">
                                            {v}
                                            {s.is_percentage
                                                ? "%"
                                                : ""}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default TabItemsEditorInventoryTooltip;
