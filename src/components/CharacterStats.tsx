// src/components/CharacterStats.tsx
import React, { useMemo } from "react";
import { themeConfigs, type ThemeKey } from "../themes";
import jobsData from "../data/jobs.json";
import type { CharacterSelectionState } from "../state/AppMemory";

/* ---------- TYPES ---------- */

interface JobLink {
  id: number;
}

interface JobDefinition {
  id: number;
  name: string;
  class_id: number;
  class_name: string;
  inherit: number;
  required_level: number;
  next_classes: JobLink[];
}

interface JobsJson {
  jobs: JobDefinition[];
}

interface CharacterStatsProps {
  theme: ThemeKey;
  selection: CharacterSelectionState;
}

/* ---------- HELPERS ---------- */

const formatJobName = (name: string): string => {
  if (!name) return "";
  const lower = name.toLowerCase().trim();

  if (lower === "bowmaster") {
    return "Bow Master";
  }

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
  if (Number.isNaN(num)) return undefined;
  return jobs.find((j) => j.id === num);
};

/* ---------- COMPONENT ---------- */

const CharacterStats: React.FC<CharacterStatsProps> = ({
  theme,
  selection,
}) => {
  const cfg = themeConfigs[theme];

  const jobs = useMemo<JobDefinition[]>(
    () => ((jobsData as JobsJson).jobs || []),
    []
  );

  const { level, baseId, class1Id, class2Id } = selection;

  const numericLevel = useMemo(() => {
    const n = Number(level);
    return Number.isFinite(n) ? n : 0;
  }, [level]);

  const baseJob = baseId ? findJobById(jobs, baseId) : undefined;
  const class1Job = class1Id ? findJobById(jobs, class1Id) : undefined;
  const class2Job = class2Id ? findJobById(jobs, class2Id) : undefined;

  // ตรวจว่าแต่ละ class ใช้ได้จริงตาม required_level มั้ย
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

  // เลือก class ที่สูงที่สุดที่ "เลเวลถึง" จริง ๆ
  const highestJob = effectiveClass2 || effectiveClass1 || effectiveBase;

  const jobName = highestJob ? formatJobName(highestJob.name) : "-";
  const levelDisplay = level || "-";

  return (
    <div className="pl-4">
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
          <span className="font-semibold">HP</span> : xxxx
        </li>
        <li>
          <span className="font-semibold">MP</span> : xxxx
        </li>
        <li>
          <span className="font-semibold">MP Recov</span> : xx
        </li>
      </ul>
    </div>
  );
};

export default CharacterStats;
