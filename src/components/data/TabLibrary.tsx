import React, { useMemo, useState } from "react";
import { GameDataLoader } from "../../data/GameDataLoader";
import CardDataTable from "./cards/CardDataTable";
import PlateDataTable from "./plate/PlateDataTable";

type LibraryMenuKey = "cards" | "plates";

const TabLibrary: React.FC = () => {
  const gameData = useMemo(() => GameDataLoader.load(), []);
  const [activeMenu, setActiveMenu] = useState<LibraryMenuKey>("cards");

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "220px minmax(0, 1fr)",
        gap: "16px",
        minHeight: 0,
      }}
    >
      <aside
        style={{
          border: "1px solid #374151",
          backgroundColor: "rgba(13,18,30,0.3)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: "8px",
          padding: "12px",
          minHeight: 0,
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "#9ca3af",
            fontWeight: 700,
            marginBottom: "10px",
            textTransform: "uppercase",
          }}
        >
          Data Menu
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { key: "cards" as const, label: "Cards", count: gameData.cards.length },
            { key: "plates" as const, label: "Plates", count: gameData.plateNames.length },
          ].map((item) => {
            const isActive = item.key === activeMenu;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveMenu(item.key)}
                style={{
                  width: "100%",
                  height: "42px",
                  borderRadius: "6px",
                  border: "1px solid #374151",
                  backgroundColor: isActive ? "#1f2937" : "#0f1115",
                  color: isActive ? "#f3f4f6" : "#9ca3af",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 12px",
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                <span>{item.label}</span>
                <span style={{ color: "#60a5fa", fontSize: "12px" }}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {activeMenu === "cards" ? (
        <CardDataTable
          key="cards"
          cards={gameData.cards}
          patchLevels={gameData.patchLevels}
          rarities={gameData.rarities}
          stats={gameData.stats}
        />
      ) : (
        <PlateDataTable
          key="plates"
          itemTypes={gameData.itemTypes}
          patchLevels={gameData.patchLevels}
          plateNames={gameData.plateNames}
          plates={gameData.plates}
          plateTypes={gameData.plateTypes}
          rarities={gameData.rarities}
          stats={gameData.stats}
        />
      )}
    </div>
  );
};

export default TabLibrary;
