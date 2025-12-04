// src/components/TabItemsEquippedHeraldry.tsx
import React, { useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";
import { AppMemory } from "../state/AppMemory";

interface TabItemsEquippedSectionProps {
    theme: ThemeKey;
}

// Stats Heraldry: 8 + Extra 3
const STATS_HERALDRY_SLOTS = [
    "Stats Heraldry I",
    "Stats Heraldry II",
    "Stats Heraldry III",
    "Stats Heraldry IV",
    "Stats Heraldry V",
    "Stats Heraldry VI",
    "Stats Heraldry VII",
    "Stats Heraldry VIII",
];

const STATS_HERALDRY_EXTRA_SLOTS = [
    "Stats Heraldry Extra I",
    "Stats Heraldry Extra II",
    "Stats Heraldry Extra III",
];

// Skill Heraldry: 4
const SKILL_HERALDRY_SLOTS = [
    "Skill Heraldry I",
    "Skill Heraldry II",
    "Skill Heraldry III",
    "Skill Heraldry IV",
];

// Special Skill Heraldry: 1
const SPECIAL_SKILL_HERALDRY_SLOTS = ["Special Skill Heraldry"];

const TabItemsEquippedHeraldry: React.FC<TabItemsEquippedSectionProps> = ({
    theme,
}) => {
    const cfg = themeConfigs[theme];

    // โหลดค่าเริ่มต้นจาก memory ถ้ามี, ถ้าไม่มีก็ใช้ {} เป็น default
    const [selected, setSelected] = useState<Record<string, string>>(() => {
        const mem = AppMemory.load();
        return mem.equippedHeraldrySelections ?? {};
    });

    const handleChange = (slot: string, value: string) => {
        setSelected((prev) => {
            const next = { ...prev, [slot]: value };
            AppMemory.patch({ equippedHeraldrySelections: next });
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
            {/* -------- STATS HERALDRY (8 slots) -------- */}
            <section>
                <div className="grid grid-cols-1 gap-0">
                    {STATS_HERALDRY_SLOTS.map((slot) => (
                        <div key={slot} className={rowClassName}>
                            <select
                                className={selectClassName}
                                value={selected[slot] ?? ""}
                                onChange={(e) => handleChange(slot, e.target.value)}
                            >
                                {/* default option เท่านั้น */}
                                <option value="">{`-- ${slot} --`}</option>
                            </select>
                        </div>
                    ))}
                </div>
            </section>

            {/* -------- STATS HERALDRY EXTRA (3 slots) -------- */}
            <section>
                <div className="grid grid-cols-1 gap-0">
                    {STATS_HERALDRY_EXTRA_SLOTS.map((slot) => (
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

            {/* -------- SKILL HERALDRY (4 slots) -------- */}
            <section>
                <div className="grid grid-cols-1 gap-0">
                    {SKILL_HERALDRY_SLOTS.map((slot) => (
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

            {/* -------- SPECIAL SKILL HERALDRY (1 slot) -------- */}
            <section>
                <div className="grid grid-cols-1 gap-0">
                    {SPECIAL_SKILL_HERALDRY_SLOTS.map((slot) => (
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

export default TabItemsEquippedHeraldry;
