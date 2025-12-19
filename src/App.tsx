// src/App.tsx
import React, { useEffect, useState } from "react";
import {
  themeConfigs,
  themeOrder,
  DEFAULT_THEME,
  type ThemeKey,
} from "./themes";

import CharacterSelectors from "./components/CharacterSelectors";
import CharacterStats from "./components/CharacterStats";
import TabItems from "./components/TabItems";
import TabExport from "./components/TabExport";

import { AppMemory } from "./state/AppMemory";
import { useAppMemory } from "./state/useAppMemory.ts";
import { restoreStateFromUrl } from "./state/RestoreStateFromUrl";

/* ---------------- TYPES ---------------- */

type ActiveTab = "Items" | "Tap2" | "Tap3" | "Tapxxx" | "Export";

/* ---------------- CONSTANTS ---------------- */

const APP_VERSION = "0.1.0";

/* ---------------- APP ---------------- */

const App: React.FC = () => {
  // UI-only state
  const [theme, setTheme] = useState<ThemeKey>(DEFAULT_THEME);
  const [activeTab, setActiveTab] = useState<ActiveTab>("Items");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 🔔 Subscribe global memory (Delegate)
  const memory = useAppMemory();

  // Restore URL → patch memory → auto notify
  useEffect(() => {
    restoreStateFromUrl();
  }, []);

  const cfg = themeConfigs[theme];

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
        {/* LEFT */}
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
            <div className={`${cfg.accentText} text-[11px] uppercase tracking-[0.35em]`}>
              Dragon Nest
            </div>
            <div className="text-xl font-semibold">DNC Simulator</div>
            <div className={`${cfg.subtitleText} text-[11px]`}>
              Character Builder • Gear Planner • Damage Calc
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 flex flex-col items-end gap-2">
          <div className="flex items-center gap-3 text-[11px]">
            <span className={`px-2 py-1 rounded-full font-mono ${cfg.badge}`}>
              v{APP_VERSION}
            </span>

            {/* SETTINGS */}
            <div className="relative">
              <button
                onClick={() => setSettingsOpen((v) => !v)}
                className="p-2 rounded-full border border-slate-600 bg-slate-900/60 hover:bg-slate-800"
              >
                ⚙
              </button>

              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md border border-slate-700 bg-slate-950/95 shadow-xl z-50">
                  <div className="px-3 py-2 border-b border-slate-700 text-[11px] uppercase">
                    Settings
                  </div>
                  <ul className="py-1 text-xs">
                    {themeOrder.map((key) => (
                      <li key={key}>
                        <button
                          className={`w-full px-3 py-1.5 text-left hover:bg-slate-800 ${key === theme ? "bg-slate-800/70" : ""
                            }`}
                          onClick={() => {
                            setTheme(key);
                            setSettingsOpen(false);
                          }}
                        >
                          {themeConfigs[key].label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* CHARACTER SELECTORS */}
          <CharacterSelectors
            theme={theme}
            selection={memory.character}
            onSelectionChange={(patch) =>
              AppMemory.patch({
                character: {
                  ...memory.character,
                  ...patch,
                },
              })
            }
          />
        </div>
      </header>

      {/* BODY */}
      <div className="flex-1 grid grid-cols-12 gap-3 w-full p-4 min-h-0">
        <aside
          className={`col-span-3 h-full p-4 rounded-xl overflow-y-auto ${cfg.sidebarCard}`}
        >
          <CharacterStats theme={theme} selection={memory.character} />
        </aside>

        <main
          className={`col-span-9 flex flex-col rounded-xl overflow-hidden min-h-0 ${cfg.mainCard}`}
        >
          <div className="flex space-x-1 px-3 pt-3">
            {["Items", "Tap2", "Tap3", "Tapxxx", "Export"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as ActiveTab)}
                className={`
                  py-2 px-4 text-xs font-mono uppercase tracking-wide rounded-t-md border
                  ${activeTab === tab ? cfg.tabActive : cfg.tabInactive}
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 px-3 pb-3 min-h-0">
            <div
              className={`w-full h-full border-2 rounded-md shadow-inner overflow-y-auto ${cfg.innerBox} ${cfg.sectionBorder}`}
            >
              {activeTab === "Items" && <TabItems theme={theme} />}
              {activeTab === "Export" && (
                <TabExport theme={theme} memory={memory} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
