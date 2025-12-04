// src/components/TabItems.tsx
import React from "react";
import { themeConfigs, type ThemeKey } from "../themes";
import TabItemsEquipped from "./TabItemsEquipped";

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

            {/* ---------- COLUMN 2 (20%) ---------- */}
            <div
                className={`
          h-full overflow-y-auto overflow-x-hidden
          border-r ${cfg.sectionBorder}
          p-4
        `}
            >
                <h4 className={`${cfg.accentText} text-lg font-bold mb-2`}>
                    Column 2 (20%)
                </h4>
                <p className="text-xs mb-3">
                    รายชื่อ items ภายในหมวดที่เลือก เช่น list แหวนทั้งหมด
                </p>

                <div className="space-y-2 text-xs font-mono">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i}>Item {i + 1}</div>
                    ))}
                </div>
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
