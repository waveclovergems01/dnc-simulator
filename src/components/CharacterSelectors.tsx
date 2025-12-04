// src/components/CharacterSelectors.tsx
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
  class_id: number; // 0 = base, 1 = class 1, 2 = class 2
  class_name: string;
  inherit: number; // -1 = ไม่มี parent, อื่นๆ = id ของ class ก่อนหน้า
  required_level: number; // เลเวลที่ต้องมีถึงจะใช้ class นี้ได้
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
  selection: CharacterSelectionState;
  onSelectionChange: (patch: Partial<CharacterSelectionState>) => void;
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

// helper หา job จาก id
const findJobById = (
  jobs: JobDefinition[],
  id: string
): JobDefinition | undefined => {
  const num = Number(id);
  if (Number.isNaN(num)) return undefined;
  return jobs.find((j) => j.id === num);
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

const CharacterSelectors: React.FC<CharacterSelectorsProps> = ({
  theme,
  selection,
  onSelectionChange,
}) => {
  const cfg = themeConfigs[theme];

  // jobs จากไฟล์ json ทำเป็น useMemo ให้ reference คงที่
  const jobs = useMemo<JobDefinition[]>(
    () => ((jobsData as JobsJson).jobs || []),
    []
  );

  const { level, baseId, class1Id, class2Id } = selection;

  const numericLevel = useMemo(() => {
    const n = Number(level);
    return Number.isFinite(n) ? n : 0;
  }, [level]);

  const selectedBase = useMemo(
    () => findJobById(jobs, baseId),
    [jobs, baseId]
  );
  const selectedClass1 = useMemo(
    () => findJobById(jobs, class1Id),
    [jobs, class1Id]
  );

  // base = class_id 0
  const baseJobs = useMemo(
    () => jobs.filter((j) => j.class_id === 0),
    [jobs]
  );

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

  const handleLevelChange = (value: string) => {
    // ปรับ level + เคลียร์ class ตาม required_level เสมอ
    const n = Number(value);
    const newNumericLevel = Number.isFinite(n) ? n : 0;

    const patch: Partial<CharacterSelectionState> = { level: value };

    // ถ้าไม่มี level เลย → เคลียร์ทั้ง class1 / class2
    if (!value) {
      patch.class1Id = "";
      patch.class2Id = "";
      onSelectionChange(patch);
      return;
    }

    // ตรวจ class1 ปัจจุบันยัง valid ตาม level ไหม
    const currentClass1 = findJobById(jobs, selection.class1Id);
    if (!currentClass1 || newNumericLevel < currentClass1.required_level) {
      // level ไม่ถึงหรือไม่มี class1 → เคลียร์ class1 & class2
      patch.class1Id = "";
      patch.class2Id = "";
      onSelectionChange(patch);
      return;
    }

    // class1 ยังใช้ได้อยู่ → เช็ค class2 ต่อ
    const currentClass2 = findJobById(jobs, selection.class2Id);
    if (!currentClass2 || newNumericLevel < currentClass2.required_level) {
      // class2 ใช้ไม่ได้แล้ว → เคลียร์เฉพาะ class2
      patch.class2Id = "";
    }

    onSelectionChange(patch);
  };

  const handleBaseChange = (id: string) => {
    // เปลี่ยน base แล้วเคลียร์ class 1 และ class 2
    onSelectionChange({ baseId: id, class1Id: "", class2Id: "" });
  };

  const handleClass1Change = (id: string) => {
    // เปลี่ยน class1 แล้วเคลียร์ class 2
    onSelectionChange({ class1Id: id, class2Id: "" });
  };

  const handleClass2Change = (id: string) => {
    onSelectionChange({ class2Id: id });
  };

  /* ---------- OPTIONS ---------- */

  const levelOptions: DropdownOption[] = [
    { label: "- Select Level -", value: "" },
    { label: "1", value: "1" },
    { label: "16", value: "16" },
    { label: "32", value: "32" },
    { label: "40", value: "40" },
    { label: "45", value: "45" },
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

  // filter class 1 ให้เหลือเฉพาะ job ที่ level ถึง required_level
  const availableClass1Jobs = useMemo(
    () =>
      class1Jobs.filter(
        (job) => numericLevel >= job.required_level
      ),
    [class1Jobs, numericLevel]
  );

  let class1Placeholder = "";
  if (!baseId) {
    class1Placeholder = "Select Base first";
  } else if (!level) {
    class1Placeholder = "Select Level first";
  } else if (availableClass1Jobs.length === 0) {
    class1Placeholder = "Level too low";
  } else {
    class1Placeholder = "- Select Class 1 -";
  }

  const class1Options: DropdownOption[] = [
    {
      label: class1Placeholder,
      value: "",
    },
    ...availableClass1Jobs.map((job) => ({
      label: formatJobName(job.name),
      value: String(job.id),
    })),
  ];

  // filter class 2 ให้เหลือเฉพาะ job ที่ level ถึง required_level
  const availableClass2Jobs = useMemo(
    () =>
      class2Jobs.filter(
        (job) => numericLevel >= job.required_level
      ),
    [class2Jobs, numericLevel]
  );

  let class2Placeholder = "";
  if (!class1Id) {
    class2Placeholder = "Select Class 1 first";
  } else if (!level) {
    class2Placeholder = "Select Level first";
  } else if (availableClass2Jobs.length === 0) {
    class2Placeholder = "Level too low";
  } else {
    class2Placeholder = "- Select Class 2 -";
  }

  const class2Options: DropdownOption[] = [
    {
      label: class2Placeholder,
      value: "",
    },
    ...availableClass2Jobs.map((job) => ({
      label: formatJobName(job.name),
      value: String(job.id),
    })),
  ];

  // "ค่าที่แสดงใน dropdown" จะ reset เป็น "" ถ้า level ไม่ถึง required_level
  const safeClass1Value = useMemo(() => {
    const job = findJobById(jobs, class1Id);
    if (!job) return "";
    if (!level || numericLevel < job.required_level) return "";
    return class1Id;
  }, [jobs, class1Id, level, numericLevel]);

  const safeClass2Value = useMemo(() => {
    const job = findJobById(jobs, class2Id);
    if (!job) return "";
    if (!level || numericLevel < job.required_level) return "";
    return class2Id;
  }, [jobs, class2Id, level, numericLevel]);

  const class1Disabled =
    !baseId || !level || availableClass1Jobs.length === 0;
  const class2Disabled =
    !baseId ||
    !class1Id ||
    !level ||
    availableClass2Jobs.length === 0;

  return (
    <div className="grid grid-cols-4 gap-4 w-[50%] min-w-[480px]">
      <Dropdown
        label="Level"
        options={levelOptions}
        value={level}
        onChange={handleLevelChange}
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
        value={safeClass1Value}
        onChange={handleClass1Change}
        labelClass={cfg.dropdownLabel}
        selectClass={cfg.dropdownSelect}
        disabled={class1Disabled}
      />
      <Dropdown
        label="Class 2"
        options={class2Options}
        value={safeClass2Value}
        onChange={handleClass2Change}
        labelClass={cfg.dropdownLabel}
        selectClass={cfg.dropdownSelect}
        disabled={class2Disabled}
      />
    </div>
  );
};

export default CharacterSelectors;
