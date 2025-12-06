// src/components/TabItemsEditorCreateItemSelectBase.tsx
import React from "react";
import { themeConfigs, type ThemeKey } from "../themes";
import type { AccessoryItem } from "./TabItemsEditorCreateItemTypes";

interface Props {
    theme: ThemeKey;
    items: AccessoryItem[];
    selectedId: number | null;
    onChange: (id: number | null) => void;
}

const TabItemsEditorCreateItemSelectBase: React.FC<Props> = ({
    theme,
    items,
    selectedId,
    onChange,
}) => {
    const cfg = themeConfigs[theme];

    const dropdownClass = `
        w-full mt-1 px-2 py-1 rounded appearance-none
        border ${cfg.popupDropdown}
        focus:outline-none
    `;

    return (
        <div className="p-2 border rounded bg-black/20">
            <div className={`${cfg.accentText} text-xs font-bold mb-1`}>
                Select Base Item
            </div>

            <select
                className={dropdownClass}
                value={selectedId ?? ""}
                onChange={(e) =>
                    onChange(e.target.value === "" ? null : Number(e.target.value))
                }
            >
                <option value="">-- Select Base Item --</option>

                {items.map((item: AccessoryItem) => (
                    <option key={item.item_id} value={item.item_id}>
                        {item.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default TabItemsEditorCreateItemSelectBase;
