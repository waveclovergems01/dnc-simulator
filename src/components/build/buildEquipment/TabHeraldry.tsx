import React, { useEffect, useMemo, useState } from "react";
import { GameDataLoader } from "../../../data/GameDataLoader";
import type * as GameDataModels from "../../../model/GameDataModels";
import { appMemory } from "../../../state/AppMemory";
import type { AppMemoryState } from "../../../state/models/AppMemoryState";
import type {
  EquippedHeraldrySlot,
  HeraldrySlotType,
  InventorySlot,
} from "../../../state/models/InventoryModels";
import {
  TooltipRouter,
  resolveInventoryTooltip,
  type TooltipPosition,
} from "../../tooltip";

interface SlotPosition {
  key: string;
  label: string;
  x: number;
  y: number;
  type: HeraldrySlotType;
}

interface HeraldrySlotButtonProps {
  label: string;
  type: HeraldrySlotType;
  slotData: EquippedHeraldrySlot | null;
  isSelected: boolean;
  plateNameMap: Map<number, GameDataModels.PlateName>;
  rarityMap: Map<number, GameDataModels.Rarity>;
  onClick?: () => void;
  onRightClick?: () => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseMove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: () => void;
}

const bgPlate = new URL("/assets/img/plate/bg.png", import.meta.url).href;
const bgCorner = new URL("/assets/img/plate/bgcorner.png", import.meta.url)
  .href;

const resolveAssetUrl = (pathFile: string): string => {
  const normalizedPath = pathFile.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

const toTooltipInventorySlot = (
  slotData: EquippedHeraldrySlot | null,
): InventorySlot | null => {
  if (!slotData) {
    return null;
  }

  return {
    slotIndex: 0,
    itemTypeId: slotData.itemTypeId,
    itemData: slotData.itemData,
  };
};

const HeraldrySlotButton: React.FC<HeraldrySlotButtonProps> = ({
  label,
  type,
  slotData,
  isSelected,
  plateNameMap,
  rarityMap,
  onClick,
  onRightClick,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}) => {
  const isCorner = type === "corner";
  const isSkill = type === "skill";
  const isSpecial = type === "special";

  const plateName =
    slotData === null
      ? null
      : (plateNameMap.get(slotData.itemData.plateNameId) ?? null);

  const rarity =
    slotData === null
      ? null
      : (rarityMap.get(slotData.itemData.rarityId) ?? null);

  return (
    <button
      type="button"
      onClick={onClick}
      onContextMenu={(event) => {
        event.preventDefault();

        if (onRightClick) {
          onRightClick();
        }
      }}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        width: isCorner ? "52px" : "56px",
        height: isCorner ? "52px" : "56px",
        border: isSelected ? "2px solid #fbbf24" : "none",
        outline: "none",
        borderRadius: isCorner ? "8px" : "14px",
        backgroundImage: `url(${isCorner ? bgCorner : bgPlate})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundColor: "transparent",
        boxShadow: "none",
        color: isCorner
          ? "#777"
          : isSpecial
            ? "#7dff5d"
            : isSkill
              ? "#f0df2d"
              : "#2df4ef",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0",
        fontSize: isCorner ? "14px" : "22px",
        fontWeight: 700,
        textShadow: isCorner ? "none" : "0 0 8px currentColor",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {slotData && plateName ? (
        <img
          src={resolveAssetUrl(plateName.pathFile)}
          alt={plateName.name}
          style={{
            width: "48px",
            height: "48px",
            objectFit: "contain",
            borderRadius: "4px",
            border: rarity
              ? `1px solid ${rarity.color}`
              : "1px solid transparent",
            boxSizing: "border-box",
          }}
        />
      ) : isCorner ? (
        ""
      ) : (
        label
      )}
    </button>
  );
};

const TabHeraldry: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<EquippedHeraldrySlot[]>(
    appMemory.getEquipmentList(),
  );
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);
  const [hoveredSlotKey, setHoveredSlotKey] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    x: 0,
    y: 0,
  });

  const gameData = useMemo(() => {
    return GameDataLoader.load();
  }, []);

  const plateNameMap = useMemo<Map<number, GameDataModels.PlateName>>(() => {
    return new Map(
      gameData.plateNames.map((plateName: GameDataModels.PlateName) => {
        return [plateName.id, plateName] as const;
      }),
    );
  }, [gameData]);

  const rarityMap = useMemo<Map<number, GameDataModels.Rarity>>(() => {
    return new Map(
      gameData.rarities.map((rarity: GameDataModels.Rarity) => {
        return [rarity.rarityId, rarity] as const;
      }),
    );
  }, [gameData]);

  useEffect(() => {
  const unsubscribe = appMemory.subscribe((state: AppMemoryState) => {
    setEquipmentList(state.equipmentList);
  });

  return () => {
    unsubscribe();
  };
}, []);

  const equipmentMap = useMemo<Map<string, EquippedHeraldrySlot>>(() => {
    return new Map(
      equipmentList.map((slot: EquippedHeraldrySlot) => {
        return [slot.slotKey, slot] as const;
      }),
    );
  }, [equipmentList]);

  const safeSelectedSlotKey =
    selectedSlotKey !== null && equipmentMap.has(selectedSlotKey)
      ? selectedSlotKey
      : null;

  const statSlots: SlotPosition[] = [
    { key: "stat-1", label: "", x: -115, y: -50, type: "stat" },
    { key: "stat-2", label: "", x: -61, y: -95, type: "stat" },
    { key: "stat-3", label: "", x: 61, y: -95, type: "stat" },
    { key: "stat-4", label: "", x: 115, y: -50, type: "stat" },
    { key: "stat-5", label: "", x: 115, y: 50, type: "stat" },
    { key: "stat-6", label: "", x: 61, y: 95, type: "stat" },
    { key: "stat-7", label: "", x: -61, y: 95, type: "stat" },
    { key: "stat-8", label: "", x: -115, y: 50, type: "stat" },
    { key: "stat-9", label: "", x: -70, y: 170, type: "stat" },
    { key: "stat-10", label: "", x: 0, y: 170, type: "stat" },
    { key: "stat-11", label: "", x: 70, y: 170, type: "stat" },
  ];

  const skillSlots: SlotPosition[] = [
    { key: "skill-1", label: "", x: -55, y: -35, type: "skill" },
    { key: "skill-2", label: "", x: 55, y: -35, type: "skill" },
    { key: "skill-3", label: "", x: 55, y: 35, type: "skill" },
    { key: "skill-4", label: "", x: -55, y: 35, type: "skill" },
  ];

  const cornerSlots: SlotPosition[] = [
    { key: "corner-1", label: "", x: -125, y: -110, type: "corner" },
    { key: "corner-2", label: "", x: 125, y: -110, type: "corner" },
    { key: "corner-3", label: "", x: 125, y: 110, type: "corner" },
    { key: "corner-4", label: "", x: -125, y: 110, type: "corner" },
  ];

  const specialSlot: SlotPosition = {
    key: "special",
    label: "",
    x: 0,
    y: 0,
    type: "special",
  };

  const allSlots: SlotPosition[] = [
    ...statSlots,
    ...skillSlots,
    ...cornerSlots,
    specialSlot,
  ];

  const centerX = 160;
  const centerY = 150;

  const hoveredSlotData = useMemo<EquippedHeraldrySlot | null>(() => {
    if (hoveredSlotKey === null) {
      return null;
    }

    return equipmentMap.get(hoveredSlotKey) ?? null;
  }, [equipmentMap, hoveredSlotKey]);

  const tooltipData = useMemo(() => {
    return resolveInventoryTooltip(toTooltipInventorySlot(hoveredSlotData));
  }, [hoveredSlotData]);

  const handleSlotRightClick = (slot: SlotPosition): void => {
    const moved = appMemory.moveHeraldryToInventory(slot.key);

    if (moved && safeSelectedSlotKey === slot.key) {
      setSelectedSlotKey(null);
    }
  };

  const handleSlotMouseEnter = (
    slot: SlotPosition,
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    const slotData = equipmentMap.get(slot.key) ?? null;

    if (!slotData) {
      setHoveredSlotKey(null);
      return;
    }

    setHoveredSlotKey(slot.key);
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleSlotMouseMove = (
    slot: SlotPosition,
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    const slotData = equipmentMap.get(slot.key) ?? null;

    if (!slotData) {
      setHoveredSlotKey(null);
      return;
    }

    setHoveredSlotKey(slot.key);
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleSlotMouseLeave = (): void => {
    setHoveredSlotKey(null);
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          padding: "16px 0",
          gap: "12px",
        }}
      >
        <div
          style={{
            color: "#94a3b8",
            fontSize: "12px",
          }}
        >
          Right click = move back to inventory
        </div>

        <div
          style={{
            position: "relative",
            width: "320px",
            height: "400px",
            borderRadius: "12px",
            overflow: "hidden",
            background:
              "radial-gradient(circle at center, #3b3b3b 0%, #232323 55%, #111111 100%)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: `${centerY}px`,
              width: "240px",
              height: "240px",
              transform: "translate(-50%, -50%)",
              borderRadius: "9999px",
              border: "2px solid rgba(160,160,160,0.12)",
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 50px rgba(0,0,0,0.2)",
            }}
          />

          {allSlots.map((slot) => {
            const slotData = equipmentMap.get(slot.key) ?? null;

            return (
              <div
                key={slot.key}
                style={{
                  position: "absolute",
                  left: `${centerX + slot.x}px`,
                  top: `${centerY + slot.y}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <HeraldrySlotButton
                  label={slot.label}
                  type={slot.type}
                  slotData={slotData}
                  isSelected={safeSelectedSlotKey === slot.key}
                  plateNameMap={plateNameMap}
                  rarityMap={rarityMap}
                  onRightClick={() => handleSlotRightClick(slot)}
                  onMouseEnter={(event) => handleSlotMouseEnter(slot, event)}
                  onMouseMove={(event) => handleSlotMouseMove(slot, event)}
                  onMouseLeave={handleSlotMouseLeave}
                />
              </div>
            );
          })}
        </div>
      </div>

      {tooltipData ? (
        <TooltipRouter data={tooltipData} position={tooltipPosition} />
      ) : null}
    </>
  );
};

export default TabHeraldry;