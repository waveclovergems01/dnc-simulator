import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  const [exportUrl, setExportUrl] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("initial");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const generateExportUrl = useCallback(async (): Promise<void> => {
    setIsGenerating(true);

    try {
      const nextUrl = await buildMemoryStateUrl(memoryState);
      setExportUrl(nextUrl);
      setStatusMessage(`generated (${nextUrl.length} chars)`);
    } catch (error: unknown) {
      console.error("Failed to build export URL.", error);
      setExportUrl("");
      setStatusMessage("Cannot generate export URL.");
    } finally {
      setIsGenerating(false);
    }
  }, [memoryState]);

  useEffect(() => {
    const unsubscribe = appMemory.subscribe((nextState: AppMemoryState) => {
      setMemoryState(nextState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    void generateExportUrl();
  }, [generateExportUrl]);

  const prettyJson = useMemo<string>(() => {
    return JSON.stringify(memoryState, null, 2);
  }, [memoryState]);

  const handleCopyUrl = async (): Promise<void> => {
    if (!exportUrl) {
      setStatusMessage("Export URL is empty.");
      return;
    }

    try {
      await navigator.clipboard.writeText(exportUrl);
      setStatusMessage("Copied export URL.");
    } catch {
      setStatusMessage("Cannot copy export URL.");
    }
  };

  const handleImportFromCurrentUrl = async (): Promise<void> => {
    try {
      const restored = await restoreStateFromUrl();

      if (restored) {
        setStatusMessage("Imported state from current URL.");
        return;
      }

      setStatusMessage("No valid state found in current URL.");
    } catch (error: unknown) {
      console.error("Failed to restore state from URL.", error);
      setStatusMessage("Cannot import state from current URL.");
    }
  };

  const handleResetMemory = (): void => {
    appMemory.resetState();
    setStatusMessage("Memory has been reset.");
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        minHeight: 0,
        color: "#e5e7eb",
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
          This export stores only compact ids and keys in the shared payload,
          then restores full runtime data back into memory from game master
          data.
        </div>

        <div
          style={{
            color: "#94a3b8",
            fontSize: "12px",
          }}
        >
          Debug: {isGenerating ? "generating..." : statusMessage}
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
              void generateExportUrl();
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
            Generate URL
          </button>

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
            onClick={() => {
              void handleImportFromCurrentUrl();
            }}
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
          Current Runtime Memory JSON
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