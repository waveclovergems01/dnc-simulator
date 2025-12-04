// src/components/TabItemsEquippedCostume.tsx
import React, { useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";
import { AppMemory } from "../state/AppMemory";

interface TabItemsEquippedSectionProps {
    theme: ThemeKey;
}

// ใช้ slot เดียวกับ Equipment แต่เป็น Costume
const COSTUME_SLOTS = [
    "Helm",
    "Upper Body",
    "Lower Body",
    "Gloves",
    "Shoes",
    "Main Weapon",
    "Secondary Weapon",
];

const COSTUME_ACCESSORIES_SLOTS = ["Ring I", "Ring II", "Earrings", "Necklace"];

const TabItemsEquippedCostume: React.FC<TabItemsEquippedSectionProps> = ({
    theme,
}) => {
    const cfg = themeConfigs[theme];

    // โหลดค่าเริ่มต้นจาก memory ถ้ามี, ถ้าไม่มีก็ใช้ {} เป็น default
    const [selected, setSelected] = useState<Record<string, string>>(() => {
        const mem = AppMemory.load();
        return mem.equippedCostumeSelections ?? {};
    });

    const handleChange = (slot: string, value: string) => {
        setSelected((prev) => {
            const next = { ...prev, [slot]: value };
            AppMemory.patch({ equippedCostumeSelections: next });
            return next;
        });
    };

    return (
        <div className="h-full w-full p-4 space-y-6">
            {/* COSTUME SECTION */}
            <section>
                <div className="grid grid-cols-1 gap-0">
                    {COSTUME_SLOTS.map((slot) => (
                        <div
                            key={slot}
                            className={`
                rounded-md border-b ${cfg.sectionBorder}
                bg-black/20 p-2
              `}
                        >
                            <select
                                className={`
                  w-full px-2 py-2
                  rounded-md
                  bg-black/40
                  text-xs font-mono
                  border ${cfg.sectionBorder}
                  focus:outline-none
                  ${cfg.accentText}
                `}
                                value={selected[slot] ?? ""}
                                onChange={(e) => handleChange(slot, e.target.value)}
                            >
                                {/* default เท่านั้น */}
                                <option value="">{`-- ${slot} Costume --`}</option>
                            </select>
                        </div>
                    ))}
                </div>
            </section>

            {/* COSTUME ACCESSORIES SECTION */}
            <section>
                <div className="grid grid-cols-1 gap-0">
                    {COSTUME_ACCESSORIES_SLOTS.map((slot) => (
                        <div
                            key={slot}
                            className={`
                rounded-md border-b ${cfg.sectionBorder}
                bg-black/20 p-2
              `}
                        >
                            <select
                                className={`
                  w-full px-2 py-2
                  rounded-md
                  bg-black/40
                  text-xs font-mono
                  border ${cfg.sectionBorder}
                  focus:outline-none
                  ${cfg.accentText}
                `}
                                value={selected[slot] ?? ""}
                                onChange={(e) => handleChange(slot, e.target.value)}
                            >
                                {/* default เท่านั้น */}
                                <option value="">{`-- ${slot} Costume --`}</option>
                            </select>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default TabItemsEquippedCostume;
