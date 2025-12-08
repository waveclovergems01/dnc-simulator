// ------------------------------------------------------------
// TabItemsPresetData.ts
// ------------------------------------------------------------

import type {
    RawStat,
    NormalizedStat,
    NormalizedStatBlock,
    NormalizedSetBonus,
    GameItem,
    EquipmentFile,
} from "./TabItemsPresetTypes";

import {
    EQUIPMENT_FILES,
    RARITY_MAP,
    SET_MAP,
    STAT_MAP,
    mapTypeIdToItemType,
} from "./TabItemsPresetTypes";

// รวม raw items ไว้ใช้หา set items
const ALL_RAW_ITEMS: EquipmentFile["items"] = EQUIPMENT_FILES.flatMap(
    (f) => f.items
);

// ------------------------
// normalize stat
// ------------------------

const normalizeStat = (raw: RawStat): NormalizedStat => {
    const def = STAT_MAP.get(raw.stat_id);
    const label = def?.label ?? `Stat ${raw.stat_id}`;
    const isPct = raw.is_percentage ?? def?.isPercentage ?? false;

    const vmin = raw.value_min ?? raw.value_max ?? 0;
    const vmax = raw.value_max ?? raw.value_min ?? vmin;

    return {
        typeId: raw.stat_id,
        label,
        isPercentage: isPct,
        valueMin: vmin,
        valueMax: vmax,
    };
};

const buildBlock = (
    label: string,
    stats?: RawStat[]
): NormalizedStatBlock | null => {
    if (!stats || stats.length === 0) return null;

    return {
        label,
        stats: stats.map(normalizeStat),
    };
};

const buildSetBonuses = (set_id?: number): NormalizedSetBonus[] | undefined => {
    if (!set_id) return;

    const data = SET_MAP.get(set_id);
    if (!data) return;

    return data.set_bonus.map((b) => ({
        count: b.count,
        stats: b.stats.map(normalizeStat),
    }));
};

// ------------------------
// MAIN LIST
// ------------------------

export const ALL_ITEMS: GameItem[] = [];

for (const file of EQUIPMENT_FILES) {
    for (const e of file.items) {
        const blocks: NormalizedStatBlock[] = [];

        const base = buildBlock("Base Stats", e.base_stats);
        const enhanced = buildBlock("Enhanced Stats", e.enhanced_stats);
        const hidden = buildBlock("Hidden Potential", e.hidden_potential);

        if (base) blocks.push(base);
        if (enhanced) blocks.push(enhanced);
        if (hidden) blocks.push(hidden);

        const rarityData = RARITY_MAP.get(e.rarity_id);

        const setItemNames =
            e.set_id != null
                ? ALL_RAW_ITEMS.filter((it) => it.set_id === e.set_id).map(
                    (it) => it.name
                )
                : undefined;

        ALL_ITEMS.push({
            itemId: e.item_id,
            key: e.item_id.toString(),
            name: e.name,
            category: "equipment",
            itemType: mapTypeIdToItemType(e.type_id),
            levelRequired: e.required_level,
            rarity: rarityData?.name,
            rarityColor: rarityData?.color,
            durability: e.durability,
            statsBlocks: blocks,
            jobId: e.job_id,
            setName: e.set_id != null ? SET_MAP.get(e.set_id)?.set_name : undefined,
            setBonuses: buildSetBonuses(e.set_id),
            setItemNames,
        });
    }
}
