import { useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";
import TabItemsEditorCreateItemPopup from "./TabItemsEditorCreateItemPopup";
import TabItemsEditorCreateItemDetails from "./TabItemsEditorCreateItemDetails";
import { AppMemory } from "../state/AppMemory";

interface CreatedItem {
    job: string;
    category_id: number;
    type_id: number;
    rarity_id: number;
    created_at: number;
}

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

    const handleOpenPopup = () => {
        const mem = AppMemory.load();
        const memJob = mem.character.baseId;

        setJob(memJob ? String(memJob) : "");
        setCategoryId(null);
        setTypeId(null);
        setRarityId(null);

        setPopupOpen(true);
    };

    const handleConfirm = () => {
        if (!job || !categoryId || !typeId || !rarityId) return;

        const newItem: CreatedItem = {
            job,
            category_id: categoryId,
            type_id: typeId,
            rarity_id: rarityId,
            created_at: Date.now()
        };

        setCreatedItem(newItem);
        setPopupOpen(false);
        setViewMode("details");
    };

    const handleCancelDetails = () => {
        setCreatedItem(null);
        setViewMode("create");
    };

    const handleAddToInventory = () => {
        alert("✔ Added to inventory!");
    };

    return (
        <div className={`p-4 ${cfg.bodyText} h-full min-h-0`}>

            {/* TAB 1 — CREATE MODE */}
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

            {/* TAB 2 — DETAILS MODE */}
            {viewMode === "details" && createdItem && (
                <div className="h-full min-h-0 grid grid-rows-[auto_1fr] gap-4">

                    {/* ROW1: BUTTONS */}
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

                    {/* ROW2: DETAIL BOX FULL HEIGHT */}
                    <TabItemsEditorCreateItemDetails
                        theme={theme as ThemeKey}
                        item={createdItem}
                    />

                </div>
            )}

        </div>
    );
}
