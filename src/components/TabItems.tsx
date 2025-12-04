// src/components/TabItems.tsx
import React from "react";
import { themeConfigs, type ThemeKey } from "../themes";
import TabItemsEquipped from "./TabItemsEquipped";
import TabItemsPreset from "./TabItemsPreset";

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
            {/* ---------- COLUMN 1 (30%) : ใส่ TabItemsEquipped ---------- */}
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

            {/* ---------- COLUMN 3 (50%) ---------- */}
            <div
                className={`
          h-full overflow-y-auto overflow-x-hidden
          p-4
        `}
            >
                <h4 className={`${cfg.accentText} text-lg font-bold mb-2`}>
                    Column 3 (50%)
                </h4>
                <p className="text-xs mb-3">
                    แสดงรายละเอียด item แบบเต็ม ทั้ง Base stats, Hidden, Set Bonus
                </p>

                <div className="space-y-2 text-xs font-mono">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i}>Detail Line {i + 1}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TabItems;
