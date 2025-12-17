import React, { useMemo } from "react";
import { themeConfigs, type ThemeKey } from "../themes";
import jobsData from "../data/m.jobs.json";
import statsMetaData from "../data/m.stats.json";
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

/**
 * Meta stat definition (from m.stats.json)
 */
interface StatMetaDefinition {
    stat_id: number;
    stat_name: string;
    display_name: string;
    stat_cat_id: number;
    stat_cat_name: string;
    is_percentage: number; // 0 | 1
}

interface StatsMetaJson {
    stats: StatMetaDefinition[];
}

interface CharacterStatsProps {
    theme: ThemeKey;
    selection: CharacterSelectionState;
}

/* ---------- CONSTANTS ---------- */

// หมวดที่ต้องการให้แสดงตายตัวเสมอ
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

/* ---------- COMPONENT ---------- */

const CharacterStats: React.FC<CharacterStatsProps> = ({
    theme,
    selection,
}) => {
    const cfg = themeConfigs[theme];

    /* ---------- LOAD JSON ---------- */

    const jobs = useMemo<JobDefinition[]>(
        () => (jobsData as JobsJson).jobs ?? [],
        []
    );

    const statsMeta = useMemo<StatMetaDefinition[]>(
        () => (statsMetaData as StatsMetaJson).stats ?? [],
        []
    );

    /* ---------- JOB / LEVEL ---------- */

    const { level, baseId, class1Id, class2Id } = selection;
    const numericLevel = Number(level) || 0;

    const baseJob = baseId ? findJobById(jobs, baseId) : undefined;
    const class1Job = class1Id ? findJobById(jobs, class1Id) : undefined;
    const class2Job = class2Id ? findJobById(jobs, class2Id) : undefined;

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

    const highestJob = effectiveClass2 || effectiveClass1 || effectiveBase;

    const jobName = formatJobName(highestJob?.name);
    const levelDisplay = level || "-";

    /* ---------- STAT DISPLAY (NO CHARACTER DATA) ---------- */

    const finalCategories = useMemo(
        () =>
            DEFAULT_CATEGORIES.map((cat) => {
                const rows = cat.stats.map((displayName) => {
                    const meta = statsMeta.find(
                        (s) =>
                            s.display_name.toLowerCase() ===
                            displayName.toLowerCase()
                    );

                    return {
                        display: displayName,
                        value: meta ? "-" : "-",
                    };
                });

                return {
                    catName: cat.catName,
                    rows,
                };
            }),
        [statsMeta]
    );

    /* ---------- RENDER ---------- */

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
                    <span className="font-semibold">HP</span> : -
                </li>
                <li>
                    <span className="font-semibold">MP</span> : -
                </li>
                <li>
                    <span className="font-semibold">MP Recov</span> : -
                </li>
            </ul>

            {/* ---------- Stat Categories ---------- */}
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
                                    <span className="font-semibold">
                                        {row.display}
                                    </span>{" "}
                                    : {row.value}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CharacterStats;
