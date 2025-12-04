// src/components/CharacterStats.tsx
import React, { useMemo } from "react";
import { themeConfigs, type ThemeKey } from "../themes";
import jobsData from "../data/jobs.json";
import charactersData from "../data/character_stats.json";
import statsMetaData from "../data/stats.json";
import type { CharacterSelectionState } from "../state/AppMemory";

/* ---------- TYPES ---------- */

interface JobLink {
    id: number;
}

interface JobDefinition {
    id: number;
    name: string;
    class_id: number; // 0 = base, 1 = class 1, 2 = class 2
    class_name: string;
    inherit: number;
    required_level: number;
    next_classes: JobLink[];
}

interface JobsJson {
    jobs: JobDefinition[];
}

interface CharacterStatRange {
    type_id: number;
    value_min: number;
    value_max: number;
}

interface CharacterDefinition {
    id: number;
    key: string;
    class_name: string; // เช่น "Inquisitor"
    level: number;
    stats: CharacterStatRange[];
}

interface CharactersJson {
    characters: CharacterDefinition[];
}

interface StatDefinition {
    type_id: number;
    type_name: string;
    display_name: string;
    cat_id: number;
    cat_name: string;
    is_percentage: boolean;
    value_min: number;
    value_max: number;
}

interface StatsMetaJson {
    stats: StatDefinition[];
}

interface CharacterStatsProps {
    theme: ThemeKey;
    selection: CharacterSelectionState;
}

/* ---------- CONSTANTS ---------- */

// หมวดที่ต้องการให้แสดงตายตัวเสมอ (แม้ไม่มีค่าใน JSON → แสดง "-")
const DEFAULT_CATEGORIES: { catName: string; stats: string[] }[] = [
    {
        catName: "stat",
        stats: ["STR", "AGI", "INT", "VIT"],
    },
    {
        catName: "basic stat",
        stats: ["P.ATK", "M.ATK", "P.DEF", "M.DEF"],
    },
    {
        catName: "special stat",
        stats: ["Critical Rate", "Stun Rate", "Paralyze Rate", "Final Damage Rate"],
    },
    {
        catName: "special resist stat",
        stats: ["Critical Resist", "Stun Resist", "Paralyze Resist"],
    },
    {
        catName: "elemental stat",
        stats: ["Fire ATK", "Ice ATK", "Light ATK", "Dark ATK"],
    },
    {
        catName: "elemental resist stat",
        stats: ["Fire Resist", "Ice Resist", "Light Resist", "Dark Resist"],
    },
];

/* ---------- HELPERS ---------- */

const formatJobName = (name: string | undefined): string => {
    if (!name) return "-";
    const lower = name.toLowerCase().trim();

    // case พิเศษ
    if (lower === "bowmaster") return "Bow Master";

    return lower
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
};

const findJobById = (
    jobs: JobDefinition[],
    id: string
): JobDefinition | undefined => {
    const num = Number(id);
    if (!id || Number.isNaN(num)) return undefined;
    return jobs.find((j) => j.id === num);
};

const formatNum = (n: number): string =>
    Number.isFinite(n)
        ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : "-";

const formatStatValue = (
    range: CharacterStatRange | undefined,
    def: StatDefinition | undefined
): string => {
    if (!range || !def) return "-";

    const { value_min, value_max } = range;
    const suffix = def.is_percentage ? "%" : "";

    if (value_min === value_max) {
        return `${formatNum(value_min)}${suffix}`;
    }
    return `${formatNum(value_min)} - ${formatNum(value_max)}${suffix}`;
};

/* ---------- COMPONENT ---------- */

const CharacterStats: React.FC<CharacterStatsProps> = ({
    theme,
    selection,
}) => {
    const cfg = themeConfigs[theme];

    // โหลดข้อมูลจาก JSON ทั้งหมด
    const jobs = useMemo<JobDefinition[]>(
        () => ((jobsData as JobsJson).jobs || []),
        []
    );

    const allCharacters = useMemo<CharacterDefinition[]>(
        () => ((charactersData as CharactersJson).characters || []),
        []
    );

    const statsMeta = useMemo<StatDefinition[]>(
        () => ((statsMetaData as StatsMetaJson).stats || []),
        []
    );

    const statMetaByTypeId = useMemo(() => {
        const m = new Map<number, StatDefinition>();
        statsMeta.forEach((s) => m.set(s.type_id, s));
        return m;
    }, [statsMeta]);

    const { level, baseId, class1Id, class2Id } = selection;
    const numericLevel = Number(level) || 0;

    // หา job จาก id ที่เลือกใน selector
    const baseJob = baseId ? findJobById(jobs, baseId) : undefined;
    const class1Job = class1Id ? findJobById(jobs, class1Id) : undefined;
    const class2Job = class2Id ? findJobById(jobs, class2Id) : undefined;

    // เช็ค required_level: ถ้าเลเวลไม่ถึง ก็ยังไม่ถือว่าใช้ได้
    const effectiveBase =
        baseJob && numericLevel >= baseJob.required_level ? baseJob : undefined;
    const effectiveClass1 =
        class1Job && numericLevel >= class1Job.required_level
            ? class1Job
            : undefined;
    const effectiveClass2 =
        class2Job && numericLevel >= class2Job.required_level
            ? class2Job
            : undefined;

    // เลือก class ที่สูงสุดที่เลเวลถึง
    const highestJob = effectiveClass2 || effectiveClass1 || effectiveBase;

    const jobName = formatJobName(highestJob?.name);
    const levelDisplay = level || "-";

    // หา character จาก character_stats.json ด้วย class_name + level
    const currentCharacter = useMemo(() => {
        if (!highestJob || !numericLevel) return undefined;

        const jobNameLower = highestJob.name.toLowerCase();
        return allCharacters.find(
            (c) =>
                c.level === numericLevel &&
                c.class_name.toLowerCase() === jobNameLower
        );
    }, [allCharacters, highestJob, numericLevel]);

    // สำหรับ Base Info: HP / MP / MP Recov (type_id 0,1,2)
    const getBaseStatDisplay = (typeId: number): string => {
        const def = statMetaByTypeId.get(typeId);
        if (!currentCharacter || !def) return "-";
        const range = currentCharacter.stats.find((s) => s.type_id === typeId);
        return formatStatValue(range, def);
    };

    // เตรียม Category ตาม DEFAULT_CATEGORIES + ค่าใน JSON (ถ้ามี)
    const finalCategories = useMemo(
        () =>
            DEFAULT_CATEGORIES.map((cat) => {
                const rows = cat.stats.map((displayName) => {
                    const meta =
                        statsMeta.find(
                            (s) =>
                                s.display_name.toLowerCase() === displayName.toLowerCase()
                        ) || undefined;

                    if (!meta || !currentCharacter) {
                        return {
                            display: displayName,
                            value: "-",
                        };
                    }

                    const range = currentCharacter.stats.find(
                        (s) => s.type_id === meta.type_id
                    );

                    return {
                        display: displayName,
                        value: formatStatValue(range, meta),
                    };
                });

                return {
                    catName: cat.catName,
                    rows,
                };
            }),
        [statsMeta, currentCharacter]
    );

    const hasCharacterData = !!currentCharacter;

    return (
        <div className="pl-4">
            {/* ---------- Base Info ---------- */}
            <div className={`border-l-2 pl-4 mb-3 ${cfg.accentText}`}>
                <h2
                    className={`
            ${cfg.accentText}
            uppercase text-sm mb-3 font-mono tracking-wide
          `}
                >
                    Base Info
                </h2>
            </div>

            <ul
                className={`
          ${cfg.bodyText}
          space-y-1 text-xs font-mono
        `}
            >
                <li>
                    <span className="font-semibold">Job</span> : {jobName}
                </li>
                <li>
                    <span className="font-semibold">Lv</span> : {levelDisplay}
                </li>
                <li>
                    <span className="font-semibold">HP</span> : {getBaseStatDisplay(0)}
                </li>
                <li>
                    <span className="font-semibold">MP</span> : {getBaseStatDisplay(1)}
                </li>
                <li>
                    <span className="font-semibold">MP Recov</span> :{" "}
                    {getBaseStatDisplay(2)}
                </li>
            </ul>

            {/* ---------- Stat Categories (default + JSON) ---------- */}
            <div className="mt-5 pb-3">
                {finalCategories.map((group) => (
                    <div key={group.catName} className="mt-4">
                        <h3
                            className={`
                ${cfg.accentText}
                uppercase text-sm mb-2 font-mono tracking-wide
              `}
                        >
                            {group.catName}
                        </h3>

                        <ul
                            className={`
                ${cfg.bodyText}
                space-y-1 text-xs font-mono
              `}
                        >
                            {group.rows.map((row) => (
                                <li key={row.display}>
                                    <span className="font-semibold">{row.display}</span> :{" "}
                                    {row.value}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {!hasCharacterData && (
                <div className={`${cfg.mutedText} text-[11px] mt-2 font-mono`}>
                    * ไม่มีข้อมูลที่ตรงกับ Job / Level ใน character_stats.json
                    (จึงแสดงค่าเป็น "-" ไว้ก่อน)
                </div>
            )}
        </div>
    );
};

export default CharacterStats;
