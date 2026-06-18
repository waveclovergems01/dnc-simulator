import React from "react";
import type * as GameDataModels from "../../model/GameDataModels";

interface CharacterBuildBarProps {
  levelOptions: number[];
  selectedLevel: number;
  selectedJobId: number;
  jobOptions: GameDataModels.JobDefinition[];
  onLevelChange: (level: number) => void;
  onJobChange: (jobId: number) => void;
}

const fieldStyle: React.CSSProperties = {
  height: "34px",
  borderRadius: "6px",
  border: "1px solid #374151",
  backgroundColor: "#0f172a",
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
    .filter((part) => part.length > 0)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
};

const CharacterBuildBar: React.FC<CharacterBuildBarProps> = ({
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
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "14px",
        border: "1px solid #1f2937",
        background: "linear-gradient(180deg, #0f172a 0%, #0b1120 100%)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          style={{
            width: "4px",
            height: "18px",
            borderRadius: "2px",
            backgroundColor: "#f472b6",
            boxShadow: "0 0 8px #f472b699",
          }}
        />
        <span
          style={{
            fontSize: "14px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#f3f4f6",
          }}
        >
          Character Build
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
        <label style={labelStyle}>
          Level
          <select
            value={selectedLevel}
            onChange={(event) => onLevelChange(Number(event.target.value))}
            style={{ ...fieldStyle, width: "96px" }}
          >
            {levelOptions.map((level) => (
              <option key={level} value={level}>
                Lv. {level}
              </option>
            ))}
          </select>
        </label>

        <label style={labelStyle}>
          Job
          <select
            value={selectedJobId}
            onChange={(event) => onJobChange(Number(event.target.value))}
            style={{ ...fieldStyle, width: "200px" }}
          >
            {jobOptions.map((job) => (
              <option key={job.id} value={job.id}>
                {formatJobName(job.name)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};

export default CharacterBuildBar;
