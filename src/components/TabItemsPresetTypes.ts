// ------------------------------------------------------------
// TabItemsPresetTypes.ts
// (FULL VERSION WITH JOB_MAP ADDED)
// ------------------------------------------------------------

import statsJson from "../data/m.stats.json";
import rarityJson from "../data/m.rarities.json";
import setBonusJson from "../data/m.set_bonuses.json";
import jobsJson from "../data/m.jobs.json";

import equipmentSeaDragon from "../data/m.equipment_sea_dragon.json";
import equipmentManticore from "../data/m.equipment_manticore.json";
import equipmentApocalypse from "../data/m.equipment_apocalypse.json";
import equipmentImmortal from "../data/m.equipment_immortal.json";
import equipmentCerberus from "../data/m.equipment_cerberus.json";
import equipmentRedSea from "../data/m.equipment_red_sea_dragon.json";

// ------------------------------------------------------------
// BASE TYPES
// ------------------------------------------------------------

export type Category = "equipment";

export type ItemType =
    | "helm"
    | "upper_body"
    | "lower_body"
    | "gloves"
    | "shoes"
    | "main_weapon"
    | "secondary_weapon";

export interface RawStat {
    stat_id: number;
    value_min?: number;
    value_max?: number;
    is_percentage?: boolean;
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

export interface RawSetBonusStat {
    stat_id: number;
    value_min: number;
    value_max: number;
    is_percentage?: boolean;
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
        isPercentage: s.is_percentage,
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

const rawSetFile = setBonusJson as RawSetBonusFile;

export const SET_MAP = new Map<number, RawSetBonusFileEntry>();

for (const s of rawSetFile.set_bonuses) {
    SET_MAP.set(s.set_id, s);
}

// ------------------------------------------------------------
// JOB MAP + JOB NAME MAP
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

interface JobsFile {
    jobs: RawJob[];
}

const jobData = jobsJson as JobsFile;

// name map
export const JOB_NAME_MAP = new Map<number, string>();

const capitalize = (s: string) =>
    s.length ? s[0].toUpperCase() + s.slice(1) : s;

for (const j of jobData.jobs) {
    JOB_NAME_MAP.set(j.id, capitalize(j.name));
}

// ⭐ NEW: full job info map (needed for inheritance filtering)
export const JOB_MAP = new Map<number, RawJob>();

for (const j of jobData.jobs) {
    JOB_MAP.set(j.id, j);
}

export const formatJobName = (jobId?: number): string | undefined => {
    if (jobId == null) return undefined;
    const name = JOB_NAME_MAP.get(jobId);
    return name ?? `Job ${jobId}`;
};

// ------------------------------------------------------------
// ALL EQUIPMENT FILES
// ------------------------------------------------------------

export const EQUIPMENT_FILES: EquipmentFile[] = [
    equipmentSeaDragon,
    equipmentManticore,
    equipmentApocalypse,
    equipmentImmortal,
    equipmentCerberus,
    equipmentRedSea,
];

// ------------------------------------------------------------
// Map type_id → itemType
// (same as your original file)
// ------------------------------------------------------------

export const mapTypeIdToItemType = (typeId: number): ItemType => {
    switch (typeId) {
        case 10001:
            return "helm";
        case 10002:
            return "upper_body";
        case 10003:
            return "lower_body";
        case 10004:
            return "gloves";
        case 10005:
            return "shoes";
        case 10006:
            return "main_weapon";
        case 10007:
            return "secondary_weapon";
        default:
            return "helm";
    }
};
