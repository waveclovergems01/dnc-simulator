import { useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";

import TabItemsEditorCreateItemPopup from "./TabItemsEditorCreateItemPopup";
import TabItemsEditorCreateItemDetails from "./TabItemsEditorCreateItemDetails";

import { AppMemory } from "../state/AppMemory";
import type { CreatedItem } from "./TabItemsEditorCreateItemTypes";

import equipmentsJson from "../data/m.equipments.json";
import jobsJson from "../data/m.jobs.json";

/* ------------------------------------------------------------
   TYPES
------------------------------------------------------------ */

interface EquipmentStat {
    stat_id: number;
    value_min: number;
    value_max: number;
    is_percentage: number; // 0 | 1
}

export interface EquipmentItem {
    item_id: number;
    name: string;
    type_id: number;
    job_id: number;
    required_level: number;
    rarity_id: number;
    durability: number;
    set_id: number;
    base_stats: EquipmentStat[];
}

interface EquipmentsJson {
    items: EquipmentItem[];
}

interface JobJsonItem {
    id: number;
    inherit: number;
}

interface JobsJson {
    jobs: JobJsonItem[];
}

/* ------------------------------------------------------------
   DATA
------------------------------------------------------------ */

const ALL_EQUIPMENTS: EquipmentItem[] =
    (equipmentsJson as EquipmentsJson).items ?? [];

const JOBS: JobJsonItem[] = (jobsJson as JobsJson).jobs ?? [];

/* ------------------------------------------------------------
   HELPERS
------------------------------------------------------------ */

/**
 * Return all inherited job ids (base -> class1 -> class2)
 */
function getAllInheritedJobIds(rootJobId: number): number[] {
    const result = new Set<number>();
    result.add(rootJobId);

    let changed = true;
    while (changed) {
        changed = false;

        for (const job of JOBS) {
            if (result.has(job.inherit) && !result.has(job.id)) {
                result.add(job.id);
                changed = true;
            }
        }
    }

    return Array.from(result);
}

/* ------------------------------------------------------------
   COMPONENT
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

    /* ------------------------------------------------------------
       HANDLERS
    ------------------------------------------------------------ */

    const handleOpenPopup = () => {
        const mem = AppMemory.load();
        const memJob = mem.character.baseId;

        setJob(memJob ? String(memJob) : "");
        setCategoryId(null);
        setTypeId(null);
        setRarityId(null);

        setPopupOpen(true);
    };

    function findMatchingEquipments(
        jobId: number,
        typeId: number,
        rarity: number
    ): EquipmentItem[] {
        const allowedJobs = getAllInheritedJobIds(jobId);

        return ALL_EQUIPMENTS.filter(
            (it) =>
                allowedJobs.includes(it.job_id) &&
                it.type_id === typeId &&
                it.rarity_id === rarity
        );
    }

    const handleConfirm = () => {
        if (!job || !categoryId || !typeId || !rarityId) return;

        const jobNum = Number(job);

        const matches = findMatchingEquipments(
            jobNum,
            typeId,
            rarityId
        );
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

    /* ------------------------------------------------------------
       RENDER
    ------------------------------------------------------------ */

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
                        baseItems={baseItems}
                    />
                </div>
            )}
        </div>
    );
}
