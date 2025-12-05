// src/components/TabItemsPresetTooltip.tsx

import React from "react";
import type { GameItem } from "./TabItemsPresetTypes";
import { ITEM_TYPE_LABEL, CATEGORY_LABEL } from "./TabItemsPresetTypes";

const ItemTooltip: React.FC<{ item: GameItem }> = ({ item }) => {
    return (
        <div
            className="
        w-72 rounded-md border border-yellow-500/70
        bg-linear-to-b from-black/95 via-black/90 to-black/80
        shadow-2xl px-3 py-2
        text-[11px] text-gray-100
      "
        >
            {/* Header */}
            <div className="text-center text-[12px] font-bold text-indigo-300 mb-1">
                {item.name}
            </div>
            <div className="text-center text-[10px] text-yellow-300 mb-1">
                Binds when Obtained
            </div>
            <div className="h-px w-full bg-yellow-500/40 mb-1" />

            {/* Basic info */}
            <div className="space-y-0.5 mb-2">
                {item.levelRequired !== undefined && (
                    <div>
                        <span className="text-yellow-300">Level Req:</span>{" "}
                        {item.levelRequired} or more
                    </div>
                )}
                <div>
                    <span className="text-yellow-300">Type:</span>{" "}
                    {ITEM_TYPE_LABEL[item.itemType]}
                </div>
                <div>
                    <span className="text-yellow-300">Category:</span>{" "}
                    {CATEGORY_LABEL[item.category]}
                </div>
                {item.rarity && (
                    <div>
                        <span className="text-yellow-300">Rarity:</span> {item.rarity}
                    </div>
                )}
            </div>

            {/* Stats blocks */}
            {item.statsBlocks.map((block) => (
                <div key={block.label} className="mt-2">
                    <div className="text-[11px] text-yellow-300 mb-1">
                        {block.label}
                    </div>
                    <div className="space-y-0.5">
                        {block.stats.map((s) => {
                            const valText =
                                s.valueMin === s.valueMax
                                    ? s.valueMin.toString()
                                    : `${s.valueMin}~${s.valueMax}`;
                            const suffix = s.isPercentage ? "%" : "";
                            return (
                                <div key={`${s.typeId}-${s.label}-${valText}`}>
                                    {s.label} : {valText}
                                    {suffix}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Set info */}
            {item.setName && item.setBonuses && item.setBonuses.length > 0 && (
                <div className="mt-2">
                    <div className="text-[11px] text-yellow-300 mb-1">
                        Set: {item.setName}
                    </div>
                    <div className="space-y-1">
                        {item.setBonuses.map((b) => (
                            <div key={b.count}>
                                <div className="text-[11px] text-yellow-300">
                                    {b.count}-piece Bonus
                                </div>
                                <div className="space-y-0.5">
                                    {b.stats.map((s) => {
                                        const valText =
                                            s.valueMin === s.valueMax
                                                ? s.valueMin.toString()
                                                : `${s.valueMin}~${s.valueMax}`;
                                        const suffix = s.isPercentage ? "%" : "";
                                        return (
                                            <div key={`${s.typeId}-${s.label}-${valText}`}>
                                                {s.label} : {valText}
                                                {suffix}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemTooltip;