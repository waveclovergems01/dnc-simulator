// src/components/TabItemsEquipped.tsx
import React, { useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";

import TabItemsEquippedEquipment from "./TabItemsEquippedEquipment";
import TabItemsEquippedCostume from "./TabItemsEquippedCostume";
import TabItemsEquippedHeraldry from "./TabItemsEquippedHeraldry";
import TabItemsEquippedMount from "./TabItemsEquippedMount";
import TabItemsEquippedMinions from "./TabItemsEquippedMinions";
import TabItemsEquippedCard from "./TabItemsEquippedCard";
import TabItemsEquippedRune from "./TabItemsEquippedRune";

interface TabItemsEquippedProps {
    theme: ThemeKey;
}

const TABS = [
    "Equipment",
    "Costume",
    "Heraldry",
    "Mount",
    "Minions",
    "Card",
    "Rune",
];

const TabItemsEquipped: React.FC<TabItemsEquippedProps> = ({ theme }) => {
    const cfg = themeConfigs[theme];
    const [activeTab, setActiveTab] = useState<string>("Equipment");

    const renderLeftSection = () => {
        switch (activeTab) {
            case "Equipment": return <TabItemsEquippedEquipment theme={theme} />;
            case "Costume": return <TabItemsEquippedCostume theme={theme} />;
            case "Heraldry": return <TabItemsEquippedHeraldry theme={theme} />;
            case "Mount": return <TabItemsEquippedMount theme={theme} />;
            case "Minions": return <TabItemsEquippedMinions theme={theme} />;
            case "Card": return <TabItemsEquippedCard theme={theme} />;
            case "Rune": return <TabItemsEquippedRune theme={theme} />;
            default: return <TabItemsEquippedEquipment theme={theme} />;
        }
    };

    return (
        <div className={`w-full h-full flex flex-col ${cfg.bodyText}`}>

            {/* ---------- ROW 1 : HEADER ---------- */}
            <div
                className={`
                    w-full p-4
                    bg-black/10 backdrop-blur-sm
                    border-b-2 ${cfg.sectionBorder}
                    shadow
                `}
            >
                <h3 className={`${cfg.accentText} text-xl font-bold`}>
                    {activeTab}
                </h3>
                <p className="text-xs mt-1 opacity-80">
                    แสดงข้อมูลของหมวด <span className="font-mono">{activeTab}</span>
                </p>
            </div>

            {/* ---------- ROW 2 : GRID 75% | 25% ---------- */}
            <div className="w-full flex-1 grid grid-cols-[75%_25%]">

                {/* ---------- LEFT CONTENT ---------- */}
                <div
                    className={`
                        relative
                        h-full w-full
                        overflow-y-auto overflow-x-hidden
                        bg-black/20 backdrop-blur-sm shadow-inner
                    `}
                >
                    {/* Floating divider (80% height) */}
                    <div
                        className={`
                            absolute right-0 top-1/2
                            -translate-y-1/2
                            ${cfg.sectionBorder}
                        `}
                        style={{
                            width: "2px",
                            height: "80%",
                        }}
                    />

                    {renderLeftSection()}
                </div>

                {/* ---------- RIGHT TABS WITH REAL DIVIDER ---------- */}
                <div
                    className={`
                        h-full w-full
                        overflow-y-auto overflow-x-hidden
                        p-3
                        bg-black/10 backdrop-blur-sm shadow-inner

                        /* 👉 TRUE COLUMN DIVIDER */
                        border-l-2 ${cfg.sectionBorder}
                    `}
                >
                    <div className="flex flex-col gap-2">
                        {TABS.map((tab) => {
                            const isActive = tab === activeTab;

                            return (
                                <button
                                    key={tab}
                                    title={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`
                                        w-full text-left
                                        px-4 py-3
                                        rounded-md font-mono text-sm
                                        border ${cfg.sectionBorder}
                                        whitespace-nowrap truncate
                                        transition-all duration-150
                                        ${isActive
                                            ? `${cfg.accentText} bg-white/10 shadow-lg`
                                            : "opacity-80 hover:bg-white/10 hover:shadow"
                                        }
                                    `}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TabItemsEquipped;
