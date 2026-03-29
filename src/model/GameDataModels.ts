export class Category {
  public readonly categoryId: number;
  public readonly categoryName: string;

  constructor(categoryId: number, categoryName: string) {
    this.categoryId = categoryId;
    this.categoryName = categoryName;
  }
}

export class ItemBaseStat {
  public readonly statId: number;
  public readonly valueMin: number;
  public readonly valueMax: number;
  public readonly isPercentage: boolean;

  constructor(
    statId: number,
    valueMin: number,
    valueMax: number,
    isPercentage: boolean,
  ) {
    this.statId = statId;
    this.valueMin = valueMin;
    this.valueMax = valueMax;
    this.isPercentage = isPercentage;
  }
}

export class EquipmentItem {
  public readonly itemId: number;
  public readonly name: string;
  public readonly typeId: number;
  public readonly jobId: number;
  public readonly requiredLevel: number;
  public readonly rarityId: number;
  public readonly durability: number;
  public readonly setId: number | null;
  public readonly baseStats: ItemBaseStat[];

  constructor(
    itemId: number,
    name: string,
    typeId: number,
    jobId: number,
    requiredLevel: number,
    rarityId: number,
    durability: number,
    setId: number | null,
    baseStats: ItemBaseStat[],
  ) {
    this.itemId = itemId;
    this.name = name;
    this.typeId = typeId;
    this.jobId = jobId;
    this.requiredLevel = requiredLevel;
    this.rarityId = rarityId;
    this.durability = durability;
    this.setId = setId;
    this.baseStats = baseStats;
  }
}

export class ItemType {
  public readonly typeId: number;
  public readonly typeName: string;
  public readonly slot: string;
  public readonly categoryId: number;

  constructor(typeId: number, typeName: string, slot: string, categoryId: number) {
    this.typeId = typeId;
    this.typeName = typeName;
    this.slot = slot;
    this.categoryId = categoryId;
  }
}

export class JobNextClass {
  public readonly id: number;

  constructor(id: number) {
    this.id = id;
  }
}

export class JobDefinition {
  public readonly id: number;
  public readonly name: string;
  public readonly classId: number;
  public readonly className: string;
  public readonly inherit: number;
  public readonly requiredLevel: number;
  public readonly nextClasses: JobNextClass[];

  constructor(
    id: number,
    name: string,
    classId: number,
    className: string,
    inherit: number,
    requiredLevel: number,
    nextClasses: JobNextClass[],
  ) {
    this.id = id;
    this.name = name;
    this.classId = classId;
    this.className = className;
    this.inherit = inherit;
    this.requiredLevel = requiredLevel;
    this.nextClasses = nextClasses;
  }
}

export class PatchLevel {
  public readonly id: number;
  public readonly level: number;

  constructor(id: number, level: number) {
    this.id = id;
    this.level = level;
  }
}

export class PlateThirdStat {
  public readonly id: number;
  public readonly statId: number;
  public readonly rarityId: number;
  public readonly patchLevelId: number;
  public readonly value: number;
  public readonly isPercentage: boolean;

  constructor(
    id: number,
    statId: number,
    rarityId: number,
    patchLevelId: number,
    value: number,
    isPercentage: boolean,
  ) {
    this.id = id;
    this.statId = statId;
    this.rarityId = rarityId;
    this.patchLevelId = patchLevelId;
    this.value = value;
    this.isPercentage = isPercentage;
  }
}

export class PlateName {
  public readonly id: number;
  public readonly name: string;
  public readonly iconName: string;
  public readonly pathFile: string;

  constructor(id: number, name: string, iconName: string, pathFile: string) {
    this.id = id;
    this.name = name;
    this.iconName = iconName;
    this.pathFile = pathFile;
  }
}

export class Plate {
  public readonly id: number;
  public readonly plateTypeId: number;
  public readonly plateLevelId: number;
  public readonly plateNameId: number;
  public readonly rarityId: number;
  public readonly statId: number;
  public readonly statValue: number;
  public readonly statPercent: number;

  constructor(
    id: number,
    plateTypeId: number,
    plateLevelId: number,
    plateNameId: number,
    rarityId: number,
    statId: number,
    statValue: number,
    statPercent: number,
  ) {
    this.id = id;
    this.plateTypeId = plateTypeId;
    this.plateLevelId = plateLevelId;
    this.plateNameId = plateNameId;
    this.rarityId = rarityId;
    this.statId = statId;
    this.statValue = statValue;
    this.statPercent = statPercent;
  }
}

export class Rarity {
  public readonly rarityId: number;
  public readonly rarityName: string;
  public readonly color: string;

  constructor(rarityId: number, rarityName: string, color: string) {
    this.rarityId = rarityId;
    this.rarityName = rarityName;
    this.color = color;
  }
}

export class RarityRuleSet {
  public readonly categories: Record<number, number[]>;
  public readonly itemTypes: Record<number, number[]>;

  constructor(
    categories: Record<number, number[]>,
    itemTypes: Record<number, number[]>,
  ) {
    this.categories = categories;
    this.itemTypes = itemTypes;
  }
}

export class SetBonusStat {
  public readonly statId: number;
  public readonly valueMin: number;
  public readonly valueMax: number;
  public readonly isPercentage: boolean;

  constructor(
    statId: number,
    valueMin: number,
    valueMax: number,
    isPercentage: boolean,
  ) {
    this.statId = statId;
    this.valueMin = valueMin;
    this.valueMax = valueMax;
    this.isPercentage = isPercentage;
  }
}

export class SetBonusStep {
  public readonly count: number;
  public readonly stats: SetBonusStat[];

  constructor(count: number, stats: SetBonusStat[]) {
    this.count = count;
    this.stats = stats;
  }
}

export class SetBonus {
  public readonly setId: number;
  public readonly setName: string;
  public readonly setBonus: SetBonusStep[];

  constructor(setId: number, setName: string, setBonus: SetBonusStep[]) {
    this.setId = setId;
    this.setName = setName;
    this.setBonus = setBonus;
  }
}

export class StatDefinition {
  public readonly statId: number;
  public readonly statName: string;
  public readonly displayName: string;
  public readonly statCatId: number;
  public readonly statCatName: string;
  public readonly isPercentage: boolean;

  constructor(
    statId: number,
    statName: string,
    displayName: string,
    statCatId: number,
    statCatName: string,
    isPercentage: boolean,
  ) {
    this.statId = statId;
    this.statName = statName;
    this.displayName = displayName;
    this.statCatId = statCatId;
    this.statCatName = statCatName;
    this.isPercentage = isPercentage;
  }
}

export class SuffixIdRef {
  public readonly suffixId: number;

  constructor(suffixId: number) {
    this.suffixId = suffixId;
  }
}

export class SuffixGroup {
  public readonly groupId: number;
  public readonly itemTypeId: number;
  public readonly normal: SuffixIdRef[];
  public readonly pvp: SuffixIdRef[];

  constructor(
    groupId: number,
    itemTypeId: number,
    normal: SuffixIdRef[],
    pvp: SuffixIdRef[],
  ) {
    this.groupId = groupId;
    this.itemTypeId = itemTypeId;
    this.normal = normal;
    this.pvp = pvp;
  }
}

export class EquipAbilityStat {
  public readonly statId: number;
  public readonly valueMin: number;
  public readonly valueMax: number;
  public readonly isPercentage: boolean;

  constructor(
    statId: number,
    valueMin: number,
    valueMax: number,
    isPercentage: boolean,
  ) {
    this.statId = statId;
    this.valueMin = valueMin;
    this.valueMax = valueMax;
    this.isPercentage = isPercentage;
  }
}

export class EquipAbility {
  public readonly rawText: string;
  public readonly type: string;
  public readonly abilityStats: EquipAbilityStat[];

  constructor(rawText: string, type: string, abilityStats: EquipAbilityStat[]) {
    this.rawText = rawText;
    this.type = type;
    this.abilityStats = abilityStats;
  }
}

export class SuffixItem {
  public readonly name: string;
  public readonly itemId: number;
  public readonly suffixTypeId: number;
  public readonly tier: number;
  public readonly extraStats: ItemBaseStat[];
  public readonly equipAbility: EquipAbility | null;

  constructor(
    name: string,
    itemId: number,
    suffixTypeId: number,
    tier: number,
    extraStats: ItemBaseStat[],
    equipAbility: EquipAbility | null,
  ) {
    this.name = name;
    this.itemId = itemId;
    this.suffixTypeId = suffixTypeId;
    this.tier = tier;
    this.extraStats = extraStats;
    this.equipAbility = equipAbility;
  }
}

export class SuffixType {
  public readonly suffixId: number;
  public readonly suffixName: string;

  constructor(suffixId: number, suffixName: string) {
    this.suffixId = suffixId;
    this.suffixName = suffixName;
  }
}

export class GameDataBundle {
  public readonly categories: Category[];
  public readonly items: EquipmentItem[];
  public readonly itemTypes: ItemType[];
  public readonly jobs: JobDefinition[];
  public readonly patchLevels: PatchLevel[];
  public readonly plate3rdStats: PlateThirdStat[];
  public readonly plateNames: PlateName[];
  public readonly plates: Plate[];
  public readonly rarities: Rarity[];
  public readonly rarityRules: RarityRuleSet;
  public readonly setBonuses: SetBonus[];
  public readonly stats: StatDefinition[];
  public readonly suffixGroups: SuffixGroup[];
  public readonly suffixItems: SuffixItem[];
  public readonly suffixTypes: SuffixType[];

  constructor(params: {
    categories: Category[];
    items: EquipmentItem[];
    itemTypes: ItemType[];
    jobs: JobDefinition[];
    patchLevels: PatchLevel[];
    plate3rdStats: PlateThirdStat[];
    plateNames: PlateName[];
    plates: Plate[];
    rarities: Rarity[];
    rarityRules: RarityRuleSet;
    setBonuses: SetBonus[];
    stats: StatDefinition[];
    suffixGroups: SuffixGroup[];
    suffixItems: SuffixItem[];
    suffixTypes: SuffixType[];
  }) {
    this.categories = params.categories;
    this.items = params.items;
    this.itemTypes = params.itemTypes;
    this.jobs = params.jobs;
    this.patchLevels = params.patchLevels;
    this.plate3rdStats = params.plate3rdStats;
    this.plateNames = params.plateNames;
    this.plates = params.plates;
    this.rarities = params.rarities;
    this.rarityRules = params.rarityRules;
    this.setBonuses = params.setBonuses;
    this.stats = params.stats;
    this.suffixGroups = params.suffixGroups;
    this.suffixItems = params.suffixItems;
    this.suffixTypes = params.suffixTypes;
  }
}