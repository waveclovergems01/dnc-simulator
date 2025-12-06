// src/components/TabItemsEditor.tsx
import React from "react";
import { themeConfigs, type ThemeKey } from "../themes";
import TabItemsEditorInventory from "./TabItemsEditorInventory";

// ⭐ เพิ่มตรงนี้
import TabItemsEditorCreateItem from "./TabItemsEditorCreateItem";

interface TabItemsEditorProps {
    theme: ThemeKey;
}

const TabItemsEditor: React.FC<TabItemsEditorProps> = ({ theme }) => {
    const cfg = themeConfigs[theme];

    return (
        <div
            className={`
                w-full h-full
                grid grid-cols-[40%_60%]
                gap-2
                text-xs
                ${cfg.bodyText}
            `}
        >
            {/* ---------- LEFT COLUMN: Inventory ---------- */}
            <div
                className={`
                    h-full border-r ${cfg.sectionBorder}
                    p-2 bg-black/20
                `}
            >
                <TabItemsEditorInventory theme={theme} />
            </div>

            {/* ---------- RIGHT COLUMN: Create Item Panel ---------- */}
            <div
                className={`
                    h-full p-2
                    bg-black/10
                `}
            >
                <TabItemsEditorCreateItem theme={theme} />
            </div>
        </div>
    );
};

export default TabItemsEditor;
