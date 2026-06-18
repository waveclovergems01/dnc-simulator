import React from "react";
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
}

const Topbar: React.FC<TopbarProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
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
        background: "linear-gradient(180deg, #11161f 0%, #0a0d14 100%)",
        position: "relative",
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
            "linear-gradient(90deg, transparent 0%, #38bdf8 20%, #a855f7 50%, #34d399 80%, transparent 100%)",
          opacity: 0.7,
        }}
      />
      <a
        href={import.meta.env.BASE_URL}
        style={{
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
          background:
            "linear-gradient(180deg, rgba(56,189,248,0.06) 0%, rgba(168,85,247,0.04) 100%)",
        }}
      >
        <img
          src={logo}
          alt="logo"
          style={{
            width: "58px",
            height: "58px",
            objectFit: "contain",
            flexShrink: 0,
            filter: "drop-shadow(0 0 10px rgba(56,189,248,0.35))",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.1,
          }}
        >
          <span
            style={{
              fontSize: "22px",
              fontWeight: 900,
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
              background: "linear-gradient(135deg, #e0f2fe 0%, #38bdf8 45%, #a855f7 100%)",
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
              color: "#64748b",
              whiteSpace: "nowrap",
            }}
          >
            Build Planner
          </span>
        </div>
      </a>

      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "0 20px",
          gap: "16px",
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
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
      </div>
    </div>
  );
};

export default Topbar;
