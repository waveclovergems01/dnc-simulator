// src/components/TabItemsEditorCreateItemPopup.tsx
import React from "react";
import { themeConfigs, type ThemeKey } from "../themes";

const RARITY_COLORS: Record<string, string> = {
    Normal: "text-white",
    Magic: "text-green-400",
    Rare: "text-blue-400",
    Epic: "text-orange-400",
    Unique: "text-purple-400",
    Legendary: "text-red-500",
};

interface Props {
    theme: ThemeKey;
    job: string;
    rarity: string;
    onChangeJob: (v: string) => void;
    onChangeRarity: (v: string) => void;
    onCancel: () => void;
    onConfirm: () => void;
}

const TabItemsEditorCreateItemPopup: React.FC<Props> = ({
    theme,
    job,
    rarity,
    onChangeJob,
    onChangeRarity,
    onCancel,
    onConfirm,
}) => {
    const cfg = themeConfigs[theme];
    const ready = job !== "" && rarity !== "";

    const dropdownClass = `
        w-full mt-1 px-2 py-1 rounded appearance-none
        border ${cfg.popupDropdown}
        focus:outline-none
    `;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center backdrop-blur-sm">
            <div
                className={`
                    w-[420px]
                    ${cfg.popupBg}
                    border ${cfg.popupBorder}
                    rounded-lg shadow-xl p-4 text-xs
                `}
            >
                <h3 className={`text-center text-sm font-bold mb-3 ${cfg.popupTitle}`}>
                    Create New Item
                </h3>

                <div className="space-y-3">

                    {/* Job */}
                    <div>
                        <label className="text-[10px] opacity-80">Job</label>
                        <select
                            className={dropdownClass}
                            value={job}
                            onChange={(e) => onChangeJob(e.target.value)}
                        >
                            <option value="">-- Select Job --</option>
                            <option value="Cleric">Cleric</option>
                            <option value="Sorceress">Sorceress</option>
                            <option value="Warrior">Warrior</option>
                            <option value="Archer">Archer</option>
                        </select>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-[10px] opacity-80">Category</label>
                        <input
                            disabled
                            value="Accessories"
                            className="mt-1 px-2 py-1 rounded bg-black/40 border border-gray-600 opacity-70 w-full"
                        />
                    </div>

                    {/* Rarity */}
                    <div>
                        <label className="text-[10px] opacity-80">Rarity</label>
                        <select
                            className={dropdownClass}
                            value={rarity}
                            onChange={(e) => onChangeRarity(e.target.value)}
                        >
                            <option value="">-- Select Rarity --</option>
                            {Object.keys(RARITY_COLORS).map((r) => (
                                <option key={r} value={r} className={RARITY_COLORS[r]}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between mt-4">
                    <button
                        className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white text-xs"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>

                    <button
                        disabled={!ready}
                        className={`
                            px-3 py-1 rounded text-white text-xs font-bold
                            ${ready
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-gray-600 opacity-40"
                            }
                        `}
                        onClick={() => ready && onConfirm()}
                    >
                        Confirm
                    </button>
                </div>

            </div>
        </div>
    );
};

export default TabItemsEditorCreateItemPopup;
