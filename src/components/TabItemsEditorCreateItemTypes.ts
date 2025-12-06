// src/components/TabItemsEditorCreateItemTypes.ts

export interface BaseStat {
    type_id: number;
    value?: number;
    value_min?: number;
    value_max?: number;
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
