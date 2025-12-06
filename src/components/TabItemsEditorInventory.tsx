// src/components/TabItemsEditorInventory.tsx
import React, { useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";

interface TabItemsEditorInventoryProps {
    theme: ThemeKey;
}

const TabItemsEditorInventory: React.FC<TabItemsEditorInventoryProps> = ({
    theme,
}) => {
    const cfg = themeConfigs[theme];

    // empty list – waiting for user added items
    const [items] = useState<string[]>([]);

    // filters – not doing anything yet
    const [category, setCategory] = useState("all");
    const [search, setSearch] = useState("");

    return (
        <div className="h-full w-full flex flex-col text-[11px]">
            {/* ---------- FILTERS ---------- */}
            <div
                className={`pb-2 mb-2 border-b ${cfg.sectionBorder} flex flex-col gap-2`}
            >
                <h4 className={`${cfg.accentText} text-xs font-bold uppercase`}>
                    Inventory
                </h4>

                <div className="grid grid-cols-2 gap-2">
                    {/* Category Filter (no logic yet) */}
                    <div className="flex flex-col gap-1">
                        <label className={`${cfg.mutedText} text-[10px]`}>
                            Category
                        </label>
                        <select
                            className={`rounded px-2 py-1 border ${cfg.dropdownSelect}`}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="equipment">Equipment</option>
                            <option value="costume">Costume</option>
                            <option value="heraldry">Heraldry</option>
                            <option value="card">Card</option>
                            <option value="rune">Rune</option>
                            <option value="mount">Mount</option>
                            <option value="minion">Minion</option>
                        </select>
                    </div>

                    {/* Search Box */}
                    <div className="flex flex-col gap-1">
                        <label className={`${cfg.mutedText} text-[10px]`}>
                            Search
                        </label>
                        <input
                            className="rounded px-2 py-1 border bg-black/20"
                            placeholder="Search…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* ---------- EMPTY LIST ---------- */}
            <div
                className={`border rounded-md ${cfg.sectionBorder} bg-black/20 flex-1 min-h-0 flex flex-col`}
            >
                <div className="flex-1 overflow-y-auto">
                    {items.length === 0 ? (
                        <div className="px-2 py-2 opacity-70">
                            Inventory is empty
                        </div>
                    ) : (
                        items.map((name, idx) => (
                            <div
                                key={idx}
                                className={`px-2 py-1 border-b ${cfg.sectionBorder} text-[11px]`}
                            >
                                {name}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TabItemsEditorInventory;
