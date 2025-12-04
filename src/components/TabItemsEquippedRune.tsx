// src/components/TabItemsEquippedRune.tsx
import React, { useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";
import { AppMemory } from "../state/AppMemory";

interface TabItemsEquippedSectionProps {
    theme: ThemeKey;
}

// แบ่งเป็น Rune โจมตี 2 ช่อง และ Rune ป้องกัน 2 ช่อง
const ATTACK_RUNE_SLOTS = ["Attack Rune I", "Attack Rune II"];
const DEFENSE_RUNE_SLOTS = ["Defense Rune I", "Defense Rune II"];

const TabItemsEquippedRune: React.FC<TabItemsEquippedSectionProps> = ({
    theme,
}) => {
    const cfg = themeConfigs[theme];

    // โหลดค่าเริ่มต้นจาก memory ถ้ามี, ถ้าไม่มีก็ใช้ {} เป็น default
    const [selected, setSelected] = useState<Record<string, string>>(() => {
        const mem = AppMemory.load();
        return mem.equippedRuneSelections ?? {};
    });

    const handleChange = (slot: string, value: string) => {
        setSelected((prev) => {
            const next = { ...prev, [slot]: value };
            AppMemory.patch({ equippedRuneSelections: next });
            return next;
        });
    };

    const selectClassName = `
    w-full px-2 py-2
    rounded-md
    bg-black/40
    text-xs font-mono
    border ${cfg.sectionBorder}
    focus:outline-none
    ${cfg.accentText}
  `;

    const rowClassName = `
    rounded-md border-b ${cfg.sectionBorder}
    bg-black/20 p-2
  `;

    return (
        <div className="h-full w-full p-4 space-y-6">
            {/* -------- ATTACK RUNES (2 slots) -------- */}
            <section>
                <div className="grid grid-cols-1 gap-0">
                    {ATTACK_RUNE_SLOTS.map((slot) => (
                        <div key={slot} className={rowClassName}>
                            <select
                                className={selectClassName}
                                value={selected[slot] ?? ""}
                                onChange={(e) => handleChange(slot, e.target.value)}
                            >
                                {/* default เท่านั้น */}
                                <option value="">{`-- ${slot} --`}</option>
                            </select>
                        </div>
                    ))}
                </div>
            </section>

            {/* -------- DEFENSE RUNES (2 slots) -------- */}
            <section>
                <div className="grid grid-cols-1 gap-0">
                    {DEFENSE_RUNE_SLOTS.map((slot) => (
                        <div key={slot} className={rowClassName}>
                            <select
                                className={selectClassName}
                                value={selected[slot] ?? ""}
                                onChange={(e) => handleChange(slot, e.target.value)}
                            >
                                <option value="">{`-- ${slot} --`}</option>
                            </select>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default TabItemsEquippedRune;
