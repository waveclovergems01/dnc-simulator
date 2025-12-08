/* eslint-disable @typescript-eslint/no-unused-vars */
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
        <div>
            Item Details Block
        </div>
    );
};

export default TabItemsEditorCreateItemDetails;
