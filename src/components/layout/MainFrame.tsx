import React, { useMemo, useState } from "react";
import Topbar from "./Topbar";
import TabBuild from "../build/TabBuild";
import type { MainTabKey, TopbarTabItem } from "./Topbar";

const ExportContent: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        color: "#e5e7eb",
      }}
    >
      Export content
    </div>
  );
};

const MainFrame: React.FC = () => {
  const tabs: TopbarTabItem[] = useMemo(
    () => [
      {
        key: "build",
        label: "Build",
      },
      {
        key: "export",
        label: "Export",
      },
    ],
    [],
  );

  const [activeTab, setActiveTab] = useState<MainTabKey>("build");

  const content = useMemo(() => {
    if (activeTab === "build") {
      return <TabBuild />;
    }

    if (activeTab === "export") {
      return <ExportContent />;
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
        backgroundColor: "transparent",
      }}
    >
      <Topbar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div
        style={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          borderLeft: "1px solid #374151",
          borderRight: "1px solid #374151",
          borderBottom: "1px solid #374151",
          backgroundColor: "#0f1115",
          padding: "16px",
          color: "#e5e7eb",
          boxSizing: "border-box",
        }}
      >
        {content}
      </div>
    </div>
  );
};

export default MainFrame;