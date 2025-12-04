// src/components/TabItemsPreset.tsx
import React, { useMemo, useRef, useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";

// JSON data
import equipmentJson from "../data/equipment_sea_dragon_cleric.json";
import accessoriesJson from "../data/accessories.json";
import accessoriesCostumeJson from "../data/accessories_costume.json";
import heraldryJson from "../data/heraldry.json";
import monsterCardsJson from "../data/monster_cards.json";
import mountsJson from "../data/mounts.json";
import runesJson from "../data/runes.json";
import statsJson from "../data/stats.json";

interface TabItemsPresetProps {
    theme: ThemeKey;
}

/* ----------------- BASE TYPES ----------------- */

type Category =
    | "equipment"
    | "costume"
    | "heraldry"
    | "mount"
    | "minions"
    | "card"
    | "rune";

type ItemType =
    // equipment + costume
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
    // others
    | "heraldry"
    | "card"
    | "mount_ground"
    | "mount_flying"
    | "rune"
    | "minion";

type SortMode = "name_asc" | "name_desc";

interface NormalizedStat {
    typeId: number;
    label: string;
    isPercentage: boolean;
    valueMin: number;
    valueMax: number;
}

interface NormalizedStatBlock {
    label: string;
    stats: NormalizedStat[];
}

interface NormalizedSetBonus {
    count: number;
    stats: NormalizedStat[];
}

interface GameItem {
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

/* ----------------- RAW JSON TYPES ----------------- */

interface RawStat {
    type_id: number;
    value_min?: number;
    value_max?: number;
    value?: number;
    is_percentage?: boolean;
}

interface EquipmentJsonItem {
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

interface EquipmentSetJson {
    set_id: string;
    name: string;
    pieces: number[];
    bonuses: { count: number; stats: RawStat[] }[];
}

interface AccessoriesFile {
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

interface CostumeAccessoriesFile {
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

interface EquipmentFile {
    equipments: EquipmentJsonItem[];
    sets: EquipmentSetJson[];
}

interface HeraldryFile {
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

interface MonsterCardsFile {
    cards: {
        item_id: number;
        key: string;
        name: string;
        level_required: number;
        rarity: string;
        flat_stats?: RawStat[];
    }[];
}

interface MountsFile {
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

interface RunesFile {
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

interface StatsFile {
    stats: {
        type_id: number;
        type_name: string;
        display_name: string;
        is_percentage: boolean;
    }[];
}

/* ----------------- LABELS ----------------- */

const CATEGORY_LABEL: Record<Category, string> = {
    equipment: "Equipment",
    costume: "Costume",
    heraldry: "Heraldry",
    mount: "Mount",
    minions: "Minions",
    card: "Card",
    rune: "Rune",
};

const ITEM_TYPE_LABEL: Record<ItemType, string> = {
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

const EQUIP_TYPES: ItemType[] = [
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

const CATEGORY_ITEM_TYPES: Record<Category, ItemType[]> = {
    equipment: EQUIP_TYPES,
    costume: EQUIP_TYPES,
    heraldry: ["heraldry"],
    mount: ["mount_ground", "mount_flying"],
    minions: ["minion"],
    card: ["card"],
    rune: ["rune"],
};

/* ----------------- STATS MAP ----------------- */

const statsData = statsJson as StatsFile;
const STAT_MAP = new Map<
    number,
    { label: string; isPercentageDefault: boolean }
>();

for (const s of statsData.stats) {
    STAT_MAP.set(s.type_id, {
        label: s.display_name,
        isPercentageDefault: s.is_percentage,
    });
}

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
            return "ring";
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

const equipmentData = equipmentJson as EquipmentFile;
const accessoriesData = accessoriesJson as AccessoriesFile;
const accessoriesCostumeData = accessoriesCostumeJson as CostumeAccessoriesFile;
const heraldryData = heraldryJson as HeraldryFile;
const cardsData = monsterCardsJson as MonsterCardsFile;
const mountsData = mountsJson as MountsFile;
const runesData = runesJson as RunesFile;

const equipmentSetMap = new Map<string, EquipmentSetJson>();
for (const s of equipmentData.sets) {
    equipmentSetMap.set(s.set_id, s);
}
if (accessoriesData.sets) {
    for (const s of accessoriesData.sets) {
        equipmentSetMap.set(s.set_id, s);
    }
}

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

/* ----------------- TOOLTIP TYPES ----------------- */

interface TooltipState {
    x: number;
    y: number;
    item: GameItem;
}

/* ----------------- TOOLTIP COMPONENT ----------------- */

const ItemTooltip: React.FC<{ item: GameItem }> = ({ item }) => {
    return (
        <div
            className="
        w-72 rounded-md border border-yellow-500/70
        bg-gradient-to-b from-black/95 via-black/90 to-black/80
        shadow-2xl px-3 py-2
        text-[11px] text-gray-100
      "
        >
            {/* Header */}
            <div className="text-center text-[12px] font-bold text-indigo-300 mb-1">
                {item.name}
            </div>
            <div className="text-center text-[10px] text-yellow-300 mb-1">
                Binds when Obtained
            </div>
            <div className="h-px w-full bg-yellow-500/40 mb-1" />

            {/* Basic info */}
            <div className="space-y-0.5 mb-2">
                {item.levelRequired !== undefined && (
                    <div>
                        <span className="text-yellow-300">Level Req:</span>{" "}
                        {item.levelRequired} or more
                    </div>
                )}
                <div>
                    <span className="text-yellow-300">Type:</span>{" "}
                    {ITEM_TYPE_LABEL[item.itemType]}
                </div>
                <div>
                    <span className="text-yellow-300">Category:</span>{" "}
                    {CATEGORY_LABEL[item.category]}
                </div>
                {item.rarity && (
                    <div>
                        <span className="text-yellow-300">Rarity:</span> {item.rarity}
                    </div>
                )}
            </div>

            {/* Stats blocks */}
            {item.statsBlocks.map((block) => (
                <div key={block.label} className="mt-2">
                    <div className="text-[11px] text-yellow-300 mb-1">
                        {block.label}
                    </div>
                    <div className="space-y-0.5">
                        {block.stats.map((s) => {
                            const valText =
                                s.valueMin === s.valueMax
                                    ? s.valueMin.toString()
                                    : `${s.valueMin}~${s.valueMax}`;
                            const suffix = s.isPercentage ? "%" : "";
                            return (
                                <div key={`${s.typeId}-${s.label}-${valText}`}>
                                    {s.label} : {valText}
                                    {suffix}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Set info */}
            {item.setName && item.setBonuses && item.setBonuses.length > 0 && (
                <div className="mt-2">
                    <div className="text-[11px] text-yellow-300 mb-1">
                        Set: {item.setName}
                    </div>
                    <div className="space-y-1">
                        {item.setBonuses.map((b) => (
                            <div key={b.count}>
                                <div className="text-[11px] text-yellow-300">
                                    {b.count}-piece Bonus
                                </div>
                                <div className="space-y-0.5">
                                    {b.stats.map((s) => {
                                        const valText =
                                            s.valueMin === s.valueMax
                                                ? s.valueMin.toString()
                                                : `${s.valueMin}~${s.valueMax}`;
                                        const suffix = s.isPercentage ? "%" : "";
                                        return (
                                            <div key={`${s.typeId}-${s.label}-${valText}`}>
                                                {s.label} : {valText}
                                                {suffix}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ----------------- MAIN COMPONENT ----------------- */

const TabItemsPreset: React.FC<TabItemsPresetProps> = ({ theme }) => {
    const cfg = themeConfigs[theme];

    const [categoryFilter, setCategoryFilter] = useState<"all" | Category>("all");
    const [typeFilter, setTypeFilter] = useState<"all" | ItemType>("all");
    const [onlyObtainable] = useState(false); // ไว้ขยายในอนาคต (ตอนนี้ทุกชิ้นถือว่า get ได้)
    const [sortMode, setSortMode] = useState<SortMode>("name_asc");
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [tooltipState, setTooltipState] = useState<TooltipState | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);

    const typeOptions: ItemType[] =
        categoryFilter === "all" ? [] : CATEGORY_ITEM_TYPES[categoryFilter];

    const handleCategoryChange = (value: "all" | Category) => {
        setCategoryFilter(value);
        if (value === "all") {
            setTypeFilter("all");
        } else if (typeFilter !== "all" && !CATEGORY_ITEM_TYPES[value].includes(typeFilter)) {
            setTypeFilter("all");
        }
    };

    const filtered = useMemo(() => {
        let arr = [...ALL_ITEMS];

        if (categoryFilter !== "all") {
            arr = arr.filter((i) => i.category === categoryFilter);
        }
        if (typeFilter !== "all") {
            arr = arr.filter((i) => i.itemType === typeFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            arr = arr.filter((i) => i.name.toLowerCase().includes(q));
        }

        arr.sort((a, b) => {
            const na = a.name.toLowerCase();
            const nb = b.name.toLowerCase();
            return sortMode === "name_asc"
                ? na.localeCompare(nb)
                : nb.localeCompare(na);
        });

        return arr;
    }, [categoryFilter, typeFilter, sortMode, search]);

    const computeTooltipPosition = (
        mouseX: number,
        mouseY: number
    ): { x: number; y: number } => {
        const offset = 16;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const tooltipEl = tooltipRef.current;
        const rectWidth =
            tooltipEl?.getBoundingClientRect().width !== undefined
                ? tooltipEl.getBoundingClientRect().width
                : 280;
        const rectHeight =
            tooltipEl?.getBoundingClientRect().height !== undefined
                ? tooltipEl.getBoundingClientRect().height
                : 360;

        let x = mouseX + offset;
        let y = mouseY + offset;

        // ชนขอบขวา → ไปซ้าย
        if (x + rectWidth > viewportWidth) {
            x = mouseX - offset - rectWidth;
            if (x < 4) x = Math.max(4, viewportWidth - rectWidth - 4);
        }

        // ชนขอบล่าง → ขึ้นบน
        if (y + rectHeight > viewportHeight) {
            y = mouseY - offset - rectHeight;
            if (y < 4) y = Math.max(4, viewportHeight - rectHeight - 4);
        }

        return { x, y };
    };

    return (
        <>
            <div className="h-full w-full flex flex-col text-[11px]">
                {/* ------------ FILTER ------------ */}
                <div
                    className={`pb-2 mb-2 border-b ${cfg.sectionBorder} flex flex-col gap-2`}
                >
                    <h4 className={`${cfg.accentText} text-xs font-bold uppercase`}>
                        Presets
                    </h4>

                    <div className="grid grid-cols-2 gap-2">
                        {/* Category */}
                        <div className="flex flex-col gap-1">
                            <label className={`${cfg.mutedText} text-[10px]`}>
                                Category
                            </label>
                            <select
                                className={`rounded px-2 py-1 border ${cfg.dropdownSelect}`}
                                value={categoryFilter}
                                onChange={(
                                    e: React.ChangeEvent<HTMLSelectElement>
                                ): void =>
                                    handleCategoryChange(
                                        e.target.value as Category | "all"
                                    )
                                }
                            >
                                <option value="all">Any category</option>
                                {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Item Type */}
                        <div className="flex flex-col gap-1">
                            <label className={`${cfg.mutedText} text-[10px]`}>
                                Item type
                            </label>
                            <select
                                disabled={categoryFilter === "all"}
                                className={`rounded px-2 py-1 border ${cfg.dropdownSelect}`}
                                value={typeFilter}
                                onChange={(
                                    e: React.ChangeEvent<HTMLSelectElement>
                                ): void =>
                                    setTypeFilter(
                                        e.target.value as ItemType | "all"
                                    )
                                }
                            >
                                <option value="all">
                                    {categoryFilter === "all"
                                        ? "Select category first"
                                        : "Any type"}
                                </option>
                                {typeOptions.map((t) => (
                                    <option key={t} value={t}>
                                        {ITEM_TYPE_LABEL[t]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="flex flex-col gap-1">
                            <label className={`${cfg.mutedText} text-[10px]`}>Sort</label>
                            <select
                                className={`rounded px-2 py-1 border ${cfg.dropdownSelect}`}
                                value={sortMode}
                                onChange={(
                                    e: React.ChangeEvent<HTMLSelectElement>
                                ): void =>
                                    setSortMode(
                                        e.target.value as SortMode
                                    )
                                }
                            >
                                <option value="name_asc">A → Z</option>
                                <option value="name_desc">Z → A</option>
                            </select>
                        </div>

                        {/* Search */}
                        <div className="flex flex-col gap-1">
                            <label className={`${cfg.mutedText} text-[10px]`}>
                                Search
                            </label>
                            <input
                                className="rounded px-2 py-1 border bg-black/20"
                                placeholder="Type to filter…"
                                value={search}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ): void => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* (option ไว้ใช้ในอนาคต) */}
                    {/* <label className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              className="h-3 w-3 accent-emerald-500"
              checked={onlyObtainable}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement>
              ): void => setOnlyObtainable(e.target.checked)}
            />
            <span className={`${cfg.mutedText} text-[10px]`}>
              Show obtainable only
            </span>
          </label> */}
                </div>

                {/* ------------ LIST (scroll เฉพาะตรงนี้) ------------ */}
                <div
                    className={`border rounded-md ${cfg.sectionBorder} bg-black/20 flex-1 min_h-0 flex flex-col`}
                >
                    <div className="flex-1 overflow-y-auto">
                        {filtered.length === 0 && (
                            <div className="px-2 py-2 text-[11px] opacity-70">
                                ไม่พบ preset ที่ตรงเงื่อนไข
                            </div>
                        )}

                        {filtered.map((p) => {
                            const active = selectedId === p.itemId;
                            return (
                                <button
                                    key={p.itemId}
                                    type="button"
                                    onClick={(): void => setSelectedId(p.itemId)}
                                    onMouseEnter={(
                                        e: React.MouseEvent<HTMLButtonElement>
                                    ): void => {
                                        const { x, y } = computeTooltipPosition(
                                            e.clientX,
                                            e.clientY
                                        );
                                        setTooltipState({
                                            x,
                                            y,
                                            item: p,
                                        });
                                    }}
                                    onMouseMove={(
                                        e: React.MouseEvent<HTMLButtonElement>
                                    ): void => {
                                        const { x, y } = computeTooltipPosition(
                                            e.clientX,
                                            e.clientY
                                        );
                                        setTooltipState((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    x,
                                                    y,
                                                }
                                                : {
                                                    x,
                                                    y,
                                                    item: p,
                                                }
                                        );
                                    }}
                                    onMouseLeave={(): void => setTooltipState(null)}
                                    className={`w-full text-left px-2 py-1 border-b ${cfg.sectionBorder}
                    font-mono text-[11px] truncate transition-colors
                    ${active
                                            ? "bg-emerald-600/50"
                                            : "hover:bg-black/40 bg-black/0"
                                        }`}
                                >
                                    {p.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ------------ GLOBAL TOOLTIP ------------ */}
            {tooltipState && (
                <div
                    ref={tooltipRef}
                    className="fixed z-[9999] pointer-events-none"
                    style={{
                        top: tooltipState.y,
                        left: tooltipState.x,
                    }}
                >
                    <ItemTooltip item={tooltipState.item} />
                </div>
            )}
        </>
    );
};

export default TabItemsPreset;
