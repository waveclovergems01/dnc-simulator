import React, { useEffect, useMemo, useRef, useState } from "react";
import { GameDataLoader } from "../../../../data/GameDataLoader";
import type * as GameDataModels from "../../../../model/GameDataModels";
import {
  formatStatValue,
  getStatLabel,
} from "../../../tooltip/tooltipUtils";

interface CreateEquipmentFormProps {
  onRegisterSubmit?: (submitHandler: (() => boolean) | null) => void;
  onCanSubmitChange?: (canSubmit: boolean) => void;
}

interface JobOption {
  jobId: number;
  label: string;
}

interface ItemTypeOption {
  itemType: GameDataModels.ItemType;
  previewItem: GameDataModels.EquipmentItem | null;
}

const EQUIPMENT_CATEGORY_ID = 10000;

const resolveAssetUrl = (pathFile: string): string => {
  const normalizedPath = pathFile.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

const getAllowedRarityIdsForItemType = (
  itemTypeId: number,
  gameData: GameDataModels.GameDataBundle,
  equipmentItems: GameDataModels.EquipmentItem[],
): number[] => {
  const itemTypeRule = gameData.rarityRules.itemTypes[itemTypeId];

  if (itemTypeRule && itemTypeRule.length > 0) {
    return [...itemTypeRule];
  }

  const itemType =
    gameData.itemTypes.find((entry: GameDataModels.ItemType) => {
      return entry.typeId === itemTypeId;
    }) ?? null;

  if (itemType) {
    const categoryRule = gameData.rarityRules.categories[itemType.categoryId];

    if (categoryRule && categoryRule.length > 0) {
      return [...categoryRule];
    }
  }

  return Array.from(
    new Set<number>(
      equipmentItems
        .filter((item: GameDataModels.EquipmentItem) => {
          return item.typeId === itemTypeId;
        })
        .map((item: GameDataModels.EquipmentItem) => {
          return item.rarityId;
        }),
    ),
  ).sort((left, right) => {
    return left - right;
  });
};

const CreateEquipmentForm: React.FC<CreateEquipmentFormProps> = ({
  onRegisterSubmit,
  onCanSubmitChange,
}) => {
  const gameData = useMemo(() => {
    return GameDataLoader.load();
  }, []);

  const equipmentItemTypes = useMemo<GameDataModels.ItemType[]>(() => {
    return gameData.itemTypes
      .filter((itemType: GameDataModels.ItemType) => {
        return itemType.categoryId === EQUIPMENT_CATEGORY_ID;
      })
      .sort((left, right) => {
        return left.typeName.localeCompare(right.typeName);
      });
  }, [gameData]);

  const equipmentTypeIdSet = useMemo<Set<number>>(() => {
    return new Set<number>(
      equipmentItemTypes.map((itemType: GameDataModels.ItemType) => {
        return itemType.typeId;
      }),
    );
  }, [equipmentItemTypes]);

  const equipmentItems = useMemo<GameDataModels.EquipmentItem[]>(() => {
    return gameData.items.filter((item: GameDataModels.EquipmentItem) => {
      return equipmentTypeIdSet.has(item.typeId);
    });
  }, [equipmentTypeIdSet, gameData.items]);

  const jobOptions = useMemo<JobOption[]>(() => {
    const usedJobIdSet = new Set<number>(
      equipmentItems.map((item: GameDataModels.EquipmentItem) => {
        return item.jobId;
      }),
    );

    return Array.from(usedJobIdSet)
      .map((jobId: number) => {
        const matchedJob =
          gameData.jobs.find((job: GameDataModels.JobDefinition) => {
            return job.id === jobId;
          }) ?? null;

        if (matchedJob) {
          return {
            jobId,
            label: matchedJob.name,
          };
        }

        if (jobId === 0) {
          return {
            jobId,
            label: "Common",
          };
        }

        return {
          jobId,
          label: `Job ${jobId}`,
        };
      })
      .sort((left, right) => {
        return left.label.localeCompare(right.label);
      });
  }, [equipmentItems, gameData.jobs]);

  const [selectedJobId, setSelectedJobId] = useState<number>(0);
  const [selectedItemTypeId, setSelectedItemTypeId] = useState<number>(0);
  const [selectedRarityId, setSelectedRarityId] = useState<number>(0);
  const [selectedLevel, setSelectedLevel] = useState<number>(0);
  const [selectedEquipmentItemId, setSelectedEquipmentItemId] =
    useState<number>(0);
  const [isItemTypeDropdownOpen, setIsItemTypeDropdownOpen] =
    useState<boolean>(false);
  const [isEquipmentDropdownOpen, setIsEquipmentDropdownOpen] =
    useState<boolean>(false);

  const itemTypeDropdownRef = useRef<HTMLDivElement | null>(null);
  const equipmentDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent): void => {
      const targetNode = event.target;

      if (!(targetNode instanceof Node)) {
        return;
      }

      if (
        itemTypeDropdownRef.current &&
        !itemTypeDropdownRef.current.contains(targetNode)
      ) {
        setIsItemTypeDropdownOpen(false);
      }

      if (
        equipmentDropdownRef.current &&
        !equipmentDropdownRef.current.contains(targetNode)
      ) {
        setIsEquipmentDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  const effectiveSelectedJobId = useMemo<number>(() => {
    if (jobOptions.length === 0) {
      return 0;
    }

    const hasSelectedJob = jobOptions.some((jobOption: JobOption) => {
      return jobOption.jobId === selectedJobId;
    });

    if (hasSelectedJob) {
      return selectedJobId;
    }

    return jobOptions[0].jobId;
  }, [jobOptions, selectedJobId]);

  const jobFilteredItems = useMemo<GameDataModels.EquipmentItem[]>(() => {
    if (effectiveSelectedJobId === 0 && jobOptions.length === 0) {
      return [];
    }

    return equipmentItems.filter((item: GameDataModels.EquipmentItem) => {
      return item.jobId === effectiveSelectedJobId;
    });
  }, [effectiveSelectedJobId, equipmentItems, jobOptions.length]);

  const itemTypeOptions = useMemo<ItemTypeOption[]>(() => {
    return equipmentItemTypes
      .filter((itemType: GameDataModels.ItemType) => {
        return jobFilteredItems.some((item: GameDataModels.EquipmentItem) => {
          return item.typeId === itemType.typeId;
        });
      })
      .map((itemType: GameDataModels.ItemType) => {
        const previewItem =
          jobFilteredItems.find((item: GameDataModels.EquipmentItem) => {
            return item.typeId === itemType.typeId;
          }) ??
          equipmentItems.find((item: GameDataModels.EquipmentItem) => {
            return item.typeId === itemType.typeId;
          }) ??
          null;

        return {
          itemType,
          previewItem,
        };
      })
      .sort((left, right) => {
        return left.itemType.typeName.localeCompare(right.itemType.typeName);
      });
  }, [equipmentItemTypes, equipmentItems, jobFilteredItems]);

  const effectiveSelectedItemTypeId = useMemo<number>(() => {
    if (itemTypeOptions.length === 0) {
      return 0;
    }

    const hasSelectedItemType = itemTypeOptions.some((option: ItemTypeOption) => {
      return option.itemType.typeId === selectedItemTypeId;
    });

    if (hasSelectedItemType) {
      return selectedItemTypeId;
    }

    return itemTypeOptions[0].itemType.typeId;
  }, [itemTypeOptions, selectedItemTypeId]);

  const selectedItemTypeOption = useMemo<ItemTypeOption | null>(() => {
    return (
      itemTypeOptions.find((option: ItemTypeOption) => {
        return option.itemType.typeId === effectiveSelectedItemTypeId;
      }) ?? null
    );
  }, [effectiveSelectedItemTypeId, itemTypeOptions]);

  const rarityOptions = useMemo<GameDataModels.Rarity[]>(() => {
    if (effectiveSelectedItemTypeId === 0) {
      return [];
    }

    const allowedRarityIds = getAllowedRarityIdsForItemType(
      effectiveSelectedItemTypeId,
      gameData,
      jobFilteredItems,
    );
    const allowedRarityIdSet = new Set<number>(allowedRarityIds);

    return gameData.rarities
      .filter((rarity: GameDataModels.Rarity) => {
        return allowedRarityIdSet.has(rarity.rarityId);
      })
      .sort((left, right) => {
        return left.rarityId - right.rarityId;
      });
  }, [effectiveSelectedItemTypeId, gameData, jobFilteredItems]);

  const effectiveSelectedRarityId = useMemo<number>(() => {
    if (rarityOptions.length === 0) {
      return 0;
    }

    const hasSelectedRarity = rarityOptions.some((rarity: GameDataModels.Rarity) => {
      return rarity.rarityId === selectedRarityId;
    });

    if (hasSelectedRarity) {
      return selectedRarityId;
    }

    return rarityOptions[0].rarityId;
  }, [rarityOptions, selectedRarityId]);

  const rarityFilteredItems = useMemo<GameDataModels.EquipmentItem[]>(() => {
    if (effectiveSelectedItemTypeId === 0 || effectiveSelectedRarityId === 0) {
      return [];
    }

    return jobFilteredItems.filter((item: GameDataModels.EquipmentItem) => {
      return (
        item.typeId === effectiveSelectedItemTypeId &&
        item.rarityId === effectiveSelectedRarityId
      );
    });
  }, [
    effectiveSelectedItemTypeId,
    effectiveSelectedRarityId,
    jobFilteredItems,
  ]);

  const levelOptions = useMemo<number[]>(() => {
    return Array.from(
      new Set<number>(
        rarityFilteredItems.map((item: GameDataModels.EquipmentItem) => {
          return item.requiredLevel;
        }),
      ),
    ).sort((left, right) => {
      return left - right;
    });
  }, [rarityFilteredItems]);

  const effectiveSelectedLevel = useMemo<number>(() => {
    if (levelOptions.length === 0) {
      return 0;
    }

    const hasSelectedLevel = levelOptions.some((level: number) => {
      return level === selectedLevel;
    });

    if (hasSelectedLevel) {
      return selectedLevel;
    }

    return levelOptions[0];
  }, [levelOptions, selectedLevel]);

  const equipmentOptions = useMemo<GameDataModels.EquipmentItem[]>(() => {
    if (effectiveSelectedLevel === 0) {
      return [];
    }

    return rarityFilteredItems
      .filter((item: GameDataModels.EquipmentItem) => {
        return item.requiredLevel === effectiveSelectedLevel;
      })
      .sort((left, right) => {
        return left.name.localeCompare(right.name);
      });
  }, [effectiveSelectedLevel, rarityFilteredItems]);

  const effectiveSelectedEquipmentItemId = useMemo<number>(() => {
    if (equipmentOptions.length === 0) {
      return 0;
    }

    const hasSelectedEquipment = equipmentOptions.some(
      (item: GameDataModels.EquipmentItem) => {
        return item.itemId === selectedEquipmentItemId;
      },
    );

    if (hasSelectedEquipment) {
      return selectedEquipmentItemId;
    }

    return equipmentOptions[0].itemId;
  }, [equipmentOptions, selectedEquipmentItemId]);

  const selectedEquipment = useMemo<GameDataModels.EquipmentItem | null>(() => {
    return (
      equipmentOptions.find((item: GameDataModels.EquipmentItem) => {
        return item.itemId === effectiveSelectedEquipmentItemId;
      }) ?? null
    );
  }, [effectiveSelectedEquipmentItemId, equipmentOptions]);

  const canSubmit = selectedEquipment !== null;

  useEffect(() => {
    if (onCanSubmitChange) {
      onCanSubmitChange(canSubmit);
    }

    return () => {
      if (onCanSubmitChange) {
        onCanSubmitChange(false);
      }
    };
  }, [canSubmit, onCanSubmitChange]);

  useEffect(() => {
    const handleSubmit = (): boolean => {
      if (!selectedEquipment) {
        return false;
      }

      console.log("Create equipment preview:", {
        itemId: selectedEquipment.itemId,
        name: selectedEquipment.name,
        typeId: selectedEquipment.typeId,
        jobId: selectedEquipment.jobId,
        rarityId: selectedEquipment.rarityId,
        requiredLevel: selectedEquipment.requiredLevel,
      });

      return true;
    };

    if (onRegisterSubmit) {
      onRegisterSubmit(handleSubmit);
    }

    return () => {
      if (onRegisterSubmit) {
        onRegisterSubmit(null);
      }
    };
  }, [onRegisterSubmit, selectedEquipment]);

  const handleJobChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedJobId(Number(event.target.value));
    setSelectedItemTypeId(0);
    setSelectedRarityId(0);
    setSelectedLevel(0);
    setSelectedEquipmentItemId(0);
    setIsItemTypeDropdownOpen(false);
    setIsEquipmentDropdownOpen(false);
  };

  const handleItemTypeSelect = (itemTypeId: number): void => {
    setSelectedItemTypeId(itemTypeId);
    setSelectedRarityId(0);
    setSelectedLevel(0);
    setSelectedEquipmentItemId(0);
    setIsItemTypeDropdownOpen(false);
    setIsEquipmentDropdownOpen(false);
  };

  const handleRarityChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setSelectedRarityId(Number(event.target.value));
    setSelectedLevel(0);
    setSelectedEquipmentItemId(0);
    setIsEquipmentDropdownOpen(false);
  };

  const handleLevelChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setSelectedLevel(Number(event.target.value));
    setSelectedEquipmentItemId(0);
    setIsEquipmentDropdownOpen(false);
  };

  const handleEquipmentSelect = (itemId: number): void => {
    setSelectedEquipmentItemId(itemId);
    setIsEquipmentDropdownOpen(false);
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
      <div
        style={{
          color: "#e5e7eb",
          fontWeight: 500,
          fontSize: "13px",
        }}
      >
        Job
      </div>
      <select
        value={effectiveSelectedJobId}
        onChange={handleJobChange}
        disabled={jobOptions.length === 0}
        style={{
          height: "40px",
          borderRadius: "6px",
          border: "1px solid #374151",
          backgroundColor: "#0f172a",
          color: "#f3f4f6",
          padding: "0 12px",
          outline: "none",
          fontSize: "13px",
          opacity: jobOptions.length === 0 ? 0.7 : 1,
        }}
      >
        {jobOptions.length > 0 ? (
          jobOptions.map((jobOption: JobOption) => {
            return (
              <option key={jobOption.jobId} value={jobOption.jobId}>
                {jobOption.label}
              </option>
            );
          })
        ) : (
          <option value={0}>No data</option>
        )}
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
        Item Type
      </div>
      <div ref={itemTypeDropdownRef} style={{ position: "relative" }}>
        <button
          type="button"
          disabled={itemTypeOptions.length === 0}
          onClick={() => {
            if (itemTypeOptions.length === 0) {
              return;
            }

            setIsItemTypeDropdownOpen((previous) => !previous);
          }}
          style={{
            width: "100%",
            minHeight: "58px",
            borderRadius: "6px",
            border: "1px solid #374151",
            backgroundColor: "#0f172a",
            color: "#f3f4f6",
            padding: "8px 12px",
            outline: "none",
            cursor: itemTypeOptions.length > 0 ? "pointer" : "not-allowed",
            opacity: itemTypeOptions.length > 0 ? 1 : 0.7,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            textAlign: "left",
          }}
        >
          {selectedItemTypeOption ? (
            <div
              style={{
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {selectedItemTypeOption.previewItem?.pathFile ? (
                <img
                  src={resolveAssetUrl(selectedItemTypeOption.previewItem.pathFile)}
                  alt={selectedItemTypeOption.itemType.typeName}
                  style={{
                    width: "34px",
                    height: "34px",
                    objectFit: "contain",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "6px",
                    border: "1px solid #374151",
                    backgroundColor: "#111827",
                    flexShrink: 0,
                  }}
                />
              )}

              <div
                style={{
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <div
                  style={{
                    color: "#f3f4f6",
                    fontSize: "13px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {selectedItemTypeOption.itemType.typeName}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              No data
            </div>
          )}

          <div
            style={{
              color: "#94a3b8",
              fontSize: "12px",
              flexShrink: 0,
            }}
          >
            ▼
          </div>
        </button>

        {isItemTypeDropdownOpen && itemTypeOptions.length > 0 ? (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              zIndex: 20,
              border: "1px solid #374151",
              borderRadius: "8px",
              backgroundColor: "#0f172a",
              boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
              overflow: "hidden",
              maxHeight: "280px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                maxHeight: "280px",
                overflowY: "auto",
              }}
            >
              {itemTypeOptions.map((option: ItemTypeOption) => {
                const isSelected =
                  option.itemType.typeId === effectiveSelectedItemTypeId;

                return (
                  <button
                    key={option.itemType.typeId}
                    type="button"
                    onClick={() => handleItemTypeSelect(option.itemType.typeId)}
                    style={{
                      width: "100%",
                      border: "none",
                      borderBottom: "1px solid #1f2937",
                      backgroundColor: isSelected ? "#1f2937" : "#0f172a",
                      color: "#f3f4f6",
                      padding: "10px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      textAlign: "left",
                    }}
                  >
                    {option.previewItem?.pathFile ? (
                      <img
                        src={resolveAssetUrl(option.previewItem.pathFile)}
                        alt={option.itemType.typeName}
                        style={{
                          width: "34px",
                          height: "34px",
                          objectFit: "contain",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "6px",
                          border: "1px solid #374151",
                          backgroundColor: "#111827",
                          flexShrink: 0,
                        }}
                      />
                    )}

                    <div
                      style={{
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {option.itemType.typeName}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div
        style={{
          color: "#e5e7eb",
          fontWeight: 500,
          fontSize: "13px",
        }}
      >
        Rarity
      </div>
      <select
        value={effectiveSelectedRarityId}
        onChange={handleRarityChange}
        disabled={rarityOptions.length === 0}
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
          opacity: rarityOptions.length === 0 ? 0.7 : 1,
        }}
      >
        {rarityOptions.length > 0 ? (
          rarityOptions.map((rarity: GameDataModels.Rarity) => {
            return (
              <option
                key={rarity.rarityId}
                value={rarity.rarityId}
                style={{
                  color: rarity.color,
                  backgroundColor: "#0f172a",
                }}
              >
                {rarity.rarityName}
              </option>
            );
          })
        ) : (
          <option value={0}>No data</option>
        )}
      </select>

      <div
        style={{
          color: "#e5e7eb",
          fontWeight: 500,
          fontSize: "13px",
        }}
      >
        Level
      </div>
      <select
        value={effectiveSelectedLevel}
        onChange={handleLevelChange}
        disabled={levelOptions.length === 0}
        style={{
          height: "40px",
          borderRadius: "6px",
          border: "1px solid #374151",
          backgroundColor: "#0f172a",
          color: "#f3f4f6",
          padding: "0 12px",
          outline: "none",
          fontSize: "13px",
          opacity: levelOptions.length === 0 ? 0.7 : 1,
        }}
      >
        {levelOptions.length > 0 ? (
          levelOptions.map((level: number) => {
            return (
              <option key={level} value={level}>
                Lv. {level}
              </option>
            );
          })
        ) : (
          <option value={0}>No data</option>
        )}
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
        Equipment
      </div>
      <div ref={equipmentDropdownRef} style={{ position: "relative" }}>
        <button
          type="button"
          disabled={equipmentOptions.length === 0}
          onClick={() => {
            if (equipmentOptions.length === 0) {
              return;
            }

            setIsEquipmentDropdownOpen((previous) => !previous);
          }}
          style={{
            width: "100%",
            minHeight: "58px",
            borderRadius: "6px",
            border: "1px solid #374151",
            backgroundColor: "#0f172a",
            color: "#f3f4f6",
            padding: "8px 12px",
            outline: "none",
            cursor: equipmentOptions.length > 0 ? "pointer" : "not-allowed",
            opacity: equipmentOptions.length > 0 ? 1 : 0.7,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            textAlign: "left",
          }}
        >
          {selectedEquipment ? (
            <div
              style={{
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {selectedEquipment.pathFile ? (
                <img
                  src={resolveAssetUrl(selectedEquipment.pathFile)}
                  alt={selectedEquipment.name}
                  style={{
                    width: "34px",
                    height: "34px",
                    objectFit: "contain",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "6px",
                    border: "1px solid #374151",
                    backgroundColor: "#111827",
                    flexShrink: 0,
                  }}
                />
              )}

              <div
                style={{
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <div
                  style={{
                    color: "#f3f4f6",
                    fontSize: "13px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {selectedEquipment.name}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              No data
            </div>
          )}

          <div
            style={{
              color: "#94a3b8",
              fontSize: "12px",
              flexShrink: 0,
            }}
          >
            ▼
          </div>
        </button>

        {isEquipmentDropdownOpen && equipmentOptions.length > 0 ? (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              zIndex: 20,
              border: "1px solid #374151",
              borderRadius: "8px",
              backgroundColor: "#0f172a",
              boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
              overflow: "hidden",
              maxHeight: "280px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                maxHeight: "280px",
                overflowY: "auto",
              }}
            >
              {equipmentOptions.map((item: GameDataModels.EquipmentItem) => {
                const isSelected =
                  item.itemId === effectiveSelectedEquipmentItemId;

                return (
                  <button
                    key={item.itemId}
                    type="button"
                    onClick={() => handleEquipmentSelect(item.itemId)}
                    style={{
                      width: "100%",
                      border: "none",
                      borderBottom: "1px solid #1f2937",
                      backgroundColor: isSelected ? "#1f2937" : "#0f172a",
                      color: "#f3f4f6",
                      padding: "10px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      textAlign: "left",
                    }}
                  >
                    {item.pathFile ? (
                      <img
                        src={resolveAssetUrl(item.pathFile)}
                        alt={item.name}
                        style={{
                          width: "34px",
                          height: "34px",
                          objectFit: "contain",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "6px",
                          border: "1px solid #374151",
                          backgroundColor: "#111827",
                          flexShrink: 0,
                        }}
                      />
                    )}

                    <div
                      style={{
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div
        style={{
          color: "#e5e7eb",
          fontWeight: 500,
          fontSize: "13px",
          alignSelf: "start",
          paddingTop: "8px",
        }}
      >
        Stats Value
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
          minHeight: "84px",
          fontSize: "13px",
        }}
      >
        {selectedEquipment ? (
          selectedEquipment.baseStats.length > 0 ? (
            selectedEquipment.baseStats.map((stat) => {
              return (
                <div key={`${selectedEquipment.itemId}-${stat.statId}`}>
                  {getStatLabel(stat.statId, gameData.stats)} :{" "}
                  {formatStatValue(stat.valueMax, stat.isPercentage)}
                </div>
              );
            })
          ) : (
            <div
              style={{
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              No stats data
            </div>
          )
        ) : (
          <div
            style={{
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            No equipment selected
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEquipmentForm;