import React, { useEffect, useMemo, useState } from "react";
import { GameDataLoader } from "../../../data/GameDataLoader";
import type * as GameDataModels from "../../../model/GameDataModels";
import { appMemory } from "../../../state/AppMemory";
import type { InventorySlot } from "../../../state/models/InventoryModels";

interface InventorySlotButtonProps {
  slotNumber: number;
  slotData: InventorySlot | null;
  isSelected: boolean;
  plateNameMap: Map<number, GameDataModels.PlateName>;
  rarityMap: Map<number, GameDataModels.Rarity>;
  onClick?: (slotNumber: number) => void;
  onDoubleClick?: (slotNumber: number) => void;
  onRightClick?: (slotNumber: number) => void;
}

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
}

const inventoryBg = new URL("/assets/img/inventory/bg.png", import.meta.url)
  .href;

const SLOT_SIZE = 56;
const SLOT_GAP = 6;

const resolveAssetUrl = (pathFile: string): string => {
  const normalizedPath = pathFile.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

const InventorySlotButton: React.FC<InventorySlotButtonProps> = ({
  slotNumber,
  slotData,
  isSelected,
  plateNameMap,
  rarityMap,
  onClick,
  onDoubleClick,
  onRightClick,
}) => {
  const plateItemData = slotData?.itemData ?? null;
  const plateName =
    plateItemData === null
      ? null
      : (plateNameMap.get(plateItemData.plateNameId) ?? null);
  const rarity =
    plateItemData === null
      ? null
      : (rarityMap.get(plateItemData.rarityId) ?? null);
  const hasItem = plateItemData !== null;

  return (
    <button
      type="button"
      onClick={() => {
        if (onClick) {
          onClick(slotNumber);
        }
      }}
      onDoubleClick={() => {
        if (onDoubleClick) {
          onDoubleClick(slotNumber);
        }
      }}
      onContextMenu={(event) => {
        event.preventDefault();

        if (onRightClick) {
          onRightClick(slotNumber);
        }
      }}
      title={plateName ? plateName.name : `Slot ${slotNumber}`}
      style={{
        width: `${SLOT_SIZE}px`,
        height: `${SLOT_SIZE}px`,
        border: isSelected ? "2px solid #fbbf24" : "none",
        outline: "none",
        padding: "0",
        cursor: "pointer",
        backgroundImage: `url(${inventoryBg})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#cbd5e1",
        fontSize: "12px",
        fontWeight: 600,
        userSelect: "none",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {hasItem && plateName ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
          }}
        >
          <img
            src={resolveAssetUrl(plateName.pathFile)}
            alt={plateName.name}
            style={{
              width: "40px",
              height: "40px",
              objectFit: "contain",
              borderRadius: "4px",
              border: rarity ? `1px solid ${rarity.color}` : "1px solid transparent",
              boxSizing: "border-box",
            }}
          />
        </div>
      ) : null}
    </button>
  );
};

const InventoryPanel: React.FC<InventoryPanelProps> = ({
  totalSlots = 600,
  columns = 6,
  rows = 10,
  width = "40%",
  title = "Inventory",
  selectedSlotIndex = null,
  onSelectedSlotChange,
  onDeleteSelected,
  onEditSlot,
}) => {
  const [inventoryList, setInventoryList] = useState<InventorySlot[]>(
    appMemory.getInventoryList(),
  );
  const [activeTab, setActiveTab] = useState<number>(0);

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

  const slotsPerTab = Math.max(1, columns * rows);
  const tabCount = Math.max(1, Math.ceil(totalSlots / slotsPerTab));

  useEffect(() => {
    const unsubscribe = appMemory.subscribe((state) => {
      setInventoryList(state.inventoryList);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const inventorySlotMap = useMemo<Map<number, InventorySlot>>(() => {
    const nextMap = new Map<number, InventorySlot>();

    inventoryList.forEach((slot: InventorySlot) => {
      if (slot.slotIndex >= 1 && slot.slotIndex <= totalSlots) {
        nextMap.set(slot.slotIndex, slot);
      }
    });

    return nextMap;
  }, [inventoryList, totalSlots]);

  const selectedSlotData = useMemo<InventorySlot | null>(() => {
    if (selectedSlotIndex === null) {
      return null;
    }

    return inventorySlotMap.get(selectedSlotIndex) ?? null;
  }, [inventorySlotMap, selectedSlotIndex]);

  useEffect(() => {
    if (selectedSlotIndex === null) {
      return;
    }

    if (!inventorySlotMap.has(selectedSlotIndex) && onSelectedSlotChange) {
      onSelectedSlotChange(null);
    }
  }, [inventorySlotMap, onSelectedSlotChange, selectedSlotIndex]);

  const safeActiveTab = useMemo<number>(() => {
    if (selectedSlotIndex !== null && inventorySlotMap.has(selectedSlotIndex)) {
      const selectedTab = Math.floor((selectedSlotIndex - 1) / slotsPerTab);

      if (selectedTab >= 0 && selectedTab < tabCount) {
        return selectedTab;
      }
    }

    return Math.min(activeTab, tabCount - 1);
  }, [activeTab, inventorySlotMap, selectedSlotIndex, slotsPerTab, tabCount]);

  const visibleSlots = useMemo<
    Array<{
      slotNumber: number;
      slotData: InventorySlot | null;
    }>
  >(() => {
    const start = safeActiveTab * slotsPerTab + 1;
    const end = Math.min(start + slotsPerTab - 1, totalSlots);

    return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => {
      const slotNumber = start + index;

      return {
        slotNumber,
        slotData: inventorySlotMap.get(slotNumber) ?? null,
      };
    });
  }, [inventorySlotMap, safeActiveTab, slotsPerTab, totalSlots]);

  const handleSlotClick = (slotNumber: number): void => {
    const slotData = inventorySlotMap.get(slotNumber) ?? null;

    if (!onSelectedSlotChange) {
      return;
    }

    if (slotData) {
      if (selectedSlotIndex === slotNumber) {
        onSelectedSlotChange(null);
        return;
      }

      onSelectedSlotChange(slotNumber);
      return;
    }

    onSelectedSlotChange(null);
  };

  const handleSlotDoubleClick = (slotNumber: number): void => {
    const slotData = inventorySlotMap.get(slotNumber) ?? null;

    if (!slotData) {
      return;
    }

    if (onSelectedSlotChange) {
      onSelectedSlotChange(slotNumber);
    }

    if (onEditSlot) {
      onEditSlot(slotNumber);
    }
  };

  const handleSlotRightClick = (slotNumber: number): void => {
    const slotData = inventorySlotMap.get(slotNumber) ?? null;

    if (!slotData || !onSelectedSlotChange) {
      return;
    }

    onSelectedSlotChange(slotNumber);
  };

  return (
    <div
      style={{
        width,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "#f3f4f6",
          marginBottom: "12px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
          paddingBottom: "12px",
          borderBottom: "1px solid #374151",
          marginBottom: "12px",
        }}
      >
        <button
          type="button"
          disabled={selectedSlotData === null}
          onClick={() => {
            if (selectedSlotData && onDeleteSelected) {
              onDeleteSelected(selectedSlotData.slotIndex);
            }
          }}
          style={{
            height: "36px",
            minWidth: "90px",
            padding: "0 12px",
            borderRadius: "6px",
            border: "1px solid #374151",
            cursor: selectedSlotData ? "pointer" : "not-allowed",
            backgroundColor: "#111827",
            color: selectedSlotData ? "#f3f4f6" : "#6b7280",
            fontWeight: 500,
          }}
        >
          Delete
        </button>

        <div
          style={{
            color: "#94a3b8",
            fontSize: "12px",
          }}
        >
          Click to select, double click to edit
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
          paddingBottom: "12px",
          borderBottom: "1px solid #374151",
          marginBottom: "12px",
        }}
      >
        {Array.from({ length: tabCount }, (_, index) => {
          const isActive = index === safeActiveTab;

          return (
            <button
              key={`inventory-tab-${index + 1}`}
              type="button"
              onClick={() => setActiveTab(index)}
              style={{
                height: "36px",
                minWidth: "44px",
                padding: "0 12px",
                borderRadius: "6px",
                border: "1px solid #374151",
                cursor: "pointer",
                whiteSpace: "nowrap",
                backgroundColor: isActive ? "#1f2937" : "#111827",
                color: isActive ? "#f3f4f6" : "#9ca3af",
                fontWeight: isActive ? 600 : 400,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(event) => {
                if (!isActive) {
                  event.currentTarget.style.backgroundColor = "#1f2937";
                }
              }}
              onMouseLeave={(event) => {
                if (!isActive) {
                  event.currentTarget.style.backgroundColor = "#111827";
                }
              }}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div
        style={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "auto",
          paddingRight: "4px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, ${SLOT_SIZE}px)`,
            gridTemplateRows: `repeat(${rows}, ${SLOT_SIZE}px)`,
            gap: `${SLOT_GAP}px`,
            justifyContent: "start",
            minWidth: "fit-content",
          }}
        >
          {visibleSlots.map((slot) => {
            return (
              <InventorySlotButton
                key={`inventory-slot-${slot.slotNumber}`}
                slotNumber={slot.slotNumber}
                slotData={slot.slotData}
                isSelected={selectedSlotIndex === slot.slotNumber}
                plateNameMap={plateNameMap}
                rarityMap={rarityMap}
                onClick={handleSlotClick}
                onDoubleClick={handleSlotDoubleClick}
                onRightClick={handleSlotRightClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;