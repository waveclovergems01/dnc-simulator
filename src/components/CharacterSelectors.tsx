// src/CharacterSelectors.tsx
import React from "react";
import { themeConfigs, type ThemeKey } from "../themes";

interface DropdownProps {
  label: string;
  options: string[];
  labelClass: string;
  selectClass: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  labelClass,
  selectClass,
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
      `}
    >
      {options.map((opt, index) => (
        <option key={index} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

interface CharacterSelectorsProps {
  theme: ThemeKey;
}

const CharacterSelectors: React.FC<CharacterSelectorsProps> = ({ theme }) => {
  const cfg = themeConfigs[theme];

  return (
    <div className="grid grid-cols-4 gap-4 w-[50%] min-w-[480px]">
      <Dropdown
        label="Level"
        options={["32", "40", "50", "60"]}
        labelClass={cfg.dropdownLabel}
        selectClass={cfg.dropdownSelect}
      />
      <Dropdown
        label="Base"
        options={["Warrior", "Archer", "Sorceress", "Cleric"]}
        labelClass={cfg.dropdownLabel}
        selectClass={cfg.dropdownSelect}
      />
      <Dropdown
        label="Class 1"
        options={["Gladiator", "Sniper", "Priest", "Elementalist"]}
        labelClass={cfg.dropdownLabel}
        selectClass={cfg.dropdownSelect}
      />
      <Dropdown
        label="Class 2"
        options={["Awaken 1", "Awaken 2", "Dark Avenger"]}
        labelClass={cfg.dropdownLabel}
        selectClass={cfg.dropdownSelect}
      />
    </div>
  );
};

export default CharacterSelectors;
