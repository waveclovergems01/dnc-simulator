// src/components/TabExport.tsx
import React, { useState } from "react";
import { themeConfigs, type ThemeKey } from "../themes";
import type { AppMemoryState } from "../state/AppMemory";

interface TabExportProps {
  theme: ThemeKey;
  memory: AppMemoryState;
}

const TabExport: React.FC<TabExportProps> = ({ theme, memory }) => {
  const cfg = themeConfigs[theme];
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copyStatus, setCopyStatus] = useState<"" | "copied" | "error">("");

  /** สร้าง URL จาก memory */
  const handleGenerateUrl = () => {
    if (typeof window === "undefined") return;

    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const json = JSON.stringify(memory);
    const encoded = encodeURIComponent(json);

    const url = `${baseUrl}?state=${encoded}`;
    setGeneratedUrl(url);
    setCopyStatus("");
  };

  /** copy URL */
  const handleCopyUrl = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus(""), 1500);
    } catch {
      setCopyStatus("error");
      setTimeout(() => setCopyStatus(""), 2000);
    }
  };

  /** STYLE ปุ่มตาม theme */
  const buttonPrimary = `
    border rounded-md text-xs font-mono px-3 py-1.5
    ${cfg.accentText.replace("text-", "border-")}
    hover:${cfg.accentText.replace("text-", "bg-")}/20
  `;

  const buttonSecondary = `
    border rounded-md text-xs font-mono px-3 py-1.5
    ${cfg.sectionBorder} ${cfg.bodyText}
    hover:bg-white/10
  `;

  const buttonDisabled = `
    border rounded-md text-xs font-mono px-3 py-1.5
    border-slate-700 text-slate-600 cursor-not-allowed
  `;

  return (
    <div className={`p-4 space-y-4 ${cfg.bodyText}`}>
      <h4 className={`${cfg.accentText} text-xl font-bold`}>
        Export
      </h4>

      <p className="text-sm">
        ปุ่ม <span className="font-mono">Generate URL</span> จะสร้างลิงก์ที่เก็บค่าปัจจุบันจาก memory  
        เมื่อเปิด URL นี้ ค่า dropdown จะถูกตั้งให้เหมือนเดิมทันที
      </p>

      {/* ---------- ปุ่มชุดบน ---------- */}
      <div className="flex gap-2">
        <button className={buttonPrimary} onClick={handleGenerateUrl}>
          Generate URL
        </button>

        <button
          className={generatedUrl ? buttonSecondary : buttonDisabled}
          onClick={handleCopyUrl}
          disabled={!generatedUrl}
        >
          Copy URL
        </button>
      </div>

      {/* ---------- ช่องแสดง URL ---------- */}
      <div className="space-y-2">
        <div className={`${cfg.mutedText} text-xs`}>Generated URL:</div>

        <textarea
          className={`
            w-full h-20 text-xs font-mono rounded-md border px-2 py-1
            ${cfg.sectionBorder} ${cfg.bodyText} bg-black/40
          `}
          readOnly
          value={generatedUrl}
          placeholder="กด Generate URL ก่อน"
        />

        {copyStatus === "copied" && (
          <div className="text-[11px] text-emerald-300 font-mono">
            ✔ Copied to clipboard
          </div>
        )}

        {copyStatus === "error" && (
          <div className="text-[11px] text-red-400 font-mono">
            ✖ Copy ไม่สำเร็จ ลองใหม่ หรือ copy จากช่องด้านบน
          </div>
        )}
      </div>
    </div>
  );
};

export default TabExport;
