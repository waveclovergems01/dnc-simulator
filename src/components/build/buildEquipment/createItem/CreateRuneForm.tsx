import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GameDataLoader } from "../../../../data/GameDataLoader";
import type * as GameDataModels from "../../../../model/GameDataModels";
import { appMemory } from "../../../../state/AppMemory";
import {
  createInventoryRuneItemData,
  createInventoryRuneSlot,
} from "../../../../state/models/InventoryFactories";
import type { InventoryRuneStat } from "../../../../state/models/InventoryModels";
import { formatStatValue, getStatLabel } from "../../../tooltip/tooltipUtils";
import type { CreateItemMode } from "./createItemTypes";

interface CreateRuneFormProps {
  mode?: CreateItemMode;
  editingSlotIndex?: number | null;
  onRegisterSubmit?: (submitHandler: (() => boolean) | null) => void;
  onCanSubmitChange?: (canSubmit: boolean) => void;
  onFinishEdit?: () => void;
}

interface RuneFormInitialState {
  selectedRuneTypeId: number;
  selectedRuneLevelId: number;
  selectedRarityId: number;
  selectedRuneId: number;
  selectedRows: RuneRowSelection[];
}

interface RuneRowSelection {
  statId: number;
  valueRarityId: number;
}

const RUNE_CATEGORY_ID = 70000;

const RARITY_VALUE_KEYS: Record<number, keyof GameDataModels.RuneStatOption> = {
  2: "valueMagic",
  3: "valueRare",
  4: "valueEpic",
  5: "valueUnique",
  6: "valueLegendary",
};

const resolveAssetUrl = (pathFile: string): string => {
  const normalizedPath = pathFile.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

const getRuneStatValue = (
  stat: GameDataModels.RuneStatOption,
  rarityId: number,
): number => {
  const key = RARITY_VALUE_KEYS[rarityId];
  return key ? Number(stat[key]) : 0;
};

const buildValueRarityIds = (
  profile: GameDataModels.RuneRarityProfile,
  stat: GameDataModels.RuneStatOption,
): number[] => {
  const ids: number[] = [];
  const minRarityId = Math.max(
    profile.minValueRarityId,
    stat.availableFromRarityId,
  );

  for (let rarityId = minRarityId; rarityId <= profile.maxValueRarityId; rarityId += 1) {
    if (RARITY_VALUE_KEYS[rarityId]) {
      ids.push(rarityId);
    }
  }

  return ids;
};

const createDefaultRows = (
  profile: GameDataModels.RuneRarityProfile | null,
): RuneRowSelection[] => {
  if (!profile) {
    return [];
  }

  const usageCount = new Map<number, number>();

  return Array.from({ length: profile.maxStatRows }, (_, rowIndex) => {
    const stat =
      profile.stats.find((option) => {
        const count = usageCount.get(option.statId) ?? 0;
        return count < option.maxOption;
      }) ?? profile.stats[rowIndex % Math.max(1, profile.stats.length)];

    if (!stat) {
      return {
        statId: 0,
        valueRarityId: profile.minValueRarityId,
      };
    }

    usageCount.set(stat.statId, (usageCount.get(stat.statId) ?? 0) + 1);
    return {
      statId: stat.statId,
      valueRarityId: buildValueRarityIds(profile, stat)[0] ?? profile.minValueRarityId,
    };
  });
};

const CreateRuneForm: React.FC<CreateRuneFormProps> = ({
  mode = "new",
  editingSlotIndex = null,
  onRegisterSubmit,
  onCanSubmitChange,
  onFinishEdit,
}) => {
  const gameData = useMemo(() => {
    return GameDataLoader.load();
  }, []);

  const runeItemTypes = useMemo<GameDataModels.ItemType[]>(() => {
    return gameData.itemTypes
      .filter((itemType) => {
        return itemType.categoryId === RUNE_CATEGORY_ID;
      })
      .sort((left, right) => {
        return left.typeId - right.typeId;
      });
  }, [gameData.itemTypes]);

  const rarityMap = useMemo<Map<number, GameDataModels.Rarity>>(() => {
    return new Map(
      gameData.rarities.map((rarity) => {
        return [rarity.rarityId, rarity] as const;
      }),
    );
  }, [gameData.rarities]);

  const initialFormState = useMemo<RuneFormInitialState>(() => {
    const defaultRuneTypeId = runeItemTypes[0]?.typeId ?? 0;
    const defaultLevelId =
      gameData.runes.find((rune) => {
        return rune.typeId === defaultRuneTypeId;
      })?.runeLevelId ?? 0;
    const defaultRune =
      gameData.runes.find((rune) => {
        return rune.typeId === defaultRuneTypeId && rune.runeLevelId === defaultLevelId;
      }) ?? null;
    const defaultProfile = defaultRune?.rarities[0] ?? null;

    const defaultState: RuneFormInitialState = {
      selectedRuneTypeId: defaultRuneTypeId,
      selectedRuneLevelId: defaultLevelId,
      selectedRarityId: defaultProfile?.rarityId ?? 0,
      selectedRuneId: defaultRune?.runeId ?? 0,
      selectedRows: createDefaultRows(defaultProfile),
    };

    if (mode !== "edit" || editingSlotIndex === null) {
      return defaultState;
    }

    const editingSlot = appMemory.getInventorySlot(editingSlotIndex);

    if (
      !editingSlot ||
      !editingSlot.itemData ||
      editingSlot.itemData.kind !== "rune"
    ) {
      return defaultState;
    }

    return {
      selectedRuneTypeId: editingSlot.itemTypeId,
      selectedRuneLevelId: editingSlot.itemData.runeLevelId,
      selectedRarityId: editingSlot.itemData.rarityId,
      selectedRuneId: editingSlot.itemData.runeId,
      selectedRows: editingSlot.itemData.stats.map((stat) => {
        return {
          statId: stat.statId,
          valueRarityId: stat.valueRarityId,
        };
      }),
    };
  }, [editingSlotIndex, gameData.runes, mode, runeItemTypes]);

  const [selectedRuneTypeId, setSelectedRuneTypeId] = useState<number>(
    initialFormState.selectedRuneTypeId,
  );
  const [selectedRuneLevelId, setSelectedRuneLevelId] = useState<number>(
    initialFormState.selectedRuneLevelId,
  );
  const [selectedRarityId, setSelectedRarityId] = useState<number>(
    initialFormState.selectedRarityId,
  );
  const [selectedRuneId, setSelectedRuneId] = useState<number>(
    initialFormState.selectedRuneId,
  );
  const [selectedRows, setSelectedRows] = useState<RuneRowSelection[]>(
    initialFormState.selectedRows,
  );

  const levelOptions = useMemo<number[]>(() => {
    return Array.from(
      new Set(
        gameData.runes
          .filter((rune) => {
            return rune.typeId === selectedRuneTypeId;
          })
          .map((rune) => {
            return rune.runeLevelId;
          }),
      ),
    ).sort((left, right) => {
      return left - right;
    });
  }, [gameData.runes, selectedRuneTypeId]);

  const effectiveSelectedRuneLevelId = useMemo<number>(() => {
    if (levelOptions.includes(selectedRuneLevelId)) {
      return selectedRuneLevelId;
    }

    return levelOptions[0] ?? 0;
  }, [levelOptions, selectedRuneLevelId]);

  const runeOptions = useMemo<GameDataModels.Rune[]>(() => {
    return gameData.runes
      .filter((rune) => {
        return (
          rune.typeId === selectedRuneTypeId &&
          rune.runeLevelId === effectiveSelectedRuneLevelId
        );
      })
      .sort((left, right) => {
        return left.runeName.localeCompare(right.runeName);
      });
  }, [effectiveSelectedRuneLevelId, gameData.runes, selectedRuneTypeId]);

  const effectiveSelectedRuneId = useMemo<number>(() => {
    if (
      runeOptions.some((rune) => {
        return rune.runeId === selectedRuneId;
      })
    ) {
      return selectedRuneId;
    }

    return runeOptions[0]?.runeId ?? 0;
  }, [runeOptions, selectedRuneId]);

  const selectedRune = useMemo<GameDataModels.Rune | null>(() => {
    return (
      runeOptions.find((rune) => {
        return rune.runeId === effectiveSelectedRuneId;
      }) ?? null
    );
  }, [effectiveSelectedRuneId, runeOptions]);

  const rarityOptions = useMemo<GameDataModels.Rarity[]>(() => {
    if (!selectedRune) {
      return [];
    }

    const rarityIdSet = new Set(
      selectedRune.rarities.map((profile) => {
        return profile.rarityId;
      }),
    );

    return gameData.rarities.filter((rarity) => {
      return rarityIdSet.has(rarity.rarityId);
    });
  }, [gameData.rarities, selectedRune]);

  const effectiveSelectedRarityId = useMemo<number>(() => {
    if (
      rarityOptions.some((rarity) => {
        return rarity.rarityId === selectedRarityId;
      })
    ) {
      return selectedRarityId;
    }

    return rarityOptions[0]?.rarityId ?? 0;
  }, [rarityOptions, selectedRarityId]);

  const selectedProfile = useMemo<GameDataModels.RuneRarityProfile | null>(() => {
    return (
      selectedRune?.rarities.find((profile) => {
        return profile.rarityId === effectiveSelectedRarityId;
      }) ?? null
    );
  }, [effectiveSelectedRarityId, selectedRune]);

  const selectedRowStats = useMemo<InventoryRuneStat[]>(() => {
    if (!selectedProfile) {
      return [];
    }

    return selectedRows
      .map((row) => {
        const stat =
          selectedProfile.stats.find((option) => {
            return option.statId === row.statId;
          }) ?? null;

        if (!stat) {
          return null;
        }

        const valueRarityIds = buildValueRarityIds(selectedProfile, stat);
        const valueRarityId = valueRarityIds.includes(row.valueRarityId)
          ? row.valueRarityId
          : (valueRarityIds[0] ?? selectedProfile.minValueRarityId);

        return {
          statId: stat.statId,
          valueRarityId,
          value: getRuneStatValue(stat, valueRarityId),
          isPercentage: stat.isPercentage,
        };
      })
      .filter((stat): stat is InventoryRuneStat => {
        return stat !== null;
      });
  }, [selectedProfile, selectedRows]);

  const canCreateRune =
    selectedRune !== null &&
    selectedProfile !== null &&
    selectedRowStats.length === selectedProfile.maxStatRows;

  const handleSubmitRune = useCallback((): boolean => {
    if (!selectedRune || !selectedProfile || !canCreateRune) {
      return false;
    }

    if (mode === "edit" && editingSlotIndex !== null) {
      const currentSlot = appMemory.getInventorySlot(editingSlotIndex);

      if (!currentSlot) {
        return false;
      }

      const currentUuid =
        currentSlot.itemData?.kind === "rune" ? currentSlot.itemData.uuid : null;
      const nextItemData = createInventoryRuneItemData({
        runeId: selectedRune.runeId,
        rarityId: selectedProfile.rarityId,
        runeLevelId: selectedRune.runeLevelId,
        stats: selectedRowStats,
      });

      appMemory.updateInventorySlot({
        slotIndex: currentSlot.slotIndex,
        itemTypeId: selectedRune.typeId,
        itemData: {
          ...nextItemData,
          uuid: currentUuid ?? nextItemData.uuid,
        },
      });

      onFinishEdit?.();
      return true;
    }

    appMemory.addInventorySlot(
      createInventoryRuneSlot({
        inventoryList: appMemory.getInventoryList(),
        itemTypeId: selectedRune.typeId,
        runeId: selectedRune.runeId,
        rarityId: selectedProfile.rarityId,
        runeLevelId: selectedRune.runeLevelId,
        stats: selectedRowStats,
      }),
    );
    return true;
  }, [
    canCreateRune,
    editingSlotIndex,
    mode,
    onFinishEdit,
    selectedProfile,
    selectedRowStats,
    selectedRune,
  ]);

  useEffect(() => {
    onRegisterSubmit?.(handleSubmitRune);

    return () => {
      onRegisterSubmit?.(null);
    };
  }, [handleSubmitRune, onRegisterSubmit]);

  useEffect(() => {
    onCanSubmitChange?.(canCreateRune);

    return () => {
      onCanSubmitChange?.(false);
    };
  }, [canCreateRune, onCanSubmitChange]);

  const selectedStatCounts = useMemo<Map<number, number>>(() => {
    const counts = new Map<number, number>();

    selectedRows.forEach((row) => {
      counts.set(row.statId, (counts.get(row.statId) ?? 0) + 1);
    });

    return counts;
  }, [selectedRows]);

  const handleRuneTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const nextTypeId = Number(event.target.value);
    const nextRune =
      gameData.runes.find((rune) => {
        return rune.typeId === nextTypeId;
      }) ?? null;
    const nextProfile = nextRune?.rarities[0] ?? null;

    setSelectedRuneTypeId(nextTypeId);
    setSelectedRuneLevelId(nextRune?.runeLevelId ?? 0);
    setSelectedRuneId(nextRune?.runeId ?? 0);
    setSelectedRarityId(nextProfile?.rarityId ?? 0);
    setSelectedRows(createDefaultRows(nextProfile));
  };

  const handleLevelChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const nextLevelId = Number(event.target.value);
    const nextRune =
      gameData.runes.find((rune) => {
        return rune.typeId === selectedRuneTypeId && rune.runeLevelId === nextLevelId;
      }) ?? null;
    const nextProfile = nextRune?.rarities[0] ?? null;

    setSelectedRuneLevelId(nextLevelId);
    setSelectedRuneId(nextRune?.runeId ?? 0);
    setSelectedRarityId(nextProfile?.rarityId ?? 0);
    setSelectedRows(createDefaultRows(nextProfile));
  };

  const handleRuneChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const nextRuneId = Number(event.target.value);
    const nextRune =
      runeOptions.find((rune) => {
        return rune.runeId === nextRuneId;
      }) ?? null;
    const nextProfile = nextRune?.rarities[0] ?? null;

    setSelectedRuneId(nextRuneId);
    setSelectedRarityId(nextProfile?.rarityId ?? 0);
    setSelectedRows(createDefaultRows(nextProfile));
  };

  const handleRarityChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const nextRarityId = Number(event.target.value);
    const nextProfile =
      selectedRune?.rarities.find((profile) => {
        return profile.rarityId === nextRarityId;
      }) ?? null;

    setSelectedRarityId(nextRarityId);
    setSelectedRows(createDefaultRows(nextProfile));
  };

  const updateRow = (rowIndex: number, nextRow: RuneRowSelection): void => {
    setSelectedRows((previousRows) => {
      return previousRows.map((row, index) => {
        return index === rowIndex ? nextRow : row;
      });
    });
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px minmax(0, 1fr)",
        gap: "12px 16px",
        alignItems: "center",
      }}
    >
      <div style={{ color: "#e5e7eb", fontWeight: 500, fontSize: "13px" }}>
        Rune Type
      </div>
      <select
        value={selectedRuneTypeId}
        onChange={handleRuneTypeChange}
        style={{
          height: "40px",
          borderRadius: "6px",
          border: "1px solid #374151",
          backgroundColor: "#0f172a",
          color: "#f3f4f6",
          padding: "0 12px",
          outline: "none",
          fontSize: "13px",
        }}
      >
        {runeItemTypes.map((itemType) => {
          return (
            <option key={itemType.typeId} value={itemType.typeId}>
              {itemType.typeName}
            </option>
          );
        })}
      </select>

      <div style={{ color: "#e5e7eb", fontWeight: 500, fontSize: "13px" }}>
        Level
      </div>
      <select
        value={effectiveSelectedRuneLevelId}
        onChange={handleLevelChange}
        style={{
          height: "40px",
          borderRadius: "6px",
          border: "1px solid #374151",
          backgroundColor: "#0f172a",
          color: "#f3f4f6",
          padding: "0 12px",
          outline: "none",
          fontSize: "13px",
        }}
      >
        {levelOptions.map((levelId) => {
          return (
            <option key={levelId} value={levelId}>
              Lv. {levelId * 10}
            </option>
          );
        })}
      </select>

      <div style={{ color: "#e5e7eb", fontWeight: 500, fontSize: "13px" }}>
        Rarity
      </div>
      <select
        value={effectiveSelectedRarityId}
        onChange={handleRarityChange}
        style={{
          height: "40px",
          borderRadius: "6px",
          border: "1px solid #374151",
          backgroundColor: "#0f172a",
          color: "#f3f4f6",
          padding: "0 12px",
          outline: "none",
          fontSize: "13px",
          fontWeight: 600,
        }}
      >
        {rarityOptions.map((rarity) => {
          return (
            <option
              key={rarity.rarityId}
              value={rarity.rarityId}
              style={{ color: rarity.color, backgroundColor: "#0f172a" }}
            >
              {rarity.rarityName}
            </option>
          );
        })}
      </select>

      <div
        style={{
          color: "#e5e7eb",
          fontWeight: 500,
          fontSize: "13px",
          alignSelf: "start",
          paddingTop: "10px",
        }}
      >
        Rune
      </div>
      <select
        value={effectiveSelectedRuneId}
        onChange={handleRuneChange}
        style={{
          height: "58px",
          borderRadius: "6px",
          border: "1px solid #374151",
          backgroundColor: "#0f172a",
          color: "#f3f4f6",
          padding: "0 12px",
          outline: "none",
          fontSize: "13px",
        }}
      >
        {runeOptions.map((rune) => {
          return (
            <option key={rune.runeId} value={rune.runeId}>
              {rune.runeName}
            </option>
          );
        })}
      </select>

      {selectedRune ? (
        <>
          <div />
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={resolveAssetUrl(selectedRune.pathFile)}
              alt={selectedRune.runeName}
              style={{ width: "38px", height: "38px", objectFit: "contain" }}
            />
            <span style={{ color: "#cbd5e1", fontSize: "13px" }}>
              {selectedProfile?.maxStatRows ?? 0} stat rows
            </span>
          </div>
        </>
      ) : null}

      <div
        style={{
          color: "#e5e7eb",
          fontWeight: 500,
          fontSize: "13px",
          alignSelf: "start",
          paddingTop: "8px",
        }}
      >
        Rune Stats
      </div>
      <div
        style={{
          border: "1px solid #374151",
          borderRadius: "8px",
          backgroundColor: "#0f172a",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          minHeight: "84px",
        }}
      >
        {selectedProfile && selectedRows.length > 0 ? (
          selectedRows.map((row, rowIndex) => {
            const selectedStat =
              selectedProfile.stats.find((stat) => {
                return stat.statId === row.statId;
              }) ?? selectedProfile.stats[0];
            const valueRarityIds = selectedStat
              ? buildValueRarityIds(selectedProfile, selectedStat)
              : [];
            const selectedValueRarityId = valueRarityIds.includes(row.valueRarityId)
              ? row.valueRarityId
              : (valueRarityIds[0] ?? selectedProfile.minValueRarityId);
            const selectedValue = selectedStat
              ? getRuneStatValue(selectedStat, selectedValueRarityId)
              : 0;
            const selectedValueRarity = rarityMap.get(selectedValueRarityId) ?? null;

            return (
              <div
                key={rowIndex}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) 130px 90px",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <select
                  value={selectedStat?.statId ?? 0}
                  onChange={(event) => {
                    const nextStatId = Number(event.target.value);
                    const nextStat =
                      selectedProfile.stats.find((stat) => {
                        return stat.statId === nextStatId;
                      }) ?? null;

                    updateRow(rowIndex, {
                      statId: nextStatId,
                      valueRarityId: nextStat
                        ? buildValueRarityIds(selectedProfile, nextStat)[0] ??
                          selectedProfile.minValueRarityId
                        : selectedProfile.minValueRarityId,
                    });
                  }}
                  style={{
                    height: "36px",
                    borderRadius: "6px",
                    border: "1px solid #374151",
                    backgroundColor: "#111827",
                    color: selectedValueRarity?.color ?? "#f3f4f6",
                    padding: "0 10px",
                    outline: "none",
                    fontSize: "13px",
                    minWidth: 0,
                  }}
                >
                  {selectedProfile.stats.map((stat) => {
                    const currentCount = selectedStatCounts.get(stat.statId) ?? 0;
                    const isCurrent = stat.statId === selectedStat?.statId;
                    const isDisabled = !isCurrent && currentCount >= stat.maxOption;

                    return (
                      <option
                        key={stat.statId}
                        value={stat.statId}
                        disabled={isDisabled}
                      >
                        {getStatLabel(stat.statId, gameData.stats)}
                      </option>
                    );
                  })}
                </select>

                <select
                  value={selectedValueRarityId}
                  onChange={(event) => {
                    updateRow(rowIndex, {
                      statId: selectedStat?.statId ?? 0,
                      valueRarityId: Number(event.target.value),
                    });
                  }}
                  style={{
                    height: "36px",
                    borderRadius: "6px",
                    border: "1px solid #374151",
                    backgroundColor: "#111827",
                    color: "#f3f4f6",
                    padding: "0 10px",
                    outline: "none",
                    fontSize: "13px",
                  }}
                >
                  {valueRarityIds.map((rarityId) => {
                    const rarity = rarityMap.get(rarityId) ?? null;

                    return (
                      <option
                        key={rarityId}
                        value={rarityId}
                        style={{
                          color: rarity?.color ?? "#f3f4f6",
                          backgroundColor: "#111827",
                        }}
                      >
                        {rarity?.rarityName ?? `Rarity ${rarityId}`}
                      </option>
                    );
                  })}
                </select>

                <div
                  style={{
                    color: selectedValueRarity?.color ?? "#f472b6",
                    fontSize: "13px",
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatStatValue(selectedValue, selectedStat?.isPercentage ?? false)}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ color: "#94a3b8", fontSize: "13px" }}>
            No rune stats
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRuneForm;
