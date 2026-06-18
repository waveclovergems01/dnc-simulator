import React, { useState } from "react";
import { appMemory } from "../../state/AppMemory";
import CharacterStatsPanel from "./CharacterStatsPanel";
import type { CreateItemMode } from "./buildEquipment/createItem/createItemTypes";
import CreateItemPanel from "./buildEquipment/CreateItemPanel";
import InventoryPanel from "./buildEquipment/InventoryPanel";
import TabBuildEquipment, {
  type EquipmentTabKey,
} from "./buildEquipment/TabBuildEquipment";

const BlockTitle: React.FC<{ title: string; accent: string }> = ({ title, accent }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 16px",
        borderBottom: "1px solid #1f2937",
        background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%)",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: "4px",
          height: "18px",
          borderRadius: "2px",
          backgroundColor: accent,
          boxShadow: `0 0 8px ${accent}99`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: "14px",
          fontWeight: 800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#f3f4f6",
        }}
      >
        {title}
      </span>
    </div>
  );
};

const TabBuild: React.FC = () => {
  const [selectedInventorySlotIndex, setSelectedInventorySlotIndex] = useState<number | null>(null);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [createItemMode, setCreateItemMode] = useState<CreateItemMode>("new");
  const [activeEquipmentTab, setActiveEquipmentTab] =
    useState<EquipmentTabKey>("general");

  const handleDeleteSelected = (slotIndex: number): void => {
    appMemory.removeInventorySlot(slotIndex);

    if (selectedInventorySlotIndex === slotIndex) {
      setSelectedInventorySlotIndex(null);
    }

    if (editingSlotIndex === slotIndex) {
      setEditingSlotIndex(null);
      setCreateItemMode("new");
    }
  };

  const handleEditSlot = (slotIndex: number): void => {
    setSelectedInventorySlotIndex(slotIndex);
    setEditingSlotIndex(slotIndex);
    setCreateItemMode("edit");
  };

  const handleEquipSlot = (slotIndex: number): void => {
    const inventorySlot = appMemory.getInventorySlot(slotIndex);

    if (!inventorySlot || !inventorySlot.itemData) {
      return;
    }

    const moved =
      inventorySlot.itemData.kind === "equipment"
        ? appMemory.moveInventorySlotToGeneralEquipment(slotIndex)
        : inventorySlot.itemData.kind === "rune"
          ? appMemory.moveInventorySlotToRune(slotIndex)
          : inventorySlot.itemData.kind === "card"
            ? appMemory.moveInventorySlotToCard(slotIndex)
            : appMemory.moveInventorySlotToHeraldry(slotIndex);

    if (!moved) {
      return;
    }

    if (selectedInventorySlotIndex === slotIndex) {
      setSelectedInventorySlotIndex(null);
    }

    if (editingSlotIndex === slotIndex) {
      setEditingSlotIndex(null);
      setCreateItemMode("new");
    }

    setActiveEquipmentTab(
      inventorySlot.itemData.kind === "equipment"
        ? "general"
        : inventorySlot.itemData.kind === "rune"
          ? "rune"
          : inventorySlot.itemData.kind === "card"
            ? "card"
            : "heraldry",
    );
  };

  const handleFinishEdit = (): void => {
    setEditingSlotIndex(null);
    setCreateItemMode("new");
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "minmax(0, 0.8fr) minmax(0, 1fr) minmax(0, 2.2fr)",
        gap: "12px",
        padding: "12px",
        boxSizing: "border-box",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      <div
        style={{
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          borderRadius: "14px",
          border: "1px solid #1f2937",
          background: "linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(11,17,32,0.3) 100%)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          overflow: "hidden",
        }}
      >
        <BlockTitle title="Character Stats" accent="#38bdf8" />
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            padding: "16px",
            color: "#e5e7eb",
          }}
        >
          <CharacterStatsPanel />
        </div>
      </div>

      <div
        style={{
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          borderRadius: "14px",
          border: "1px solid #1f2937",
          background: "linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(11,17,32,0.3) 100%)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          overflow: "hidden",
        }}
      >
        <BlockTitle title="Character Equipment" accent="#a855f7" />
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <TabBuildEquipment
            activeTab={activeEquipmentTab}
            onTabChange={setActiveEquipmentTab}
          />
        </div>
      </div>

      <div
        style={{
          height: "100%",
          minHeight: 0,
          display: "flex",
          justifyContent: "flex-start",
          gap: "12px",
        }}
      >
        <div
          style={{
            height: "100%",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            borderRadius: "14px",
            border: "1px solid #1f2937",
            background: "linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(11,17,32,0.3) 100%)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            overflow: "hidden",
          }}
        >
          <BlockTitle title="Inventory" accent="#facc15" />
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden", padding: "16px" }}>
            <InventoryPanel
              title=""
              selectedSlotIndex={selectedInventorySlotIndex}
              onSelectedSlotChange={setSelectedInventorySlotIndex}
              onDeleteSelected={handleDeleteSelected}
              onEditSlot={handleEditSlot}
              onEquipSlot={handleEquipSlot}
            />
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            borderRadius: "14px",
            border: "1px solid #1f2937",
            background: "linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(11,17,32,0.3) 100%)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            overflow: "hidden",
          }}
        >
          <BlockTitle title={createItemMode === "edit" ? "Edit Item" : "Create Item"} accent="#34d399" />
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden", padding: "16px" }}>
            <CreateItemPanel
              width="100%"
              title=""
              mode={createItemMode}
              editingSlotIndex={editingSlotIndex}
              onFinishEdit={handleFinishEdit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabBuild;
