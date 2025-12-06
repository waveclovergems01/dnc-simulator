// src/components/TabItems.tsx
import React from "react";
import { themeConfigs, type ThemeKey } from "../themes";
import TabItemsEquipped from "./TabItemsEquipped";
import TabItemsPreset from "./TabItemsPreset";

// ⭐ เพิ่ม import นี้
import TabItemsEditor from "./TabItemsEditor";

interface TabItemsProps {
    theme: ThemeKey;
}

const TabItems: React.FC<TabItemsProps> = ({ theme }) => {
    const cfg = themeConfigs[theme];

    return (
        <div
            className={`
                w-full h-full grid
                grid-cols-[30%_20%_50%]
                ${cfg.bodyText}
            `}
        >
            {/* ---------- COLUMN 1 (30%) : Equipped ---------- */}
            <div
                className={`
                    h-full overflow-y-auto overflow-x-hidden
                    border-r ${cfg.sectionBorder}
                    p-0
                `}
            >
                <TabItemsEquipped theme={theme} />
            </div>

            {/* ---------- COLUMN 2 (20%) : Preset ---------- */}
            <div
                className={`
                    h-full overflow-y-auto overflow-x-hidden
                    border-r ${cfg.sectionBorder}
                    p-4
                `}
            >
                <TabItemsPreset theme={theme} />
            </div>

            {/* ---------- COLUMN 3 (50%) : Editor ---------- */}
            <div
                className={`
                    h-full overflow-y-auto overflow-x-hidden
                    p-4
                `}
            >
                <TabItemsEditor theme={theme} />
            </div>
        </div>
    );
};

export default TabItems;
