import React, { useEffect, useMemo, useState } from "react";
import { appMemory } from "../../state/AppMemory";
import type { AppMemoryState } from "../../state/models/AppMemoryState";
import {
  buildMemoryStateUrl,
  restoreStateFromUrl,
} from "../../state/RestoreStateFromUrl";

const TabExport: React.FC = () => {
  const [memoryState, setMemoryState] = useState<AppMemoryState>(
    appMemory.getState(),
  );
  const [importMessage, setImportMessage] = useState<string>("");

  useEffect(() => {
    const unsubscribe = appMemory.subscribe((nextState: AppMemoryState) => {
      setMemoryState(nextState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const exportUrl = useMemo<string>(() => {
    return buildMemoryStateUrl(memoryState);
  }, [memoryState]);

  const prettyJson = useMemo<string>(() => {
    return JSON.stringify(memoryState, null, 2);
  }, [memoryState]);

  const handleCopyUrl = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(exportUrl);
      setImportMessage("Copied export URL.");
    } catch {
      setImportMessage("Cannot copy URL.");
    }
  };

  const handleImportFromCurrentUrl = (): void => {
    const restored = restoreStateFromUrl();

    if (restored) {
      setImportMessage("Imported state from current URL.");
      return;
    }

    setImportMessage("No valid state found in current URL.");
  };

  const handleResetMemory = (): void => {
    appMemory.resetState();
    setImportMessage("Memory has been reset.");
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        color: "#e5e7eb",
        minHeight: 0,
      }}
    >
      <div
        style={{
          border: "1px solid #374151",
          borderRadius: "10px",
          backgroundColor: "#111827",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#f3f4f6",
          }}
        >
          Export Memory To URL
        </div>

        <div
          style={{
            color: "#94a3b8",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          This URL contains the current AppMemory state. Opening the link with
          the state query will restore data back into memory and notify all
          subscribed modules.
        </div>

        <textarea
          readOnly
          value={exportUrl}
          style={{
            width: "100%",
            minHeight: "120px",
            borderRadius: "8px",
            border: "1px solid #374151",
            backgroundColor: "#0f172a",
            color: "#e5e7eb",
            padding: "12px",
            resize: "vertical",
            outline: "none",
            fontSize: "12px",
            lineHeight: 1.5,
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => {
              void handleCopyUrl();
            }}
            style={{
              height: "40px",
              minWidth: "140px",
              padding: "0 16px",
              borderRadius: "6px",
              border: "1px solid #374151",
              cursor: "pointer",
              backgroundColor: "#1f2937",
              color: "#f3f4f6",
              fontWeight: 600,
            }}
          >
            Copy URL
          </button>

          <button
            type="button"
            onClick={handleImportFromCurrentUrl}
            style={{
              height: "40px",
              minWidth: "180px",
              padding: "0 16px",
              borderRadius: "6px",
              border: "1px solid #374151",
              cursor: "pointer",
              backgroundColor: "#111827",
              color: "#f3f4f6",
              fontWeight: 500,
            }}
          >
            Import From Current URL
          </button>

          <button
            type="button"
            onClick={handleResetMemory}
            style={{
              height: "40px",
              minWidth: "140px",
              padding: "0 16px",
              borderRadius: "6px",
              border: "1px solid #374151",
              cursor: "pointer",
              backgroundColor: "#111827",
              color: "#f3f4f6",
              fontWeight: 500,
            }}
          >
            Reset Memory
          </button>
        </div>

        {importMessage ? (
          <div
            style={{
              color: "#94a3b8",
              fontSize: "12px",
            }}
          >
            {importMessage}
          </div>
        ) : null}
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          border: "1px solid #374151",
          borderRadius: "10px",
          backgroundColor: "#111827",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "#f3f4f6",
          }}
        >
          Current Memory JSON
        </div>

        <textarea
          readOnly
          value={prettyJson}
          style={{
            width: "100%",
            flex: 1,
            minHeight: "240px",
            borderRadius: "8px",
            border: "1px solid #374151",
            backgroundColor: "#0f172a",
            color: "#e5e7eb",
            padding: "12px",
            resize: "none",
            outline: "none",
            fontSize: "12px",
            lineHeight: 1.5,
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
};

export default TabExport;