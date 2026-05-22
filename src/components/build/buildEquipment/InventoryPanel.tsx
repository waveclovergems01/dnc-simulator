import React, { useEffect, useMemo, useRef, useState } from "react";
import { GameDataLoader } from "../../../data/GameDataLoader";
import type * as GameDataModels from "../../../model/GameDataModels";
import { appMemory } from "../../../state/AppMemory";
import type { AppMemoryState } from "../../../state/models/AppMemoryState";
import type {
  EquippedGeneralEquipmentSlot,
  EquippedHeraldrySlot,
  InventorySlot,
} from "../../../state/models/InventoryModels";
import {
  TooltipRouter,
  resolveInventoryTooltip,
  type TooltipPosition,
} from "../../tooltip";

const SLOT_SIZE = 56;
const SLOT_GAP = 8;
const COMPARE_TOOLTIP_MAX_WIDTH = 340;
const TOOLTIP_COLUMN_GAP = 12;

const getViewportTooltipHeight = (): number => {
  return Math.max(160, window.innerHeight - 16);
};

const getSingleTooltipMaxColumns = (): number => {
  return Math.max(
    1,
    Math.floor((window.innerWidth - 16) / (COMPARE_TOOLTIP_MAX_WIDTH + TOOLTIP_COLUMN_GAP)),
  );
};

const getTooltipMaxColumnsForWidth = (
  availableWidth: number,
  maxColumns: number,
): number => {
  return Math.max(
    1,
    Math.min(
      maxColumns,
      Math.floor(
        (availableWidth + TOOLTIP_COLUMN_GAP) /
          (COMPARE_TOOLTIP_MAX_WIDTH + TOOLTIP_COLUMN_GAP),
      ),
    ),
  );
};

const resolveAssetUrl = (pathFile: string): string => {
  const normalizedPath = pathFile.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

const isSamePlateKind = (
  inventorySlot: InventorySlot | null,
  equipmentSlot: EquippedHeraldrySlot | null,
): boolean => {
  if (
    !inventorySlot ||
    !equipmentSlot ||
    inventorySlot.itemData === null ||
    inventorySlot.itemData.kind !== "plate"
  ) {
    return false;
  }

  return (
    inventorySlot.itemTypeId === equipmentSlot.itemTypeId &&
    inventorySlot.itemData.plateNameId === equipmentSlot.itemData.plateNameId
  );
};

const toInventorySlotShape = (
  equipmentSlot: EquippedHeraldrySlot | EquippedGeneralEquipmentSlot | null,
): InventorySlot | null => {
  if (!equipmentSlot) {
    return null;
  }

  return {
    slotIndex: 0,
    itemTypeId: equipmentSlot.itemTypeId,
    itemData: equipmentSlot.itemData,
  };
};

const findComparableGeneralEquipmentSlot = (
  inventorySlot: InventorySlot | null,
  generalEquipmentList: EquippedGeneralEquipmentSlot[],
): EquippedGeneralEquipmentSlot | null => {
  if (
    !inventorySlot ||
    inventorySlot.itemData === null ||
    inventorySlot.itemData.kind !== "equipment"
  ) {
    return null;
  }

  return (
    generalEquipmentList.find((equipmentSlot: EquippedGeneralEquipmentSlot) => {
      return equipmentSlot.itemTypeId === inventorySlot.itemTypeId;
    }) ?? null
  );
};

const InventorySlotButton: React.FC<{
  slotNumber: number;
  slotData: InventorySlot | null;
  isSelected: boolean;
  plateNameMap: Map<number, GameDataModels.PlateName>;
  rarityMap: Map<number, GameDataModels.Rarity>;
  equipmentItemMap: Map<number, GameDataModels.EquipmentItem>;
  onClick: (slotNumber: number, slotData: InventorySlot | null) => void;
  onDoubleClick: (slotNumber: number, slotData: InventorySlot | null) => void;
  onRightClick: (slotNumber: number, slotData: InventorySlot | null) => void;
  onMouseEnter: (
    slotNumber: number,
    slotData: InventorySlot | null,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  onMouseMove: (
    slotNumber: number,
    slotData: InventorySlot | null,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  onMouseLeave: (event: React.MouseEvent<HTMLButtonElement>) => void;
}> = ({
  slotNumber,
  slotData,
  isSelected,
  plateNameMap,
  rarityMap,
  equipmentItemMap,
  onClick,
  onDoubleClick,
  onRightClick,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}) => {
  const itemData = slotData?.itemData ?? null;
  const plateName = itemData?.kind === "plate"
    ? plateNameMap.get(itemData.plateNameId)
    : null;
  const equipmentItem = itemData?.kind === "equipment"
    ? equipmentItemMap.get(itemData.itemId)
    : null;
  const rarity = itemData ? rarityMap.get(itemData.rarityId) : null;
  const itemImagePath = plateName?.pathFile ?? equipmentItem?.pathFile ?? null;
  const itemName = plateName?.name ?? equipmentItem?.name ?? "";
  const hasItem = itemData !== null && (plateName !== null || equipmentItem !== null);
  const enhancementLevel =
    itemData?.kind === "equipment" ? itemData.enhancementLevel : 0;

  return (
    <button
      type="button"
      onClick={() => onClick(slotNumber, slotData)}
      onDoubleClick={() => onDoubleClick(slotNumber, slotData)}
      onContextMenu={(event) => {
        event.preventDefault();
        onRightClick(slotNumber, slotData);
      }}
      onMouseEnter={(event) => onMouseEnter(slotNumber, slotData, event)}
      onMouseMove={(event) => onMouseMove(slotNumber, slotData, event)}
      onMouseLeave={onMouseLeave}
      className={`relative rounded-xl border-2 transition-all duration-200 flex items-center justify-center overflow-hidden group
        ${hasItem ? "border-transparent" : "border-zinc-800 hover:border-zinc-700 shadow-inner"}
        ${isSelected ? "ring-2 ring-yellow-500/50 scale-105 z-10" : "hover:scale-105"}`}
      style={{
        width: `${SLOT_SIZE}px`,
        height: `${SLOT_SIZE}px`,
        backgroundColor: hasItem
          ? "rgba(18, 18, 20, 0.95)"
          : "rgba(10, 10, 12, 0.4)",
        borderColor: hasItem && rarity ? rarity.color : undefined,
        boxShadow: hasItem && rarity ? `0 0 10px ${rarity.color}44` : "none",
      }}
    >
      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />
      {hasItem && itemImagePath ? (
        <img
          src={resolveAssetUrl(itemImagePath)}
          alt={itemName}
          className="w-[85%] h-[85%] object-contain z-10 transition-transform group-hover:scale-110"
          style={{
            filter: rarity ? `drop-shadow(0 0 4px ${rarity.color})` : "none",
          }}
        />
      ) : null}
      {hasItem && !itemImagePath ? (
        <div
          className="z-10 text-[11px] font-bold text-zinc-200 transition-transform group-hover:scale-110"
          style={{
            filter: rarity ? `drop-shadow(0 0 4px ${rarity.color})` : "none",
          }}
          title={itemName}
        >
          EQ
        </div>
      ) : null}
      {enhancementLevel > 0 ? (
        <div
          className="absolute -left-2 top-1 z-20 rounded bg-black/80 px-1 text-[10px] font-bold leading-4 text-lime-300 shadow-md"
          style={{
            border: "1px solid rgba(190, 242, 100, 0.55)",
            textShadow: "0 1px 2px rgba(0,0,0,0.9)",
          }}
        >
          +{enhancementLevel}
        </div>
      ) : null}
    </button>
  );
};

export interface InventoryPanelProps {
  totalSlots?: number;
  columns?: number;
  rows?: number;
  width?: string;
  title?: string;
  selectedSlotIndex?: number | null;
  onSelectedSlotChange?: (slotIndex: number | null) => void;
  onDeleteSelected?: (slotIndex: number) => void;
  onEditSlot?: (slotIndex: number) => void;
  onEquipSlot?: (slotIndex: number) => void;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({
  totalSlots = 1200,
  columns = 6,
  rows = 10,
  width = "450px",
  title = "Inventory",
  selectedSlotIndex = null,
  onSelectedSlotChange,
  onDeleteSelected,
  onEditSlot,
  onEquipSlot,
}) => {
  const [memoryState, setMemoryState] = useState<AppMemoryState>(
    appMemory.getState(),
  );
  const [activeTab, setActiveTab] = useState<number>(0);
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    x: 0,
    y: 0,
  });
  const [tooltipAnchorRect, setTooltipAnchorRect] = useState<DOMRect | null>(
    null,
  );
  const tooltipHideTimeoutRef = useRef<number | null>(null);

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
      setHoveredSlotIndex(null);
      setTooltipAnchorRect(null);
      tooltipHideTimeoutRef.current = null;
    }, 180);
  };

  const compareTooltipLayout = useMemo(() => {
    if (!tooltipAnchorRect) {
      const halfWidth = Math.max(0, (window.innerWidth - 32) / 2);

      return {
        leftWidth: halfWidth,
        rightLeft: 16 + halfWidth,
        rightWidth: halfWidth,
      };
    }

    const sideGap = 12;
    const leftWidth = Math.max(0, tooltipAnchorRect.left - sideGap - 8);
    const rightLeft = tooltipAnchorRect.right + sideGap;
    const rightWidth = Math.max(0, window.innerWidth - rightLeft - 8);

    return {
      leftWidth,
      rightLeft,
      rightWidth,
    };
  }, [tooltipAnchorRect]);

  const gameData = useMemo(() => {
    return GameDataLoader.load();
  }, []);

  const plateNameMap = useMemo(() => {
    return new Map(
      gameData.plateNames.map((plateName) => {
        return [plateName.id, plateName] as const;
      }),
    );
  }, [gameData]);

  const rarityMap = useMemo(() => {
    return new Map(
      gameData.rarities.map((rarity) => {
        return [rarity.rarityId, rarity] as const;
      }),
    );
  }, [gameData]);

  const equipmentItemMap = useMemo(() => {
    return new Map(
      gameData.items.map((item) => {
        return [item.itemId, item] as const;
      }),
    );
  }, [gameData]);

  const slotsPerTab = columns * rows;
  const tabCount = Math.ceil(totalSlots / slotsPerTab);

  useEffect(() => {
    return appMemory.subscribe((nextState) => {
      setMemoryState(nextState);
    });
  }, []);

  useEffect(() => {
    return () => {
      cancelTooltipHide();
    };
  }, []);

  const inventorySlotMap = useMemo(() => {
    const map = new Map<number, InventorySlot>();

    memoryState.inventoryList.forEach((slot) => {
      map.set(slot.slotIndex, slot);
    });

    return map;
  }, [memoryState.inventoryList]);

  const selectedSlot = useMemo<InventorySlot | null>(() => {
    if (selectedSlotIndex === null) {
      return null;
    }

    return inventorySlotMap.get(selectedSlotIndex) ?? null;
  }, [inventorySlotMap, selectedSlotIndex]);

  const selectedSlotHasItem =
    selectedSlot !== null && selectedSlot.itemData !== null;

  const visibleSlots = useMemo(() => {
    const start = activeTab * slotsPerTab + 1;

    return Array.from({ length: slotsPerTab }, (_, index) => {
      const slotNumber = start + index;

      return {
        slotNumber,
        slotData: inventorySlotMap.get(slotNumber) ?? null,
      };
    }).filter((slot) => {
      return slot.slotNumber <= totalSlots;
    });
  }, [activeTab, inventorySlotMap, slotsPerTab, totalSlots]);

  const hoveredInventorySlot = useMemo<InventorySlot | null>(() => {
    if (hoveredSlotIndex === null) {
      return null;
    }

    return inventorySlotMap.get(hoveredSlotIndex) ?? null;
  }, [hoveredSlotIndex, inventorySlotMap]);

  const compareEquipmentSlot = useMemo<EquippedHeraldrySlot | null>(() => {
    if (
      !hoveredInventorySlot ||
      hoveredInventorySlot.itemData === null ||
      hoveredInventorySlot.itemData.kind !== "plate"
    ) {
      return null;
    }

    return (
      memoryState.equipmentList.find((equipmentSlot) => {
        return isSamePlateKind(hoveredInventorySlot, equipmentSlot);
      }) ?? null
    );
  }, [hoveredInventorySlot, memoryState.equipmentList]);

  const compareGeneralEquipmentSlot =
    useMemo<EquippedGeneralEquipmentSlot | null>(() => {
      return findComparableGeneralEquipmentSlot(
        hoveredInventorySlot,
        memoryState.generalEquipmentList,
      );
    }, [hoveredInventorySlot, memoryState.generalEquipmentList]);

  const compareInventorySlot = useMemo<InventorySlot | null>(() => {
    return toInventorySlotShape(compareEquipmentSlot ?? compareGeneralEquipmentSlot);
  }, [compareEquipmentSlot, compareGeneralEquipmentSlot]);

  const tooltipData = useMemo(() => {
    if (!hoveredInventorySlot) {
      return null;
    }

    return resolveInventoryTooltip(hoveredInventorySlot, compareInventorySlot);
  }, [compareInventorySlot, hoveredInventorySlot]);

  const compareTooltipData = useMemo(() => {
    if (!compareInventorySlot) {
      return null;
    }

    const resolvedCompareTooltip = resolveInventoryTooltip(compareInventorySlot);

    if (!resolvedCompareTooltip) {
      return null;
    }

    return {
      ...resolvedCompareTooltip,
      title: `${resolvedCompareTooltip.title}(Equipped)`,
    };
  }, [compareInventorySlot]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Delete") {
        return;
      }

      if (!selectedSlotHasItem || selectedSlotIndex === null) {
        return;
      }

      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (target instanceof HTMLElement && target.isContentEditable) {
        return;
      }

      event.preventDefault();
      onDeleteSelected?.(selectedSlotIndex);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onDeleteSelected, selectedSlotHasItem, selectedSlotIndex]);

  return (
    <div className="flex flex-col h-full select-none" style={{ width }}>
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
          {title}
        </h2>
        <button
          disabled={!selectedSlotHasItem}
          onClick={() => {
            if (selectedSlotIndex === null || !selectedSlotHasItem) {
              return;
            }

            onDeleteSelected?.(selectedSlotIndex);
          }}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all
            ${
              selectedSlotHasItem
                ? "bg-red-500/10 text-red-400 border border-red-500/40 hover:bg-red-500/20 active:scale-95"
                : "bg-zinc-900 text-zinc-600 border border-zinc-700 cursor-not-allowed"
            }`}
        >
          DELETE ITEM
        </button>
      </div>

      <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 mb-4 text-[11px] text-zinc-500 flex justify-between items-center">
        <div className="flex gap-3">
          <span>
            <strong className="text-zinc-400">Left:</strong> Select
          </span>
          <span>
            <strong className="text-zinc-400">Double:</strong> Edit
          </span>
          <span>
            <strong className="text-zinc-400">Del:</strong> Delete
          </span>
        </div>
        <span className="text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">
          Right Click: Equip / Swap
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: tabCount }, (_, index) => {
          return (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-medium transition-all
                ${
                  activeTab === index
                    ? "bg-zinc-100 text-zinc-950 border-zinc-100 shadow-lg shadow-white/10"
                    : "bg-zinc-900/80 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300 active:scale-90"
                }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar bg-zinc-950/20 rounded-2xl border border-white/2 p-2">
        <div
          className="grid justify-start"
          style={{
            gridTemplateColumns: `repeat(${columns}, ${SLOT_SIZE}px)`,
            gap: `${SLOT_GAP}px`,
          }}
        >
          {visibleSlots.map((slot) => {
            return (
              <InventorySlotButton
                key={slot.slotNumber}
                slotNumber={slot.slotNumber}
                slotData={slot.slotData}
                isSelected={
                  selectedSlotIndex === slot.slotNumber &&
                  slot.slotData?.itemData !== null
                }
                plateNameMap={plateNameMap}
                rarityMap={rarityMap}
                equipmentItemMap={equipmentItemMap}
                onClick={(slotNumber, slotData) => {
                  if (!slotData || slotData.itemData === null) {
                    onSelectedSlotChange?.(null);
                    return;
                  }

                  onSelectedSlotChange?.(
                    selectedSlotIndex === slotNumber ? null : slotNumber,
                  );
                }}
                onDoubleClick={(slotNumber, slotData) => {
                  if (!slotData || slotData.itemData === null) {
                    return;
                  }

                  onEditSlot?.(slotNumber);
                }}
                onRightClick={(slotNumber, slotData) => {
                  if (!slotData || slotData.itemData === null) {
                    return;
                  }

                  onEquipSlot?.(slotNumber);
                }}
                onMouseEnter={(slotNumber, slotData, event) => {
                  cancelTooltipHide();

                  if (!slotData || slotData.itemData === null) {
                    setHoveredSlotIndex(null);
                    return;
                  }

                  setHoveredSlotIndex(slotNumber);
                  setTooltipAnchorRect(event.currentTarget.getBoundingClientRect());
                  setTooltipPosition({
                    x: event.clientX,
                    y: event.clientY,
                  });
                }}
                onMouseMove={(_, slotData, event) => {
                  cancelTooltipHide();

                  if (!slotData || slotData.itemData === null) {
                    return;
                  }

                  setTooltipPosition({
                    x: event.clientX,
                    y: event.clientY,
                  });
                }}
                onMouseLeave={() => {
                  scheduleTooltipHide();
                }}
              />
            );
          })}
        </div>
      </div>

      {compareTooltipData && tooltipData ? (
        <>
          <div
            style={{
              position: "fixed",
              left: "8px",
              top: "8px",
              bottom: "8px",
              width: `${compareTooltipLayout.leftWidth}px`,
              zIndex: 9999,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "start",
              pointerEvents: "none",
              overflow: "visible",
            }}
          >
            <TooltipRouter
              data={compareTooltipData}
              position={tooltipPosition}
              variant="inline"
              maxHeight={getViewportTooltipHeight()}
              maxColumns={getTooltipMaxColumnsForWidth(
                compareTooltipLayout.leftWidth,
                2,
              )}
              onMouseEnter={cancelTooltipHide}
              onMouseLeave={scheduleTooltipHide}
            />
          </div>
          <div
            style={{
              position: "fixed",
              left: `${compareTooltipLayout.rightLeft}px`,
              top: "8px",
              bottom: "8px",
              width: `${compareTooltipLayout.rightWidth}px`,
              zIndex: 9999,
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "start",
              pointerEvents: "none",
              overflow: "visible",
            }}
          >
            <TooltipRouter
              data={tooltipData}
              position={tooltipPosition}
              variant="inline"
              maxHeight={getViewportTooltipHeight()}
              maxColumns={getTooltipMaxColumnsForWidth(
                compareTooltipLayout.rightWidth,
                2,
              )}
              onMouseEnter={cancelTooltipHide}
              onMouseLeave={scheduleTooltipHide}
            />
          </div>
        </>
      ) : tooltipData ? (
        <TooltipRouter
          data={tooltipData}
          position={{
            x: tooltipPosition.x,
            y: tooltipPosition.y,
          }}
          maxColumns={getSingleTooltipMaxColumns()}
          onMouseEnter={cancelTooltipHide}
          onMouseLeave={scheduleTooltipHide}
        />
      ) : null}
    </div>
  );
};

export default InventoryPanel;
