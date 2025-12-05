// src/components/TabItemsPresetTypes.ts

// JSON data imports (ต้องแน่ใจว่า path ถูกต้องในโปรเจกต์จริง)
import equipmentJson from "../data/equipment_sea_dragon_cleric.json";
import accessoriesJson from "../data/accessories.json";
import accessoriesCostumeJson from "../data/accessories_costume.json";
import heraldryJson from "../data/heraldry.json";
import monsterCardsJson from "../data/monster_cards.json";
import mountsJson from "../data/mounts.json";
import runesJson from "../data/runes.json";
import statsJson from "../data/stats.json";

/* ----------------- BASE TYPES ----------------- */

export type Category =
    | "equipment"
    | "costume"
    | "heraldry"
    | "mount"
    | "minions"
    | "card"
    | "rune";

export type ItemType =
    | "helm"
    | "upper_body"
    | "lower_body"
    | "gloves"
    | "shoes"
    | "main_weapon"
    | "secondary_weapon"
    | "ring"
    | "earrings"
    | "necklace"
    | "heraldry"
    | "card"
    | "mount_ground"
    | "mount_flying"
    | "rune"
    | "minion";

export type SortMode = "name_asc" | "name_desc";

export interface NormalizedStat {
    typeId: number;
    label: string;
    isPercentage: boolean;
    valueMin: number;
    valueMax: number;
}

export interface NormalizedStatBlock {
    label: string;
    stats: NormalizedStat[];
}

export interface NormalizedSetBonus {
    count: number;
    stats: NormalizedStat[];
}

export interface GameItem {
    itemId: number;
    key: string;
    name: string;
    category: Category;
    itemType: ItemType;
    levelRequired?: number;
    rarity?: string;
    statsBlocks: NormalizedStatBlock[];
    setName?: string;
    setBonuses?: NormalizedSetBonus[];
}

export interface TooltipState {
    x: number;
    y: number;
    item: GameItem;
}

/* ----------------- RAW JSON TYPES (ย่อมาจากไฟล์เดิม) ----------------- */

export interface RawStat {
    type_id: number;
    value_min?: number;
    value_max?: number;
    value?: number;
    is_percentage?: boolean;
}

export interface EquipmentSetJson {
    set_id: string;
    name: string;
    pieces: number[];
    bonuses: { count: number; stats: RawStat[] }[];
}

export interface EquipmentJsonItem {
    item_id: number;
    key: string;
    name: string;
    slot: string;
    class: string;
    level_required: number;
    rarity: string;
    set_id?: string;
    base_stats?: RawStat[];
    enhanced_stats?: RawStat[];
    hidden_potential?: RawStat[];
}

export interface AccessoriesFile {
    accessories: {
        item_id: number;
        key: string;
        name: string;
        slot: string;
        level_required: number;
        rarity: string;
        set_id?: string;
        base_stats?: RawStat[];
        hidden_potential?: RawStat[];
    }[];
    sets?: EquipmentSetJson[];
}

export interface CostumeAccessoriesFile {
    accessories: {
        item_id: number;
        key: string;
        name: string;
        slot: string;
        level_required: number;
        rarity: string;
        is_costume?: boolean;
        base_stats?: RawStat[];
    }[];
}

export interface EquipmentFile {
    equipments: EquipmentJsonItem[];
    sets: EquipmentSetJson[];
}

export interface HeraldryFile {
    heraldry: {
        item_id: number;
        key: string;
        name: string;
        level_required: number;
        rarity: string;
        flat_stats?: RawStat[];
        percent_stats?: RawStat[];
    }[];
}

export interface MonsterCardsFile {
    cards: {
        item_id: number;
        key: string;
        name: string;
        level_required: number;
        rarity: string;
        flat_stats?: RawStat[];
    }[];
}

export interface MountsFile {
    mounts: {
        item_id: number;
        key: string;
        name: string;
        rarity: string;
        level_required: number;
        movement_type: "ground" | "flying";
        base_stats?: RawStat[];
        percent_stats?: RawStat[];
    }[];
}

export interface RunesFile {
    runes: {
        item_id: number;
        key: string;
        name: string;
        level_required: number;
        rune_type: string;
        rarity: string;
        flat_stats?: RawStat[];
    }[];
}

export interface StatsFile {
    stats: {
        type_id: number;
        type_name: string;
        display_name: string;
        is_percentage: boolean;
    }[];
}

/* ----------------- RAW DATA IMPORTS ----------------- */

export const rawData = {
    equipmentJson,
    accessoriesJson,
    accessoriesCostumeJson,
    heraldryJson,
    monsterCardsJson,
    mountsJson,
    runesJson,
    statsJson,
};

/* ----------------- LABELS ----------------- */

export const CATEGORY_LABEL: Record<Category, string> = {
    equipment: "Equipment",
    costume: "Costume",
    heraldry: "Heraldry",
    mount: "Mount",
    minions: "Minions",
    card: "Card",
    rune: "Rune",
};

export const ITEM_TYPE_LABEL: Record<ItemType, string> = {
    helm: "Helm",
    upper_body: "Upper Body",
    lower_body: "Lower Body",
    gloves: "Gloves",
    shoes: "Shoes",
    main_weapon: "Main Weapon",
    secondary_weapon: "Secondary Weapon",
    ring: "Ring",
    earrings: "Earrings",
    necklace: "Necklace",

    heraldry: "Heraldry",
    card: "Card",
    mount_ground: "Ground Mount",
    mount_flying: "Flying Mount",
    rune: "Rune",
    minion: "Minion",
};

export const EQUIP_TYPES: ItemType[] = [
    "helm",
    "upper_body",
    "lower_body",
    "gloves",
    "shoes",
    "main_weapon",
    "secondary_weapon",
    "ring",
    "earrings",
    "necklace",
];

export const CATEGORY_ITEM_TYPES: Record<Category, ItemType[]> = {
    equipment: EQUIP_TYPES,
    costume: EQUIP_TYPES,
    heraldry: ["heraldry"],
    mount: ["mount_ground", "mount_flying"],
    minions: ["minion"],
    card: ["card"],
    rune: ["rune"],
};

/* ----------------- STATS MAP ----------------- */

const statsData = rawData.statsJson as StatsFile;
export const STAT_MAP = new Map<
    number,
    { label: string; isPercentageDefault: boolean }
>();

for (const s of statsData.stats) {
    STAT_MAP.set(s.type_id, {
        label: s.display_name,
        isPercentageDefault: s.is_percentage,
    });
}