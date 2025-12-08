import { useEffect, useMemo } from "react";
import { themeConfigs, type ThemeKey } from "../themes";

import categoriesData from "../data/m.categories.json";
import itemTypesData from "../data/m.item_types.json";
import raritiesData from "../data/m.rarities.json";
import rarityRulesData from "../data/m.rarity_rules.json";

import jobsData from "../data/jobs.json";
import { AppMemory } from "../state/AppMemory";

interface PopupProps {
    isOpen: boolean;
    theme: string;

    job: string;
    onChangeJob: (v: string) => void;

    categoryId: number | null;
    typeId: number | null;
    rarityId: number | null;

    onChangeCategory: (v: number | null) => void;
    onChangeType: (v: number | null) => void;
    onChangeRarity: (v: number | null) => void;

    onCancel: () => void;
    onConfirm: () => void;
}

export default function TabItemsEditorCreateItemPopup({
    isOpen,
    theme,
    job,
    onChangeJob,
    categoryId,
    typeId,
    rarityId,
    onChangeCategory,
    onChangeType,
    onChangeRarity,
    onCancel,
    onConfirm
}: PopupProps) {

    const cfg = themeConfigs[theme as ThemeKey];

    const cap = (s: string) =>
        s.length ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

    /** -------------------------------
     * Base class only
     * -------------------------------*/
    const baseJobs = useMemo(() => {
        return jobsData.jobs
            .filter(j => j.class_id === 0)
            .map(j => ({
                id: j.id,
                name: cap(j.name)
            }));
    }, []);

    /** ---------------------------------------------------------
     * REALTIME SYNC JOB WITH AppMemory (WHILE POPUP IS OPEN)
     * --------------------------------------------------------*/
    useEffect(() => {
        if (!isOpen) return;

        const unsubscribe = AppMemory.subscribe(() => {
            const mem = AppMemory.load();
            const memJob = mem.character.baseId;

            if (memJob && memJob !== job) {
                onChangeJob(String(memJob));
                onChangeCategory(null);
                onChangeType(null);
                onChangeRarity(null);
            }
        });

        return unsubscribe;
    }, [isOpen, job]);

    /** -------------------------------
     * CATEGORY / TYPE / RARITY
     * -------------------------------*/
    const categories = categoriesData.categories;
    const itemTypes = itemTypesData.item_types;
    const rarities = raritiesData.rarities;

    const rulesItem = rarityRulesData.rarity_rules.item_types as Record<string, number[]>;
    const rulesCat = rarityRulesData.rarity_rules.categories as Record<string, number[]>;

    const typeOptions = useMemo(() => {
        if (!categoryId) return [];
        return itemTypes.filter(t => t.category_id === categoryId);
    }, [categoryId, itemTypes]);

    const allowedRarities = useMemo(() => {
        if (!categoryId) return [];

        if (typeId && rulesItem[String(typeId)]) {
            return rulesItem[String(typeId)];
        }

        return rulesCat[String(categoryId)] ?? [];
    }, [categoryId, typeId, rulesItem, rulesCat]);

    const rarityOptions = useMemo(() => {
        return rarities.filter(r => allowedRarities.includes(r.rarity_id));
    }, [rarities, allowedRarities]);

    const handleConfirm = () => {
        if (!categoryId || !typeId || !rarityId) return;
        onConfirm();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className={`rounded-lg p-5 shadow-xl w-[440px] border ${cfg.popupBg} ${cfg.popupBorder} ${cfg.bodyText}`}>
                <h2 className={`text-lg font-bold text-center mb-4 ${cfg.popupTitle}`}>
                    Create Item
                </h2>

                {/* JOB */}
                <div className="mb-4">
                    <label className={`${cfg.dropdownLabel} text-xs`}>Job</label>
                    <select
                        value={job}
                        onChange={(e) => onChangeJob(e.target.value)}
                        className={`w-full rounded p-1 mt-1 ${cfg.popupDropdown}`}
                    >
                        <option value="">-- Select Job --</option>
                        {baseJobs.map(j => (
                            <option key={j.id} value={j.id}>
                                {j.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* CATEGORY */}
                <div className="mb-4">
                    <label className={`${cfg.dropdownLabel} text-xs`}>Category</label>
                    <select
                        value={categoryId ?? ""}
                        onChange={(e) => {
                            const cid = Number(e.target.value);
                            onChangeCategory(cid || null);
                            onChangeType(null);
                            onChangeRarity(null);
                        }}
                        className={`w-full rounded p-1 mt-1 ${cfg.popupDropdown}`}
                    >
                        <option value="">-- Select Category --</option>
                        {categories.map(c => (
                            <option key={c.category_id} value={c.category_id}>
                                {cap(c.category_name)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* ITEM TYPE */}
                {categoryId && (
                    <div className="mb-4">
                        <label className={`${cfg.dropdownLabel} text-xs`}>Item Type</label>
                        <select
                            value={typeId ?? ""}
                            onChange={(e) => {
                                const tid = Number(e.target.value);
                                onChangeType(tid || null);
                                onChangeRarity(null);
                            }}
                            className={`w-full rounded p-1 mt-1 ${cfg.popupDropdown}`}
                        >
                            <option value="">-- Select Item Type --</option>
                            {typeOptions.map(t => (
                                <option key={t.type_id} value={t.type_id}>
                                    {cap(t.type_name)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* RARITY */}
                {typeId && (
                    <div className="mb-4">
                        <label className={`${cfg.dropdownLabel} text-xs`}>Rarity</label>
                        <select
                            value={rarityId ?? ""}
                            onChange={(e) =>
                                onChangeRarity(Number(e.target.value))
                            }
                            className={`w-full rounded p-1 mt-1 ${cfg.popupDropdown}`}
                        >
                            <option value="">-- Select Rarity --</option>
                            {rarityOptions.map(r => (
                                <option
                                    key={r.rarity_id}
                                    value={r.rarity_id}
                                    style={{ color: r.color }}
                                >
                                    {cap(r.rarity_name)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* BUTTONS */}
                <div className="flex justify-between mt-6">
                    <button
                        className={`px-3 py-1 rounded ${cfg.popupDropdown}`}
                        onClick={onCancel}
                    >
                        Cancel
                    </button>

                    <button
                        disabled={!categoryId || !typeId || !rarityId}
                        className={`px-3 py-1 rounded font-bold ${cfg.buttonPrimary}
                            ${!categoryId || !typeId || !rarityId ? "opacity-40 cursor-not-allowed" : ""}`}
                        onClick={handleConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
