import React, { useState } from "react";
import logo from "../../assets/logo.png";

export type MainTabKey = "build" | "library" | "export";

export interface TopbarTabItem {
  key: MainTabKey;
  label: string;
}

interface TopbarProps {
  tabs: TopbarTabItem[];
  activeTab: MainTabKey;
  onTabChange: (tabKey: MainTabKey) => void;
  contentOpacity: number;
  onContentOpacityChange: (opacity: number) => void;
}

const Topbar: React.FC<TopbarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  contentOpacity,
  onContentOpacityChange,
}) => {
  const [isBrandClicked, setIsBrandClicked] = useState<boolean>(false);

  const handleBrandClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    // trigger click animation without immediately navigating
    event.preventDefault();
    setIsBrandClicked(true);
    window.setTimeout(() => {
      setIsBrandClicked(false);
      window.location.href = import.meta.env.BASE_URL;
    }, 450);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "112px",
        borderBottom: "1px solid #1f2937",
        boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        alignItems: "center",
        flexShrink: 0,
        background: "linear-gradient(180deg, rgba(17,22,31,0.55) 0%, rgba(10,13,20,0.55) 100%)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "2px",
          background:
            "linear-gradient(90deg, transparent 0%, #4338ca 20%, #3b82f6 50%, #22d3ee 80%, transparent 100%)",
          opacity: 0.7,
          zIndex: 1,
        }}
      />
      <a
        href={import.meta.env.BASE_URL}
        onClick={handleBrandClick}
        className={`brand-link${isBrandClicked ? " brand-clicked" : ""}`}
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          borderRight: "1px solid #1f2937",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "0 24px",
          textDecoration: "none",
          color: "#e5e7eb",
          cursor: "pointer",
          width: "fit-content",
          minWidth: "fit-content",
          overflow: "visible",
          background:
            "linear-gradient(180deg, rgba(34,211,238,0.05) 0%, rgba(49,46,129,0.04) 100%)",
        }}
      >
        <img
          src={logo}
          alt="logo"
          className="brand-logo"
          style={{
            position: "relative",
            zIndex: 1,
            width: "58px",
            height: "58px",
            objectFit: "contain",
            flexShrink: 0,
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.1,
          }}
        >
          <span
            className="brand-title"
            style={{
              fontSize: "22px",
              fontWeight: 900,
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
              background:
                "linear-gradient(0deg, #1e1b4b 0%, #4338ca 18%, #3b82f6 38%, #22d3ee 50%, #3b82f6 62%, #4338ca 82%, #1e1b4b 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            DNC Simulator
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "#6366f1",
              whiteSpace: "nowrap",
            }}
          >
            Build Planner
          </span>
          <span
            style={{
              marginTop: "3px",
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              color: "#475569",
              whiteSpace: "nowrap",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            {__APP_TAG__ ? __APP_TAG__ : `v${__APP_VERSION__}`} · {__COMMIT_HASH__}
          </span>
        </div>
      </a>

      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          gap: "16px",
          minWidth: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
            minWidth: 0,
          }}
        >
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                style={{
                  height: "40px",
                  padding: "0 20px",
                  borderRadius: "8px",
                  border: isActive ? "1px solid #38bdf8" : "1px solid #2a3344",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  background: isActive
                    ? "linear-gradient(180deg, #1e3a5f 0%, #172b45 100%)"
                    : "#111827",
                  color: isActive ? "#e0f2fe" : "#9ca3af",
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: isActive ? "0.03em" : "normal",
                  boxShadow: isActive ? "0 0 12px rgba(56,189,248,0.25)" : "none",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(event) => {
                  if (!isActive) {
                    event.currentTarget.style.backgroundColor = "#1f2937";
                    event.currentTarget.style.color = "#e5e7eb";
                  }
                }}
                onMouseLeave={(event) => {
                  if (!isActive) {
                    event.currentTarget.style.backgroundColor = "#111827";
                    event.currentTarget.style.color = "#9ca3af";
                  }
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
            minWidth: "240px",
            justifyContent: "flex-end",
            color: "#9ca3af",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          UI Opacity
          <input
            type="range"
            min={20}
            max={100}
            step={5}
            value={Math.round(contentOpacity * 100)}
            onChange={(event) => {
              onContentOpacityChange(Number(event.target.value) / 100);
            }}
            style={{
              width: "130px",
              accentColor: "#38bdf8",
              cursor: "pointer",
            }}
          />
          <span
            style={{
              width: "38px",
              color: "#e5e7eb",
              fontVariantNumeric: "tabular-nums",
              textAlign: "right",
            }}
          >
            {Math.round(contentOpacity * 100)}%
          </span>
        </label>
      </div>
    </div>
  );
};

export default Topbar;
