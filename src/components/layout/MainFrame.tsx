import React, { useCallback, useEffect, useMemo, useState } from "react";
import Topbar from "./Topbar";
import CharacterBuildBar from "./CharacterBuildBar";
import TabBuild from "../build/TabBuild";
import TabLibrary from "../data/TabLibrary";
import TabExport from "../export/TabExport";
import { GameDataLoader } from "../../data/GameDataLoader";
import { appMemory } from "../../state/AppMemory";
import { restoreStateFromUrl } from "../../state/RestoreStateFromUrl";
import type { AppMemoryState } from "../../state/models/AppMemoryState";
import type { MainTabKey, TopbarTabItem } from "./Topbar";

const MainFrame: React.FC = () => {
  const gameData = useMemo(() => {
    return GameDataLoader.load();
  }, []);
  const characterJobs = useMemo(() => {
    return gameData.jobs.filter((job) => {
      return job.id !== 9999;
    });
  }, [gameData.jobs]);

  const tabs: TopbarTabItem[] = useMemo(
    () => [
      {
        key: "build",
        label: "Build",
      },
      {
        key: "library",
        label: "Library",
      },
      {
        key: "export",
        label: "Export",
      },
    ],
    [],
  );

  const [activeTab, setActiveTab] = useState<MainTabKey>("build");
  const [memoryState, setMemoryState] = useState<AppMemoryState>(() => {
    return appMemory.getState();
  });
  const levelOptions = useMemo<number[]>(() => {
    return gameData.patchLevels
      .map((level) => {
        return level.level;
      })
      .sort((left, right) => {
        return left - right;
      });
  }, [gameData.patchLevels]);
  const selectedLevel = levelOptions.includes(memoryState.characterLevel)
    ? memoryState.characterLevel
    : levelOptions[levelOptions.length - 1] ?? 1;
  const availableJobs = useMemo(() => {
    return characterJobs
      .filter((job) => {
        return job.requiredLevel <= selectedLevel;
      })
      .sort((left, right) => {
        if (left.requiredLevel !== right.requiredLevel) {
          return left.requiredLevel - right.requiredLevel;
        }

        if (left.classId !== right.classId) {
          return left.classId - right.classId;
        }

        return left.id - right.id;
      });
  }, [characterJobs, selectedLevel]);
  const effectiveSelectedJobId = useMemo<number>(() => {
    const isSelectedJobAvailable = availableJobs.some((job) => {
      return job.id === memoryState.characterJobId;
    });

    return isSelectedJobAvailable ? memoryState.characterJobId : availableJobs[0]?.id ?? 0;
  }, [availableJobs, memoryState.characterJobId]);
  const handleLevelChange = useCallback(
    (nextLevel: number): void => {
      const nextAvailableJobs = characterJobs
        .filter((job) => {
          return job.requiredLevel <= nextLevel;
        })
        .sort((left, right) => {
          if (left.requiredLevel !== right.requiredLevel) {
            return left.requiredLevel - right.requiredLevel;
          }

          if (left.classId !== right.classId) {
            return left.classId - right.classId;
          }

          return left.id - right.id;
        });
      const canKeepPreviousJob = nextAvailableJobs.some((job) => {
        return job.id === memoryState.characterJobId;
      });
      const nextJobId = canKeepPreviousJob
        ? memoryState.characterJobId
        : nextAvailableJobs[0]?.id ?? 0;

      appMemory.setCharacterBuild(nextLevel, nextJobId);
    },
    [characterJobs, memoryState.characterJobId],
  );
  const handleJobChange = useCallback(
    (nextJobId: number): void => {
      appMemory.setCharacterBuild(selectedLevel, nextJobId);
    },
    [selectedLevel],
  );

  useEffect(() => {
    void restoreStateFromUrl();
  }, []);

  useEffect(() => {
    return appMemory.subscribe((nextState) => {
      setMemoryState(nextState);
    });
  }, []);

  const content = useMemo(() => {
    if (activeTab === "build") {
      return <TabBuild />;
    }

    if (activeTab === "export") {
      return <TabExport />;
    }

    if (activeTab === "library") {
      return <TabLibrary />;
    }

    return null;
  }, [activeTab]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "transparent",
      }}
    >
      <Topbar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div
        style={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, #0a0d14 0%, #060810 100%)",
          color: "#e5e7eb",
          boxSizing: "border-box",
        }}
      >
        <div style={{ padding: "12px 12px 0" }}>
          <CharacterBuildBar
            levelOptions={levelOptions}
            selectedLevel={selectedLevel}
            selectedJobId={effectiveSelectedJobId}
            jobOptions={availableJobs}
            onLevelChange={handleLevelChange}
            onJobChange={handleJobChange}
          />
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          {content}
        </div>
      </div>
    </div>
  );
};

export default MainFrame;
