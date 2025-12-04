// src/App.tsx
import React, { useState } from "react";
import {
  themeConfigs,
  themeOrder,
  DEFAULT_THEME,
  type ThemeKey,
} from "./themes";
import CharacterSelectors from "./components/CharacterSelectors";
import TabExport from "./components/TabExport";
import CharacterStats from "./components/CharacterStats";
import TabItems from "./components/TabItems";
import {
  AppMemory,
  type AppMemoryState,
  type CharacterSelectionState,
} from "./state/AppMemory";

/* ------------------------ TYPES ------------------------ */

type ActiveTab = "Items" | "Tap2" | "Tap3" | "Tapxxx" | "Export";

/* ------------------------ CONSTANTS ------------------------ */

const APP_VERSION = "0.1.0";

interface TabContentProps {
  tab: ActiveTab;
  accentClass: string;
  textClass: string;
  mutedClass: string;
}

const TabContent: React.FC<TabContentProps> = ({
  tab,
  accentClass,
  textClass,
  mutedClass,
}) => (
  <div className="p-4">
    <h4 className={`${accentClass} text-xl font-bold mb-4`}>
      Content for {tab}
    </h4>
    <p className={`${textClass} text-sm mb-4`}>
      Put tab-specific details, graphs, skills, or gear here.
    </p>
    <div className={`text-xs font-mono space-y-1 ${mutedClass}`}>
      <p>Status: ONLINE</p>
      <p>Last Access: {new Date().toLocaleTimeString()}</p>
      <p>
        {Array.from({ length: 500 })
          .map(() => "Status: ONLINE")
          .join(" ")}
      </p>
      <p>END</p>
    </div>
  </div>
);

/* ------------------------ MAIN APP ------------------------ */

const App: React.FC = () => {
  // UI state (ไม่เก็บใน memory)
  const [theme, setTheme] = useState<ThemeKey>(DEFAULT_THEME);
  const [activeTab, setActiveTab] = useState<ActiveTab>("Items");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // โหลด memory เริ่มต้น (อาจมาจาก URL)
  const initialMemory = AppMemory.load();
  const [characterSelection, setCharacterSelection] =
    useState<CharacterSelectionState>(initialMemory.character);

  const cfg = themeConfigs[theme];

  const handleThemeChange = (nextTheme: ThemeKey) => {
    setTheme(nextTheme);
    setSettingsOpen(false);
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  const handleToggleSettings = () => {
    setSettingsOpen((prev) => !prev);
  };

  const updateCharacterSelection = (
    patch: Partial<CharacterSelectionState>
  ) => {
    setCharacterSelection((prev) => {
      const next: CharacterSelectionState = { ...prev, ...patch };
      AppMemory.patch({ character: next });
      return next;
    });
  };

  const currentMemory: AppMemoryState = AppMemory.load();

  return (
    <div className={`${cfg.root} font-sans h-screen flex flex-col`}>
      {/* HEADER */}
      <header
        className={`
          w-full h-28 px-6 border-b
          ${cfg.header}
          backdrop-blur flex items-center justify-between
        `}
      >
        {/* LEFT: Logo & title */}
        <div className="flex items-center gap-4">
          <div
            className={`
              h-14 w-14 rounded-xl
              bg-linear-to-br ${cfg.logoRing}
              shadow-[0_0_20px_rgba(16,185,129,0.6)]
              flex items-center justify-center
            `}
          >
            <span className="text-[11px] font-black tracking-[0.22em] text-emerald-300">
              DNC
            </span>
          </div>

          <div>
            <div
              className={`${cfg.accentText} text-[11px] uppercase tracking-[0.35em]`}
            >
              Dragon Nest
            </div>
            <div className="text-xl font-semibold">DNC Simulator</div>
            <div className={`${cfg.subtitleText} text-[11px]`}>
              Character Builder • Gear Planner • Damage Calc
            </div>
          </div>
        </div>

        {/* RIGHT: version + settings (gear) + dropdowns */}
        <div className="flex-1 flex flex-col items-end gap-2">
          {/* Row 1: version + settings button */}
          <div className="flex items-center gap-3 text-[11px]">
            <span
              className={`
                px-2 py-1 rounded-full font-mono
                ${cfg.badge}
              `}
            >
              v{APP_VERSION}
            </span>

            {/* Settings gear + dropdown */}
            <div className="relative">
              <button
                onClick={handleToggleSettings}
                className="
                  p-2 rounded-full border border-slate-600
                  bg-slate-900/60 hover:bg-slate-800
                  flex items-center justify-center
                "
                aria-label="Settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-emerald-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.4 15a1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 3.4 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 3.4a1.65 1.65 0 0 0 1-1.51V2a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 16 3.4a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20.6 9a1.65 1.65 0 0 0 1.51 1H22a2 2 0 0 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15z" />
                </svg>
              </button>

              {settingsOpen && (
                <div
                  className="
                    absolute right-0 mt-2 w-56 rounded-md border border-slate-700
                    bg-slate-950/95 shadow-xl z-50
                  "
                >
                  <div className="px-3 py-2 border-b border-slate-700 text-[11px] uppercase tracking-wide text-slate-300">
                    Settings
                  </div>
                  <ul className="py-1 text-xs">
                    <li className="px-3 py-1.5 text-slate-400 uppercase tracking-wide text-[10px]">
                      Theme
                    </li>
                    {themeOrder.map((key) => (
                      <li key={key}>
                        <button
                          className={`
                            w-full flex items-center justify-between px-3 py-1.5 text-left
                            hover:bg-slate-800 text-slate-200
                            ${key === theme ? "bg-slate-800/70" : ""}
                          `}
                          onClick={() => handleThemeChange(key)}
                        >
                          <span>{themeConfigs[key].label}</span>
                          {key === theme && (
                            <span className="text-emerald-300 text-[10px] font-mono">
                              ACTIVE
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                    <li className="px-3 py-2 mt-1 border-t border-slate-800 text-[11px] text-slate-500">
                      More settings coming soon...
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Character selectors */}
          <CharacterSelectors
            theme={theme}
            selection={characterSelection}
            onSelectionChange={updateCharacterSelection}
          />
        </div>
      </header>

      {/* BODY GRID */}
      <div className="flex-1 grid grid-cols-12 gap-3 w-full p-4 min-h-0">
        {/* SIDEBAR */}
        <aside
          className={`
            col-span-3 h-full p-4 rounded-xl overflow-y-auto
            ${themeConfigs[theme].sidebarCard}
          `}
        >
          {/* Base Info / Job / Lv จาก memory */}
          <CharacterStats theme={theme} selection={characterSelection} />
        </aside>

        {/* MAIN CONTENT */}
        <main
          className={`
            col-span-9 flex flex-col rounded-xl overflow-hidden min-h-0
            ${themeConfigs[theme].mainCard}
          `}
        >
          {/* Tabs */}
          <div className="flex space-x-1 px-3 pt-3">
            {["Items", "Tap2", "Tap3", "Tapxxx", "Export"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab as ActiveTab)}
                className={`
                  py-2 px-4 text-xs font-mono uppercase tracking-wide rounded-t-md border
                  ${activeTab === tab
                    ? themeConfigs[theme].tabActive
                    : themeConfigs[theme].tabInactive
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content box */}
          <div className="flex-1 px-3 pb-3 min-h-0">
            <div
              className={`
                w-full h-full border-2 rounded-md shadow-inner
                overflow-y-auto overflow-x-hidden
                ${themeConfigs[theme].innerBox} ${themeConfigs[theme].sectionBorder}
              `}
            >
              {activeTab === "Export" && (
                <TabExport theme={theme} memory={currentMemory} />
              )}

              {activeTab === "Items" && <TabItems theme={theme} />}

              {activeTab !== "Items" && activeTab !== "Export" && (
                <TabContent
                  tab={activeTab}
                  accentClass={themeConfigs[theme].accentText}
                  textClass={themeConfigs[theme].bodyText}
                  mutedClass={themeConfigs[theme].mutedText}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
