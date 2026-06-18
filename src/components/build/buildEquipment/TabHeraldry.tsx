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
  badge: string;
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
        className="absolute -top-0.5 -left-0.5 z-20 w-6 h-4 bg-zinc-950 border rounded flex items-center justify-center shadow-md"
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
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />
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
  const plateMap = useMemo(() => new Map(gameData.plates.map((p: GameDataModels.Plate) => [p.id, p])), [gameData]);
  const statMap = useMemo(() => new Map(gameData.stats.map((s: GameDataModels.StatDefinition) => [s.statId, s])), [gameData]);
  const plate3rdStatMap = useMemo(() => new Map(gameData.plate3rdStats.map((t: GameDataModels.PlateThirdStat) => [t.id, t])), [gameData]);

  useEffect(() => {
    return appMemory.subscribe((state) => setEquipmentList(state.equipmentList));
  }, []);

  const equipmentMap = useMemo(() => new Map(equipmentList.map(s => [s.slotKey, s])), [equipmentList]);

  // Total stats grouped by plate type across ALL equipped heraldry plates
  interface TotalStatEntry { key: string; statId: number; label: string; value: number; isPercentage: boolean; }
  interface PlateTypeSection { typeId: number; typeName: string; stats: TotalStatEntry[]; }

  const heraldryStatsSections = useMemo<PlateTypeSection[]>(() => {
    const typeMap = new Map<number, Map<string, TotalStatEntry>>();

    equipmentList.forEach((slot: EquippedHeraldrySlot) => {
      const { plateIds, plate3rdStatId } = slot.itemData;
      const plateTypeId = slot.itemTypeId;

      if (!typeMap.has(plateTypeId)) typeMap.set(plateTypeId, new Map());
      const accumulated = typeMap.get(plateTypeId)!;

      plateIds.forEach((pid) => {
        const plate = plateMap.get(pid);
        if (!plate) return;
        const stat = statMap.get(plate.statId);
        const label = stat?.displayName || stat?.statName || `Stat ${plate.statId}`;

        if (plate.statValue > 0) {
          const key = `${plate.statId}-flat`;
          const cur = accumulated.get(key);
          accumulated.set(key, { key, statId: plate.statId, label, value: (cur?.value ?? 0) + plate.statValue, isPercentage: false });
        }
        if (plate.statPercent > 0) {
          const key = `${plate.statId}-pct`;
          const cur = accumulated.get(key);
          accumulated.set(key, { key, statId: plate.statId, label, value: (cur?.value ?? 0) + plate.statPercent, isPercentage: true });
        }
      });

      if (plate3rdStatId !== null) {
        const third = plate3rdStatMap.get(plate3rdStatId);
        if (third) {
          const stat = statMap.get(third.statId);
          const label = stat?.displayName || stat?.statName || `Stat ${third.statId}`;
          const key = `${third.statId}-${third.isPercentage ? "pct" : "flat"}`;
          const cur = accumulated.get(key);
          accumulated.set(key, { key, statId: third.statId, label, value: (cur?.value ?? 0) + third.value, isPercentage: third.isPercentage });
        }
      }
    });

    const typeNameMap: Record<number, string> = {
      30001: "Enhancement",
      30002: "Skill",
      30003: "Special Skill",
      30004: "Fellowship",
    };
    const typeOrder = [30001, 30002, 30003, 30004];

    return typeOrder
      .filter((tid) => typeMap.has(tid))
      .map((tid) => ({
        typeId: tid,
        typeName: typeNameMap[tid] ?? `Type ${tid}`,
        stats: Array.from(typeMap.get(tid)!.values()).sort((a, b) => a.statId - b.statId),
      }));
  }, [equipmentList, plateMap, statMap, plate3rdStatMap]);

  const allSlots: SlotPosition[] = [
    // 1-8: Plate Stats Only (Badge S)
    { key: "stat-1", x: -140, y: -65, badge: "Stat", color: "#f97316" },
    { key: "stat-2", x: -78, y: -125, badge: "Stat", color: "#f97316" },
    { key: "stat-3", x: 78, y: -125, badge: "Stat", color: "#f97316" },
    { key: "stat-4", x: 140, y: -65, badge: "Stat", color: "#f97316" },
    { key: "stat-5", x: 140, y: 65, badge: "Stat", color: "#f97316" },
    { key: "stat-6", x: 78, y: 125, badge: "Stat", color: "#f97316" },
    { key: "stat-7", x: -78, y: 125, badge: "Stat", color: "#f97316" },
    { key: "stat-8", x: -140, y: 65, badge: "Stat", color: "#f97316" },

    // Skill 1-4: Skill Only (Badge K)
    { key: "skill-1", x: -68, y: -48, badge: "Skill", color: "#22d3ee" },
    { key: "skill-2", x: 68, y: -48, badge: "Skill", color: "#22d3ee" },
    { key: "skill-3", x: 68, y: 45, badge: "Skill", color: "#22d3ee" },
    { key: "skill-4", x: -68, y: 45, badge: "Skill", color: "#22d3ee" },

    // Corner 1-4: Expedition Only (Badge E)
    { key: "corner-1", x: -155, y: -140, badge: "Ex", color: "#a855f7" },
    { key: "corner-2", x: 155, y: -140, badge: "Ex", color: "#a855f7" },
    { key: "corner-3", x: 155, y: 140, badge: "Ex", color: "#a855f7" },
    { key: "corner-4", x: -155, y: 140, badge: "Ex", color: "#a855f7" },

    // Special (A)
    { key: "special", x: 0, y: 0, badge: "S", color: "#fbbf24" },

    // 9-11: ปรับค่า Y ลงมาจาก 205 เป็น 255 (ขยับลงประมาณ 2 ช่อง)
    { key: "stat-9", x: -95, y: 255, badge: "S/S", color: "#90cf2b" },
    { key: "stat-10", x: 0, y: 255, badge: "S/S", color: "#90cf2b" },
    { key: "stat-11", x: 95, y: 255, badge: "S/S", color: "#90cf2b" },
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
        <div className="absolute left-1/2 top-[200px] -translate-x-1/2 -translate-y-1/2 w-[290px] h-[290px] rounded-full border border-white/3 pointer-events-none" />

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

      <div className="w-[400px] mt-3 min-h-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-zinc-900/90">
        <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-2">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            Heraldry Stats
          </h2>
          <span className="text-[10px] text-zinc-600">v</span>
        </div>

        <div className="max-h-full overflow-y-auto px-4 py-2">
          {heraldryStatsSections.length > 0 ? (
            <div className="flex flex-col gap-3">
              {heraldryStatsSections.map((section) => (
                <div key={section.typeId}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 border-b border-white/5 pb-1 mb-1">
                    {section.typeName}
                  </div>
                  <div className="flex flex-col">
                    {section.stats.map((stat) => (
                      <div
                        key={stat.key}
                        className="flex items-center justify-between py-0.5"
                      >
                        <span className="text-[12px] font-semibold uppercase tracking-wide text-zinc-500">
                          {stat.label}
                        </span>
                        <span className="text-[15px] font-black tabular-nums text-zinc-100">
                          {stat.isPercentage ? `${stat.value}%` : stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-zinc-600">
              No heraldry equipped
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabHeraldry;