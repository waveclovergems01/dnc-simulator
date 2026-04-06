import React, { useEffect, useMemo, useState } from "react";
import { GameDataLoader } from "../../../data/GameDataLoader";
import type * as GameDataModels from "../../../model/GameDataModels";
import { appMemory } from "../../../state/AppMemory";
import type { EquippedHeraldrySlot } from "../../../state/models/InventoryModels";
import {
  TooltipRouter,
  resolveInventoryTooltip,
  type TooltipPosition,
} from "../../tooltip";

// --- Configuration ---
interface SlotPosition {
  key: string;
  x: number;
  y: number;
  badge: "S" | "K" | "E" | "A";
  color: string;
}

const resolveAssetUrl = (pathFile: string): string => {
  const normalizedPath = pathFile.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

// --- Sub-Component: Heraldry Slot ---
const HeraldrySlotButton: React.FC<{
  slotData: EquippedHeraldrySlot | null;
  isSelected: boolean;
  badge: string;
  badgeColor: string;
  plateNameMap: Map<number, GameDataModels.PlateName>;
  rarityMap: Map<number, GameDataModels.Rarity>;
  onRightClick: () => void;
  onMouseEnter: (event: React.MouseEvent) => void;
  onMouseMove: (event: React.MouseEvent) => void;
  onMouseLeave: () => void;
}> = ({ slotData, isSelected, badge, badgeColor, plateNameMap, rarityMap, onRightClick, onMouseEnter, onMouseMove, onMouseLeave }) => {
  
  const plate = slotData ? plateNameMap.get(slotData.itemData.plateNameId) : null;
  const rarity = slotData ? rarityMap.get(slotData.itemData.rarityId) : null;
  const rarityGlow = rarity ? `drop-shadow(0 0 6px ${rarity.color})` : "none";
  
  return (
    <div className="w-14 h-14 relative shrink-0 transition-all">
      <div 
        className="absolute -top-0.5 -left-0.5 z-20 w-4 h-4 bg-zinc-950 border rounded flex items-center justify-center shadow-md"
        style={{ borderColor: badgeColor }}
      >
        <span className="text-[9px] font-black" style={{ color: badgeColor }}>{badge}</span>
      </div>

      <button
        className={`w-full h-full relative group cursor-pointer rounded-xl border-2 transition-all flex items-center justify-center overflow-hidden
          ${plate ? "border-transparent" : "border-zinc-700 hover:border-zinc-600 shadow-inner"}
          ${isSelected ? "z-30 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.1)]" : "hover:scale-105"}`}
        style={{
          backgroundColor: plate ? "rgba(18, 18, 20, 0.95)" : "rgba(10, 10, 12, 0.6)", 
          borderColor: plate && rarity ? rarity.color : undefined,
          boxShadow: plate && rarity ? `0 0 12px ${rarity.color}66` : undefined,
        }}
        onContextMenu={(e) => { e.preventDefault(); onRightClick(); }}
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        {plate && (
          <img 
            src={resolveAssetUrl(plate.pathFile)} 
            alt={plate.name}
            className="w-[85%] h-[85%] object-contain z-10"
            style={{ filter: rarityGlow }}
          />
        )}
        {plate && (
          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-zinc-900 border border-cyan-500 rounded-full flex items-center justify-center z-10 shadow-md">
            <span className="text-[8px] text-cyan-300">↺</span>
          </div>
        )}
      </button>
    </div>
  );
};

// --- Main Component ---
const TabHeraldry: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState(appMemory.getEquipmentList());
  const [hoveredSlotKey, setHoveredSlotKey] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 });

  const gameData = useMemo(() => GameDataLoader.load(), []);
  const plateNameMap = useMemo(() => new Map(gameData.plateNames.map(p => [p.id, p])), [gameData]);
  const rarityMap = useMemo(() => new Map(gameData.rarities.map(r => [r.rarityId, r])), [gameData]);

  useEffect(() => {
    return appMemory.subscribe((state) => setEquipmentList(state.equipmentList));
  }, []);

  const equipmentMap = useMemo(() => new Map(equipmentList.map(s => [s.slotKey, s])), [equipmentList]);

  const allSlots: SlotPosition[] = [
    // 1-8: Plate Stats Only (Badge S)
    { key: "stat-1", x: -140, y: -65, badge: "S", color: "#f97316" },
    { key: "stat-2", x: -78, y: -125, badge: "S", color: "#f97316" },
    { key: "stat-3", x: 78, y: -125, badge: "S", color: "#f97316" },
    { key: "stat-4", x: 140, y: -65, badge: "S", color: "#f97316" },
    { key: "stat-5", x: 140, y: 65, badge: "S", color: "#f97316" },
    { key: "stat-6", x: 78, y: 125, badge: "S", color: "#f97316" },
    { key: "stat-7", x: -78, y: 125, badge: "S", color: "#f97316" },
    { key: "stat-8", x: -140, y: 65, badge: "S", color: "#f97316" },

    // Skill 1-4: Skill Only (Badge K)
    { key: "skill-1", x: -68, y: -48, badge: "K", color: "#22d3ee" },
    { key: "skill-2", x: 68, y: -48, badge: "K", color: "#22d3ee" },
    { key: "skill-3", x: 68, y: 45, badge: "K", color: "#22d3ee" },
    { key: "skill-4", x: -68, y: 45, badge: "K", color: "#22d3ee" },

    // Corner 1-4: Expedition Only (Badge E)
    { key: "corner-1", x: -155, y: -140, badge: "E", color: "#a855f7" },
    { key: "corner-2", x: 155, y: -140, badge: "E", color: "#a855f7" },
    { key: "corner-3", x: 155, y: 140, badge: "E", color: "#a855f7" },
    { key: "corner-4", x: -155, y: 140, badge: "E", color: "#a855f7" },

    // Special (A)
    { key: "special", x: 0, y: 0, badge: "A", color: "#fbbf24" },

    // 9-11: ปรับค่า Y ลงมาจาก 205 เป็น 255 (ขยับลงประมาณ 2 ช่อง)
    { key: "stat-9", x: -95, y: 255, badge: "A", color: "#fbbf24" },
    { key: "stat-10", x: 0, y: 255, badge: "A", color: "#fbbf24" },
    { key: "stat-11", x: 95, y: 255, badge: "A", color: "#fbbf24" },
  ];

  const centerX = 200; 
  const centerY = 200;

  const handleMouseEnter = (key: string, e: React.MouseEvent) => {
    if (equipmentMap.has(key)) {
      setHoveredSlotKey(key);
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const tooltipData = useMemo(() => {
    const slotData = hoveredSlotKey ? equipmentMap.get(hoveredSlotKey) : null;
    return slotData ? resolveInventoryTooltip({ slotIndex: 0, itemTypeId: slotData.itemTypeId, itemData: slotData.itemData }) : null;
  }, [hoveredSlotKey, equipmentMap]);

  return (
    <div className="w-full h-full flex flex-col items-center p-4 select-none">
      
      {/* ขยายความสูง Frame จาก 480px เป็น 520px เพื่อรองรับ 3 ช่องล่างที่ต่ำลงมา */}
      <div className="relative w-[400px] h-[520px] p-2 bg-zinc-950/60 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        
        {/* Deco Circle */}
        <div className="absolute left-1/2 top-[200px] -translate-x-1/2 -translate-y-1/2 w-[290px] h-[290px] rounded-full border border-white/[0.03] pointer-events-none" />

        {allSlots.map((slot) => (
          <div
            key={slot.key}
            className="absolute"
            style={{ left: `${centerX + slot.x}px`, top: `${centerY + slot.y}px`, transform: "translate(-50%, -50%)" }}
          >
            <HeraldrySlotButton
              slotData={equipmentMap.get(slot.key) || null}
              isSelected={hoveredSlotKey === slot.key}
              badge={slot.badge}
              badgeColor={slot.color}
              plateNameMap={plateNameMap}
              rarityMap={rarityMap}
              onRightClick={() => appMemory.moveHeraldryToInventory(slot.key)}
              onMouseEnter={(e) => handleMouseEnter(slot.key, e)}
              onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setHoveredSlotKey(null)}
            />
          </div>
        ))}
      </div>
      {tooltipData && <TooltipRouter data={tooltipData} position={tooltipPosition} />}
    </div>
  );
};

export default TabHeraldry;