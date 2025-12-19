// src/state/RestoreStateFromUrl.ts
import { AppMemory } from "./AppMemory";
import type { AppMemoryState } from "./AppMemory";

/**
 * Restore AppMemoryState จาก URL (?state=...)
 * - decodeURIComponent
 * - JSON.parse
 * - patch ลง AppMemory
 * - trigger listeners (delegate)
 */
export const restoreStateFromUrl = (): void => {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const encodedState = params.get("state");
  if (!encodedState) return;

  try {
    const decoded = decodeURIComponent(encodedState);
    const parsed = JSON.parse(decoded) as AppMemoryState;

    // ---- BASIC STRUCTURE GUARD ----
    if (
      !parsed ||
      !parsed.character ||
      typeof parsed.character.level !== "string" ||
      typeof parsed.character.baseId !== "string" ||
      typeof parsed.character.class1Id !== "string" ||
      typeof parsed.character.class2Id !== "string"
    ) {
      return;
    }

    // 🔔 Unity-style Action.Invoke()
    AppMemory.patch(parsed);
  } catch (err) {
    console.error("RestoreStateFromUrl failed", err);
  }
};
