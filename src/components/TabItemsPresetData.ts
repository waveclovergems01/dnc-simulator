// src/components/TabItemsPresetData.ts

import type {
    RawStat,
    NormalizedStat,
    NormalizedStatBlock,
    NormalizedSetBonus,
    EquipmentSetJson,
    GameItem,
    ItemType,
    EquipmentFile,
    AccessoriesFile,
    CostumeAccessoriesFile,
    HeraldryFile,
    MonsterCardsFile,
    MountsFile,
    RunesFile,
} from "./TabItemsPresetTypes";

import {
    STAT_MAP,
    rawData,
} from "./TabItemsPresetTypes";

/* ----------------- HELPERS ----------------- */

const mapSlotToItemType = (slot: string): ItemType => {
    switch (slot) {
        case "helm":
            return "helm";
        case "upper_body":
            return "upper_body";
        case "lower_body":
            return "lower_body";
        case "gloves":
            return "gloves";
        case "shoes":
            return "shoes";
        case "weapon":
            return "main_weapon";
        case "shield":
            return "secondary_weapon";
        case "ring":
            return "ring";
        case "earrings":
            return "earrings";
        case "necklace":
            return "necklace";
        default:
            return "ring"; // ควรมี fallback
    }
};

const normalizeStat = (raw: RawStat): NormalizedStat => {
    const def = STAT_MAP.get(raw.type_id);
    const baseLabel = def?.label ?? `Stat ${raw.type_id}`;

    const valueMin =
        raw.value_min !== undefined
            ? raw.value_min
            : raw.value !== undefined
                ? raw.value
                : 0;
    const valueMax =
        raw.value_max !== undefined
            ? raw.value_max
            : raw.value !== undefined
                ? raw.value
                : valueMin;

    const isPercentage =
        raw.is_percentage !== undefined
            ? raw.is_percentage
            : def?.isPercentageDefault ?? false;

    return {
        typeId: raw.type_id,
        label: baseLabel,
        isPercentage,
        valueMin,
        valueMax,
    };
};

const buildBlock = (
    label: string,
    arr: RawStat[] | undefined
): NormalizedStatBlock | null => {
    if (!arr || arr.length === 0) return null;
    return {
        label,
        stats: arr.map((s) => normalizeStat(s)),
    };
};

const buildSetBonuses = (
    bonuses: EquipmentSetJson["bonuses"] | undefined
): NormalizedSetBonus[] | undefined => {
    if (!bonuses || bonuses.length === 0) return undefined;
    return bonuses.map((b) => ({
        count: b.count,
        stats: b.stats.map((s) => normalizeStat(s)),
    }));
};

/* ----------------- BUILD MASTER ITEM LIST ----------------- */

const equipmentData = rawData.equipmentJson as EquipmentFile;
const accessoriesData = rawData.accessoriesJson as AccessoriesFile;
const accessoriesCostumeData = rawData.accessoriesCostumeJson as CostumeAccessoriesFile;
const heraldryData = rawData.heraldryJson as HeraldryFile;
const cardsData = rawData.monsterCardsJson as MonsterCardsFile;
const mountsData = rawData.mountsJson as MountsFile;
const runesData = rawData.runesJson as RunesFile;

const equipmentSetMap = new Map<string, EquipmentSetJson>();
for (const s of equipmentData.sets) {
    equipmentSetMap.set(s.set_id, s);
}
if (accessoriesData.sets) {
    for (const s of accessoriesData.sets) {
        equipmentSetMap.set(s.set_id, s);
    }
}

const buildAllItems = (): GameItem[] => {
    const ALL_ITEMS: GameItem[] = [];

    // equipment (Sea Dragon cleric)
    for (const e of equipmentData.equipments) {
        const blocks: NormalizedStatBlock[] = [];
        const baseBlock = buildBlock("Base Stats", e.base_stats);
        const enhancedBlock = buildBlock("Enhanced Stats", e.enhanced_stats);
        const hiddenBlock = buildBlock("Hidden Potential", e.hidden_potential);

        if (baseBlock) blocks.push(baseBlock);
        if (enhancedBlock) blocks.push(enhancedBlock);
        if (hiddenBlock) blocks.push(hiddenBlock);

        let setName: string | undefined;
        let setBonuses: NormalizedSetBonus[] | undefined;

        if (e.set_id) {
            const s = equipmentSetMap.get(e.set_id);
            if (s) {
                setName = s.name;
                setBonuses = buildSetBonuses(s.bonuses);
            }
        }

        ALL_ITEMS.push({
            itemId: e.item_id,
            key: e.key,
            name: e.name,
            category: "equipment",
            itemType: mapSlotToItemType(e.slot),
            levelRequired: e.level_required,
            rarity: e.rarity,
            statsBlocks: blocks,
            setName,
            setBonuses,
        });
    }

    // accessories (normal) → จัดเป็น equipment
    for (const a of accessoriesData.accessories) {
        const blocks: NormalizedStatBlock[] = [];
        const baseBlock = buildBlock("Base Stats", a.base_stats);
        const hiddenBlock = buildBlock("Hidden Potential", a.hidden_potential);
        if (baseBlock) blocks.push(baseBlock);
        if (hiddenBlock) blocks.push(hiddenBlock);

        let setName: string | undefined;
        let setBonuses: NormalizedSetBonus[] | undefined;

        if (a.set_id) {
            const s = equipmentSetMap.get(a.set_id);
            if (s) {
                setName = s.name;
                setBonuses = buildSetBonuses(s.bonuses);
            }
        }

        ALL_ITEMS.push({
            itemId: a.item_id,
            key: a.key,
            name: a.name,
            category: "equipment",
            itemType: mapSlotToItemType(a.slot),
            levelRequired: a.level_required,
            rarity: a.rarity,
            statsBlocks: blocks,
            setName,
            setBonuses,
        });
    }

    // costume accessories → จัดเป็น costume
    for (const c of accessoriesCostumeData.accessories) {
        const blocks: NormalizedStatBlock[] = [];
        const baseBlock = buildBlock("Base Stats", c.base_stats);
        if (baseBlock) blocks.push(baseBlock);

        ALL_ITEMS.push({
            itemId: c.item_id,
            key: c.key,
            name: c.name,
            category: "costume",
            itemType: mapSlotToItemType(c.slot),
            levelRequired: c.level_required,
            rarity: c.rarity,
            statsBlocks: blocks,
        });
    }

    // heraldry
    for (const h of heraldryData.heraldry) {
        const blocks: NormalizedStatBlock[] = [];
        const flatBlock = buildBlock("Flat Stats", h.flat_stats);
        const percentBlock = buildBlock("Percent Stats", h.percent_stats);
        if (flatBlock) blocks.push(flatBlock);
        if (percentBlock) blocks.push(percentBlock);

        ALL_ITEMS.push({
            itemId: h.item_id,
            key: h.key,
            name: h.name,
            category: "heraldry",
            itemType: "heraldry",
            levelRequired: h.level_required,
            rarity: h.rarity,
            statsBlocks: blocks,
        });
    }

    // monster cards
    for (const c of cardsData.cards) {
        const blocks: NormalizedStatBlock[] = [];
        const flatBlock = buildBlock("Flat Stats", c.flat_stats);
        if (flatBlock) blocks.push(flatBlock);

        ALL_ITEMS.push({
            itemId: c.item_id,
            key: c.key,
            name: c.name,
            category: "card",
            itemType: "card",
            levelRequired: c.level_required,
            rarity: c.rarity,
            statsBlocks: blocks,
        });
    }

    // mounts
    for (const m of mountsData.mounts) {
        const blocks: NormalizedStatBlock[] = [];
        const baseBlock = buildBlock("Base Stats", m.base_stats);
        const percentBlock = buildBlock("Percent Stats", m.percent_stats);
        if (baseBlock) blocks.push(baseBlock);
        if (percentBlock) blocks.push(percentBlock);

        const itemType: ItemType =
            m.movement_type === "flying" ? "mount_flying" : "mount_ground";

        ALL_ITEMS.push({
            itemId: m.item_id,
            key: m.key,
            name: m.name,
            category: "mount",
            itemType,
            levelRequired: m.level_required,
            rarity: m.rarity,
            statsBlocks: blocks,
        });
    }

    // runes
    for (const r of runesData.runes) {
        const blocks: NormalizedStatBlock[] = [];
        const flatBlock = buildBlock("Flat Stats", r.flat_stats);
        if (flatBlock) blocks.push(flatBlock);

        ALL_ITEMS.push({
            itemId: r.item_id,
            key: r.key,
            name: r.name,
            category: "rune",
            itemType: "rune",
            levelRequired: r.level_required,
            rarity: r.rarity,
            statsBlocks: blocks,
        });
    }

    return ALL_ITEMS;
};

export const ALL_ITEMS: GameItem[] = buildAllItems();