// ------------------------------------------------------------
// TabItemsPresetTypes.ts
// FINAL VERSION — MATCH m.item_types.json (slot-based)
// ------------------------------------------------------------

import statsJson from "../data/m.stats.json";
import rarityJson from "../data/m.rarities.json";
import setBonusJson from "../data/m.set_bonuses.json";
import jobsJson from "../data/m.jobs.json";
import equipmentsJson from "../data/m.equipments.json";
import itemTypesJson from "../data/m.item_types.json";

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

const toBool = (v?: number): boolean => v === 1;

// ------------------------------------------------------------
// BASE TYPES (MATCH JSON)
// ------------------------------------------------------------

export type Category =
    | "equipment"
    | "costume"
    | "heraldry"
    | "mount"
    | "minion"
    | "card"
    | "rune";

/**
 * ItemType = slot from m.item_types.json
 */
export type ItemType =
    | "helm"
    | "upper"
    | "lower"
    | "gloves"
    | "shoes"
    | "main_weapon"
    | "secondary_weapon"
    | "ring"
    | "earrings"
    | "necklace"
    | "helm_costume"
    | "upper_costume"
    | "lower_costume"
    | "gloves_costume"
    | "shoes_costume"
    | "main_weapon_costume"
    | "secondary_weapon_costume"
    | "ring_costume"
    | "earrings_costume"
    | "necklace_costume"
    | "wings"
    | "tail"
    | "decal"
    | "enhancement_heraldry"
    | "skill_heraldry"
    | "special_skill_heraldry"
    | "ground_mount"
    | "flying_mount"
    | "minion"
    | "card"
    | "rune_destruction"
    | "rune_adamantine";

// ------------------------------------------------------------
// RAW DATA TYPES
// ------------------------------------------------------------

export interface RawStat {
    stat_id: number;
    value_min?: number;
    value_max?: number;
    is_percentage?: number; // 0 | 1
}

export interface RawItem {
    item_id: number;
    name: string;
    type_id: number;
    job_id: number;
    required_level: number;
    rarity_id: number;
    durability?: number;
    set_id?: number;

    base_stats?: RawStat[];
    enhanced_stats?: RawStat[];
    hidden_potential?: RawStat[];
}

export interface EquipmentFile {
    items: RawItem[];
}

// ------------------------------------------------------------
// SET BONUS (RAW)
// ------------------------------------------------------------

export interface RawSetBonusStat {
    stat_id: number;
    value_min: number;
    value_max: number;
    is_percentage?: number;
}

export interface RawSetBonusEntry {
    count: number;
    stats: RawSetBonusStat[];
}

export interface RawSetBonusFileEntry {
    set_id: number;
    set_name: string;
    set_bonus: RawSetBonusEntry[];
}

export interface RawSetBonusFile {
    set_bonuses: RawSetBonusFileEntry[];
}

// ------------------------------------------------------------
// NORMALIZED TYPES (USED BY UI)
// ------------------------------------------------------------

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
    levelRequired: number;
    rarity?: string;
    rarityColor?: string;
    durability?: number;
    statsBlocks: NormalizedStatBlock[];
    jobId?: number;
    setName?: string;
    setBonuses?: NormalizedSetBonus[];
    setItemNames?: string[];
}

// ------------------------------------------------------------
// STAT MAP
// ------------------------------------------------------------

export const STAT_MAP = new Map<number, { label: string; isPercentage: boolean }>();

for (const s of statsJson.stats) {
    STAT_MAP.set(s.stat_id, {
        label: s.display_name,
        isPercentage: toBool(s.is_percentage),
    });
}

// ------------------------------------------------------------
// RARITY MAP
// ------------------------------------------------------------

export const RARITY_MAP = new Map<number, { name: string; color: string }>();

for (const r of rarityJson.rarities) {
    RARITY_MAP.set(r.rarity_id, {
        name: r.rarity_name,
        color: r.color,
    });
}

// ------------------------------------------------------------
// SET MAP
// ------------------------------------------------------------

const rawSetFile = setBonusJson as unknown as RawSetBonusFile;

export const SET_MAP = new Map<number, RawSetBonusFileEntry>();

for (const s of rawSetFile.set_bonuses) {
    SET_MAP.set(s.set_id, s);
}

// ------------------------------------------------------------
// JOB MAP
// ------------------------------------------------------------

interface RawJob {
    id: number;
    name: string;
    class_id: number;
    class_name: string;
    inherit: number;
    required_level: number;
    next_classes: { id: number }[];
}

const jobData = jobsJson as unknown as { jobs: RawJob[] };

export const JOB_NAME_MAP = new Map<number, string>();
export const JOB_MAP = new Map<number, RawJob>();

const capitalize = (s: string) =>
    s.length ? s[0].toUpperCase() + s.slice(1) : s;

for (const j of jobData.jobs) {
    JOB_NAME_MAP.set(j.id, capitalize(j.name));
    JOB_MAP.set(j.id, j);
}

export const formatJobName = (jobId?: number): string | undefined => {
    if (jobId == null) return undefined;
    return JOB_NAME_MAP.get(jobId) ?? `Job ${jobId}`;
};

// ------------------------------------------------------------
// EQUIPMENT FILE (SINGLE SOURCE)
// ------------------------------------------------------------

const equipmentFile = equipmentsJson as unknown as EquipmentFile;

export const EQUIPMENT_FILES: EquipmentFile[] = [
    equipmentFile,
];

// ------------------------------------------------------------
// ITEM TYPE MAP (FROM JSON)
// ------------------------------------------------------------

interface RawItemType {
    type_id: number;
    type_name: string;
    slot: string;
    category_id: number;
}

export const TYPE_ID_TO_ITEM_TYPE = new Map<number, ItemType>();

for (const t of itemTypesJson.item_types as RawItemType[]) {
    TYPE_ID_TO_ITEM_TYPE.set(t.type_id, t.slot as ItemType);
}

// ------------------------------------------------------------
// Map type_id → ItemType (slot)
// ------------------------------------------------------------

export const mapTypeIdToItemType = (typeId: number): ItemType => {
    return TYPE_ID_TO_ITEM_TYPE.get(typeId) ?? "helm";
};
