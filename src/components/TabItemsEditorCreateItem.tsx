import { useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";
import TabItemsEditorCreateItemPopup from "./TabItemsEditorCreateItemPopup";

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

    const [popupOpen, setPopupOpen] = useState(false);

    const [job, setJob] = useState("");
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [typeId, setTypeId] = useState<number | null>(null);
    const [rarityId, setRarityId] = useState<number | null>(null);

    const [createdItem, setCreatedItem] = useState<CreatedItem | null>(null);

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
    };

    return (
        <div className={`p-4 ${cfg.bodyText}`}>

            {/* CREATE ITEM BUTTON */}
            <button
                className={`px-3 py-1 rounded ${cfg.buttonPrimary}`}
                onClick={() => setPopupOpen(true)}
            >
                Create Item
            </button>

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

            {/* CREATED ITEM DISPLAY */}
            {createdItem && (
                <div
                    className={`
                        mt-6 p-3 rounded border 
                        ${cfg.innerBox} 
                        ${cfg.sectionBorder}
                    `}
                >
                    <h3 className={`${cfg.accentText} font-bold mb-2`}>
                        Created Item:
                    </h3>

                    <pre className="text-sm opacity-90">
                        {JSON.stringify(createdItem, null, 2)}
                    </pre>
                </div>
            )}

        </div>
    );
}
