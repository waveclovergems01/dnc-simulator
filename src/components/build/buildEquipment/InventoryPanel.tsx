import React, { useEffect, useMemo, useState } from "react";
import { GameDataLoader } from "../../../data/GameDataLoader";
import type * as GameDataModels from "../../../model/GameDataModels";
import { appMemory } from "../../../state/AppMemory";
import type { AppMemoryState } from "../../../state/models/AppMemoryState";
import type {
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
const COMPARE_TOOLTIP_OFFSET_X = 286;

const resolveAssetUrl = (pathFile: string): string => {
  const normalizedPath = pathFile.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

const isSamePlateKind = (
  inventorySlot: InventorySlot | null,
  equipmentSlot: EquippedHeraldrySlot | null,
): boolean => {
  if (!inventorySlot || !equipmentSlot || inventorySlot.itemData === null) {
    return false;
  }

  return (
    inventorySlot.itemTypeId === equipmentSlot.itemTypeId &&
    inventorySlot.itemData.plateNameId === equipmentSlot.itemData.plateNameId
  );
};

const InventorySlotButton: React.FC<{
  slotNumber: number;
  slotData: InventorySlot | null;
  isSelected: boolean;
  plateNameMap: Map<number, GameDataModels.PlateName>;
  rarityMap: Map<number, GameDataModels.Rarity>;
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
  onMouseLeave: () => void;
}> = ({
  slotNumber,
  slotData,
  isSelected,
  plateNameMap,
  rarityMap,
  onClick,
  onDoubleClick,
  onRightClick,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}) => {
  const plateItemData = slotData?.itemData ?? null;
  const plateName = plateItemData ? plateNameMap.get(plateItemData.plateNameId) : null;
  const rarity = plateItemData ? rarityMap.get(plateItemData.rarityId) : null;
  const hasItem = plateItemData !== null && plateName !== null;

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
        backgroundColor: hasItem ? "rgba(18, 18, 20, 0.95)" : "rgba(10, 10, 12, 0.4)",
        borderColor: hasItem && rarity ? rarity.color : undefined,
        boxShadow: hasItem && rarity ? `0 0 10px ${rarity.color}44` : "none",
      }}
    >
      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />
      {hasItem && plateName ? (
        <img
          src={resolveAssetUrl(plateName.pathFile)}
          alt={plateName.name}
          className="w-[85%] h-[85%] object-contain z-10 transition-transform group-hover:scale-110"
          style={{
            filter: rarity ? `drop-shadow(0 0 4px ${rarity.color})` : "none",
          }}
        />
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
  const [memoryState, setMemoryState] = useState<AppMemoryState>(appMemory.getState());
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 });

  const gameData = useMemo(() => GameDataLoader.load(), []);
  const plateNameMap = useMemo(() => new Map(gameData.plateNames.map((plateName) => [plateName.id, plateName] as const)), [gameData]);
  const rarityMap = useMemo(() => new Map(gameData.rarities.map((rarity) => [rarity.rarityId, rarity] as const)), [gameData]);

  const slotsPerTab = columns * rows;
  const tabCount = Math.ceil(totalSlots / slotsPerTab);

  useEffect(() => {
    return appMemory.subscribe((nextState) => {
      setMemoryState(nextState);
    });
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

  const selectedSlotHasItem = selectedSlot?.itemData !== null && selectedSlot !== null;

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
    if (!hoveredInventorySlot || hoveredInventorySlot.itemData === null) {
      return null;
    }

    return (
      memoryState.equipmentList.find((equipmentSlot) => {
        return isSamePlateKind(hoveredInventorySlot, equipmentSlot);
      }) ?? null
    );
  }, [hoveredInventorySlot, memoryState.equipmentList]);

  const tooltipData = useMemo(() => {
    return resolveInventoryTooltip(hoveredInventorySlot, compareEquipmentSlot);
  }, [compareEquipmentSlot, hoveredInventorySlot]);

  const compareTooltipData = useMemo(() => {
    if (!hoveredInventorySlot || !compareEquipmentSlot) {
      return null;
    }

    const resolvedCompareTooltip = resolveInventoryTooltip(
      compareEquipmentSlot,
      hoveredInventorySlot,
    );

    if (!resolvedCompareTooltip) {
      return null;
    }

    return {
      ...resolvedCompareTooltip,
      title: `${resolvedCompareTooltip.title}(Equipped)`,
    };
  }, [compareEquipmentSlot, hoveredInventorySlot]);

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
        target instanceof HTMLSelectElement ||
        target instanceof HTMLElement
      ) {
        if (target instanceof HTMLElement && target.isContentEditable) {
          return;
        }
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
        <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{title}</h2>
        <button
          disabled={!selectedSlotHasItem}
          onClick={() => {
            if (selectedSlotIndex === null || !selectedSlotHasItem) {
              return;
            }

            onDeleteSelected?.(selectedSlotIndex);
          }}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all
            ${selectedSlotHasItem
              ? "bg-red-500/10 text-red-400 border border-red-500/40 hover:bg-red-500/20 active:scale-95"
              : "bg-zinc-900 text-zinc-600 border border-zinc-700 cursor-not-allowed"}`}
        >
          DELETE ITEM
        </button>
      </div>

      <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 mb-4 text-[11px] text-zinc-500 flex justify-between items-center">
        <div className="flex gap-3">
          <span><strong className="text-zinc-400">Left:</strong> Select</span>
          <span><strong className="text-zinc-400">Double:</strong> Edit</span>
          <span><strong className="text-zinc-400">Del:</strong> Delete</span>
        </div>
        <span className="text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">
          Right Click: Equip / Swap
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: tabCount }, (_, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-medium transition-all
              ${activeTab === index
                ? "bg-zinc-100 text-zinc-950 border-zinc-100 shadow-lg shadow-white/10"
                : "bg-zinc-900/80 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300 active:scale-90"}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar bg-zinc-950/20 rounded-2xl border border-white/2 p-2">
        <div
          className="grid justify-start"
          style={{
            gridTemplateColumns: `repeat(${columns}, ${SLOT_SIZE}px)`,
            gap: `${SLOT_GAP}px`,
          }}
        >
          {visibleSlots.map((slot) => (
            <InventorySlotButton
              key={slot.slotNumber}
              {...slot}
              isSelected={selectedSlotIndex === slot.slotNumber && slot.slotData?.itemData !== null}
              plateNameMap={plateNameMap}
              rarityMap={rarityMap}
              onClick={(slotNumber, slotData) => {
                if (!slotData || slotData.itemData === null) {
                  onSelectedSlotChange?.(null);
                  return;
                }

                onSelectedSlotChange?.(selectedSlotIndex === slotNumber ? null : slotNumber);
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
                if (!slotData || slotData.itemData === null) {
                  setHoveredSlotIndex(null);
                  return;
                }

                setHoveredSlotIndex(slotNumber);
                setTooltipPosition({ x: event.clientX, y: event.clientY });
              }}
              onMouseMove={(_, slotData, event) => {
                if (!slotData || slotData.itemData === null) {
                  return;
                }

                setTooltipPosition({ x: event.clientX, y: event.clientY });
              }}
              onMouseLeave={() => setHoveredSlotIndex(null)}
            />
          ))}
        </div>
      </div>

      {tooltipData ? <TooltipRouter data={tooltipData} position={tooltipPosition} /> : null}
      {compareTooltipData ? (
        <TooltipRouter
          data={compareTooltipData}
          position={{
            x: tooltipPosition.x + COMPARE_TOOLTIP_OFFSET_X,
            y: tooltipPosition.y,
          }}
        />
      ) : null}
    </div>
  );
};

export default InventoryPanel;
