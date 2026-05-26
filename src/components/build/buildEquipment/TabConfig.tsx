import React, { useEffect, useMemo, useState } from "react";
import collectionsJson from "../../../assets/json/m.collections.json";
import titlesJson from "../../../assets/json/m.titles.json";
import { GameDataLoader } from "../../../data/GameDataLoader";
import { appMemory } from "../../../state/AppMemory";
import type { AppMemoryState } from "../../../state/models/AppMemoryState";

interface CollectionStat {
  stat_id: number;
  value_min: number;
  value_max: number;
  is_percentage: number;
}

interface CollectionLevel {
  level: number;
  required_sets: number;
  stats: CollectionStat[];
}

interface CollectionConfig {
  id: string;
  name: string;
  levels: CollectionLevel[];
}

interface CollectionsJsonShape {
  collections: CollectionConfig[];
}

interface TitleConfig {
  id: string;
  name: string;
  level: number;
  stats: CollectionStat[];
}

interface TitlesJsonShape {
  titles: TitleConfig[];
}

const collectionsData = collectionsJson as CollectionsJsonShape;
const titlesData = titlesJson as TitlesJsonShape;

const formatStatValue = (stat: CollectionStat): string => {
  const suffix = stat.is_percentage ? "%" : "";

  if (stat.value_min !== stat.value_max) {
    return `${stat.value_min.toLocaleString()} - ${stat.value_max.toLocaleString()}${suffix}`;
  }

  return `${stat.value_max.toLocaleString()}${suffix}`;
};

const TabConfig: React.FC = () => {
  const gameData = useMemo(() => {
    return GameDataLoader.load();
  }, []);
  const [memoryState, setMemoryState] = useState<AppMemoryState>(() => {
    return appMemory.getState();
  });
  const [isCollectionOpen, setIsCollectionOpen] = useState<boolean>(false);
  const [isTitlesOpen, setIsTitlesOpen] = useState<boolean>(false);

  useEffect(() => {
    return appMemory.subscribe((nextState) => {
      setMemoryState(nextState);
    });
  }, []);

  const collection = collectionsData.collections[0] ?? null;
  const collectionCycleLength = collection?.levels.length ?? 0;
  const statLabelMap = useMemo(() => {
    return new Map(
      gameData.stats.map((stat) => {
        return [stat.statId, stat.displayName || stat.statName] as const;
      }),
    );
  }, [gameData.stats]);

  if (!collection) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        No config data
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto text-zinc-200">
      <section className="rounded-lg border border-white/10 bg-zinc-900/80">
        <div className="border-b border-white/10 bg-black/30 px-4 py-3">
          <button
            type="button"
            onClick={() => setIsCollectionOpen((previous) => !previous)}
            className="flex w-full items-center justify-between text-left"
          >
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              Collection
            </h2>
            <span className="text-xs font-bold text-zinc-500">
              {isCollectionOpen ? "Collapse" : "Expand"}
            </span>
          </button>
        </div>
        {isCollectionOpen ? (
          <div className="space-y-4 p-4">
            <label className="flex max-w-xs flex-col gap-2 text-sm font-bold text-zinc-300">
              Collection Level
              <input
                type="number"
                min={0}
                max={100}
                value={memoryState.collectionLevel}
                onChange={(event) => {
                  const nextLevel = Math.max(
                    0,
                    Math.min(100, Number(event.target.value) || 0),
                  );
                  appMemory.setCollectionLevel(nextLevel);
                }}
                className="h-10 rounded-md border border-white/10 bg-zinc-950 px-3 text-sm font-bold text-zinc-100 outline-none focus:border-amber-400"
              />
            </label>
            <div className="text-xs text-zinc-500">
              Lv. {memoryState.collectionLevel} applies{" "}
              {collectionCycleLength > 0
                ? `${Math.floor(memoryState.collectionLevel / collectionCycleLength)} full cycles`
                : "0 full cycles"}
              {collectionCycleLength > 0 &&
              memoryState.collectionLevel % collectionCycleLength > 0
                ? ` + ${memoryState.collectionLevel % collectionCycleLength} levels`
                : ""}
              .
            </div>

            <div className="grid grid-cols-1 gap-3">
              {collection.levels.map((level) => {
                const appliedCount =
                  collectionCycleLength === 0 ||
                  memoryState.collectionLevel < level.level
                    ? 0
                    : Math.floor(
                        (memoryState.collectionLevel - level.level) /
                          collectionCycleLength,
                      ) + 1;
                const isActive = appliedCount > 0;

                return (
                  <div
                    key={level.level}
                    className={`rounded-md border p-3 ${
                      isActive
                        ? "border-emerald-400/40 bg-emerald-400/5"
                        : "border-white/10 bg-black/20"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-black text-zinc-100">
                        {collection.name} Lv. {level.level}
                      </span>
                      <span className="text-xs font-bold text-zinc-500">
                        {appliedCount > 0 ? `x${appliedCount}` : `${level.required_sets} sets`}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {level.stats.map((stat, index) => {
                        return (
                          <div
                            key={`${level.level}-${stat.stat_id}-${index}`}
                            className="flex justify-between gap-3 text-sm"
                          >
                            <span className="text-zinc-400">
                              {statLabelMap.get(stat.stat_id) ?? `Stat ${stat.stat_id}`}
                            </span>
                            <span className="font-bold tabular-nums text-orange-300">
                              {formatStatValue(stat)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-zinc-500">Collection Level</span>
            <span className="font-bold text-amber-300">
              Lv. {memoryState.collectionLevel}
            </span>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-white/10 bg-zinc-900/80">
        <div className="border-b border-white/10 bg-black/30 px-4 py-3">
          <button
            type="button"
            onClick={() => setIsTitlesOpen((previous) => !previous)}
            className="flex w-full items-center justify-between text-left"
          >
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              Titles
            </h2>
            <span className="text-xs font-bold text-zinc-500">
              {isTitlesOpen ? "Collapse" : "Expand"}
            </span>
          </button>
        </div>
        {isTitlesOpen ? (
          <div className="space-y-3 p-4">
            <button
              type="button"
              onClick={() => appMemory.setTitleId(null)}
              className={`w-full rounded-md border p-3 text-left transition ${
                memoryState.titleId === null
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-white/10 bg-black/20 hover:border-amber-400/60"
              }`}
            >
              <div className="font-bold text-zinc-100">No Title</div>
            </button>
            {titlesData.titles.map((title) => {
              const isActive = memoryState.titleId === title.id;

              return (
                <button
                  key={title.id}
                  type="button"
                  onClick={() => appMemory.setTitleId(title.id)}
                  className={`w-full rounded-md border p-3 text-left transition ${
                    isActive
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-white/10 bg-black/20 hover:border-amber-400/60"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-black text-zinc-100">{title.name}</span>
                    <span className="text-xs font-bold text-zinc-500">
                      Lv. {title.level}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {title.stats.map((stat, index) => {
                      return (
                        <div
                          key={`${title.id}-${stat.stat_id}-${index}`}
                          className="flex justify-between gap-3 text-sm"
                        >
                          <span className="text-zinc-400">
                            {statLabelMap.get(stat.stat_id) ?? `Stat ${stat.stat_id}`}
                          </span>
                          <span className="font-bold tabular-nums text-orange-300">
                            {formatStatValue(stat)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-zinc-500">Selected Title</span>
            <span className="font-bold text-amber-300">
              {titlesData.titles.find((title) => title.id === memoryState.titleId)
                ?.name ?? "None"}
            </span>
          </div>
        )}
      </section>
    </div>
  );
};

export default TabConfig;
