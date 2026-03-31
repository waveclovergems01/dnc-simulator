import React from "react";
import type { CreateItemMode } from "./createItemTypes";

interface CreateItemActionBarProps {
  mode: CreateItemMode;
  onPrimaryClick: () => void;
  onCancelClick: () => void;
  isPrimaryDisabled?: boolean;
}

const CreateItemActionBar: React.FC<CreateItemActionBarProps> = ({
  mode,
  onPrimaryClick,
  onCancelClick,
  isPrimaryDisabled = false,
}) => {
  const primaryLabel = mode === "edit" ? "Save" : "Create";

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        paddingBottom: "16px",
        borderBottom: "1px solid #374151",
      }}
    >
      <button
        type="button"
        onClick={onPrimaryClick}
        disabled={isPrimaryDisabled}
        style={{
          height: "40px",
          minWidth: "110px",
          padding: "0 16px",
          borderRadius: "6px",
          border: "1px solid #374151",
          cursor: isPrimaryDisabled ? "not-allowed" : "pointer",
          backgroundColor: "#1f2937",
          color: isPrimaryDisabled ? "#6b7280" : "#f3f4f6",
          fontWeight: 600,
          opacity: isPrimaryDisabled ? 0.7 : 1,
        }}
      >
        {primaryLabel}
      </button>

      <button
        type="button"
        onClick={onCancelClick}
        style={{
          height: "40px",
          minWidth: "110px",
          padding: "0 16px",
          borderRadius: "6px",
          border: "1px solid #374151",
          cursor: "pointer",
          backgroundColor: "#111827",
          color: "#f3f4f6",
          fontWeight: 500,
        }}
      >
        Cancel
      </button>
    </div>
  );
};

export default CreateItemActionBar;