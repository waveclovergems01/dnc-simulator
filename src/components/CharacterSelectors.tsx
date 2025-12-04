// src/components/CharacterSelectors.tsx
import React, { useMemo, useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";
import jobsData from "../data/jobs.json";

/* ---------- TYPES ---------- */

interface JobLink {
  id: number;
}

interface JobDefinition {
  id: number;
  name: string;
  class_id: number; // 0 = base, 1 = class 1, 2 = class 2
  class_name: string;
  inherit: number; // -1 = ไม่มี parent, อื่นๆ = id ของ class ก่อนหน้า
  next_classes: JobLink[];
}

interface JobsJson {
  jobs: JobDefinition[];
}

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  labelClass: string;
  selectClass: string;
  disabled?: boolean;
}

interface CharacterSelectorsProps {
  theme: ThemeKey;
}

/* ---------- HELPERS ---------- */

// แปลงชื่ออาชีพให้เป็น Warrior, Bow Master, Shooting Star, ...
const formatJobName = (name: string): string => {
  if (!name) return "";
  const lower = name.toLowerCase().trim();

  // เคสพิเศษที่เขียนติดกันใน JSON
  if (lower === "bowmaster") {
    return "Bow Master";
  }

  // default: title case ตามคำที่คั่นด้วย space
  return lower
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

/* ---------- DROPDOWN COMPONENT ---------- */

const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  value,
  onChange,
  labelClass,
  selectClass,
  disabled,
}) => (
  <div className="flex flex-col text-xs w-full">
    <span
      className={`${labelClass} uppercase font-semibold tracking-wide mb-1`}
    >
      {label}
    </span>
    <select
      className={`
        ${selectClass}
        rounded-md px-2 py-1.5 shadow-inner text-xs
        focus:outline-none focus:ring-2 focus:ring-emerald-400
        transition w-full
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}
      `}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

/* ---------- MAIN COMPONENT ---------- */

const CharacterSelectors: React.FC<CharacterSelectorsProps> = ({ theme }) => {
  const cfg = themeConfigs[theme];

  const jobs = (jobsData as JobsJson).jobs || [];

  // base = class_id 0
  const baseJobs = useMemo(
    () => jobs.filter((j) => j.class_id === 0),
    [jobs]
  );

  // state เริ่มต้นเป็น "ยังไม่เลือก"
  const [level, setLevel] = useState<string>("");
  const [baseId, setBaseId] = useState<string>("");
  const [class1Id, setClass1Id] = useState<string>("");
  const [class2Id, setClass2Id] = useState<string>("");

  const findJobById = (id: string): JobDefinition | undefined => {
    const num = Number(id);
    if (Number.isNaN(num)) return undefined;
    return jobs.find((j) => j.id === num);
  };

  const selectedBase = useMemo(() => findJobById(baseId), [baseId, jobs]);
  const selectedClass1 = useMemo(() => findJobById(class1Id), [class1Id, jobs]);

  // class 1 options = inherit = base.id
  const class1Jobs = useMemo(() => {
    if (!selectedBase) return [];
    return jobs.filter(
      (j) => j.class_id === 1 && j.inherit === selectedBase.id
    );
  }, [jobs, selectedBase]);

  // class 2 options = inherit = class1.id
  const class2Jobs = useMemo(() => {
    if (!selectedClass1) return [];
    return jobs.filter(
      (j) => j.class_id === 2 && j.inherit === selectedClass1.id
    );
  }, [jobs, selectedClass1]);

  /* ---------- HANDLERS ---------- */

  const handleBaseChange = (id: string) => {
    setBaseId(id);
    // เปลี่ยน base แล้วเคลียร์ class 1 และ class 2
    setClass1Id("");
    setClass2Id("");
  };

  const handleClass1Change = (id: string) => {
    setClass1Id(id);
    // เปลี่ยน class1 แล้วเคลียร์ class 2
    setClass2Id("");
  };

  const handleClass2Change = (id: string) => {
    setClass2Id(id);
  };

  /* ---------- OPTIONS ---------- */

  const levelOptions: DropdownOption[] = [
    { label: "- Select Level -", value: "" },
    { label: "32", value: "32" },
    { label: "40", value: "40" },
    { label: "50", value: "50" },
    { label: "60", value: "60" },
  ];

  const baseOptions: DropdownOption[] = [
    { label: "- Select Base -", value: "" },
    ...baseJobs.map((job) => ({
      label: formatJobName(job.name),
      value: String(job.id),
    })),
  ];

  const class1Options: DropdownOption[] = [
    {
      label: baseId ? "- Select Class 1 -" : "Select Base first",
      value: "",
    },
    ...(baseId
      ? class1Jobs.map((job) => ({
          label: formatJobName(job.name),
          value: String(job.id),
        }))
      : []),
  ];

  const class2Options: DropdownOption[] = [
    {
      label: class1Id ? "- Select Class 2 -" : "Select Class 1 first",
      value: "",
    },
    ...(class1Id
      ? class2Jobs.map((job) => ({
          label: formatJobName(job.name),
          value: String(job.id),
        }))
      : []),
  ];

  // disabled flags
  const class1Disabled = !baseId;
  const class2Disabled = !baseId || !class1Id;

  return (
    <div className="grid grid-cols-4 gap-4 w-[50%] min-w-[480px]">
      <Dropdown
        label="Level"
        options={levelOptions}
        value={level}
        onChange={setLevel}
        labelClass={cfg.dropdownLabel}
        selectClass={cfg.dropdownSelect}
      />
      <Dropdown
        label="Base"
        options={baseOptions}
        value={baseId}
        onChange={handleBaseChange}
        labelClass={cfg.dropdownLabel}
        selectClass={cfg.dropdownSelect}
      />
      <Dropdown
        label="Class 1"
        options={class1Options}
        value={class1Id}
        onChange={handleClass1Change}
        labelClass={cfg.dropdownLabel}
        selectClass={cfg.dropdownSelect}
        disabled={class1Disabled}
      />
      <Dropdown
        label="Class 2"
        options={class2Options}
        value={class2Id}
        onChange={handleClass2Change}
        labelClass={cfg.dropdownLabel}
        selectClass={cfg.dropdownSelect}
        disabled={class2Disabled}
      />
    </div>
  );
};

export default CharacterSelectors;
