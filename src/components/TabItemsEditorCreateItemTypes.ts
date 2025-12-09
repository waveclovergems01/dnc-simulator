// src/components/TabItemsEditorCreateItemTypes.ts

export interface BaseStat {
    stat_id: number;
    value_min?: number;
    value_max?: number;
}

export interface EquipmentItem {
    item_id: number;
    name: string;
    type_id: number;
    job_id: number;
    required_level: number;
    rarity_id: number;
    durability: number;
    set_id: number;
    base_stats: BaseStat[];
}

export interface CreatedItem {
    job: string;
    category_id: number;
    type_id: number;
    rarity_id: number;
    created_at: number;
}

export interface PotentialStat {
    type_id: number;
    value: number;
}

export interface SetEffectEntry {
    count: number;
    stats: { type_id: number; value: number }[];
}

export interface AccessoryItem {
    item_id: number;
    key: string;
    name: string;
    slot: string;
    level_required: number;
    rarity: string;
    base_stats: BaseStat[];
    potential_stats?: PotentialStat[];
    set_stats?: SetEffectEntry[];
    set_effects?: SetEffectEntry[];
}

export type StatMap = Record<number, string>;
