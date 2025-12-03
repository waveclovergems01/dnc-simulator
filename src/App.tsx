import React, { useState } from "react";
import {
  themeConfigs,
  themeOrder,
  DEFAULT_THEME,
  type ThemeKey,
} from "./themes";
import CharacterSelectors from "./components/CharacterSelectors";

/* ------------------------ TYPES ------------------------ */
type ActiveTab = "Tap1" | "Tap2" | "Tap3" | "Tapxxx";

interface InfoItem {
  label: string;
  value: string;
}

/* ------------------------ CONSTANTS ------------------------ */

const APP_VERSION = "0.1.0";

const baseInfo: InfoItem[] = [
  { label: "Job", value: "xxxxx" },
  { label: "Lv", value: "xx" },
  { label: "HP", value: "xxxx" },
  { label: "MP", value: "xxxx" },
  { label: "MP Recov", value: "xx" },
];

const basicStats: string[] = [
  "xx : xxxxx",
  "xx : xx",
  "xx : xxxx",
  "xx : xxxx",
  "xx : xx",
];

interface RepeatingSectionProps {
  title: string;
  titleClass: string;
  textClass: string;
  borderClass: string;
}

const RepeatingSection: React.FC<RepeatingSectionProps> = ({
  title,
  titleClass,
  textClass,
  borderClass,
}) => (
  <div className={`mt-6 pt-4 border-t ${borderClass}`}>
    <h3
      className={`${titleClass} uppercase text-sm mb-2 font-mono tracking-wide`}
    >
      {title}
    </h3>
    <ul className={`${textClass} space-y-1 text-xs font-mono`}>
      {basicStats.map((stat, idx) => (
        <li key={idx}>{stat}</li>
      ))}
    </ul>
  </div>
);

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

      {/* ข้อความยาว ๆ ไว้ทดสอบ vertical scroll */}
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
  const [activeTab, setActiveTab] = useState<ActiveTab>("Tap1");
  const [theme, setTheme] = useState<ThemeKey>(DEFAULT_THEME);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const cfg = themeConfigs[theme];

  return (
    // ใช้เต็มหน้าจอ + แบ่ง header / body ด้วย flex
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
                onClick={() => setSettingsOpen((o) => !o)}
                className="
                  p-2 rounded-full border border-slate-600
                  bg-slate-900/60 hover:bg-slate-800
                  flex items-center justify-center
                "
                aria-label="Settings"
              >
                {/* Gear icon (SVG) */}
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
                          onClick={() => {
                            setTheme(key);
                            setSettingsOpen(false);
                          }}
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

          {/* Row 2: dropdowns */}
          <CharacterSelectors theme={theme} />
        </div>
      </header>

      {/* BODY GRID */}
      {/* flex-1 + min-h-0 ทำให้ grid นี้ยืดเต็มส่วนที่เหลือและอนุญาตให้ internal scroll */}
      <div className="flex-1 grid grid-cols-12 gap-3 w-full p-4 min-h-0">
        {/* SIDEBAR */}
        <aside
          className={`
            col-span-3 h-full p-4 rounded-xl overflow-y-auto
            ${themeConfigs[theme].sidebarCard}
          `}
        >
          <div className={`border-l-2 pl-4 ${themeConfigs[theme].accentText}`}>
            <h2
              className={`${themeConfigs[theme].accentText} uppercase text-sm mb-3 font-mono tracking-wide`}
            >
              Base Info
            </h2>
          </div>

          <div className="pl-4">
            <ul
              className={`${themeConfigs[theme].bodyText} space-y-1 text-xs font-mono`}
            >
              {baseInfo.map((item, index) => (
                <li key={index}>
                  <span className="font-semibold">{item.label}</span> :{" "}
                  {item.value}
                </li>
              ))}
            </ul>

            <h2
              className={`
                ${themeConfigs[theme].accentText}
                uppercase text-sm mt-5 mb-3 font-mono tracking-wide
                border-t pt-3 ${themeConfigs[theme].sectionBorder}
              `}
            >
              Basic Stats
            </h2>
            <ul
              className={`${themeConfigs[theme].bodyText} space-y-1 text-xs font-mono`}
            >
              {basicStats.map((stat, idx) => (
                <li key={idx}>{stat}</li>
              ))}
            </ul>

            <RepeatingSection
              title="xxxxxxx"
              titleClass={themeConfigs[theme].accentText}
              textClass={themeConfigs[theme].bodyText}
              borderClass={themeConfigs[theme].sectionBorder}
            />
            <RepeatingSection
              title="xxxxxxx"
              titleClass={themeConfigs[theme].accentText}
              textClass={themeConfigs[theme].bodyText}
              borderClass={themeConfigs[theme].sectionBorder}
            />
            <RepeatingSection
              title="xxxxxxx"
              titleClass={themeConfigs[theme].accentText}
              textClass={themeConfigs[theme].bodyText}
              borderClass={themeConfigs[theme].sectionBorder}
            />
          </div>
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
            {(["Tap1", "Tap2", "Tap3", "Tapxxx"] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-2 px-4 text-xs font-mono uppercase tracking-wide rounded-t-md border
                  ${
                    activeTab === tab
                      ? themeConfigs[theme].tabActive
                      : themeConfigs[theme].tabInactive
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content box: ใช้ flex-1 + h-full + min-h-0 แทน h-188 */}
          <div className="flex-1 px-3 pb-3 min-h-0">
            <div
              className={`
                w-full h-full border-2 rounded-md shadow-inner
                overflow-y-auto overflow-x-hidden
                ${themeConfigs[theme].innerBox} ${themeConfigs[theme].sectionBorder}
              `}
            >
              <TabContent
                tab={activeTab}
                accentClass={themeConfigs[theme].accentText}
                textClass={themeConfigs[theme].bodyText}
                mutedClass={themeConfigs[theme].mutedText}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
