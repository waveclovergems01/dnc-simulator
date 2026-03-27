// src/components/TabItemsEditorInventory.tsx
import React, { useEffect, useMemo, useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";
import { AppMemory } from "../state/AppMemory";
import type { InventoryItem } from "../state/AppMemory";

import rarityData from "../data/m.rarities.json";
import equipmentsJson from "../data/m.equipments.json";

import TabItemsEditorInventoryTooltip from "./TabItemsEditorInventoryTooltip";

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

const EQUIPMENT_MAP = new Map<number, typeof equipmentsJson.items[number]>();
equipmentsJson.items.forEach((e) =>
    EQUIPMENT_MAP.set(e.item_id, e)
);

/* ------------------------------------------------------------
   HELPERS
------------------------------------------------------------ */

function calcTooltipPosition(
    x: number,
    y: number,
    w = 260,
    h = 440
) {
    const pad = 12;
    let left = x + 16;
    let top = y + 16;

    if (left + w > window.innerWidth) left = x - w - 16;
    if (top + h > window.innerHeight) top = y - h - 16;

    return {
        left: Math.max(pad, left),
        top: Math.max(pad, top),
    };
}

/* ------------------------------------------------------------
   MAIN
------------------------------------------------------------ */

const TabItemsEditorInventory: React.FC<{ theme: ThemeKey }> = ({
    theme,
}) => {
    const cfg = themeConfigs[theme];

    const [items, setItems] = useState<InventoryItem[]>([]);
    const [hoverId, setHoverId] = useState<string | null>(null);
    const [mouse, setMouse] = useState<{ x: number; y: number } | null>(
        null
    );

    useEffect(() => {
        const sync = () =>
            setItems(AppMemory.load().inventoryItems);
        sync();
        return AppMemory.subscribe(sync);
    }, []);

    const hoveredItem = useMemo(() => {
        if (!hoverId) return null;
        const inv = items.find((i) => i.id === hoverId);
        return inv ? EQUIPMENT_MAP.get(inv.item_id) ?? null : null;
    }, [hoverId, items]);

    const pos =
        mouse && hoveredItem
            ? calcTooltipPosition(mouse.x, mouse.y)
            : null;

    return (
        <div className="h-full w-full flex flex-col text-[11px] relative">
            <div
                className={`pb-2 mb-2 border-b ${cfg.sectionBorder}`}
            >
                <h4 className={`${cfg.accentText} text-xs font-bold uppercase`}>
                    Inventory
                </h4>
            </div>

            <div
                className={`flex-1 min-h-0 border rounded-md ${cfg.sectionBorder} bg-black/20 overflow-y-auto`}
            >
                {items.length === 0 ? (
                    <div className="px-3 py-2 opacity-70">
                        Inventory is empty
                    </div>
                ) : (
                    items.map((i) => {
                        const rarity =
                            RARITY_MAP.get(i.rarity_id);
                        return (
                            <div
                                key={i.id}
                                className={`
                                    px-3 py-2
                                    border-b ${cfg.sectionBorder}
                                    hover:bg-black/30
                                    cursor-pointer
                                    flex items-center gap-2
                                `}
                                onDoubleClick={() => {
                                    AppMemory.setInventoryEditTarget({
                                        inventoryId: i.id,
                                        item_id: i.item_id,
                                    });
                                }}
                                onMouseEnter={(e) => {
                                    setHoverId(i.id);
                                    setMouse({
                                        x: e.clientX,
                                        y: e.clientY,
                                    });
                                }}
                                onMouseMove={(e) =>
                                    setMouse({
                                        x: e.clientX,
                                        y: e.clientY,
                                    })
                                }
                                onMouseLeave={() => {
                                    setHoverId(null);
                                    setMouse(null);
                                }}
                            >
                                <div
                                    className="font-bold flex-1"
                                    style={{ color: rarity?.color }}
                                >
                                    {i.name}
                                </div>

                                <button
                                    className="opacity-60 hover:opacity-100 text-red-400"
                                    title="Delete item"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const ok =
                                            window.confirm(
                                                `Delete "${i.name}" from inventory?`
                                            );
                                        if (ok) {
                                            AppMemory.removeInventoryItem(
                                                i.id
                                            );
                                        }
                                    }}
                                >
                                    🗑
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {hoveredItem && pos && (
                <div
                    style={{
                        position: "fixed",
                        left: pos.left,
                        top: pos.top,
                        pointerEvents: "none",
                        zIndex: 999,
                    }}
                >
                    <TabItemsEditorInventoryTooltip
                        item={hoveredItem}
                    />
                </div>
            )}
        </div>
    );
};

export default TabItemsEditorInventory;
