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

import jobsJson from "../data/m.jobs.json";

const ALL_EQUIPMENTS: EquipmentItem[] = [
    ...eqCerberus.items,
    ...eqApocalypse.items,
    ...eqManticore.items,
    ...eqImmortal.items,
    ...eqSeaDragon.items,
    ...eqRedSeaDragon.items,
    ...eqAncientTotem.items,
];

/* ------------------------------------------------------------
   NEW: FUNCTION - RETURN ALL INHERITED JOB IDs
------------------------------------------------------------ */
function getAllInheritedJobIds(rootJobId: number): number[] {
    const result = new Set<number>();
    result.add(rootJobId);

    let changed = true;
    while (changed) {
        changed = false;

        for (const job of jobsJson.jobs) {
            // ถ้า job.inherit = root, หรือ job.inherit = อะไรที่อยู่ใน result
            if (result.has(job.inherit) && !result.has(job.id)) {
                result.add(job.id);
                changed = true;
            }
        }
    }
    return Array.from(result);
}

/* ------------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------------ */
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
    const [baseItems, setBaseItems] = useState<EquipmentItem[]>([]);

    const handleOpenPopup = () => {
        const mem = AppMemory.load();
        const memJob = mem.character.baseId;

        setJob(memJob ? String(memJob) : "");
        setCategoryId(null);
        setTypeId(null);
        setRarityId(null);

        setPopupOpen(true);
    };

    /* ------------------------------------------------------------
       NEW FILTER WITH INHERITED JOB SUPPORT
    ------------------------------------------------------------ */
    function findMatchingEquipments(jobId: number, typeId: number, rarity: number) {
        const allowedJobs = getAllInheritedJobIds(jobId);

        return ALL_EQUIPMENTS.filter(
            (it: EquipmentItem) =>
                allowedJobs.includes(it.job_id) &&
                it.type_id === typeId &&
                it.rarity_id === rarity
        );
    }

    const handleConfirm = () => {
        if (!job || !categoryId || !typeId || !rarityId) return;

        const jobNum = Number(job);

        // ใช้ฟังก์ชันใหม่
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

    return (
        <div className={`${cfg.bodyText} h-full min-h-0`}>
            {viewMode === "create" && (
                <button
                    className={`px-3 py-1 rounded ${cfg.buttonPrimary}`}
                    onClick={handleOpenPopup}
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
                    <div className="grid grid-cols-2 gap-0">
                        <button
                            className={`px-3 py-1 rounded ${cfg.buttonPrimary}`}
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
