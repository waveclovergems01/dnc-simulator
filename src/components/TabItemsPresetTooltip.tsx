// ------------------------------------------------------------
// TabItemsPresetTooltip.tsx
// Dragon Nest–style tooltip
// ------------------------------------------------------------

import React from "react";
import type { GameItem } from "./TabItemsPresetTypes";
import { formatJobName } from "./TabItemsPresetTypes";

const Divider: React.FC = () => (
    <div className="h-px w-full bg-[#E0C15A]/40 my-1" />
);

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="text-[#FFE066] text-[12px] font-bold mt-3 mb-1">
        {children}
    </div>
);

const ItemTooltip: React.FC<{ item: GameItem }> = ({ item }) => {
    const jobName = formatJobName(item.jobId);
    const [firstBlock, ...restBlocks] = item.statsBlocks;

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
            {/* -------- Name + Bind line -------- */}
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

            {/* -------- Basic info -------- */}
            <div className="space-y-0.5 mb-2 leading-tight">
                <div>
                    <span className="text-[#FFE066]">Level Req:</span>{" "}
                    {item.levelRequired} or more
                </div>

                {jobName && (
                    <div>
                        <span className="text-[#FFE066]">Class:</span>{" "}
                        <span className="text-[#ff8800]">{jobName}</span>
                    </div>
                )}

                <div>
                    <span className="text-[#FFE066]">Type:</span> {item.itemType}
                </div>

                {item.rarity && (
                    <div>
                        <span className="text-[#FFE066]">Item Level:</span> {item.rarity}
                    </div>
                )}

                {item.durability != null && (
                    <div>
                        <span className="text-[#FFE066]">Durability:</span>{" "}
                        {item.durability}/{item.durability}
                    </div>
                )}

                <div className="text-[11px] text-gray-400">(Cannot be traded)</div>
            </div>

            {/* -------- Main stats (first block) -------- */}
            {firstBlock && (
                <div className="mt-1 space-y-0.5">
                    {firstBlock.stats.map((s) => {
                        const v =
                            s.valueMin === s.valueMax
                                ? s.valueMin
                                : `${s.valueMin}-${s.valueMax}`;
                        return (
                            <div key={`${s.typeId}-${v}`} className="flex">
                                <span className="text-gray-300">{s.label}</span>
                                <span className="ml-auto text-gray-100">
                                    {v}
                                    {s.isPercentage ? "%" : ""}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* -------- remaining stat blocks as sections -------- */}
            {restBlocks.map((block) => (
                <div key={block.label} className="mt-2">
                    <SectionHeader>{block.label}</SectionHeader>
                    <div className="space-y-0.5">
                        {block.stats.map((s) => {
                            const v =
                                s.valueMin === s.valueMax
                                    ? s.valueMin
                                    : `${s.valueMin}-${s.valueMax}`;
                            return (
                                <div key={`${s.typeId}-${v}`} className="flex">
                                    <span className="text-gray-300">{s.label}</span>
                                    <span className="ml-auto text-gray-100">
                                        {v}
                                        {s.isPercentage ? "%" : ""}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* -------- Flavor text (enhance + hidden potential) -------- */}
            <div className="mt-3 text-[11px] space-y-1">
                <div>
                    You can enhance the stats using the{" "}
                    <span className="text-[#FFE066]">[Item Enhancement]</span> at the
                    town&apos;s blacksmith.
                </div>
                <div className="mt-1">
                    <span className="text-[#FFE066]">[Hidden Potential]</span>
                    <br />
                    You can add potential abilities with{" "}
                    <span className="text-[#FFE066]">[Codes]</span>.
                </div>
            </div>

            {/* -------- Set Items -------- */}
            {item.setName && item.setItemNames && item.setItemNames.length > 0 && (
                <>
                    <SectionHeader>Set Items</SectionHeader>
                    <div className="text-[11px] text-gray-300 space-y-0.5">
                        {item.setItemNames.map((name) => (
                            <div key={name}>{name}</div>
                        ))}
                    </div>
                </>
            )}

            {/* -------- Set Bonus -------- */}
            {item.setBonuses && item.setBonuses.length > 0 && (
                <>
                    <SectionHeader>Set Bonus</SectionHeader>
                    <div className="space-y-1">
                        {item.setBonuses.map((b) => (
                            <div key={b.count}>
                                {b.stats.map((s) => {
                                    const v =
                                        s.valueMin === s.valueMax
                                            ? s.valueMin
                                            : `${s.valueMin}-${s.valueMax}`;
                                    return (
                                        <div key={`${b.count}-${s.typeId}-${v}`} className="flex">
                                            <span className="text-[#FFE066] mr-1">
                                                {b.count}-
                                            </span>
                                            <span>{s.label} :</span>
                                            <span className="ml-auto">
                                                {v}
                                                {s.isPercentage ? "%" : ""}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ItemTooltip;
