// ------------------------------------------------------------
// TabItemsPresetTypesSetBonus.ts
// (แยกเพื่อหลีกเลี่ยง circular import)
// ------------------------------------------------------------

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
