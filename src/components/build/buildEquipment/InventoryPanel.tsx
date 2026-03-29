import React, { useMemo, useState } from "react";

interface InventorySlotButtonProps {
  slotNumber: number;
  onClick?: (slotNumber: number) => void;
  onRightClick?: (slotNumber: number) => void;
}

export interface InventoryPanelProps {
  totalSlots?: number;
  columns?: number;
  rows?: number;
  width?: string;
  title?: string;
}

const inventoryBg = new URL("../../../assets/img/inventory/bg.png", import.meta.url)
  .href;

const SLOT_SIZE = 56;
const SLOT_GAP = 6;

const InventorySlotButton: React.FC<InventorySlotButtonProps> = ({
  slotNumber,
  onClick,
  onRightClick,
}) => {
  return (
    <button
      type="button"
      onClick={() => {
        if (onClick) {
          onClick(slotNumber);
        }
      }}
      onContextMenu={(event) => {
        event.preventDefault();

        if (onRightClick) {
          onRightClick(slotNumber);
        }
      }}
      style={{
        width: `${SLOT_SIZE}px`,
        height: `${SLOT_SIZE}px`,
        border: "none",
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
      }}
    />
  );
};

const InventoryPanel: React.FC<InventoryPanelProps> = ({
  totalSlots = 600,
  columns = 6,
  rows = 10,
  width = "40%",
  title = "Inventory",
}) => {
  const slotsPerTab = Math.max(1, columns * rows);
  const tabCount = Math.max(1, Math.ceil(totalSlots / slotsPerTab));
  const [activeTab, setActiveTab] = useState<number>(0);

  const safeActiveTab = Math.min(activeTab, tabCount - 1);

  const visibleSlotNumbers = useMemo(() => {
    const start = safeActiveTab * slotsPerTab + 1;
    const end = Math.min(start + slotsPerTab - 1, totalSlots);

    return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => {
      return start + index;
    });
  }, [safeActiveTab, slotsPerTab, totalSlots]);

  const handleSlotClick = (slotNumber: number): void => {
    console.log("inventory slot click:", slotNumber);
  };

  const handleSlotRightClick = (slotNumber: number): void => {
    console.log("inventory slot right click:", slotNumber);
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
          {visibleSlotNumbers.map((slotNumber) => (
            <InventorySlotButton
              key={`inventory-slot-${slotNumber}`}
              slotNumber={slotNumber}
              onClick={handleSlotClick}
              onRightClick={handleSlotRightClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;