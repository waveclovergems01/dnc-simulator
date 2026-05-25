import React, { useEffect, useMemo, useRef, useState } from "react";
import { GameDataLoader } from "../../../data/GameDataLoader";
import { appMemory } from "../../../state/AppMemory";
import type { AppMemoryState } from "../../../state/models/AppMemoryState";
import type { EquippedRuneSlot, InventorySlot } from "../../../state/models/InventoryModels";
import {
  TooltipRouter,
  resolveInventoryTooltip,
  type TooltipPosition,
} from "../../tooltip";

type RuneWheelSlotKind = "rune" | "skill" | "origin";

interface RuneWheelSlotConfig {
  key: string;
  label: string;
  itemTypeId: number | null;
  kind: RuneWheelSlotKind;
  x: number;
  y: number;
}

const RUNE_SLOT_CONFIGS: RuneWheelSlotConfig[] = [
  {
    key: "rune_destruction-1",
    label: "Destruction Rune",
    itemTypeId: 70001,
    kind: "rune",
    x: 50,
    y: 9,
  },
  {
    key: "rune_adamantine-1",
    label: "Adamantine Rune",
    itemTypeId: 70002,
    kind: "rune",
    x: 13,
    y: 50,
  },
  {
    key: "rune_adamantine-2",
    label: "Adamantine Rune",
    itemTypeId: 70002,
    kind: "rune",
    x: 87,
    y: 50,
  },
  {
    key: "rune_destruction-2",
    label: "Destruction Rune",
    itemTypeId: 70001,
    kind: "rune",
    x: 50,
    y: 91,
  },
  {
    key: "rune_skill-1",
    label: "Skill Rune",
    itemTypeId: null,
    kind: "skill",
    x: 27,
    y: 28,
  },
  {
    key: "rune_skill-2",
    label: "Skill Rune",
    itemTypeId: null,
    kind: "skill",
    x: 73,
    y: 28,
  },
  {
    key: "rune_skill-3",
    label: "Skill Rune",
    itemTypeId: null,
    kind: "skill",
    x: 27,
    y: 72,
  },
  {
    key: "rune_skill-4",
    label: "Skill Rune",
    itemTypeId: null,
    kind: "skill",
    x: 73,
    y: 72,
  },
  {
    key: "rune_origin",
    label: "Origin Rune",
    itemTypeId: null,
    kind: "origin",
    x: 50,
    y: 50,
  },
];

const STAT_DISPLAY_PRIORITY = new Map<number, number>(
  [
    7,
    8,
    3,
    4,
    5,
    6,
    0,
    1,
    2,
    18,
    19,
    20,
    21,
    14,
    11,
    12,
    13,
    9,
    10,
  ].map((statId, index) => {
    return [statId, index] as const;
  }),
);

const getStatPriority = (statId: number): number => {
  return STAT_DISPLAY_PRIORITY.get(statId) ?? 1000 + statId;
};

const resolveAssetUrl = (pathFile: string): string => {
  const normalizedPath = pathFile.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

const toInventorySlotShape = (slot: EquippedRuneSlot): InventorySlot => {
  return {
    slotIndex: 0,
    itemTypeId: slot.itemTypeId,
    itemData: slot.itemData,
  };
};

const getRuneFrameClipPath = (kind: RuneWheelSlotKind): string => {
  if (kind === "skill") {
    return "polygon(18% 0, 82% 0, 100% 18%, 100% 82%, 82% 100%, 18% 100%, 0 82%, 0 18%)";
  }

  if (kind === "origin") {
    return "circle(50% at 50% 50%)";
  }

  return "polygon(50% 0, 88% 12%, 100% 50%, 88% 88%, 50% 100%, 12% 88%, 0 50%, 12% 12%)";
};

const getEmptyRuneFrameColor = (config: RuneWheelSlotConfig): string => {
  if (config.kind === "origin") {
    return "#78716c";
  }

  if (config.kind === "skill") {
    return "#52525b";
  }

  if (config.itemTypeId === 70001) {
    return "#8b5cf6";
  }

  if (config.itemTypeId === 70002) {
    return "#60a5fa";
  }

  return "#52525b";
};

const TabRune: React.FC = () => {
  const gameData = useMemo(() => {
    return GameDataLoader.load();
  }, []);
  const [memoryState, setMemoryState] = useState<AppMemoryState>(
    appMemory.getState(),
  );
  const [hoveredSlotKey, setHoveredSlotKey] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    x: 0,
    y: 0,
  });
  const tooltipHideTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return appMemory.subscribe((nextState) => {
      setMemoryState(nextState);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (tooltipHideTimeoutRef.current !== null) {
        window.clearTimeout(tooltipHideTimeoutRef.current);
      }
    };
  }, []);

  const cancelTooltipHide = (): void => {
    if (tooltipHideTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(tooltipHideTimeoutRef.current);
    tooltipHideTimeoutRef.current = null;
  };

  const scheduleTooltipHide = (): void => {
    cancelTooltipHide();
    tooltipHideTimeoutRef.current = window.setTimeout(() => {
      setHoveredSlotKey(null);
      tooltipHideTimeoutRef.current = null;
    }, 180);
  };

  const runeMap = useMemo(() => {
    return new Map(
      gameData.runes.map((rune) => {
        return [rune.runeId, rune] as const;
      }),
    );
  }, [gameData.runes]);

  const rarityMap = useMemo(() => {
    return new Map(
      gameData.rarities.map((rarity) => {
        return [rarity.rarityId, rarity] as const;
      }),
    );
  }, [gameData.rarities]);

  const equippedRuneMap = useMemo(() => {
    return new Map(
      memoryState.runeList.map((slot) => {
        return [slot.slotKey, slot] as const;
      }),
    );
  }, [memoryState.runeList]);

  const totalStats = useMemo(() => {
    const statMap = new Map<
      string,
      { statId: number; label: string; value: number; isPercentage: boolean }
    >();

    memoryState.runeList.forEach((slot) => {
      slot.itemData.stats.forEach((stat) => {
        const key = `${stat.statId}-${stat.isPercentage ? "percent" : "value"}`;
        const current = statMap.get(key);
        const statDefinition =
          gameData.stats.find((item) => {
            return item.statId === stat.statId;
          }) ?? null;
        const label = statDefinition?.displayName || statDefinition?.statName || `Stat ${stat.statId}`;

        statMap.set(key, {
          statId: stat.statId,
          label,
          value: (current?.value ?? 0) + stat.value,
          isPercentage: stat.isPercentage,
        });
      });
    });

    return Array.from(statMap.entries())
      .map(([key, value]) => {
        return { key, ...value };
      })
      .sort((left, right) => {
        const leftPriority = getStatPriority(left.statId);
        const rightPriority = getStatPriority(right.statId);

        if (leftPriority !== rightPriority) {
          return leftPriority - rightPriority;
        }

        return Number(left.isPercentage) - Number(right.isPercentage);
      });
  }, [gameData.stats, memoryState.runeList]);

  const hoveredRuneSlot = useMemo<EquippedRuneSlot | null>(() => {
    if (hoveredSlotKey === null) {
      return null;
    }

    return equippedRuneMap.get(hoveredSlotKey) ?? null;
  }, [equippedRuneMap, hoveredSlotKey]);

  const tooltipData = useMemo(() => {
    if (!hoveredRuneSlot) {
      return null;
    }

    return resolveInventoryTooltip(toInventorySlotShape(hoveredRuneSlot));
  }, [hoveredRuneSlot]);

  return (
    <div className="flex h-full w-full flex-col gap-4 bg-zinc-950 p-4 text-zinc-300">
      <div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-zinc-900/70">
        <div
          className="relative aspect-square w-full max-w-[360px]"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(33,33,34,0.98) 0 16%, rgba(20,20,21,0.95) 17% 32%, rgba(55,55,54,0.72) 33% 35%, rgba(27,27,28,0.95) 36% 48%, rgba(9,9,10,0.2) 49% 100%)",
            borderRadius: "50%",
            boxShadow:
              "inset 0 0 24px rgba(0,0,0,0.95), 0 18px 36px rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-700/70"
            style={{
              boxShadow: "inset 0 0 18px rgba(0,0,0,0.8)",
            }}
          />
          <div className="absolute left-1/2 top-[16%] h-[68%] w-px -translate-x-1/2 bg-zinc-700/35" />
          <div className="absolute left-[16%] top-1/2 h-px w-[68%] -translate-y-1/2 bg-zinc-700/35" />
          <div className="absolute left-[26%] top-[26%] h-px w-[48%] rotate-45 bg-zinc-700/25" />
          <div className="absolute left-[26%] top-[74%] h-px w-[48%] -rotate-45 bg-zinc-700/25" />
          <div className="absolute left-1/2 top-1/2 h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/70 bg-black/40" />

        {RUNE_SLOT_CONFIGS.map((config) => {
          const slot = equippedRuneMap.get(config.key) ?? null;
          const rune = slot ? runeMap.get(slot.itemData.runeId) : null;
          const rarity = slot ? rarityMap.get(slot.itemData.rarityId) : null;
          const isPendingSlot = config.kind !== "rune";
          const frameColor = rarity?.color ?? getEmptyRuneFrameColor(config);
          const slotSize = config.kind === "origin" ? "18%" : "18%";

          return (
            <button
              key={config.key}
              type="button"
              disabled={isPendingSlot}
              onContextMenu={(event) => {
                event.preventDefault();

                if (slot && config.kind === "rune") {
                  appMemory.moveRuneToInventory(config.key);
                }
              }}
              onMouseEnter={(event) => {
                cancelTooltipHide();

                if (!slot || config.kind !== "rune") {
                  setHoveredSlotKey(null);
                  return;
                }

                setHoveredSlotKey(config.key);
                setTooltipPosition({
                  x: event.clientX,
                  y: event.clientY,
                });
              }}
              onMouseMove={(event) => {
                cancelTooltipHide();

                if (!slot || config.kind !== "rune") {
                  return;
                }

                setTooltipPosition({
                  x: event.clientX,
                  y: event.clientY,
                });
              }}
              onMouseLeave={scheduleTooltipHide}
              title={
                isPendingSlot
                  ? `${config.label} slot`
                  : slot
                    ? `${rune?.runeName ?? config.label} - right click to unequip`
                    : `${config.label} - right click rune in inventory to equip`
              }
              className="group absolute flex items-center justify-center border bg-zinc-950/90 p-0.5 transition-all hover:scale-105"
              style={{
                left: `${config.x}%`,
                top: `${config.y}%`,
                width: slotSize,
                height: slotSize,
                transform: "translate(-50%, -50%)",
                clipPath: getRuneFrameClipPath(config.kind),
                borderColor: frameColor,
                boxShadow: slot
                  ? `0 0 0 2px ${frameColor}88, 0 0 14px ${frameColor}99`
                  : "0 0 0 2px rgba(0,0,0,0.65), inset 0 0 10px rgba(0,0,0,0.85)",
                cursor: isPendingSlot ? "default" : "pointer",
              }}
            >
              <div
                className="flex h-full w-full items-center justify-center bg-black/45"
                style={{
                  clipPath: getRuneFrameClipPath(config.kind),
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.9)",
                }}
              >
                {rune ? (
                  <img
                    src={resolveAssetUrl(rune.pathFile)}
                    alt={rune.runeName}
                    className="h-[88%] w-[88%] object-contain transition-transform group-hover:scale-110"
                    style={{
                      filter: rarity ? `drop-shadow(0 0 5px ${rarity.color})` : "none",
                    }}
                  />
                ) : (
                  <div
                    className="h-[38%] w-[38%] border border-zinc-600/80 bg-zinc-950/90"
                    style={{
                      transform: config.kind === "origin" ? "none" : "rotate(45deg)",
                      borderRadius: config.kind === "origin" ? "50%" : "2px",
                    }}
                  />
                )}
              </div>
            </button>
          );
        })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-zinc-900/90">
        <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-2">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            Rune Stats
          </h2>
          <span className="text-[10px] text-zinc-600">v</span>
        </div>

        <div className="max-h-full overflow-y-auto px-4 py-2">
          {totalStats.length > 0 ? (
            <div className="flex flex-col">
              {totalStats.map((stat) => {
                return (
                  <div
                    key={stat.key}
                    className="flex items-center justify-between border-b border-white/5 py-1 last:border-0"
                  >
                    <span className="text-[12px] font-semibold uppercase tracking-wide text-zinc-500">
                      {stat.label}
                    </span>
                    <span className="text-[16px] font-black tabular-nums text-zinc-100">
                      {stat.isPercentage ? `${stat.value}%` : stat.value}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-zinc-600">
              No rune equipped
            </div>
          )}
        </div>
      </div>

      {tooltipData ? (
        <TooltipRouter
          data={tooltipData}
          position={tooltipPosition}
          onMouseEnter={cancelTooltipHide}
          onMouseLeave={scheduleTooltipHide}
        />
      ) : null}
    </div>
  );
};

export default TabRune;
