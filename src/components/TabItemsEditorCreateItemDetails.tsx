// src/components/TabItemsEditorCreateItemDetails.tsx
import React from "react";
import { themeConfigs, type ThemeKey } from "../themes";
import type {
    AccessoryItem,
    BaseStat,
    PotentialStat,
    SetEffectEntry,
    StatMap
} from "./TabItemsEditorCreateItemTypes";

interface Props {
    theme: ThemeKey;
    item: AccessoryItem;
    statMap: StatMap;
}

const RARITY_COLORS: Record<string, string> = {
    Normal: "text-white",
    Magic: "text-green-400",
    Rare: "text-blue-400",
    Epic: "text-orange-400",
    Unique: "text-purple-400",
    Legendary: "text-red-500",
};

const TabItemsEditorCreateItemDetails: React.FC<Props> = ({
    theme,
    item,
    statMap,
}) => {
    const cfg = themeConfigs[theme];

    return (
        <div className="space-y-4">

            {/* Title */}
            <div className={`${cfg.accentText} font-bold text-sm`}>{item.name}</div>

            {/* Basic Info */}
            <div className="text-[11px] opacity-80">
                <div>Lv Req: {item.level_required}</div>
                <div>Type: {item.slot}</div>
                <div>Category: Accessories</div>
                <div>
                    Rarity:{" "}
                    <span className={RARITY_COLORS[item.rarity] ?? ""}>
                        {item.rarity}
                    </span>
                </div>
            </div>

            {/* Base Stats */}
            <div className="p-2 border rounded bg-black/20">
                <div className={`${cfg.accentText} font-bold text-xs mb-1`}>
                    Base Stats
                </div>

                {item.base_stats.map((bs: BaseStat, idx: number) => {
                    const name = statMap[bs.type_id] ?? `Stat ${bs.type_id}`;

                    let value: string | number = "-";
                    if (bs.value !== undefined) value = bs.value;
                    else if (bs.value_min !== undefined && bs.value_max !== undefined)
                        value = `${bs.value_min}–${bs.value_max}`;
                    else if (bs.value_min !== undefined) value = bs.value_min;
                    else if (bs.value_max !== undefined) value = bs.value_max;

                    return (
                        <div key={idx} className="text-[11px]">
                            {name}: {value}
                        </div>
                    );
                })}
            </div>

            {/* Hidden Potential */}
            {item.potential_stats && item.potential_stats.length > 0 && (
                <div className="p-2 border rounded bg-black/20">
                    <div className={`${cfg.accentText} font-bold text-xs mb-1`}>
                        Hidden Potential
                    </div>

                    {item.potential_stats.map((ps: PotentialStat, idx: number) => (
                        <div key={idx} className="text-[11px]">
                            {statMap[ps.type_id]}: {ps.value}
                        </div>
                    ))}
                </div>
            )}

            {/* Set Effects */}
            {(item.set_stats || item.set_effects) && (
                <div className="p-2 border rounded bg-black/20">
                    <div className={`${cfg.accentText} font-bold text-xs mb-2`}>
                        Set Effects
                    </div>

                    {(item.set_stats ?? item.set_effects)?.map(
                        (set: SetEffectEntry, idx: number) => (
                            <div key={idx} className="mb-2">
                                <div className="text-[11px] font-bold opacity-80">
                                    {set.count}-Piece Bonus
                                </div>

                                {set.stats.map(
                                    (s: { type_id: number; value: number }, i: number) => (
                                        <div key={i} className="text-[11px] ml-2">
                                            {statMap[s.type_id]}: {s.value}
                                        </div>
                                    )
                                )}
                            </div>
                        )
                    )}
                </div>
            )}

        </div>
    );
};

export default TabItemsEditorCreateItemDetails;
