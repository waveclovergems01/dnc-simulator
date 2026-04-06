import React, { useEffect, useMemo, useState } from "react";
import { GameDataLoader } from "../../../data/GameDataLoader";
import type * as GameDataModels from "../../../model/GameDataModels";
import { appMemory } from "../../../state/AppMemory";
import type { AppMemoryState } from "../../../state/models/AppMemoryState";
import type { EquippedHeraldrySlot } from "../../../state/models/InventoryModels";
import {
  TooltipRouter,
  resolveInventoryTooltip,
  type TooltipPosition,
} from "../../tooltip";

// --- Types ---
type CostumeSlotType = 
  | "helmet" | "armour" | "pants" | "gloves" | "boots" 
  | "mainWeapon" | "subWeapon" 
  | "necklace" | "earring" | "ring"
  | "wing" | "tail" | "decals";

interface SlotPosition {
  key: string;
  type: CostumeSlotType;
  row: string;
  col: string;
}

interface CostumeSlotButtonProps {
  type: CostumeSlotType;
  slotData: EquippedHeraldrySlot | null;
  plateNameMap: Map<number, GameDataModels.PlateName>;
  rarityMap: Map<number, GameDataModels.Rarity>;
  onRightClick?: () => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseMove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: () => void;
}

const bgPlate = new URL("/assets/img/general/bg.png", import.meta.url).href;

const resolveAssetUrl = (pathFile: string): string => {
  const normalizedPath = pathFile.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

// --- Sub-Component: CostumeSlotButton ---
const CostumeSlotButton: React.FC<CostumeSlotButtonProps> = ({
  slotData,
  plateNameMap,
  rarityMap,
  onRightClick,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}) => {
  const plateName = slotData ? plateNameMap.get(slotData.itemData.plateNameId) : null;
  const rarity = slotData ? rarityMap.get(slotData.itemData.rarityId) : null;

  return (
    <button
      type="button"
      onContextMenu={(e) => { 
        e.preventDefault(); 
        onRightClick?.(); 
      }}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative flex h-14 w-14 items-center justify-center rounded-[10px] bg-black/40 p-0 border border-white/10 hover:border-white/30 transition-all cursor-pointer"
      style={{
        backgroundImage: `url(${bgPlate})`,
        backgroundSize: "cover",
      }}
    >
      {slotData && plateName ? (
        <img
          src={resolveAssetUrl(plateName.pathFile)}
          alt={plateName.name}
          className="h-[42px] w-[42px] rounded-sm object-contain"
          style={{
            border: rarity ? `1px solid ${rarity.color}` : "none",
          }}
        />
      ) : (
        <div className="flex flex-col items-center opacity-30">
           <span className="text-[9px] uppercase font-bold text-white">Empty</span>
        </div>
      )}
    </button>
  );
};

// --- Main Component: TabCostume ---
const TabCostume: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<EquippedHeraldrySlot[]>(appMemory.getEquipmentList());
  const [hoveredSlotKey, setHoveredSlotKey] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 });

  const gameData = useMemo(() => GameDataLoader.load(), []);
  const plateNameMap = useMemo(() => new Map(gameData.plateNames.map(p => [p.id, p])), [gameData]);
  const rarityMap = useMemo(() => new Map(gameData.rarities.map(r => [r.rarityId, r])), [gameData]);

  useEffect(() => {
    return appMemory.subscribe((state: AppMemoryState) => setEquipmentList(state.equipmentList));
  }, []);

  const equipmentMap = useMemo(() => new Map(equipmentList.map(s => [s.slotKey, s])), [equipmentList]);

  const slots: SlotPosition[] = [
    { key: "costume-helmet", type: "helmet", row: "row-start-1", col: "col-start-5" },
    { key: "costume-armour", type: "armour", row: "row-start-2", col: "col-start-5" },
    { key: "costume-pants", type: "pants", row: "row-start-3", col: "col-start-5" },
    { key: "costume-gloves", type: "gloves", row: "row-start-4", col: "col-start-5" },
    { key: "costume-boots", type: "boots", row: "row-start-5", col: "col-start-5" },
    { key: "costume-main-weapon", type: "mainWeapon", row: "row-start-6", col: "col-start-5" },
    { key: "costume-sub-weapon", type: "subWeapon", row: "row-start-7", col: "col-start-5" },
    
    { key: "costume-wing", type: "wing", row: "row-start-7", col: "col-start-6" },
    { key: "costume-tail", type: "tail", row: "row-start-8", col: "col-start-6" },
    { key: "costume-decals", type: "decals", row: "row-start-9", col: "col-start-6" },

    { key: "costume-necklace", type: "necklace", row: "row-start-8", col: "col-start-1" },
    { key: "costume-earring", type: "earring", row: "row-start-8", col: "col-start-2" },
    { key: "costume-ring-1", type: "ring", row: "row-start-8", col: "col-start-3" },
    { key: "costume-ring-2", type: "ring", row: "row-start-8", col: "col-start-4" },
  ];

  const hoveredSlotData = hoveredSlotKey ? equipmentMap.get(hoveredSlotKey) : null;
  const tooltipData = useMemo(() => {
     if(!hoveredSlotData) return null;
     return resolveInventoryTooltip({ 
       slotIndex: 0, 
       itemTypeId: hoveredSlotData.itemTypeId, 
       itemData: hoveredSlotData.itemData 
     });
  }, [hoveredSlotData]);

  return (
    <div className="flex w-full justify-center pt-5">
      <div className="grid grid-cols-6 grid-rows-[repeat(9,56px)] gap-x-2 gap-y-[5px] rounded-xl border border-white/5 bg-black/20 p-4 h-fit w-fit shadow-2xl">
        {slots.map((slot) => (
          <div
            key={slot.key}
            className={`${slot.row} ${slot.col} flex items-center justify-center`}
          >
            <CostumeSlotButton
              type={slot.type}
              slotData={equipmentMap.get(slot.key) ?? null}
              plateNameMap={plateNameMap}
              rarityMap={rarityMap}
              onRightClick={() => {
                console.log(`Unequip Costume: ${slot.key}`);
              }}
              onMouseEnter={(e) => {
                setHoveredSlotKey(slot.key);
                setTooltipPosition({ x: e.clientX, y: e.clientY });
              }}
              onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setHoveredSlotKey(null)}
            />
          </div>
        ))}
      </div>
      {tooltipData && (
        <TooltipRouter data={tooltipData} position={tooltipPosition} />
      )}
    </div>
  );
};

export default TabCostume;