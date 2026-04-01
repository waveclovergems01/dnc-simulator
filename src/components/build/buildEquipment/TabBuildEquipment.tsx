import React, { useMemo, useState } from "react";
import TabCard from "./TabCard";
import TabCostume from "./TabCostume";
import TabGeneral from "./TabGeneral";
import TabHeraldry from "./TabHeraldry";
import TabMinion from "./TabMinion";
import TabMount from "./TabMount";
import TabRune from "./TabRune";

export type EquipmentTabKey =
  | "general"
  | "costume"
  | "heraldry"
  | "mount"
  | "minion"
  | "card"
  | "rune";

interface EquipmentTabItem {
  key: EquipmentTabKey;
  label: string;
}

interface TabBuildEquipmentProps {
  activeTab?: EquipmentTabKey;
  onTabChange?: (tab: EquipmentTabKey) => void;
}

const TabBuildEquipment: React.FC<TabBuildEquipmentProps> = ({
  activeTab: controlledActiveTab,
  onTabChange,
}) => {
  const tabs: EquipmentTabItem[] = useMemo(() => {
    return [
      { key: "general", label: "General" },
      { key: "costume", label: "Costume" },
      { key: "heraldry", label: "Heraldry" },
      { key: "mount", label: "Mount" },
      { key: "minion", label: "Minion" },
      { key: "card", label: "Card" },
      { key: "rune", label: "Rune" },
    ];
  }, []);

  const [internalActiveTab, setInternalActiveTab] =
    useState<EquipmentTabKey>("general");

  const activeTab: EquipmentTabKey = controlledActiveTab ?? internalActiveTab;

  const handleTabChange = (tab: EquipmentTabKey): void => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tab);
    }

    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const content = useMemo(() => {
    if (activeTab === "general") {
      return <TabGeneral />;
    }

    if (activeTab === "costume") {
      return <TabCostume />;
    }

    if (activeTab === "heraldry") {
      return <TabHeraldry />;
    }

    if (activeTab === "mount") {
      return <TabMount />;
    }

    if (activeTab === "minion") {
      return <TabMinion />;
    }

    if (activeTab === "card") {
      return <TabCard />;
    }

    if (activeTab === "rune") {
      return <TabRune />;
    }

    return null;
  }, [activeTab]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #374151",
      }}
    >
      <div
        style={{
          width: "100%",
          minHeight: "80px",
          borderBottom: "1px solid #374151",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          boxSizing: "border-box",
          flexWrap: "wrap",
          alignContent: "center",
          backgroundColor: "#0f1115",
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
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

      <div
        style={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          padding: "16px",
          boxSizing: "border-box",
          backgroundColor: "#0f1115",
          color: "#e5e7eb",
        }}
      >
        {content}
      </div>
    </div>
  );
};

export default TabBuildEquipment;