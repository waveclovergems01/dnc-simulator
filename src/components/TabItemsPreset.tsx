// ------------------------------------------------------------
// TabItemsPreset.tsx  (FINAL FULL VERSION)
// ------------------------------------------------------------

import React, { useMemo, useRef, useState } from "react";
import type { ThemeKey } from "../themes";
import { ALL_ITEMS } from "./TabItemsPresetData";
import type { GameItem, ItemType } from "./TabItemsPresetTypes";
import ItemTooltip from "./TabItemsPresetTooltip";

// -------------------------------
// FILTER OPTIONS
// -------------------------------

const CATEGORY_OPTIONS = ["equipment"] as const;

const ITEM_TYPE_OPTIONS: ItemType[] = [
    "helm",
    "upper_body",
    "lower_body",
    "gloves",
    "shoes",
    "main_weapon",
    "secondary_weapon",
];

// unique job list
const JOB_IDS = Array.from(
    new Set(ALL_ITEMS.map((x) => x.jobId).filter((v): v is number => v != null))
);

// ------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------

const TabItemsPreset: React.FC<{ theme: ThemeKey }> = () => {
    // filters
    const [search, setSearch] = useState("");
    const [jobFilter, setJobFilter] = useState<number | "">("");
    const [categoryFilter, setCategoryFilter] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<ItemType | "">("");

    // hover tooltip
    const [hoverItem, setHoverItem] = useState<GameItem | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });

    const tooltipRef = useRef<HTMLDivElement>(null);

    // ------------------------------------------------------------
    // FILTERING ITEMS
    // ------------------------------------------------------------

    const filtered = useMemo(() => {
        const list = ALL_ITEMS.filter((item) => {
            if (search && !item.name.toLowerCase().includes(search.toLowerCase()))
                return false;

            if (jobFilter !== "" && item.jobId !== jobFilter) return false;
            if (categoryFilter && item.category !== categoryFilter) return false;
            if (typeFilter !== "" && item.itemType !== typeFilter) return false;

            return true;
        });

        // -------------------------------
        // GLOBAL SORT ORDER
        // Level → Job → Category → Type → Rarity
        // -------------------------------
        return list.sort((a, b) => {
            // 1) Level ASC
            if (a.levelRequired !== b.levelRequired)
                return a.levelRequired - b.levelRequired;

            // 2) Job ASC  (null → last)
            const jobA = a.jobId ?? 9999;
            const jobB = b.jobId ?? 9999;
            if (jobA !== jobB) return jobA - jobB;

            // 3) Set Item ASC (ใช้ชื่อชุด ถ้าไม่มี ใช้ "")
            const setA = a.setName ?? "";
            const setB = b.setName ?? "";
            if (setA !== setB) return setA.localeCompare(setB);

            // 4) Category ASC
            if (a.category !== b.category)
                return String(a.category).localeCompare(String(b.category));

            // 5) Item Type ASC
            if (a.itemType !== b.itemType)
                return String(a.itemType).localeCompare(String(b.itemType));

            // 6) Rarity ASC
            const rarityA = a.rarity ?? "";
            const rarityB = b.rarity ?? "";
            return rarityA.localeCompare(rarityB);
        });
    }, [search, jobFilter, categoryFilter, typeFilter]);


    // ------------------------------------------------------------
    // HANDLE TOOLTIP POSITION — DYNAMIC BOUNDING CLAMP
    // ------------------------------------------------------------

    const handleMouseEnter = (
        e: React.MouseEvent<HTMLDivElement>,
        item: GameItem
    ) => {
        const mouseX = e.clientX + 18;
        const mouseY = e.clientY + 18;

        setHoverItem(item);

        // Wait tooltip to render → measure → clamp
        setTimeout(() => {
            const el = tooltipRef.current;
            if (!el) return;

            const rect = el.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            let x = mouseX;
            let y = mouseY;

            // clamp right
            if (x + rect.width > vw - 10) {
                x = vw - rect.width - 10;
            }

            // clamp bottom
            if (y + rect.height > vh - 10) {
                y = vh - rect.height - 10;
            }

            // clamp left
            if (x < 10) x = 10;

            // clamp top
            if (y < 10) y = 10;

            setTooltipPos({ x, y });
        }, 0);
    };

    // ------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------

    return (
        <div className="relative h-full flex flex-col">

            {/* ---------------- Sticky Filters ---------------- */}
            <div className="sticky top-0 z-20 bg-black border-b border-gray-700 p-2 space-y-2">

                {/* Search */}
                <input
                    className="w-full px-2 py-1 text-sm bg-gray-900 border border-gray-600 rounded"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {/* Job Filter */}
                <select
                    className="w-full px-2 py-1 text-sm bg-gray-900 border border-gray-600 rounded"
                    value={jobFilter}
                    onChange={(e) =>
                        setJobFilter(e.target.value === "" ? "" : Number(e.target.value))
                    }
                >
                    <option value="">All Jobs</option>
                    {JOB_IDS.map((id) => (
                        <option key={id} value={id}>
                            Job {id}
                        </option>
                    ))}
                </select>

                {/* Category Filter */}
                <select
                    className="w-full px-2 py-1 text-sm bg-gray-900 border border-gray-600 rounded"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>

                {/* Item Type Filter */}
                <select
                    className="w-full px-2 py-1 text-sm bg-gray-900 border border-gray-600 rounded"
                    value={typeFilter}
                    onChange={(e) =>
                        setTypeFilter(
                            e.target.value === "" ? "" : (e.target.value as ItemType)
                        )
                    }
                >
                    <option value="">All Item Types</option>
                    {ITEM_TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>
            </div>

            {/* ---------------- Items List (1-column, zero-gap) ---------------- */}
            <div className="flex-1 overflow-y-auto">
                {filtered.map((item) => (
                    <div
                        key={item.key}
                        className="flex items-center border-b border-gray-800 cursor-pointer hover:bg-gray-900"
                        onMouseEnter={(e) => handleMouseEnter(e, item)}
                        onMouseLeave={() => setHoverItem(null)}
                    >
                        {/* rarity bar */}
                        <div
                            className="w-1 h-10 rounded-r"
                            style={{ backgroundColor: item.rarityColor }}
                        />

                        {/* item name */}
                        <div
                            className="px-2 text-sm font-semibold truncate"
                            style={{ color: item.rarityColor }}
                        >
                            {item.name}
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        No items found.
                    </div>
                )}
            </div>

            {/* ---------------- Tooltip ---------------- */}
            {hoverItem && (
                <div
                    ref={tooltipRef}
                    style={{
                        position: "fixed",
                        top: tooltipPos.y,
                        left: tooltipPos.x,
                        zIndex: 9999,
                        pointerEvents: "none",
                    }}
                >
                    <ItemTooltip item={hoverItem} />
                </div>
            )}
        </div>
    );
};

export default TabItemsPreset;
