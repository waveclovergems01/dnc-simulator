import React, { useEffect, useMemo, useState } from "react";
import { GameDataLoader } from "../../../data/GameDataLoader";
import type * as GameDataModels from "../../../model/GameDataModels";
import { appMemory } from "../../../state/AppMemory";
import type { InventorySlot } from "../../../state/models/InventoryModels";
import {
  TooltipRouter,
  resolveInventoryTooltip,
  type TooltipPosition,
} from "../../tooltip";

// --- Configuration ---
const SLOT_SIZE = 56;
const SLOT_GAP = 8; 

const resolveAssetUrl = (pathFile: string): string => {
  const normalizedPath = pathFile.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

// --- Sub-Component: Inventory Slot Button ---
const InventorySlotButton: React.FC<{
  slotNumber: number;
  slotData: InventorySlot | null;
  isSelected: boolean;
  plateNameMap: Map<number, GameDataModels.PlateName>;
  rarityMap: Map<number, GameDataModels.Rarity>;
  onClick: (slotNumber: number) => void;
  onDoubleClick: (slotNumber: number) => void;
  onRightClick: (slotNumber: number) => void;
  onMouseEnter: (slotNumber: number, event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseMove: (slotNumber: number, event: React.MouseEvent<HTMLButtonElement>) => void;
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
  const hasItem = !!plateName;

  return (
    <button
      type="button"
      onClick={() => onClick(slotNumber)}
      onDoubleClick={() => onDoubleClick(slotNumber)}
      onContextMenu={(e) => {
        e.preventDefault();
        onRightClick(slotNumber);
      }}
      onMouseEnter={(e) => onMouseEnter(slotNumber, e)}
      onMouseMove={(e) => onMouseMove(slotNumber, e)}
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
      {hasItem && plateName && (
        <img
          src={resolveAssetUrl(plateName.pathFile)}
          alt={plateName.name}
          className="w-[85%] h-[85%] object-contain z-10 transition-transform group-hover:scale-110"
          style={{
            filter: rarity ? `drop-shadow(0 0 4px ${rarity.color})` : "none",
          }}
        />
      )}
    </button>
  );
};

// --- Main Component: Inventory Panel ---
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
  const [inventoryList, setInventoryList] = useState(appMemory.getInventoryList());
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 });

  const gameData = useMemo(() => GameDataLoader.load(), []);
  const plateNameMap = useMemo(() => new Map(gameData.plateNames.map((p) => [p.id, p])), [gameData]);
  const rarityMap = useMemo(() => new Map(gameData.rarities.map((r) => [r.rarityId, r])), [gameData]);

  const slotsPerTab = columns * rows;
  const tabCount = Math.ceil(totalSlots / slotsPerTab);

  useEffect(() => {
    return appMemory.subscribe((state) => setInventoryList(state.inventoryList));
  }, []);

  const inventorySlotMap = useMemo(() => {
    const map = new Map();
    inventoryList.forEach((slot) => map.set(slot.slotIndex, slot));
    return map;
  }, [inventoryList]);

  const visibleSlots = useMemo(() => {
    const start = activeTab * slotsPerTab + 1;
    return Array.from({ length: slotsPerTab }, (_, i) => {
      const num = start + i;
      return { slotNumber: num, slotData: inventorySlotMap.get(num) || null };
    }).filter((s) => s.slotNumber <= totalSlots);
  }, [activeTab, inventorySlotMap, slotsPerTab, totalSlots]);

  const tooltipData = useMemo(() => {
    const slot = hoveredSlotIndex ? inventorySlotMap.get(hoveredSlotIndex) : null;
    return resolveInventoryTooltip(slot);
  }, [hoveredSlotIndex, inventorySlotMap]);

  return (
    <div className="flex flex-col h-full select-none" style={{ width }}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{title}</h2>
        <button
          disabled={selectedSlotIndex === null}
          onClick={() => selectedSlotIndex && onDeleteSelected?.(selectedSlotIndex)}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all
            ${selectedSlotIndex 
              ? "bg-red-500/10 text-red-400 border border-red-500/40 hover:bg-red-500/20 active:scale-95" 
              : "bg-zinc-900 text-zinc-600 border border-zinc-700 cursor-not-allowed"}`}
        >
          DELETE ITEM
        </button>
      </div>

      {/* Usage Guide */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3 mb-4 text-[11px] text-zinc-500 flex justify-between items-center">
        <div className="flex gap-3">
          <span><strong className="text-zinc-400">Left:</strong> Select</span>
          <span><strong className="text-zinc-400">Double:</strong> Edit</span>
        </div>
        <span className="text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700">
          Right Click: Equip
        </span>
      </div>

      {/* Pagination Tabs - ปรับเป็น flex-wrap แทน scrollbar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: tabCount }, (_, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-medium transition-all
              ${activeTab === i 
                ? "bg-zinc-100 text-zinc-950 border-zinc-100 shadow-lg shadow-white/10" 
                : "bg-zinc-900/80 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300 active:scale-90"}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Inventory Grid Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar bg-zinc-950/20 rounded-2xl border border-white/2 p-2">
        <div 
          className="grid justify-start"
          style={{ 
            gridTemplateColumns: `repeat(${columns}, ${SLOT_SIZE}px)`,
            gap: `${SLOT_GAP}px` 
          }}
        >
          {visibleSlots.map((slot) => (
            <InventorySlotButton
              key={slot.slotNumber}
              {...slot}
              isSelected={selectedSlotIndex === slot.slotNumber}
              plateNameMap={plateNameMap}
              rarityMap={rarityMap}
              onClick={(n) => onSelectedSlotChange?.(selectedSlotIndex === n ? null : n)}
              onDoubleClick={(n) => onEditSlot?.(n)}
              onRightClick={(n) => onEquipSlot?.(n)}
              onMouseEnter={(n, e) => {
                if (inventorySlotMap.get(n)?.itemData) {
                  setHoveredSlotIndex(n);
                  setTooltipPosition({ x: e.clientX, y: e.clientY });
                }
              }}
              onMouseMove={(_, e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setHoveredSlotIndex(null)}
            />
          ))}
        </div>
      </div>

      {tooltipData && <TooltipRouter data={tooltipData} position={tooltipPosition} />}
    </div>
  );
};

export default InventoryPanel;