import React, { useMemo, useState } from "react";
import { GameDataLoader } from "../../../data/GameDataLoader";
import type { PatchLevel, Plate, PlateName } from "../../../model/GameDataModels";

export interface CreateItemPanelProps {
  width?: string;
  title?: string;
}

interface PlateTypeOption {
  id: number;
  label: string;
}

const resolvePlateIconUrl = (iconName: string): string => {
  return new URL(`../../../assets/img/plate/${iconName}`, import.meta.url).href;
};

const CreateItemPanel: React.FC<CreateItemPanelProps> = ({
  width = "60%",
  title = "Create Item",
}) => {
  const gameData = useMemo(() => GameDataLoader.load(), []);

  const plateTypeOptions = useMemo<PlateTypeOption[]>(() => {
    const uniqueTypeIds = Array.from(
      new Set(gameData.plates.map((plate: Plate) => plate.plateTypeId)),
    ).sort((left, right) => left - right);

    return uniqueTypeIds.map((typeId) => {
      return {
        id: typeId,
        label: `Type ${typeId}`,
      };
    });
  }, [gameData]);

  const plateLevelOptions = useMemo<PatchLevel[]>(() => {
    return [...gameData.patchLevels].sort((left, right) => left.level - right.level);
  }, [gameData]);

  const plateNameOptions = useMemo<PlateName[]>(() => {
    return [...gameData.plateNames].sort((left, right) => {
      return left.name.localeCompare(right.name);
    });
  }, [gameData]);

  const [showCreatePlate, setShowCreatePlate] = useState<boolean>(false);
  const [selectedPlateTypeId, setSelectedPlateTypeId] = useState<number>(
    plateTypeOptions[0]?.id ?? 0,
  );
  const [selectedPlateLevelId, setSelectedPlateLevelId] = useState<number>(
    plateLevelOptions[0]?.id ?? 0,
  );
  const [selectedPlateNameId, setSelectedPlateNameId] = useState<number>(
    plateNameOptions[0]?.id ?? 0,
  );

  const selectedPlateName = useMemo<PlateName | null>(() => {
    return (
      plateNameOptions.find((plateName) => plateName.id === selectedPlateNameId) ?? null
    );
  }, [plateNameOptions, selectedPlateNameId]);

  const matchedPlate = useMemo<Plate | null>(() => {
    return (
      gameData.plates.find((plate) => {
        return (
          plate.plateTypeId === selectedPlateTypeId &&
          plate.plateLevelId === selectedPlateLevelId &&
          plate.plateNameId === selectedPlateNameId
        );
      }) ?? null
    );
  }, [gameData, selectedPlateLevelId, selectedPlateNameId, selectedPlateTypeId]);

  return (
    <div
      style={{
        width,
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
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
          flex: 1,
          minHeight: 0,
          border: "1px solid #374151",
          borderRadius: "10px",
          backgroundColor: "#111827",
          padding: "16px",
          color: "#cbd5e1",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div>
          <button
            type="button"
            onClick={() => setShowCreatePlate((previous) => !previous)}
            style={{
              height: "40px",
              padding: "0 16px",
              borderRadius: "6px",
              border: "1px solid #374151",
              cursor: "pointer",
              backgroundColor: "#1f2937",
              color: "#f3f4f6",
              fontWeight: 600,
            }}
          >
            Create Plate
          </button>
        </div>

        {showCreatePlate ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "180px minmax(0, 1fr)",
              gap: "12px 16px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                color: "#e5e7eb",
                fontWeight: 600,
              }}
            >
              Plate Type
            </div>
            <select
              value={selectedPlateTypeId}
              onChange={(event) => setSelectedPlateTypeId(Number(event.target.value))}
              style={{
                height: "40px",
                borderRadius: "6px",
                border: "1px solid #374151",
                backgroundColor: "#0f172a",
                color: "#f3f4f6",
                padding: "0 12px",
                outline: "none",
              }}
            >
              {plateTypeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>

            <div
              style={{
                color: "#e5e7eb",
                fontWeight: 600,
              }}
            >
              Plate Level
            </div>
            <select
              value={selectedPlateLevelId}
              onChange={(event) => setSelectedPlateLevelId(Number(event.target.value))}
              style={{
                height: "40px",
                borderRadius: "6px",
                border: "1px solid #374151",
                backgroundColor: "#0f172a",
                color: "#f3f4f6",
                padding: "0 12px",
                outline: "none",
              }}
            >
              {plateLevelOptions.map((level) => (
                <option key={level.id} value={level.id}>
                  Lv. {level.level}
                </option>
              ))}
            </select>

            <div
              style={{
                color: "#e5e7eb",
                fontWeight: 600,
              }}
            >
              Plate Name
            </div>
            <select
              value={selectedPlateNameId}
              onChange={(event) => setSelectedPlateNameId(Number(event.target.value))}
              style={{
                height: "40px",
                borderRadius: "6px",
                border: "1px solid #374151",
                backgroundColor: "#0f172a",
                color: "#f3f4f6",
                padding: "0 12px",
                outline: "none",
              }}
            >
              {plateNameOptions.map((plateName) => (
                <option key={plateName.id} value={plateName.id}>
                  {plateName.name}
                </option>
              ))}
            </select>

            <div
              style={{
                color: "#e5e7eb",
                fontWeight: 600,
                alignSelf: "start",
                paddingTop: "8px",
              }}
            >
              Icon
            </div>
            <div>
              <div
                style={{
                  width: "84px",
                  height: "84px",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  backgroundColor: "#0f172a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {selectedPlateName ? (
                  <img
                    src={resolvePlateIconUrl(selectedPlateName.iconName)}
                    alt={selectedPlateName.name}
                    style={{
                      width: "72px",
                      height: "72px",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                ) : null}
              </div>

              {selectedPlateName ? (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    color: "#94a3b8",
                    wordBreak: "break-all",
                  }}
                >
                  {selectedPlateName.pathFile}
                </div>
              ) : null}
            </div>

            <div
              style={{
                color: "#e5e7eb",
                fontWeight: 600,
                alignSelf: "start",
                paddingTop: "8px",
              }}
            >
              Preview Data
            </div>
            <div
              style={{
                border: "1px solid #374151",
                borderRadius: "8px",
                backgroundColor: "#0f172a",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div>plateTypeId: {selectedPlateTypeId}</div>
              <div>plateLevelId: {selectedPlateLevelId}</div>
              <div>plateNameId: {selectedPlateNameId}</div>
              <div>
                matchedPlateId: {matchedPlate ? matchedPlate.id : "-"}
              </div>
              <div>
                statId: {matchedPlate ? matchedPlate.statId : "-"}
              </div>
              <div>
                statValue: {matchedPlate ? matchedPlate.statValue : "-"}
              </div>
              <div>
                statPercent: {matchedPlate ? matchedPlate.statPercent : "-"}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CreateItemPanel;