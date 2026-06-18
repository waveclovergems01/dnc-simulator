import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { GameDataLoader } from "../../../../data/GameDataLoader";
import type * as GameDataModels from "../../../../model/GameDataModels";
import { appMemory } from "../../../../state/AppMemory";
import {
  createInventoryCardItemData,
  createInventoryCardSlot,
} from "../../../../state/models/InventoryFactories";
import { formatStatValue, getStatLabel } from "../../../tooltip/tooltipUtils";
import type { CreateItemMode } from "./createItemTypes";

interface CreateCardFormProps {
  mode?: CreateItemMode;
  editingSlotIndex?: number | null;
  onRegisterSubmit?: (submitHandler: (() => boolean) | null) => void;
  onCanSubmitChange?: (canSubmit: boolean) => void;
  onFinishEdit?: () => void;
}

interface CardFormInitialState {
  selectedCardLevelId: number;
  selectedCardNameId: number;
  selectedRarityId: number;
}

const resolveAssetUrl = (pathFile: string): string => {
  const normalizedPath = pathFile.replace(/^\/+/, "");
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
};

const STAT_DISPLAY_PRIORITY = new Map<number, number>(
  [
    7,
    8,
    3,
    4,
    5,
    6,
    9,
    10,
    11,
    13,
    12,
    14,
    20,
    21,
    18,
    19,
    15,
    17,
    16,
    24,
    25,
    22,
    23,
  ].map((statId, index) => {
    return [statId, index] as const;
  }),
);

const getStatPriority = (statId: number): number => {
  return STAT_DISPLAY_PRIORITY.get(statId) ?? 1000 + statId;
};

const sortCardStats = (stats: GameDataModels.CardStat[]): GameDataModels.CardStat[] => {
  return [...stats].sort((left, right) => {
    const leftPriority = getStatPriority(left.statId);
    const rightPriority = getStatPriority(right.statId);

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return Number(left.isPercentage) - Number(right.isPercentage);
  });
};

const formatStatRange = (stat: GameDataModels.CardStat): string => {
  if (stat.valueMin === stat.valueMax) {
    return formatStatValue(stat.valueMax, stat.isPercentage);
  }

  return `${formatStatValue(stat.valueMin, stat.isPercentage)}-${formatStatValue(
    stat.valueMax,
    stat.isPercentage,
  )}`;
};

const CreateCardForm: React.FC<CreateCardFormProps> = ({
  mode = "new",
  editingSlotIndex = null,
  onRegisterSubmit,
  onCanSubmitChange,
  onFinishEdit,
}) => {
  const gameData = useMemo(() => {
    return GameDataLoader.load();
  }, []);

  const initialFormState = useMemo<CardFormInitialState>(() => {
    const defaultCard = gameData.cards[0] ?? null;
    const defaultState: CardFormInitialState = {
      selectedCardLevelId: defaultCard?.cardLevelId ?? 0,
      selectedCardNameId: defaultCard?.cardNameId ?? 0,
      selectedRarityId: defaultCard?.rarities[0]?.rarityId ?? 0,
    };

    if (mode !== "edit" || editingSlotIndex === null) {
      return defaultState;
    }

    const editingSlot = appMemory.getInventorySlot(editingSlotIndex);

    if (
      !editingSlot ||
      !editingSlot.itemData ||
      editingSlot.itemData.kind !== "card"
    ) {
      return defaultState;
    }

    return {
      selectedCardLevelId: editingSlot.itemData.cardLevelId,
      selectedCardNameId: editingSlot.itemData.cardNameId,
      selectedRarityId: editingSlot.itemData.rarityId,
    };
  }, [editingSlotIndex, gameData.cards, mode]);

  const [selectedCardLevelId, setSelectedCardLevelId] = useState<number>(
    initialFormState.selectedCardLevelId,
  );
  const [selectedCardNameId, setSelectedCardNameId] = useState<number>(
    initialFormState.selectedCardNameId,
  );
  const [selectedRarityId, setSelectedRarityId] = useState<number>(
    initialFormState.selectedRarityId,
  );
  const [isBulkCreateOpen, setIsBulkCreateOpen] = useState<boolean>(false);
  const [selectedBulkRarityId, setSelectedBulkRarityId] = useState<number>(
    initialFormState.selectedRarityId,
  );

  const rarityMap = useMemo<Map<number, GameDataModels.Rarity>>(() => {
    return new Map(
      gameData.rarities.map((rarity) => {
        return [rarity.rarityId, rarity] as const;
      }),
    );
  }, [gameData.rarities]);

  const patchLevelMap = useMemo<Map<number, GameDataModels.PatchLevel>>(() => {
    return new Map(
      gameData.patchLevels.map((patchLevel) => {
        return [patchLevel.id, patchLevel] as const;
      }),
    );
  }, [gameData.patchLevels]);

  const cardLevelOptions = useMemo<number[]>(() => {
    return Array.from(
      new Set(
        gameData.cards.map((card) => {
          return card.cardLevelId;
        }),
      ),
    ).sort((left, right) => {
      return left - right;
    });
  }, [gameData.cards]);

  const bulkRarityOptions = useMemo<GameDataModels.Rarity[]>(() => {
    const rarityIdSet = new Set<number>(
      gameData.cards.flatMap((card) => {
        return card.rarities.map((rarity) => {
          return rarity.rarityId;
        });
      }),
    );

    return gameData.rarities.filter((rarity) => {
      return rarityIdSet.has(rarity.rarityId);
    });
  }, [gameData.cards, gameData.rarities]);

  const effectiveSelectedBulkRarityId = useMemo<number>(() => {
    if (
      bulkRarityOptions.some((rarity) => {
        return rarity.rarityId === selectedBulkRarityId;
      })
    ) {
      return selectedBulkRarityId;
    }

    return bulkRarityOptions[0]?.rarityId ?? 0;
  }, [bulkRarityOptions, selectedBulkRarityId]);

  const bulkCreateCards = useMemo(() => {
    if (effectiveSelectedBulkRarityId === 0) {
      return [];
    }

    return gameData.cards
      .map((card) => {
        const cardRarity =
          card.rarities.find((rarity) => {
            return rarity.rarityId === effectiveSelectedBulkRarityId;
          }) ?? null;

        if (!cardRarity) {
          return null;
        }

        return {
          card,
          cardRarity,
        };
      })
      .filter((entry): entry is {
        card: GameDataModels.Card;
        cardRarity: GameDataModels.CardRarity;
      } => {
        return entry !== null;
      });
  }, [effectiveSelectedBulkRarityId, gameData.cards]);

  const effectiveSelectedCardLevelId = useMemo<number>(() => {
    if (cardLevelOptions.includes(selectedCardLevelId)) {
      return selectedCardLevelId;
    }

    return cardLevelOptions[0] ?? 0;
  }, [cardLevelOptions, selectedCardLevelId]);

  const cardOptions = useMemo<GameDataModels.Card[]>(() => {
    return gameData.cards
      .filter((card) => {
        return card.cardLevelId === effectiveSelectedCardLevelId;
      })
      .sort((left, right) => {
        return left.slotNumber - right.slotNumber;
      });
  }, [effectiveSelectedCardLevelId, gameData.cards]);

  const effectiveSelectedCardNameId = useMemo<number>(() => {
    if (
      cardOptions.some((card) => {
        return card.cardNameId === selectedCardNameId;
      })
    ) {
      return selectedCardNameId;
    }

    return cardOptions[0]?.cardNameId ?? 0;
  }, [cardOptions, selectedCardNameId]);

  const selectedCard = useMemo<GameDataModels.Card | null>(() => {
    return (
      cardOptions.find((card) => {
        return card.cardNameId === effectiveSelectedCardNameId;
      }) ?? null
    );
  }, [cardOptions, effectiveSelectedCardNameId]);

  const rarityOptions = useMemo<GameDataModels.Rarity[]>(() => {
    if (!selectedCard) {
      return [];
    }

    const rarityIdSet = new Set(
      selectedCard.rarities.map((rarity) => {
        return rarity.rarityId;
      }),
    );

    return gameData.rarities.filter((rarity) => {
      return rarityIdSet.has(rarity.rarityId);
    });
  }, [gameData.rarities, selectedCard]);

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

  const selectedCardRarity = useMemo<GameDataModels.CardRarity | null>(() => {
    return (
      selectedCard?.rarities.find((rarity) => {
        return rarity.rarityId === effectiveSelectedRarityId;
      }) ?? null
    );
  }, [effectiveSelectedRarityId, selectedCard]);

  const previewStats = useMemo<GameDataModels.CardStat[]>(() => {
    return selectedCardRarity ? sortCardStats(selectedCardRarity.stats) : [];
  }, [selectedCardRarity]);

  const canCreateCard = selectedCard !== null && selectedCardRarity !== null;

  const handleSubmitCard = useCallback((): boolean => {
    if (!selectedCard || !selectedCardRarity) {
      return false;
    }

    if (mode === "edit" && editingSlotIndex !== null) {
      const currentSlot = appMemory.getInventorySlot(editingSlotIndex);

      if (!currentSlot) {
        return false;
      }

      const currentUuid =
        currentSlot.itemData?.kind === "card" ? currentSlot.itemData.uuid : null;
      const nextItemData = createInventoryCardItemData({
        cardNameId: selectedCard.cardNameId,
        cardId: selectedCardRarity.cardId,
        rarityId: selectedCardRarity.rarityId,
        cardLevelId: selectedCard.cardLevelId,
        slotNumber: selectedCard.slotNumber,
      });

      appMemory.updateInventorySlot({
        slotIndex: currentSlot.slotIndex,
        itemTypeId: selectedCard.typeId,
        itemData: {
          ...nextItemData,
          uuid: currentUuid ?? nextItemData.uuid,
        },
      });

      onFinishEdit?.();
      return true;
    }

    appMemory.addInventorySlot(
      createInventoryCardSlot({
        inventoryList: appMemory.getInventoryList(),
        itemTypeId: selectedCard.typeId,
        cardNameId: selectedCard.cardNameId,
        cardId: selectedCardRarity.cardId,
        rarityId: selectedCardRarity.rarityId,
        cardLevelId: selectedCard.cardLevelId,
        slotNumber: selectedCard.slotNumber,
      }),
    );
    return true;
  }, [editingSlotIndex, mode, onFinishEdit, selectedCard, selectedCardRarity]);

  useEffect(() => {
    onRegisterSubmit?.(handleSubmitCard);

    return () => {
      onRegisterSubmit?.(null);
    };
  }, [handleSubmitCard, onRegisterSubmit]);

  useEffect(() => {
    onCanSubmitChange?.(canCreateCard);

    return () => {
      onCanSubmitChange?.(false);
    };
  }, [canCreateCard, onCanSubmitChange]);

  const handleLevelChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const nextLevelId = Number(event.target.value);
    const nextCard =
      gameData.cards.find((card) => {
        return card.cardLevelId === nextLevelId;
      }) ?? null;

    setSelectedCardLevelId(nextLevelId);
    setSelectedCardNameId(nextCard?.cardNameId ?? 0);
    setSelectedRarityId(nextCard?.rarities[0]?.rarityId ?? 0);
  };

  const handleCardChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const nextCardNameId = Number(event.target.value);
    const nextCard =
      cardOptions.find((card) => {
        return card.cardNameId === nextCardNameId;
      }) ?? null;

    setSelectedCardNameId(nextCardNameId);
    setSelectedRarityId(nextCard?.rarities[0]?.rarityId ?? 0);
  };

  const handleCreateAllCards = (): void => {
    let inventoryList = appMemory.getInventoryList();

    bulkCreateCards.forEach(({ card, cardRarity }) => {
      const nextSlot = createInventoryCardSlot({
        inventoryList,
        itemTypeId: card.typeId,
        cardNameId: card.cardNameId,
        cardId: cardRarity.cardId,
        rarityId: cardRarity.rarityId,
        cardLevelId: card.cardLevelId,
        slotNumber: card.slotNumber,
      });

      appMemory.addInventorySlot(nextSlot);
      inventoryList = [...inventoryList, nextSlot];
    });

    setIsBulkCreateOpen(false);
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
      {mode !== "edit" ? (
        <>
          <div />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => {
                setSelectedBulkRarityId(effectiveSelectedRarityId);
                setIsBulkCreateOpen(true);
              }}
              style={{
                minHeight: "38px",
                borderRadius: "6px",
                border: "1px solid #f59e0b66",
                backgroundColor: "#451a03",
                color: "#fde68a",
                padding: "0 14px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              Create All Cards
            </button>
          </div>
        </>
      ) : null}

      <div style={{ color: "#e5e7eb", fontWeight: 500, fontSize: "13px" }}>
        Level
      </div>
      <select
        value={effectiveSelectedCardLevelId}
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
        {cardLevelOptions.map((levelId) => {
          const patchLevel = patchLevelMap.get(levelId) ?? null;

          return (
            <option key={levelId} value={levelId}>
              Lv. {patchLevel?.level ?? levelId}
            </option>
          );
        })}
      </select>

      <div style={{ color: "#e5e7eb", fontWeight: 500, fontSize: "13px" }}>
        Card Name
      </div>
      <select
        value={effectiveSelectedCardNameId}
        onChange={handleCardChange}
        style={{
          height: "46px",
          borderRadius: "6px",
          border: "1px solid #374151",
          backgroundColor: "#0f172a",
          color: "#f3f4f6",
          padding: "0 12px",
          outline: "none",
          fontSize: "13px",
        }}
      >
        {cardOptions.map((card) => {
          return (
            <option key={card.cardNameId} value={card.cardNameId}>
              #{card.slotNumber} {card.cardName}
            </option>
          );
        })}
      </select>

      <div style={{ color: "#e5e7eb", fontWeight: 500, fontSize: "13px" }}>
        Rarity
      </div>
      <select
        value={effectiveSelectedRarityId}
        onChange={(event) => setSelectedRarityId(Number(event.target.value))}
        style={{
          height: "40px",
          borderRadius: "6px",
          border: "1px solid #374151",
          backgroundColor: "#0f172a",
          color: rarityMap.get(effectiveSelectedRarityId)?.color ?? "#f3f4f6",
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

      {selectedCard ? (
        <>
          <div />
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={resolveAssetUrl(selectedCard.pathFile)}
              alt={selectedCard.cardName}
              style={{ width: "38px", height: "38px", objectFit: "contain" }}
            />
            <span style={{ color: "#cbd5e1", fontSize: "13px" }}>
              Slot Number: {selectedCard.slotNumber}
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
        Stats Preview
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
        {previewStats.length > 0 ? (
          previewStats.map((stat) => {
            return (
              <div key={`${selectedCardRarity?.cardId}-${stat.statId}`}>
                {getStatLabel(stat.statId, gameData.stats)} :{" "}
                <span
                  style={{
                    color:
                      rarityMap.get(effectiveSelectedRarityId)?.color ?? "#f3f4f6",
                    fontWeight: 700,
                  }}
                >
                  {formatStatRange(stat)}
                </span>
              </div>
            );
          })
        ) : (
          <div style={{ color: "#94a3b8", fontSize: "13px" }}>
            No card stats
          </div>
        )}
      </div>

      {isBulkCreateOpen
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 10000,
                backgroundColor: "rgba(2, 6, 23, 0.72)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
              }}
            >
              <div
                style={{
                  width: "min(460px, 100%)",
                  borderRadius: "10px",
                  border: "1px solid #374151",
                  backgroundColor: "#111827",
                  boxShadow: "0 18px 48px rgba(0,0,0,0.5)",
                  color: "#e5e7eb",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div style={{ fontSize: "17px", fontWeight: 800 }}>
                  Create All Cards
                </div>
                <div style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.45 }}>
                  Select card rarity. This will create every card with that rarity into
                  Inventory.
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px minmax(0, 1fr)",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 700 }}>Rarity</div>
                  <select
                    value={effectiveSelectedBulkRarityId}
                    onChange={(event) => {
                      setSelectedBulkRarityId(Number(event.target.value));
                    }}
                    style={{
                      height: "40px",
                      borderRadius: "6px",
                      border: "1px solid #374151",
                      backgroundColor: "#0f172a",
                      color:
                        rarityMap.get(effectiveSelectedBulkRarityId)?.color ??
                        "#f3f4f6",
                      padding: "0 12px",
                      outline: "none",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    {bulkRarityOptions.map((rarity) => {
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
                </div>

                <div style={{ color: "#cbd5e1", fontSize: "13px" }}>
                  Cards to create:{" "}
                  <strong style={{ color: "#f3f4f6" }}>
                    {bulkCreateCards.length}
                  </strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    marginTop: "4px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsBulkCreateOpen(false)}
                    style={{
                      height: "38px",
                      borderRadius: "6px",
                      border: "1px solid #374151",
                      backgroundColor: "#111827",
                      color: "#e5e7eb",
                      padding: "0 14px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={bulkCreateCards.length === 0}
                    onClick={handleCreateAllCards}
                    style={{
                      height: "38px",
                      borderRadius: "6px",
                      border: "1px solid #f59e0b66",
                      backgroundColor:
                        bulkCreateCards.length > 0 ? "#b45309" : "#374151",
                      color: "#fff7ed",
                      padding: "0 14px",
                      cursor: bulkCreateCards.length > 0 ? "pointer" : "not-allowed",
                      fontWeight: 800,
                      opacity: bulkCreateCards.length > 0 ? 1 : 0.65,
                    }}
                  >
                    Create All
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};

export default CreateCardForm;
