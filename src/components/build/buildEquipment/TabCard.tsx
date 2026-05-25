import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { GameDataLoader } from "../../../data/GameDataLoader";
import { appMemory } from "../../../state/AppMemory";
import type { AppMemoryState } from "../../../state/models/AppMemoryState";
import type { EquippedCardSlot, InventorySlot } from "../../../state/models/InventoryModels";
import {
  TooltipRouter,
  resolveInventoryTooltip,
  type TooltipPosition,
} from "../../tooltip";

// --- Types & Configuration ---
type CardSubTab = "cards" | "mastery";

const TOTAL_CARD_SLOTS = 70; 
const CARDS_PER_PAGE = 16;
const MAX_LEVEL = 20;

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

const toInventorySlotShape = (slot: EquippedCardSlot): InventorySlot => {
  return {
    slotIndex: 0,
    itemTypeId: slot.itemTypeId,
    itemData: slot.itemData,
  };
};

const TabCard: React.FC = () => {
  const gameData = useMemo(() => {
    return GameDataLoader.load();
  }, []);
  const [memoryState, setMemoryState] = useState<AppMemoryState>(
    appMemory.getState(),
  );
  const [activeSubTab, setActiveSubTab] = useState<CardSubTab>("cards");
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredSlotKey, setHoveredSlotKey] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    x: 0,
    y: 0,
  });
  
  // ใช้ number สำหรับ Browser Interval แทน NodeJS.Timeout
  const timerRef = useRef<number | null>(null);
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

  const initialMastery = [
    { id: 1, name: "Destruction Mastery", icon: "†" },
    { id: 2, name: "Magic Mastery", icon: "✨" },
    { id: 3, name: "Giant Bear Mastery", icon: "✊" },
    { id: 4, name: "Wind Mastery", icon: "🏃" },
    { id: 5, name: "Wisdom Mastery", icon: "💡" },
    { id: 6, name: "Health Mastery", icon: "♥" },
    { id: 7, name: "Lethal Mastery", icon: "🎯" },
    { id: 8, name: "Final Mastery", icon: "🔱" },
  ];

  const [masteryLevels, setMasteryLevels] = useState<{ [key: number]: number }>(
    Object.fromEntries(initialMastery.map((m) => [m.id, 0]))
  );

  // --- Logic: ปรับเลเวล ---
  const updateLevel = useCallback((id: number, delta: number) => {
    setMasteryLevels((prev) => {
      const currentLv = prev[id] || 0;
      const newLv = Math.max(0, Math.min(MAX_LEVEL, currentLv + delta));
      return { ...prev, [id]: newLv };
    });
  }, []);

  const setMaxLevel = (id: number) => {
    setMasteryLevels((prev) => ({ ...prev, [id]: MAX_LEVEL }));
  };

  // --- Logic: ระบบกดค้าง (Hold to Auto Increment/Decrement) ---
  const startCounter = (id: number, delta: number) => {
    updateLevel(id, delta); // ทำงานทันทีที่คลิกครั้งแรก
    if (timerRef.current) window.clearInterval(timerRef.current);
    
    timerRef.current = window.setInterval(() => {
      updateLevel(id, delta);
    }, 120); // ความเร็วในการรันเลข (120ms)
  };

  const stopCounter = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // --- Logic: Pagination ---
  const totalPages = Math.ceil(TOTAL_CARD_SLOTS / CARDS_PER_PAGE);
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const currentSlots = Array.from({ length: CARDS_PER_PAGE }, (_, i) => startIndex + i + 1)
    .filter((slotIdx) => slotIdx <= TOTAL_CARD_SLOTS);

  const cardMap = useMemo(() => {
    return new Map(
      gameData.cards.map((card) => {
        return [card.cardNameId, card] as const;
      }),
    );
  }, [gameData.cards]);

  const rarityMap = useMemo(() => {
    return new Map(
      gameData.rarities.map((rarity) => {
        return [rarity.rarityId, rarity] as const;
      }),
    );
  }, [gameData.rarities]);

  const equippedCardMap = useMemo(() => {
    return new Map(
      memoryState.cardList.map((slot) => {
        return [slot.slotKey, slot] as const;
      }),
    );
  }, [memoryState.cardList]);

  const totalStats = useMemo(() => {
    const statMap = new Map<
      string,
      { statId: number; label: string; value: number; isPercentage: boolean }
    >();

    memoryState.cardList.forEach((slot) => {
      const card = cardMap.get(slot.itemData.cardNameId) ?? null;
      const cardRarity =
        card?.rarities.find((rarity) => {
          return rarity.cardId === slot.itemData.cardId;
        }) ?? null;

      cardRarity?.stats.forEach((stat) => {
        const key = `${stat.statId}-${stat.isPercentage ? "percent" : "value"}`;
        const current = statMap.get(key);
        const statDefinition =
          gameData.stats.find((item) => {
            return item.statId === stat.statId;
          }) ?? null;
        const label =
          statDefinition?.displayName || statDefinition?.statName || `Stat ${stat.statId}`;

        statMap.set(key, {
          statId: stat.statId,
          label,
          value: (current?.value ?? 0) + stat.valueMax,
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
  }, [cardMap, gameData.stats, memoryState.cardList]);

  const hoveredCardSlot = useMemo<EquippedCardSlot | null>(() => {
    if (hoveredSlotKey === null) {
      return null;
    }

    return equippedCardMap.get(hoveredSlotKey) ?? null;
  }, [equippedCardMap, hoveredSlotKey]);

  const tooltipData = useMemo(() => {
    if (!hoveredCardSlot) {
      return null;
    }

    return resolveInventoryTooltip(toInventorySlotShape(hoveredCardSlot));
  }, [hoveredCardSlot]);

  return (
    <div className="flex flex-col items-center w-full h-full p-4 space-y-6 text-zinc-200 select-none">
      
      {/* --- Sub-Tab Header --- */}
      <div className="flex space-x-1 border-b border-white/10 w-full max-w-2xl">
        <button
          className={`px-6 py-3 text-sm font-bold transition-all ${
            activeSubTab === "cards" ? "text-amber-400 border-b-2 border-amber-400 bg-white/5" : "text-zinc-500 hover:text-zinc-300"
          }`}
          onClick={() => setActiveSubTab("cards")}
        >
          Monster Cards
        </button>
        <button
          className={`px-6 py-3 text-sm font-bold transition-all ${
            activeSubTab === "mastery" ? "text-amber-400 border-b-2 border-amber-400 bg-white/5" : "text-zinc-500 hover:text-zinc-300"
          }`}
          onClick={() => setActiveSubTab("mastery")}
        >
          The Power of Mastery
        </button>
      </div>

      {/* --- Main Content Area --- */}
      <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-6 w-full max-w-2xl min-h-[550px] shadow-2xl backdrop-blur-xl flex flex-col">
        
        {activeSubTab === "cards" ? (
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="grid grid-cols-4 gap-4 sm:gap-6 justify-items-center">
              {currentSlots.map((slotIdx) => {
                const slotKey = `card-${slotIdx}`;
                const slot = equippedCardMap.get(slotKey) ?? null;
                const card = slot ? cardMap.get(slot.itemData.cardNameId) : null;
                const rarity = slot ? rarityMap.get(slot.itemData.rarityId) : null;

                return (
                  <div key={slotIdx} className="flex flex-col items-center space-y-2 group">
                    <button
                      type="button"
                      onContextMenu={(event) => {
                        event.preventDefault();

                        if (slot) {
                          appMemory.moveCardToInventory(slotKey);
                        }
                      }}
                      onMouseEnter={(event) => {
                        cancelTooltipHide();

                        if (!slot) {
                          setHoveredSlotKey(null);
                          return;
                        }

                        setHoveredSlotKey(slotKey);
                        setTooltipPosition({
                          x: event.clientX,
                          y: event.clientY,
                        });
                      }}
                      onMouseMove={(event) => {
                        cancelTooltipHide();

                        if (!slot) {
                          return;
                        }

                        setTooltipPosition({
                          x: event.clientX,
                          y: event.clientY,
                        });
                      }}
                      onMouseLeave={scheduleTooltipHide}
                      className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border bg-zinc-900/50 transition-all hover:border-amber-500/50 sm:h-20 sm:w-20"
                      style={{
                        borderColor: slot && rarity ? rarity.color : "rgba(255,255,255,0.08)",
                        boxShadow: slot && rarity ? `0 0 12px ${rarity.color}55` : "none",
                      }}
                      title={
                        slot
                          ? `${card?.cardName ?? "Monster Card"} - right click to unequip`
                          : `Card Slot ${slotIdx}`
                      }
                    >
                      {card ? (
                        <img
                          src={resolveAssetUrl(card.pathFile)}
                          alt={card.cardName}
                          className="h-[82%] w-[82%] object-contain transition-transform group-hover:scale-110"
                          style={{
                            filter: rarity ? `drop-shadow(0 0 4px ${rarity.color})` : "none",
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rotate-45 border border-zinc-700 opacity-20" />
                      )}
                      <span className="absolute bottom-1 right-1.5 text-[9px] text-zinc-600">
                        {slotIdx}
                      </span>
                    </button>
                    <span
                      className="max-w-20 truncate text-[10px] tracking-widest"
                      style={{ color: rarity?.color ?? "#71717a" }}
                    >
                      {card ? card.cardName.replace("Monster Card - ", "") : "Empty"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-auto pt-8 flex justify-center items-center space-x-3">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-amber-500 disabled:opacity-10">&laquo;</button>
              <div className="flex space-x-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg text-sm font-black transition-all ${currentPage === page ? "bg-amber-500 text-black" : "text-zinc-500 hover:text-zinc-200"}`}>{page}</button>
                ))}
              </div>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-amber-500 disabled:opacity-10">&raquo;</button>
            </div>

          </div>
        ) : (
          /* --- Mastery List (Hold Click & 75/25 Layout) --- */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2 duration-300">
            {initialMastery.map((m) => (
              <div
                key={m.id}
                className="group relative flex items-center p-4 bg-linear-to-br from-zinc-900/80 to-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/40 transition-all h-24"
              >
                {/* Information Layer (คลิกทะลุได้) */}
                <div className="flex items-center w-full pointer-events-none z-0">
                  <div className="w-10 h-10 bg-black rounded-full border border-white/10 flex items-center justify-center mr-3 shrink-0 shadow-xl">
                    <span className="text-cyan-400 text-xl">{m.icon}</span>
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{m.name}</span>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-xl font-black text-amber-400 tabular-nums drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                        {masteryLevels[m.id]}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-600 italic">/ {MAX_LEVEL}</span>
                    </div>
                  </div>
                </div>

                {/* --- Hover Controls Layer (อยู่ด้านบนสุด) --- */}
                <div className="absolute inset-0 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20">
                  {/* Top 75%: Plus / Minus */}
                  <div className="flex h-[75%] w-full">
                    <button
                      onMouseDown={() => startCounter(m.id, 1)}
                      onMouseUp={stopCounter}
                      onMouseLeave={stopCounter}
                      className="w-1/2 h-full bg-green-500/10 hover:bg-green-500/30 border-r border-white/5 flex items-center justify-center text-green-400 text-3xl font-black transition-colors pointer-events-auto"
                    >
                      +
                    </button>
                    <button
                      onMouseDown={() => startCounter(m.id, -1)}
                      onMouseUp={stopCounter}
                      onMouseLeave={stopCounter}
                      className="w-1/2 h-full bg-red-500/10 hover:bg-red-500/30 flex items-center justify-center text-red-400 text-3xl font-black transition-colors pointer-events-auto"
                    >
                      −
                    </button>
                  </div>

                  {/* Bottom 25%: Max Level */}
                  <button
                    onClick={() => setMaxLevel(m.id)}
                    className="h-[25%] w-full bg-amber-500/10 hover:bg-amber-500/40 border-t border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-amber-400 transition-colors pointer-events-auto"
                  >
                    Set Max Level
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-white/10 bg-zinc-900/90">
        <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-2">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            Card Stats
          </h2>
          <span className="text-[10px] text-zinc-600">v</span>
        </div>

        <div className="max-h-48 overflow-y-auto px-4 py-2">
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
            <div className="py-6 text-center text-sm text-zinc-600">
              No card equipped
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

export default TabCard;
