import React from "react";
import logo from "../../assets/logo.png";
import type * as GameDataModels from "../../model/GameDataModels";

export type MainTabKey = "build" | "library" | "export";

export interface TopbarTabItem {
  key: MainTabKey;
  label: string;
}

interface TopbarProps {
  tabs: TopbarTabItem[];
  activeTab: MainTabKey;
  onTabChange: (tabKey: MainTabKey) => void;
  levelOptions: number[];
  selectedLevel: number;
  selectedJobId: number;
  jobOptions: GameDataModels.JobDefinition[];
  onLevelChange: (level: number) => void;
  onJobChange: (jobId: number) => void;
}

const fieldStyle: React.CSSProperties = {
  height: "32px",
  borderRadius: "6px",
  border: "1px solid #374151",
  backgroundColor: "#111827",
  color: "#e5e7eb",
  padding: "0 10px",
  fontSize: "13px",
  fontWeight: 600,
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: "#9ca3af",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const formatJobName = (name: string): string => {
  return name
    .split(/[\s_-]+/)
    .filter((part) => {
      return part.length > 0;
    })
    .map((part) => {
      return `${part.charAt(0).toUpperCase()}${part.slice(1)}`;
    })
    .join(" ");
};

const Topbar: React.FC<TopbarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  levelOptions,
  selectedLevel,
  selectedJobId,
  jobOptions,
  onLevelChange,
  onJobChange,
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "112px",
        border: "1px solid #374151",
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        alignItems: "center",
        flexShrink: 0,
        backgroundColor: "#0f1115",
      }}
    >
      <a
        href={import.meta.env.BASE_URL}
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
            width: "60px",
            height: "60px",
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
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "10px 16px",
          gap: "10px",
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            overflowX: "auto",
          }}
        >
          <label style={labelStyle}>
            Level
            <select
              value={selectedLevel}
              onChange={(event) => onLevelChange(Number(event.target.value))}
              style={{ ...fieldStyle, width: "88px" }}
            >
              {levelOptions.map((level) => {
                return (
                  <option key={level} value={level}>
                    Lv. {level}
                  </option>
                );
              })}
            </select>
          </label>

          <label style={labelStyle}>
            Job
            <select
              value={selectedJobId}
              onChange={(event) => onJobChange(Number(event.target.value))}
              style={{ ...fieldStyle, width: "190px" }}
            >
              {jobOptions.map((job) => {
                return (
                  <option key={job.id} value={job.id}>
                    {formatJobName(job.name)}
                  </option>
                );
              })}
            </select>
          </label>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
            width: "100%",
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
      </div>
    </div>
  );
};

export default Topbar;
