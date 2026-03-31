import React, { useState } from "react";
import { appMemory } from "../../state/AppMemory";
import type { CreateItemMode } from "./buildEquipment/createItem/createItemTypes";
import CreateItemPanel from "./buildEquipment/CreateItemPanel";
import InventoryPanel from "./buildEquipment/InventoryPanel";
import TabBuildEquipment from "./buildEquipment/TabBuildEquipment";

const TabBuild: React.FC = () => {
  const [selectedInventorySlotIndex, setSelectedInventorySlotIndex] = useState<number | null>(null);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [createItemMode, setCreateItemMode] = useState<CreateItemMode>("new");

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
        gridTemplateColumns: "20% 25% 55%",
      }}
    >
      <div
        style={{
          borderRight: "1px solid #000",
          padding: "16px",
          height: "100%",
        }}
      >
        Left Content
      </div>

      <TabBuildEquipment />

      <div
        style={{
          padding: "16px",
          height: "100%",
          minHeight: 0,
          display: "flex",
          justifyContent: "flex-start",
          gap: "16px",
        }}
      >
        <InventoryPanel
          selectedSlotIndex={selectedInventorySlotIndex}
          onSelectedSlotChange={setSelectedInventorySlotIndex}
          onDeleteSelected={handleDeleteSelected}
          onEditSlot={handleEditSlot}
        />

        <CreateItemPanel
          mode={createItemMode}
          editingSlotIndex={editingSlotIndex}
          onFinishEdit={handleFinishEdit}
        />
      </div>
    </div>
  );
};

export default TabBuild;