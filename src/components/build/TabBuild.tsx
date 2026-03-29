import React from "react";
import CreateItemPanel from "./buildEquipment/CreateItemPanel";
import InventoryPanel from "./buildEquipment/InventoryPanel";
import TabBuildEquipment from "./buildEquipment/TabBuildEquipment";

const TabBuild: React.FC = () => {
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
        <InventoryPanel />
        <CreateItemPanel />
      </div>
    </div>
  );
};

export default TabBuild;