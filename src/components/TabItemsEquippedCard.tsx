// src/components/TabItemsEquippedCard.tsx
import React, { useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";
import { AppMemory } from "../state/AppMemory";

interface TabItemsEquippedSectionProps {
    theme: ThemeKey;
}

// 64 ช่อง Card 1..64
const CARD_SLOTS = Array.from({ length: 64 }, (_, i) => `Card ${i + 1}`);

const TabItemsEquippedCard: React.FC<TabItemsEquippedSectionProps> = ({
    theme,
}) => {
    const cfg = themeConfigs[theme];

    // โหลดค่าเริ่มต้นจาก memory ถ้ามี, ถ้าไม่มีก็ใช้ {} เป็น default
    const [selected, setSelected] = useState<Record<string, string>>(() => {
        const mem = AppMemory.load();
        return mem.equippedCardSelections ?? {};
    });

    const handleChange = (slot: string, value: string) => {
        setSelected((prev) => {
            const next = { ...prev, [slot]: value };
            AppMemory.patch({ equippedCardSelections: next });
            return next;
        });
    };

    return (
        <div className="h-full w-full p-4 space-y-6">
            <section>
                <div className="grid grid-cols-1 gap-0">
                    {CARD_SLOTS.map((slot) => (
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
                                {/* default เท่านั้น ตามที่สั่ง */}
                                <option value="">{`-- ${slot} --`}</option>
                            </select>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default TabItemsEquippedCard;
