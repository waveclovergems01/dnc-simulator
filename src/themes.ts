// src/themes.ts

export type ThemeKey = "neonDark" | "softLight" | "ocean" | "crimson";

export interface ThemeConfig {
  label: string;
  root: string;
  header: string;
  logoRing: string;
  accentText: string;
  subtitleText: string;
  bodyText: string;
  mutedText: string;
  badge: string;
  sidebarCard: string;
  mainCard: string;
  innerBox: string;
  tabActive: string;
  tabInactive: string;
  dropdownLabel: string;
  dropdownSelect: string;
  sectionBorder: string;
}

export const themeConfigs: Record<ThemeKey, ThemeConfig> = {
  neonDark: {
    label: "Neon Dark",
    root: "min-h-screen bg-slate-950 text-emerald-50",
    header:
      "bg-slate-950/90 border-emerald-600/70 shadow-[0_0_25px_rgba(16,185,129,0.45)]",
    logoRing: "from-slate-900 to-slate-800 border-emerald-400",
    accentText: "text-emerald-300",
    subtitleText: "text-slate-400",
    bodyText: "text-slate-100/90",
    mutedText: "text-emerald-200",
    badge: "border-emerald-400/70 text-emerald-300",
    sidebarCard:
      "bg-slate-950/80 border border-emerald-700/70 shadow-[0_0_30px_rgba(15,118,110,0.35)]",
    mainCard:
      "bg-slate-950/80 border border-emerald-700/70 shadow-[0_0_30px_rgba(15,118,110,0.35)]",
    innerBox:
      "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
    tabActive:
      "bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.6)]",
    tabInactive:
      "bg-slate-800 text-emerald-200 border-slate-700 hover:bg-slate-700",
    dropdownLabel: "text-emerald-300",
    dropdownSelect:
      "bg-slate-950/70 border-emerald-500/60 text-emerald-50",
    sectionBorder: "border-emerald-900",
  },
  softLight: {
    label: "Soft Light",
    root: "min-h-screen bg-slate-100 text-slate-900",
    header:
      "bg-white border-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.25)]",
    logoRing: "from-emerald-50 to-emerald-100 border-emerald-400",
    accentText: "text-emerald-700",
    subtitleText: "text-slate-500",
    bodyText: "text-slate-700",
    mutedText: "text-slate-500",
    badge: "border-emerald-400 text-emerald-700",
    sidebarCard:
      "bg-white border border-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    mainCard:
      "bg-white border border-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    innerBox:
      "bg-gradient-to-br from-white via-emerald-50 to-slate-50",
    tabActive:
      "bg-emerald-500 text-white border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.45)]",
    tabInactive:
      "bg-slate-100 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
    dropdownLabel: "text-emerald-700",
    dropdownSelect:
      "bg-white border-emerald-300 text-slate-900",
    sectionBorder: "border-emerald-200",
  },
  ocean: {
    label: "Ocean",
    root: "min-h-screen bg-sky-950 text-cyan-50",
    header:
      "bg-sky-950/90 border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.45)]",
    logoRing: "from-sky-900 to-sky-800 border-cyan-400",
    accentText: "text-cyan-300",
    subtitleText: "text-cyan-200/80",
    bodyText: "text-cyan-50/95",
    mutedText: "text-cyan-200",
    badge: "border-cyan-400/70 text-cyan-300",
    sidebarCard:
      "bg-sky-950/80 border border-cyan-700/70 shadow-[0_0_30px_rgba(6,182,212,0.35)]",
    mainCard:
      "bg-sky-950/80 border border-cyan-700/70 shadow-[0_0_30px_rgba(6,182,212,0.35)]",
    innerBox:
      "bg-gradient-to-br from-sky-950 via-slate-900 to-sky-900",
    tabActive:
      "bg-cyan-500 text-sky-950 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)]",
    tabInactive:
      "bg-sky-900 text-cyan-200 border-sky-700 hover:bg-sky-800",
    dropdownLabel: "text-cyan-200",
    dropdownSelect:
      "bg-sky-950/70 border-cyan-500/60 text-cyan-50",
    sectionBorder: "border-cyan-900",
  },
  crimson: {
    label: "Crimson",
    root: "min-h-screen bg-slate-950 text-rose-50",
    header:
      "bg-slate-950/90 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.45)]",
    logoRing: "from-slate-900 to-slate-800 border-rose-400",
    accentText: "text-rose-300",
    subtitleText: "text-rose-200/80",
    bodyText: "text-rose-50/95",
    mutedText: "text-rose-200",
    badge: "border-rose-400/70 text-rose-300",
    sidebarCard:
      "bg-slate-950/80 border border-rose-700/70 shadow-[0_0_30px_rgba(244,63,94,0.35)]",
    mainCard:
      "bg-slate-950/80 border border-rose-700/70 shadow-[0_0_30px_rgba(244,63,94,0.35)]",
    innerBox:
      "bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950",
    tabActive:
      "bg-rose-500 text-slate-950 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.6)]",
    tabInactive:
      "bg-slate-900 text-rose-200 border-slate-700 hover:bg-slate-800",
    dropdownLabel: "text-rose-300",
    dropdownSelect:
      "bg-slate-950/70 border-rose-500/60 text-rose-50",
    sectionBorder: "border-rose-900",
  },
};

export const themeOrder: ThemeKey[] = ["neonDark", "softLight", "ocean", "crimson"];

export const DEFAULT_THEME: ThemeKey = "neonDark";
