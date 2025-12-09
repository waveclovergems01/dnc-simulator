import React from "react";
import { themeConfigs, type ThemeKey } from "../themes";

interface CreatedItem {
    job: string;
    category_id: number;
    type_id: number;
    rarity_id: number;
    created_at: number;
}

interface Props {
    theme: ThemeKey;
    item: CreatedItem;
}


const TabItemsEditorCreateItemDetails: React.FC<Props> = ({ theme, item }) => {
    const cfg = themeConfigs[theme];

    return (
        <div className={`p-3 rounded border ${cfg.sectionBorder}`}>
            <div className={`${cfg.accentText} font-bold text-sm mb-2`}>
                Item Details
            </div>

            <div className="text-xs space-y-1">
                <div><b>Job:</b> {item.job}</div>
                <div><b>Category:</b> {item.category_id}</div>
                <div><b>Type:</b> {item.type_id}</div>
                <div><b>Rarity:</b> {item.rarity_id}</div>
                <div><b>Created:</b> {new Date(item.created_at).toLocaleString()}</div>
            </div>
        </div>
    );
};

export default TabItemsEditorCreateItemDetails;
