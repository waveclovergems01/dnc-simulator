import React from "react";
import logo from "../../assets/logo.png";

export type MainTabKey = "build" | "export";

export interface TopbarTabItem {
  key: MainTabKey;
  label: string;
}

interface TopbarProps {
  tabs: TopbarTabItem[];
  activeTab: MainTabKey;
  onTabChange: (tabKey: MainTabKey) => void;
}

const Topbar: React.FC<TopbarProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "80px",
        border: "1px solid #374151",
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        alignItems: "center",
        flexShrink: 0,
        backgroundColor: "#0f1115", // 👈 เพิ่ม bg ให้เข้าธีม
      }}
    >
      <a
        href="/"
        style={{
          height: "100%",
          borderRight: "1px solid #374151",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "0 16px",
          textDecoration: "none",
          color: "#e5e7eb",
          cursor: "pointer",
          width: "fit-content",
          minWidth: "fit-content",
        }}
      >
        <img
          src={logo}
          alt="logo"
          style={{
            width: "40px",
            height: "40px",
            objectFit: "contain",
            flexShrink: 0,
          }}
        />

        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          DNC Simulator
        </div>
      </a>

      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
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
                padding: "0 16px",
                borderRadius: "6px",
                border: "1px solid #374151",
                cursor: "pointer",
                whiteSpace: "nowrap",

                // ✅ สีใหม่
                backgroundColor: isActive ? "#1f2937" : "#111827",
                color: isActive ? "#f3f4f6" : "#9ca3af",
                fontWeight: isActive ? 600 : 400,

                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#1f2937";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#111827";
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Topbar;