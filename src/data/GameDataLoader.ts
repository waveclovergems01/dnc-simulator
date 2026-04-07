import categoriesJson from "../assets/json/m.categories.json";
import equipmentsJson from "../assets/json/m.equipments.json";
import itemTypesJson from "../assets/json/m.item_types.json";
import jobsJson from "../assets/json/m.jobs.json";
import patchLevelsJson from "../assets/json/m.patch_levels.json";
import plate3rdStatsJson from "../assets/json/m.plate_3rd_stats.json";
import plateNamesJson from "../assets/json/m.plate_names.json";
import platesJson from "../assets/json/m.plates.json";
import platesTypeJson from "../assets/json/m.plate_types.json";
import raritiesJson from "../assets/json/m.rarities.json";
import rarityRulesJson from "../assets/json/m.rarity_rules.json";
import setBonusesJson from "../assets/json/m.set_bonuses.json";
import statsJson from "../assets/json/m.stats.json";
import suffixGroupsJson from "../assets/json/m.suffix_groups.json";
import suffixItemsJson from "../assets/json/m.suffix_items.json";
import suffixTypesJson from "../assets/json/m.suffix_types.json";

import * as GameDataModels from "../model/GameDataModels";

interface CategoriesJsonShape {
  categories: Array<{
    category_id: number;
    category_name: string;
  }>;
}

interface EquipmentsJsonShape {
  items: Array<{
    item_id: number;
    name: string;
    type_id: number;
    job_id: number;
    required_level: number;
    rarity_id: number;
    durability: number;
    set_id?: number | null;
    icon_name?: string | null;
    path_file?: string | null;
    base_stats: Array<{
      stat_id: number;
      value_min: number;
      value_max: number;
      is_percentage: number;
    }>;
  }>;
}

interface ItemTypesJsonShape {
  item_types: Array<{
    type_id: number;
    type_name: string;
    slot: string;
    category_id: number;
  }>;
}

interface JobsJsonShape {
  jobs: Array<{
    id: number;
    name: string;
    class_id: number;
    class_name: string;
    inherit: number;
    required_level: number;
    next_classes: Array<{
      id: number;
    }>;
  }>;
}

interface PatchLevelsJsonShape {
  patch_levels: Array<{
    id: number;
    level: number;
  }>;
}

interface Plate3rdStatsJsonShape {
  plate_3rd_stats: Array<{
    id: number;
    stat_id: number;
    rarity_id: number;
    patch_level_id: number;
    value: number;
    is_percentage: number;
  }>;
}

interface PlateNamesJsonShape {
  plate_names: Array<{
    id: number;
    name: string;
    icon_name: string;
    path_file: string;
  }>;
}

interface PlatesJsonShape {
  plates: Array<{
    id: number;
    item_type_id: number;
    plate_level_id: number;
    plate_name_id: number;
    rarity_id: number;
    stat_id: number;
    stat_value: number;
    stat_percent: number;
  }>;
}

interface PlateTypesJsonShape {
  plate_types: Array<{
    id: number;
    name: string;
  }>;
}

interface RaritiesJsonShape {
  rarities: Array<{
    rarity_id: number;
    rarity_name: string;
    color: string;
  }>;
}

interface RarityRulesJsonShape {
  rarity_rules: {
    categories: Record<string, string>;
    item_types: Record<string, string>;
  };
}

interface SetBonusesJsonShape {
  set_bonuses: Array<{
    set_id: number;
    set_name: string;
    set_bonus: Array<{
      count: number;
      stats: Array<{
        stat_id: number;
        value_min: number;
        value_max: number;
        is_percentage: number;
      }>;
    }>;
  }>;
}

interface StatsJsonShape {
  stats: Array<{
    stat_id: number;
    stat_name: string;
    display_name: string;
    stat_cat_id: number;
    stat_cat_name: string;
    is_percentage: number;
  }>;
}

interface SuffixGroupsJsonShape {
  suffix_groups: Array<{
    group_id: number;
    item_type_id: number;
    normal: Array<{
      suffix_id: number;
    }>;
    pvp: Array<{
      suffix_id: number;
    }>;
  }>;
}

interface SuffixItemsJsonShape {
  suffix_items: Array<{
    name: string;
    item_id: number;
    suffix_type_id: number;
    tier: number;
    extra_stats: Array<{
      stat_id: number;
      value_min: number;
      value_max: number;
      is_percentage: number;
    }>;
    equip_ability?: {
      raw_text: string;
      type: string;
      ability_stats: Array<{
        stat_id: number;
        value_min: number;
        value_max: number;
        is_percentage: number;
      }>;
    };
  }>;
}

interface SuffixTypesJsonShape {
  suffix_types: Array<{
    suffix_id: number;
    suffix_name: string;
  }>;
}

const parseBooleanNumber = (value: number): boolean => {
  return value === 1;
};

const parseRuleValues = (value: string): number[] => {
  try {
    const parsed = JSON.parse(value) as number[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const mapBaseStat = (stat: {
  stat_id: number;
  value_min: number;
  value_max: number;
  is_percentage: number;
}): GameDataModels.ItemBaseStat => {
  return new GameDataModels.ItemBaseStat(
    stat.stat_id,
    stat.value_min,
    stat.value_max,
    parseBooleanNumber(stat.is_percentage),
  );
};

const mapAbilityStat = (stat: {
  stat_id: number;
  value_min: number;
  value_max: number;
  is_percentage: number;
}): GameDataModels.EquipAbilityStat => {
  return new GameDataModels.EquipAbilityStat(
    stat.stat_id,
    stat.value_min,
    stat.value_max,
    parseBooleanNumber(stat.is_percentage),
  );
};

const mapSetBonusStat = (stat: {
  stat_id: number;
  value_min: number;
  value_max: number;
  is_percentage: number;
}): GameDataModels.SetBonusStat => {
  return new GameDataModels.SetBonusStat(
    stat.stat_id,
    stat.value_min,
    stat.value_max,
    parseBooleanNumber(stat.is_percentage),
  );
};

export class GameDataLoader {
  private static cache: GameDataModels.GameDataBundle | null = null;

  public static load(): GameDataModels.GameDataBundle {
    if (GameDataLoader.cache) {
      return GameDataLoader.cache;
    }

    const categoriesData = categoriesJson as CategoriesJsonShape;
    const equipmentsData = equipmentsJson as EquipmentsJsonShape;
    const itemTypesData = itemTypesJson as ItemTypesJsonShape;
    const jobsData = jobsJson as JobsJsonShape;
    const patchLevelsData = patchLevelsJson as PatchLevelsJsonShape;
    const plate3rdStatsData = plate3rdStatsJson as Plate3rdStatsJsonShape;
    const plateNamesData = plateNamesJson as PlateNamesJsonShape;
    const plateTypesData = platesTypeJson as PlateTypesJsonShape;
    const platesData = platesJson as PlatesJsonShape;
    const raritiesData = raritiesJson as RaritiesJsonShape;
    const rarityRulesData = rarityRulesJson as RarityRulesJsonShape;
    const setBonusesData = setBonusesJson as SetBonusesJsonShape;
    const statsData = statsJson as StatsJsonShape;
    const suffixGroupsData = suffixGroupsJson as SuffixGroupsJsonShape;
    const suffixItemsData = suffixItemsJson as SuffixItemsJsonShape;
    const suffixTypesData = suffixTypesJson as SuffixTypesJsonShape;

    const categories = categoriesData.categories.map((item) => {
      return new GameDataModels.Category(item.category_id, item.category_name);
    });

    const items = equipmentsData.items.map((item) => {
      return new GameDataModels.EquipmentItem(
        item.item_id,
        item.name,
        item.type_id,
        item.job_id,
        item.required_level,
        item.rarity_id,
        item.durability,
        item.set_id ?? null,
        item.icon_name ?? null,
        item.path_file ?? null,
        item.base_stats.map(mapBaseStat),
      );
    });

    const itemTypes = itemTypesData.item_types.map((item) => {
      return new GameDataModels.ItemType(
        item.type_id,
        item.type_name,
        item.slot,
        item.category_id,
      );
    });

    const jobs = jobsData.jobs.map((item) => {
      return new GameDataModels.JobDefinition(
        item.id,
        item.name,
        item.class_id,
        item.class_name,
        item.inherit,
        item.required_level,
        item.next_classes.map((nextClass) => {
          return new GameDataModels.JobNextClass(nextClass.id);
        }),
      );
    });

    const patchLevels = patchLevelsData.patch_levels.map((item) => {
      return new GameDataModels.PatchLevel(item.id, item.level);
    });

    const plate3rdStats = plate3rdStatsData.plate_3rd_stats.map((item) => {
      return new GameDataModels.PlateThirdStat(
        item.id,
        item.stat_id,
        item.rarity_id,
        item.patch_level_id,
        item.value,
        parseBooleanNumber(item.is_percentage),
      );
    });

    const plateNames = plateNamesData.plate_names.map((item) => {
      return new GameDataModels.PlateName(
        item.id,
        item.name,
        item.icon_name,
        item.path_file,
      );
    });

    const plates = platesData.plates.map((item) => {
      return new GameDataModels.Plate(
        item.id,
        item.item_type_id,
        item.plate_level_id,
        item.plate_name_id,
        item.rarity_id,
        item.stat_id,
        item.stat_value,
        item.stat_percent,
      );
    });

    const plateTypes = plateTypesData.plate_types.map((item) => { 
      return new GameDataModels.PlateType(item.id, item.name);
    }); 

    const rarities = raritiesData.rarities.map((item) => {
      return new GameDataModels.Rarity(
        item.rarity_id,
        item.rarity_name,
        item.color,
      );
    });

    const rarityRules = new GameDataModels.RarityRuleSet(
      Object.fromEntries(
        Object.entries(rarityRulesData.rarity_rules.categories).map(
          ([key, value]) => {
            return [Number(key), parseRuleValues(value)];
          },
        ),
      ) as Record<number, number[]>,
      Object.fromEntries(
        Object.entries(rarityRulesData.rarity_rules.item_types).map(
          ([key, value]) => {
            return [Number(key), parseRuleValues(value)];
          },
        ),
      ) as Record<number, number[]>,
    );

    const setBonuses = setBonusesData.set_bonuses.map((item) => {
      return new GameDataModels.SetBonus(
        item.set_id,
        item.set_name,
        item.set_bonus.map((bonusStep) => {
          return new GameDataModels.SetBonusStep(
            bonusStep.count,
            bonusStep.stats.map(mapSetBonusStat),
          );
        }),
      );
    });

    const stats = statsData.stats.map((item) => {
      return new GameDataModels.StatDefinition(
        item.stat_id,
        item.stat_name,
        item.display_name,
        item.stat_cat_id,
        item.stat_cat_name,
        parseBooleanNumber(item.is_percentage),
      );
    });

    const suffixGroups = suffixGroupsData.suffix_groups.map((item) => {
      return new GameDataModels.SuffixGroup(
        item.group_id,
        item.item_type_id,
        item.normal.map((suffix) => {
          return new GameDataModels.SuffixIdRef(suffix.suffix_id);
        }),
        item.pvp.map((suffix) => {
          return new GameDataModels.SuffixIdRef(suffix.suffix_id);
        }),
      );
    });

    const suffixItems = suffixItemsData.suffix_items.map((item) => {
      const equipAbility = item.equip_ability
        ? new GameDataModels.EquipAbility(
            item.equip_ability.raw_text,
            item.equip_ability.type,
            item.equip_ability.ability_stats.map(mapAbilityStat),
          )
        : null;

      return new GameDataModels.SuffixItem(
        item.name,
        item.item_id,
        item.suffix_type_id,
        item.tier,
        item.extra_stats.map(mapBaseStat),
        equipAbility,
      );
    });

    const suffixTypes = suffixTypesData.suffix_types.map((item) => {
      return new GameDataModels.SuffixType(item.suffix_id, item.suffix_name);
    });

    GameDataLoader.cache = new GameDataModels.GameDataBundle({
      categories,
      items,
      itemTypes,
      jobs,
      patchLevels,
      plate3rdStats,
      plateNames,
      plates,
      plateTypes,
      rarities,
      rarityRules,
      setBonuses,
      stats,
      suffixGroups,
      suffixItems,
      suffixTypes,
    });

    return GameDataLoader.cache;
  }
}