import React from "react";
import type { CreateItemTabKey } from "./createItemTypes";

export interface CreateItemTabItem {
  key: CreateItemTabKey;
  label: string;
}

interface CreateItemTabBarProps {
  tabs: CreateItemTabItem[];
  activeTab: CreateItemTabKey | null;
  onTabChange: (tabKey: CreateItemTabKey) => void;
}

const CreateItemTabBar: React.FC<CreateItemTabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        paddingBottom: "16px",
        borderBottom: "1px solid #374151",
      }}
    >
      {tabs.map((tab: CreateItemTabItem) => {
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
              backgroundColor: isActive ? "#1f2937" : "#111827",
              color: isActive ? "#f3f4f6" : "#9ca3af",
              fontWeight: isActive ? 600 : 400,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(event) => {
              if (!isActive) {
                event.currentTarget.style.backgroundColor = "#1f2937";
              }
            }}
            onMouseLeave={(event) => {
              if (!isActive) {
                event.currentTarget.style.backgroundColor = "#111827";
              }
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default CreateItemTabBar;