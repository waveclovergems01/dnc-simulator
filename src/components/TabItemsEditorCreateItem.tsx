import { useEffect, useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";

import TabItemsEditorCreateItemPopup from "./TabItemsEditorCreateItemPopup";
import TabItemsEditorCreateItemDetails from "./TabItemsEditorCreateItemDetails";

import { AppMemory } from "../state/AppMemory";
import type {
    CreatedItem,
    EquipmentItem,
} from "./TabItemsEditorCreateItemTypes";

import equipmentsJson from "../data/m.equipments.json";
import itemTypesJson from "../data/m.item_types.json";

/* ---------------- DATA ---------------- */

const ALL_EQUIPMENTS: EquipmentItem[] = equipmentsJson.items;
const ITEM_TYPES = itemTypesJson.item_types;

/* ---------------- HELPERS ---------------- */

function getCategoryIdFromType(typeId: number): number | null {
    const found = ITEM_TYPES.find((t) => t.type_id === typeId);
    return found ? found.category_id : null;
}

/* ---------------- COMPONENT ---------------- */

interface Props {
    theme: string;
}

export default function TabItemsEditorCreateItem({ theme }: Props) {
    const cfg = themeConfigs[theme as ThemeKey];

    const [viewMode, setViewMode] =
        useState<"create" | "details">("create");
    const [popupOpen, setPopupOpen] = useState(false);

    const [job, setJob] = useState("");
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [typeId, setTypeId] = useState<number | null>(null);
    const [rarityId, setRarityId] = useState<number | null>(null);

    const [createdItem, setCreatedItem] =
        useState<CreatedItem | null>(null);
    const [baseItems, setBaseItems] = useState<EquipmentItem[]>([]);

    /* ---------------- INVENTORY → EDIT ---------------- */

    useEffect(() => {
        const unsubscribe = AppMemory.subscribe(() => {
            const mem = AppMemory.load();
            const edit = mem.inventoryEditTarget;
            if (!edit) return;

            const base = ALL_EQUIPMENTS.find(
                (e) => e.item_id === edit.item_id
            );
            if (!base) return;

            const catId = getCategoryIdFromType(base.type_id);

            setJob(String(base.job_id));
            setCategoryId(catId);
            setTypeId(base.type_id);
            setRarityId(base.rarity_id);

            setBaseItems([base]);
            setCreatedItem({
                job: String(base.job_id),
                category_id: catId ?? 0,
                type_id: base.type_id,
                rarity_id: base.rarity_id,
                created_at: Date.now(),
            });

            setViewMode("details");

            AppMemory.setInventoryEditTarget(null);
        });

        return unsubscribe;
    }, []);

    /* ---------------- CREATE FLOW ---------------- */

    const handleConfirm = () => {
        if (!job || !categoryId || !typeId || !rarityId) return;

        const matches = ALL_EQUIPMENTS.filter(
            (e) =>
                e.type_id === typeId &&
                e.rarity_id === rarityId &&
                (e.job_id === Number(job) || e.job_id === 9999)
        );

        setBaseItems(matches);
        setCreatedItem({
            job,
            category_id: categoryId,
            type_id: typeId,
            rarity_id: rarityId,
            created_at: Date.now(),
        });

        setPopupOpen(false);
        setViewMode("details");
    };

    return (
        <div className={`${cfg.bodyText} h-full min-h-0`}>
            {viewMode === "create" && (
                <button
                    className={`px-3 py-1 rounded ${cfg.buttonPrimary}`}
                    onClick={() => setPopupOpen(true)}
                >
                    Create Item
                </button>
            )}

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

            {viewMode === "details" && createdItem && (
                <div className="h-full min-h-0 grid grid-rows-[auto_1fr] gap-0">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <button
                            className={`px-3 py-1 rounded ${cfg.buttonPrimary}`}
                            onClick={() => {
                                const base = baseItems[0];
                                if (!base) return;

                                AppMemory.addInventoryItem({
                                    id: crypto.randomUUID(),
                                    item_id: base.item_id,
                                    name: base.name,
                                    category_id: createdItem.category_id,
                                    type_id: createdItem.type_id,
                                    rarity_id: createdItem.rarity_id,
                                    job_id: Number(createdItem.job),
                                    created_at: Date.now(),
                                });

                                setViewMode("create");
                                setCreatedItem(null);
                                setBaseItems([]);
                            }}
                        >
                            Add to Inventory
                        </button>

                        <button
                            className={`px-3 py-1 rounded border ${cfg.sectionBorder}`}
                            onClick={() => {
                                setViewMode("create");
                                setCreatedItem(null);
                                setBaseItems([]);
                            }}
                        >
                            Cancel
                        </button>
                    </div>

                    <TabItemsEditorCreateItemDetails
                        theme={theme as ThemeKey}
                        baseItems={baseItems}
                    />
                </div>
            )}
        </div>
    );
}
