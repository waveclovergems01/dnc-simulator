import { useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";

import TabItemsEditorCreateItemPopup from "./TabItemsEditorCreateItemPopup";
import TabItemsEditorCreateItemDetails from "./TabItemsEditorCreateItemDetails";

import { AppMemory } from "../state/AppMemory";
import type { CreatedItem, EquipmentItem } from "./TabItemsEditorCreateItemTypes";

// -------- IMPORT EQUIPMENT JSON --------
import eqCerberus from "../data/m.equipment_cerberus.json";
import eqApocalypse from "../data/m.equipment_apocalypse.json";
import eqManticore from "../data/m.equipment_manticore.json";
import eqImmortal from "../data/m.equipment_immortal.json";
import eqSeaDragon from "../data/m.equipment_sea_dragon.json";
import eqRedSeaDragon from "../data/m.equipment_red_sea_dragon.json";
import eqAncientTotem from "../data/m.equipment_ancient_totem.json";

// merge all equipment
const ALL_EQUIPMENTS: EquipmentItem[] = [
    ...eqCerberus.items,
    ...eqApocalypse.items,
    ...eqManticore.items,
    ...eqImmortal.items,
    ...eqSeaDragon.items,
    ...eqRedSeaDragon.items,
    ...eqAncientTotem.items,
];

interface Props {
    theme: string;
}

export default function TabItemsEditorCreateItem({ theme }: Props) {
    const cfg = themeConfigs[theme as ThemeKey];

    const [viewMode, setViewMode] = useState<"create" | "details">("create");
    const [popupOpen, setPopupOpen] = useState(false);

    const [job, setJob] = useState("");
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [typeId, setTypeId] = useState<number | null>(null);
    const [rarityId, setRarityId] = useState<number | null>(null);

    const [createdItem, setCreatedItem] = useState<CreatedItem | null>(null);

    // base item list loaded after confirm
    const [baseItems, setBaseItems] = useState<EquipmentItem[]>([]);

    // -----------------------
    // LOAD MEMORY + OPEN POPUP
    // -----------------------
    const handleOpenPopup = () => {
        const mem = AppMemory.load();
        const memJob = mem.character.baseId;

        setJob(memJob ? String(memJob) : "");
        setCategoryId(null);
        setTypeId(null);
        setRarityId(null);

        setPopupOpen(true);
    };

    // -----------------------
    // FILTER EQUIPMENTS
    // -----------------------
    const findMatchingEquipments = (
        jobId: number,
        typeId: number,
        rarity: number
    ): EquipmentItem[] => {
        return ALL_EQUIPMENTS.filter(
            (it) =>
                it.job_id === jobId &&
                it.type_id === typeId &&
                it.rarity_id === rarity
        );
    };

    // -----------------------
    // CONFIRM → GO DETAILS
    // -----------------------
    const handleConfirm = () => {
        if (!job || !categoryId || !typeId || !rarityId) return;

        const jobNum = Number(job);

        // filter items by job/type/rarity
        const matches = findMatchingEquipments(jobNum, typeId, rarityId);
        setBaseItems(matches);

        const newItem: CreatedItem = {
            job,
            category_id: categoryId,
            type_id: typeId,
            rarity_id: rarityId,
            created_at: Date.now(),
        };

        setCreatedItem(newItem);
        setPopupOpen(false);
        setViewMode("details");
    };

    const handleCancelDetails = () => {
        setCreatedItem(null);
        setBaseItems([]);
        setViewMode("create");
    };

    const handleAddToInventory = () => {
        alert("✔ Added to inventory!");
    };

    return (
        <div className={`p-4 ${cfg.bodyText} h-full min-h-0`}>

            {/* MODE = CREATE */}
            {viewMode === "create" && (
                <button
                    className={`px-3 py-1 rounded ${cfg.buttonPrimary}`}
                    onClick={handleOpenPopup}
                >
                    Create Item
                </button>
            )}

            {/* POPUP */}
            <TabItemsEditorCreateItemPopup
                isOpen={popupOpen}
                theme={theme}
                job={job}
                onChangeJob={setJob}
                categoryId={categoryId}
                typeId={typeId}
                rarityId={rarityId}
                onChangeCategory={setCategoryId}
                onChangeType={setTypeId}
                onChangeRarity={setRarityId}
                onCancel={() => setPopupOpen(false)}
                onConfirm={handleConfirm}
            />

            {/* MODE = DETAILS */}
            {viewMode === "details" && createdItem && (
                <div className="h-full min-h-0 grid grid-rows-[auto_1fr] gap-4">

                    {/* ROW1 BUTTONS */}
                    <div className="grid grid-cols-2 gap-1">
                        <button
                            className={`px-3 py-1 rounded ${cfg.buttonPrimary}`}
                            onClick={handleAddToInventory}
                        >
                            Add to Inventory
                        </button>

                        <button
                            className={`px-3 py-1 rounded border ${cfg.sectionBorder}`}
                            onClick={handleCancelDetails}
                        >
                            Cancel
                        </button>
                    </div>

                    {/* ROW2 DETAILS */}
                    <TabItemsEditorCreateItemDetails
                        theme={theme as ThemeKey}
                        item={createdItem}
                        baseItems={baseItems}
                    />
                </div>
            )}
        </div>
    );
}
