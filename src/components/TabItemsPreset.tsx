// ------------------------------------------------------------
// TabItemsPreset.tsx
// FINAL — Job filter supports job_id = 9999 (ALL CLASS)
// Other filters still apply normally
// ------------------------------------------------------------

import React, { useMemo, useRef, useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";

import { ALL_ITEMS } from "./TabItemsPresetData";
import type { GameItem } from "./TabItemsPresetTypes";

import ItemTooltip from "./TabItemsPresetTooltip";
import { formatJobName, JOB_MAP } from "./TabItemsPresetTypes";

import categoriesJson from "../data/m.categories.json";
import itemTypesJson from "../data/m.item_types.json";

// ------------------------------------------------------------
// CATEGORY OPTIONS
// ------------------------------------------------------------

interface CategoryEntry {
    category_id: number;
    category_name: string;
}

const CATEGORY_LIST = categoriesJson.categories as CategoryEntry[];

const CATEGORY_OPTIONS = CATEGORY_LIST.map((c) => ({
    id: c.category_id,
    key: c.category_name.toLowerCase(),
    name: c.category_name,
}));

const prettyCategoryName = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1);

// ------------------------------------------------------------
// ITEM TYPE OPTIONS
// ------------------------------------------------------------

interface ItemTypeEntry {
    type_id: number;
    type_name: string;
    category_id: number;
}

const ITEM_TYPE_LIST = itemTypesJson.item_types as ItemTypeEntry[];

const toSystemTypeName = (name: string) =>
    name.toLowerCase().replace(/ /g, "_");

const prettyItemType = (s: string) =>
    s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// ------------------------------------------------------------
// SORT ORDER USING REAL type_id
// ------------------------------------------------------------

const ITEM_TYPE_SORT_ORDER = new Map<string, number>();

for (const t of ITEM_TYPE_LIST) {
    ITEM_TYPE_SORT_ORDER.set(
        toSystemTypeName(t.type_name),
        t.type_id
    );
}

// ------------------------------------------------------------
// JOB FILTER (BASE CLASSES ONLY)
// ------------------------------------------------------------

const JOB_IDS = Array.from(JOB_MAP.values())
    .filter((j) => j.class_id === 0)
    .map((j) => j.id);

// ------------------------------------------------------------
// GET ALL DESCENDANT JOBS
// ------------------------------------------------------------

const getAllDescendantJobs = (jobId: number): number[] => {
    const result = [jobId];

    const children = Array.from(JOB_MAP.values()).filter(
        (j) => j.inherit === jobId
    );

    for (const child of children) {
        result.push(...getAllDescendantJobs(child.id));
    }

    return result;
};

// ------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------

const TabItemsPreset: React.FC<{ theme: ThemeKey }> = ({ theme }) => {
    const T = themeConfigs[theme];

    const [search, setSearch] = useState("");
    const [jobFilter, setJobFilter] = useState<number | "">("");
    const [levelFilter, setLevelFilter] = useState<number | "">("");

    const [categoryFilter, setCategoryFilter] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<string>("");

    const [hoverItem, setHoverItem] = useState<GameItem | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null);

    // ------------------------------------------------------------
    // ITEM TYPES BY CATEGORY
    // ------------------------------------------------------------

    const availableItemTypes = useMemo(() => {
        if (!categoryFilter) return [];

        const category = CATEGORY_OPTIONS.find(
            (c) => c.key === categoryFilter
        );
        if (!category) return [];

        return ITEM_TYPE_LIST.filter(
            (t) => t.category_id === category.id
        ).map((t) => ({
            raw: t.type_name,
            sys: toSystemTypeName(t.type_name),
        }));
    }, [categoryFilter]);

    const handleCategoryChange = (value: string) => {
        setCategoryFilter(value);
        setTypeFilter("");
    };

    // ------------------------------------------------------------
    // FILTERING (FIXED ALL CLASS LOGIC)
    // ------------------------------------------------------------

    const filtered = useMemo(() => {
        const list = ALL_ITEMS.filter((item) => {

            // SEARCH
            if (
                search &&
                !item.name.toLowerCase().includes(search.toLowerCase())
            ) {
                return false;
            }

            // JOB FILTER
            if (jobFilter !== "") {
                // item.jobId === 9999 → usable by ALL jobs
                if (item.jobId !== 9999) {
                    const allowedJobs = getAllDescendantJobs(jobFilter);
                    if (!allowedJobs.includes(item.jobId ?? -1)) {
                        return false;
                    }
                }
            }

            // LEVEL FILTER
            if (levelFilter !== "" && item.levelRequired !== levelFilter) {
                return false;
            }

            // CATEGORY FILTER
            if (categoryFilter && item.category !== categoryFilter) {
                return false;
            }

            // ITEM TYPE FILTER
            if (typeFilter && item.itemType !== typeFilter) {
                return false;
            }

            return true;
        });

        // SORTING
        return list.sort((a, b) => {
            if (a.levelRequired !== b.levelRequired)
                return a.levelRequired - b.levelRequired;

            const jobA = a.jobId ?? 9999;
            const jobB = b.jobId ?? 9999;
            if (jobA !== jobB) return jobA - jobB;

            const setA = a.setName ?? "";
            const setB = b.setName ?? "";
            if (setA !== setB) return setA.localeCompare(setB);

            const typeA = ITEM_TYPE_SORT_ORDER.get(a.itemType) ?? 999999;
            const typeB = ITEM_TYPE_SORT_ORDER.get(b.itemType) ?? 999999;
            if (typeA !== typeB) return typeA - typeB;

            return (a.rarity ?? "").localeCompare(b.rarity ?? "");
        });
    }, [
        search,
        jobFilter,
        levelFilter,
        categoryFilter,
        typeFilter,
    ]);

    // ------------------------------------------------------------
    // TOOLTIP HANDLING
    // ------------------------------------------------------------

    const handleMouseEnter = (
        e: React.MouseEvent<HTMLDivElement>,
        item: GameItem
    ) => {
        const mouseX = e.clientX + 18;
        const mouseY = e.clientY + 18;

        setHoverItem(item);

        setTimeout(() => {
            const el = tooltipRef.current;
            if (!el) return;

            const rect = el.getBoundingClientRect();
            let x = mouseX;
            let y = mouseY;

            if (x + rect.width > window.innerWidth - 10)
                x = window.innerWidth - rect.width - 10;
            if (y + rect.height > window.innerHeight - 10)
                y = window.innerHeight - rect.height - 10;

            setTooltipPos({ x, y });
        }, 0);
    };

    // ------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------

    return (
        <div className="relative h-full flex flex-col">

            {/* FILTER BAR */}
            <div className={`sticky top-0 z-20 p-2 space-y-2 bg-black ${T.sectionBorder} border-b`}>

                <input
                    className={`w-full px-2 py-1 text-sm rounded ${T.dropdownSelect}`}
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className={`w-full px-2 py-1 text-sm rounded ${T.dropdownSelect}`}
                    value={jobFilter}
                    onChange={(e) =>
                        setJobFilter(
                            e.target.value === "" ? "" : Number(e.target.value)
                        )
                    }
                >
                    <option value="">All Jobs</option>
                    {JOB_IDS.map((id) => (
                        <option key={id} value={id}>
                            {formatJobName(id)}
                        </option>
                    ))}
                </select>

                <select
                    className={`w-full px-2 py-1 text-sm rounded ${T.dropdownSelect}`}
                    value={levelFilter}
                    onChange={(e) =>
                        setLevelFilter(
                            e.target.value === "" ? "" : Number(e.target.value)
                        )
                    }
                >
                    <option value="">All Levels</option>
                    <option value={32}>Level 32</option>
                    <option value={40}>Level 40</option>
                    <option value={50}>Level 50</option>
                </select>

                <select
                    className={`w-full px-2 py-1 text-sm rounded ${T.dropdownSelect}`}
                    value={categoryFilter}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat.key} value={cat.key}>
                            {prettyCategoryName(cat.key)}
                        </option>
                    ))}
                </select>

                <select
                    className={`w-full px-2 py-1 text-sm rounded ${T.dropdownSelect}`}
                    value={typeFilter}
                    onChange={(e) =>
                        setTypeFilter(e.target.value)
                    }
                >
                    <option value="">All Item Types</option>
                    {availableItemTypes.map((t) => (
                        <option key={t.sys} value={t.sys}>
                            {prettyItemType(t.sys)}
                        </option>
                    ))}
                </select>
            </div>

            {/* ITEM LIST */}
            <div className="flex-1 overflow-y-auto">
                {filtered.map((item) => (
                    <div
                        key={item.key}
                        className="flex items-center border-b border-gray-800 cursor-pointer hover:bg-gray-900"
                        onMouseEnter={(e) => handleMouseEnter(e, item)}
                        onMouseLeave={() => setHoverItem(null)}
                    >
                        <div
                            className="w-1 h-10 rounded-r"
                            style={{ backgroundColor: item.rarityColor }}
                        />
                        <div
                            className="px-2 text-sm font-semibold truncate"
                            style={{ color: item.rarityColor }}
                        >
                            {item.name}
                        </div>
                    </div>
                ))}
            </div>

            {/* TOOLTIP */}
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
