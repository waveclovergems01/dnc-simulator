import React, { useEffect, useMemo, useState } from "react";
import { GameDataLoader } from "../../data/GameDataLoader";
import { appMemory } from "../../state/AppMemory";
import type { AppMemoryState } from "../../state/models/AppMemoryState";

const ATTACK_STAT_IDS = new Set<number>([7, 8]);
const CHARACTER_SUMMARY_STAT_IDS = new Set<number>([0, 1, 2, 26]);

const STAT_DISPLAY_PRIORITY = new Map<number, number>(
  [
    7,
    8,
    3,
    4,
    5,
    6,
    0,
    1,
    2,
    18,
    19,
    20,
    21,
    14,
    11,
    12,
    13,
    9,
    10,
    15,
    16,
    17,
    22,
    23,
    24,
    25,
    26,
  ].map((statId, index) => {
    return [statId, index] as const;
  }),
);

interface BaseStatRow {
  key: string;
  statId: number;
  label: string;
  minValue: number;
  maxValue: number;
  isPercentage: boolean;
}

const getStatPriority = (statId: number): number => {
  return STAT_DISPLAY_PRIORITY.get(statId) ?? 1000 + statId;
};

const formatJobName = (name: string): string => {
  return name
    .split(/[\s_-]+/)
    .filter((part) => {
      return part.length > 0;
    })
    .map((part) => {
      return `${part.charAt(0).toUpperCase()}${part.slice(1)}`;
    })
    .join(" ");
};

const formatNumber = (value: number): string => {
  const rounded = Math.round(value * 100) / 100;

  return Number.isInteger(rounded)
    ? rounded.toLocaleString()
    : rounded.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const formatStatValue = (row: BaseStatRow): string => {
  const suffix = row.isPercentage ? "%" : "";

  if (ATTACK_STAT_IDS.has(row.statId) && !row.isPercentage) {
    return `${formatNumber(row.minValue)} - ${formatNumber(row.maxValue)}`;
  }

  return `${formatNumber(row.maxValue)}${suffix}`;
};

const createStatKey = (statId: number, isPercentage: boolean): string => {
  return `${statId}-${isPercentage ? "percent" : "value"}`;
};

const StatsBlock: React.FC<{ title: string; rows: BaseStatRow[] }> = ({
  title,
  rows,
}) => {
  return (
    <div
      style={{
        border: "1px solid #374151",
        borderRadius: "8px",
        backgroundColor: "#111827",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid #374151",
          backgroundColor: "#0b1120",
          padding: "10px 12px",
          color: "#9ca3af",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      <div style={{ padding: "8px 12px" }}>
        {rows.map((stat) => {
          return (
            <div
              key={stat.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                padding: "6px 0",
              }}
            >
              <span
                style={{
                  color: "#93c5fd",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </span>
              <span
                style={{
                  color: "#f8fafc",
                  fontSize: "15px",
                  fontWeight: 800,
                  fontVariantNumeric: "tabular-nums",
                  textShadow: "1px 1px 0 #1d4ed8",
                }}
              >
                {formatStatValue(stat)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CharacterStatsPanel: React.FC = () => {
  const gameData = useMemo(() => {
    return GameDataLoader.load();
  }, []);
  const [memoryState, setMemoryState] = useState<AppMemoryState>(() => {
    return appMemory.getState();
  });

  useEffect(() => {
    return appMemory.subscribe((nextState) => {
      setMemoryState(nextState);
    });
  }, []);

  const statDefinitionMap = useMemo(() => {
    return new Map(
      gameData.stats.map((stat) => {
        return [stat.statId, stat] as const;
      }),
    );
  }, [gameData.stats]);

  const defaultStatRows = useMemo<BaseStatRow[]>(() => {
    return gameData.stats
      .filter((stat) => {
        return stat.statCatId >= 0 && stat.statCatId <= 7;
      })
      .map((stat) => {
        return {
          key: createStatKey(stat.statId, stat.isPercentage),
          statId: stat.statId,
          label: stat.displayName || stat.statName || `Stat ${stat.statId}`,
          minValue: 0,
          maxValue: 0,
          isPercentage: stat.isPercentage,
        };
      })
      .sort((left, right) => {
        const leftPriority = getStatPriority(left.statId);
        const rightPriority = getStatPriority(right.statId);

        if (leftPriority !== rightPriority) {
          return leftPriority - rightPriority;
        }

        return Number(left.isPercentage) - Number(right.isPercentage);
      });
  }, [gameData.stats]);

  const characterJob = useMemo(() => {
    return (
      gameData.jobs.find((job) => {
        return job.id === memoryState.characterJobId;
      }) ?? null
    );
  }, [gameData.jobs, memoryState.characterJobId]);

  const allStats = useMemo<BaseStatRow[]>(() => {
    const statMap = new Map<string, BaseStatRow>();

    defaultStatRows.forEach((row) => {
      statMap.set(row.key, { ...row });
    });

    const addStat = (
      statId: number,
      minValue: number,
      maxValue: number,
      isPercentage: boolean,
    ): void => {
      if (minValue === 0 && maxValue === 0) {
        return;
      }

      const statDefinition = statDefinitionMap.get(statId) ?? null;

      if (
        !statDefinition ||
        statDefinition.statCatId < 0 ||
        statDefinition.statCatId > 7
      ) {
        return;
      }

      const key = createStatKey(statId, isPercentage);
      const current = statMap.get(key);
      const label =
        statDefinition.displayName || statDefinition.statName || `Stat ${statId}`;

      statMap.set(key, {
        key,
        statId,
        label,
        minValue: (current?.minValue ?? 0) + minValue,
        maxValue: (current?.maxValue ?? 0) + maxValue,
        isPercentage,
      });
    };

    memoryState.generalEquipmentList.forEach((slot) => {
      const equipment =
        gameData.items.find((item) => {
          return item.itemId === slot.itemData.itemId;
        }) ?? null;

      equipment?.baseStats.forEach((stat) => {
        addStat(stat.statId, stat.valueMin, stat.valueMax, stat.isPercentage);
      });
      slot.itemData.customEnhanceStats?.forEach((stat) => {
        addStat(stat.statId, stat.valueMin, stat.valueMax, stat.isPercentage);
      });
      slot.itemData.customHiddenPotentialStats?.forEach((stat) => {
        addStat(stat.statId, stat.valueMin, stat.valueMax, stat.isPercentage);
      });
    });

    const equippedSetCountMap = new Map<number, number>();
    memoryState.generalEquipmentList.forEach((slot) => {
      const equipment =
        gameData.items.find((item) => {
          return item.itemId === slot.itemData.itemId;
        }) ?? null;

      if (equipment?.setId === null || equipment?.setId === undefined) {
        return;
      }

      equippedSetCountMap.set(
        equipment.setId,
        (equippedSetCountMap.get(equipment.setId) ?? 0) + 1,
      );
    });
    equippedSetCountMap.forEach((equippedCount, setId) => {
      const setBonus =
        gameData.setBonuses.find((bonus) => {
          return bonus.setId === setId;
        }) ?? null;

      setBonus?.setBonus.forEach((step) => {
        if (equippedCount < step.count) {
          return;
        }

        step.stats.forEach((stat) => {
          addStat(stat.statId, stat.valueMin, stat.valueMax, stat.isPercentage);
        });
      });
    });

    memoryState.equipmentList.forEach((slot) => {
      slot.itemData.plateIds.forEach((plateId) => {
        const plate =
          gameData.plates.find((item) => {
            return item.id === plateId;
          }) ?? null;

        if (!plate) {
          return;
        }

        addStat(plate.statId, plate.statValue, plate.statValue, false);
        addStat(plate.statId, plate.statPercent, plate.statPercent, true);
      });

      if (slot.itemData.plate3rdStatId !== null) {
        const thirdStat =
          gameData.plate3rdStats.find((item) => {
            return item.id === slot.itemData.plate3rdStatId;
          }) ?? null;

        if (thirdStat) {
          addStat(
            thirdStat.statId,
            thirdStat.value,
            thirdStat.value,
            thirdStat.isPercentage,
          );
        }
      }
    });

    memoryState.runeList.forEach((slot) => {
      slot.itemData.stats.forEach((stat) => {
        addStat(stat.statId, stat.value, stat.value, stat.isPercentage);
      });
    });

    memoryState.cardList.forEach((slot) => {
      const card =
        gameData.cards.find((item) => {
          return item.cardNameId === slot.itemData.cardNameId;
        }) ?? null;
      const cardRarity =
        card?.rarities.find((rarity) => {
          return rarity.cardId === slot.itemData.cardId;
        }) ?? null;

      cardRarity?.stats.forEach((stat) => {
        addStat(stat.statId, stat.valueMin, stat.valueMax, stat.isPercentage);
      });
    });

    return Array.from(statMap.values()).sort((left, right) => {
      const leftPriority = getStatPriority(left.statId);
      const rightPriority = getStatPriority(right.statId);

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      if (left.statId !== right.statId) {
        return left.statId - right.statId;
      }

      return Number(left.isPercentage) - Number(right.isPercentage);
    });
  }, [
    defaultStatRows,
    gameData.cards,
    gameData.items,
    gameData.plate3rdStats,
    gameData.plates,
    gameData.setBonuses,
    memoryState.cardList,
    memoryState.equipmentList,
    memoryState.generalEquipmentList,
    memoryState.runeList,
    statDefinitionMap,
  ]);
  const baseStats = useMemo(() => {
    return allStats.filter((stat) => {
      return !stat.isPercentage && !CHARACTER_SUMMARY_STAT_IDS.has(stat.statId);
    });
  }, [allStats]);
  const potentialStats = useMemo(() => {
    return allStats.filter((stat) => {
      return stat.isPercentage && !CHARACTER_SUMMARY_STAT_IDS.has(stat.statId);
    });
  }, [allStats]);
  const characterSummaryStats = useMemo(() => {
    return {
      hp:
        allStats.find((stat) => {
          return stat.statId === 0 && !stat.isPercentage;
        }) ?? null,
      mp:
        allStats.find((stat) => {
          return stat.statId === 1 && !stat.isPercentage;
        }) ?? null,
      mpRecovery:
        allStats.find((stat) => {
          return stat.statId === 2 && !stat.isPercentage;
        }) ?? null,
      movementSpeed:
        allStats.find((stat) => {
          return stat.statId === 26 && stat.isPercentage;
        }) ?? null,
    };
  }, [allStats]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          border: "1px solid #374151",
          borderRadius: "8px",
          backgroundColor: "#111827",
          padding: "12px",
        }}
      >
        <div
          style={{
            marginBottom: "10px",
            color: "#9ca3af",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          Character
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
            <span style={{ color: "#94a3b8", fontSize: "12px" }}>Job</span>
            <span
              style={{
                color: "#f3f4f6",
                fontSize: "13px",
                fontWeight: 700,
                textAlign: "right",
              }}
            >
              {characterJob ? formatJobName(characterJob.name) : "Unknown"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
            <span style={{ color: "#94a3b8", fontSize: "12px" }}>Level</span>
            <span style={{ color: "#f3f4f6", fontSize: "13px", fontWeight: 700 }}>
              Lv. {memoryState.characterLevel}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
            <span style={{ color: "#94a3b8", fontSize: "12px" }}>HP</span>
            <span style={{ color: "#b91c1c", fontSize: "13px", fontWeight: 800 }}>
              {characterSummaryStats.hp ? formatStatValue(characterSummaryStats.hp) : "0"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
            <span style={{ color: "#94a3b8", fontSize: "12px" }}>MP</span>
            <span style={{ color: "#2563eb", fontSize: "13px", fontWeight: 800 }}>
              {characterSummaryStats.mp ? formatStatValue(characterSummaryStats.mp) : "0"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
            <span style={{ color: "#94a3b8", fontSize: "12px" }}>MP Recovery</span>
            <span style={{ color: "#f3f4f6", fontSize: "13px", fontWeight: 700 }}>
              {characterSummaryStats.mpRecovery
                ? formatStatValue(characterSummaryStats.mpRecovery)
                : "0"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
            <span style={{ color: "#94a3b8", fontSize: "12px" }}>Movement Speed</span>
            <span style={{ color: "#f3f4f6", fontSize: "13px", fontWeight: 700 }}>
              {characterSummaryStats.movementSpeed
                ? formatStatValue(characterSummaryStats.movementSpeed)
                : "0%"}
            </span>
          </div>
        </div>
      </div>

      <StatsBlock title="Base Stats" rows={baseStats} />
      <StatsBlock title="Potential Stats" rows={potentialStats} />
    </div>
  );
};

export default CharacterStatsPanel;
