// src/components/TabItemsEditorCreateItem.tsx
import React, { useMemo, useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";

import accessoriesJson from "../data/accessories.json";
import statsJson from "../data/stats.json";

import TabItemsEditorCreateItemPopup from "./TabItemsEditorCreateItemPopup";
import TabItemsEditorCreateItemSelectBase from "./TabItemsEditorCreateItemSelectBase";
import TabItemsEditorCreateItemDetails from "./TabItemsEditorCreateItemDetails";

import type { AccessoryItem, StatMap } from "./TabItemsEditorCreateItemTypes";

interface Props {
    theme: ThemeKey;
}

const TabItemsEditorCreateItem: React.FC<Props> = ({ theme }) => {
    const cfg = themeConfigs[theme];

    // main UI states
    const [popup, setPopup] = useState(false);
    const [editorMode, setEditorMode] = useState(false);

    const [job, setJob] = useState("");
    const [rarity, setRarity] = useState("");

    const [selectedId, setSelectedId] = useState<number | null>(null);

    // load item list
    const items = useMemo<AccessoryItem[]>(() => {
        return (accessoriesJson as { accessories: AccessoryItem[] }).accessories;
    }, []);

    // stat name lookup
    const statMap: StatMap = useMemo(() => {
        const map: StatMap = {};
        statsJson.stats.forEach((s) => (map[s.type_id] = s.display_name));
        return map;
    }, []);

    const selectedItem =
        selectedId !== null ? items.find((x) => x.item_id === selectedId) ?? null : null;

    /* ==========================================================
        Editor UI
    ========================================================== */
    if (editorMode) {
        return (
            <div className="w-full h-full grid grid-rows-[auto_1fr] gap-2 text-xs">
                {/* Buttons */}
                <div className="flex gap-2 border-b pb-2">
                    <button
                        className={`px-3 py-1 rounded ${cfg.buttonPrimary}`}
                        onClick={() => alert("Add to Build → Coming soon!")}
                    >
                        Add to Build
                    </button>

                    <button
                        className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white text-xs"
                        onClick={() => {
                            setEditorMode(false);
                            setSelectedId(null);
                        }}
                    >
                        Cancel
                    </button>
                </div>

                {/* Editor */}
                <div className="overflow-y-auto p-2 space-y-4">

                    <TabItemsEditorCreateItemSelectBase
                        theme={theme}
                        items={items}
                        selectedId={selectedId}
                        onChange={setSelectedId}
                    />

                    {selectedItem && (
                        <TabItemsEditorCreateItemDetails
                            theme={theme}
                            item={selectedItem}
                            statMap={statMap}
                        />
                    )}
                </div>
            </div>
        );
    }

    /* ==========================================================
        Default Panel (no editor)
    ========================================================== */
    return (
        <div className="w-full h-full grid grid-rows-[auto_1fr] gap-2 text-xs">
            <button
                onClick={() => setPopup(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition shadow ${cfg.buttonPrimary}`}
            >
                + Create Item
            </button>

            <div className="opacity-50 text-[11px] p-1">(Item editor empty)</div>

            {popup && (
                <TabItemsEditorCreateItemPopup
                    theme={theme}
                    job={job}
                    rarity={rarity}
                    onChangeJob={setJob}
                    onChangeRarity={setRarity}
                    onCancel={() => setPopup(false)}
                    onConfirm={() => {
                        setPopup(false);
                        setEditorMode(true);
                    }}
                />
            )}
        </div>
    );
};

export default TabItemsEditorCreateItem;
