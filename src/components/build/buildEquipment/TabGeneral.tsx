import React, { useEffect, useMemo, useState } from "react";
import { GameDataLoader } from "../../../data/GameDataLoader";
import type * as GameDataModels from "../../../model/GameDataModels";
import { appMemory } from "../../../state/AppMemory";
import type { EquippedGeneralEquipmentSlot } from "../../../state/models/InventoryModels";
import {
  TooltipRouter,
  resolveInventoryTooltip,
  type TooltipPosition,
} from "../../tooltip";

interface GeneralSlotConfig {
  key: string;
  label: string;
  isHidden?: boolean;
}

const armorSlots: GeneralSlotConfig[] = [
  { key: "helm", label: "Head" },
  { key: "upper", label: "Top" },
  { key: "lower", label: "Bottom" },
  { key: "gloves", label: "Gloves" },
  { key: "shoes", label: "Boots" },
  { key: "main_weapon", label: "Weapon" },
  { key: "secondary_weapon", label: "Sub-Weapon" },
];

const extraSlots: GeneralSlotConfig[] = [
  { key: "wing", label: "Wing", isHidden: true },
  { key: "tail", label: "Tail", isHidden: true },
  { key: "decal", label: "Decal", isHidden: true },
];

const accessorySlots: GeneralSlotConfig[] = [
  { key: "necklace", label: "Necklace" },
  { key: "earrings-1", label: "Earring" },
  { key: "ring-1", label: "Ring 1" },
  { key: "ring-2", label: "Ring 2" },
];

const resolveAssetUrl = (pathFile: string): string => {
  const normalizedPath = pathFile.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

const EquipmentSlot: React.FC<{
  config: GeneralSlotConfig;
  slotData: EquippedGeneralEquipmentSlot | null;
  itemMap: Map<number, GameDataModels.EquipmentItem>;
  rarityMap: Map<number, GameDataModels.Rarity>;
  isSelected: boolean;
  onRightClick: () => void;
  onMouseEnter: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseMove: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave: () => void;
}> = ({
  config,
  slotData,
  itemMap,
  rarityMap,
  isSelected,
  onRightClick,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}) => {
  const item = slotData ? itemMap.get(slotData.itemData.itemId) : null;
  const rarity = slotData ? rarityMap.get(slotData.itemData.rarityId) : null;
  const hasItem = item !== null && item !== undefined;
  const rarityColor = rarity?.color ?? "#3f3f46";
  const enhancementLevel = slotData?.itemData.enhancementLevel ?? 0;

  return (
    <div
      className={`w-13 h-13 sm:w-14 sm:h-14 relative shrink-0 ${
        config.isHidden ? "invisible" : "visible"
      }`}
      title={config.label}
    >
      <button
        type="button"
        className={`w-full h-full relative group rounded-lg border-2 transition-all flex items-center justify-center overflow-hidden
          ${hasItem ? "border-transparent" : "border-zinc-700 hover:border-zinc-600 shadow-inner"}
          ${isSelected ? "scale-110 z-20" : "hover:scale-105"}`}
        style={{
          backgroundColor: hasItem ? "rgba(18, 18, 20, 0.95)" : "rgba(10, 10, 12, 0.6)",
          borderColor: hasItem ? rarityColor : undefined,
          boxShadow: hasItem ? `0 0 10px ${rarityColor}66` : undefined,
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          onRightClick();
        }}
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />
        {hasItem && item?.pathFile ? (
          <img
            src={resolveAssetUrl(item.pathFile)}
            alt={item.name}
            className="w-[85%] h-[85%] object-contain z-10 transition-transform group-hover:scale-110"
            style={{ filter: `drop-shadow(0 0 5px ${rarityColor})` }}
          />
        ) : null}
        {hasItem && !item?.pathFile ? (
          <div
            className="z-10 text-[11px] font-bold text-zinc-200 transition-transform group-hover:scale-110"
            style={{ filter: `drop-shadow(0 0 5px ${rarityColor})` }}
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
        {hasItem ? (
          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-zinc-900 border border-cyan-500 rounded-full flex items-center justify-center z-10 shadow-md">
            <span className="text-[8px] text-cyan-300">↺</span>
          </div>
        ) : (
          <div className="w-10 h-10 bg-zinc-800/50 rounded-md" />
        )}
      </button>
    </div>
  );
};

const TabGeneral: React.FC = () => {
  const [generalEquipmentList, setGeneralEquipmentList] = useState(
    appMemory.getGeneralEquipmentList(),
  );
  const [hoveredSlotKey, setHoveredSlotKey] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    x: 0,
    y: 0,
  });

  const gameData = useMemo(() => {
    return GameDataLoader.load();
  }, []);

  const itemMap = useMemo(() => {
    return new Map(
      gameData.items.map((item: GameDataModels.EquipmentItem) => {
        return [item.itemId, item] as const;
      }),
    );
  }, [gameData]);

  const rarityMap = useMemo(() => {
    return new Map(
      gameData.rarities.map((rarity: GameDataModels.Rarity) => {
        return [rarity.rarityId, rarity] as const;
      }),
    );
  }, [gameData]);

  useEffect(() => {
    return appMemory.subscribe((state) => {
      setGeneralEquipmentList(state.generalEquipmentList);
    });
  }, []);

  const equipmentMap = useMemo(() => {
    return new Map(
      generalEquipmentList.map((slot: EquippedGeneralEquipmentSlot) => {
        return [slot.slotKey, slot] as const;
      }),
    );
  }, [generalEquipmentList]);

  const tooltipData = useMemo(() => {
    const slotData = hoveredSlotKey ? equipmentMap.get(hoveredSlotKey) : null;

    return slotData
      ? resolveInventoryTooltip({
          slotIndex: 0,
          itemTypeId: slotData.itemTypeId,
          itemData: slotData.itemData,
        })
      : null;
  }, [equipmentMap, hoveredSlotKey]);

  const renderSlot = (config: GeneralSlotConfig): React.ReactNode => {
    return (
      <EquipmentSlot
        key={config.key}
        config={config}
        slotData={equipmentMap.get(config.key) ?? null}
        itemMap={itemMap}
        rarityMap={rarityMap}
        isSelected={hoveredSlotKey === config.key}
        onRightClick={() => {
          appMemory.moveGeneralEquipmentToInventory(config.key);
        }}
        onMouseEnter={(event) => {
          if (!equipmentMap.has(config.key)) {
            return;
          }

          setHoveredSlotKey(config.key);
          setTooltipPosition({ x: event.clientX, y: event.clientY });
        }}
        onMouseMove={(event) => {
          if (!equipmentMap.has(config.key)) {
            return;
          }

          setTooltipPosition({ x: event.clientX, y: event.clientY });
        }}
        onMouseLeave={() => {
          setHoveredSlotKey(null);
        }}
      />
    );
  };

  return (
    <div className="w-full h-full bg-zinc-950/50 flex flex-col items-end p-4 select-none relative overflow-hidden">
      <div className="flex flex-col items-end space-y-4 z-10 pr-6 sm:pr-8">
        <div className="flex items-end space-x-2">
          <div className="flex flex-col space-y-1.5">
            {armorSlots.map(renderSlot)}
          </div>

          <div className="flex flex-col space-y-1.5 justify-end">
            <div className="h-13 sm:h-14" />
            <div className="h-13 sm:h-14" />
            <div className="h-13 sm:h-14" />
            <div className="h-13 sm:h-14" />
            {extraSlots.map(renderSlot)}
          </div>
        </div>

        <div className="w-[312px] h-[1px] bg-white/10" />

        <div className="flex flex-row-reverse gap-2 pr-[66px] sm:pr-[72px]">
          {[...accessorySlots].reverse().map(renderSlot)}
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <span className="text-zinc-600 italic text-sm">Character Preview Area</span>
      </div>

      {tooltipData ? (
        <TooltipRouter data={tooltipData} position={tooltipPosition} />
      ) : null}
    </div>
  );
};

export default TabGeneral;
