import { useEffect, useMemo, useState } from "react";
import MainFrame from "./components/layout/MainFrame";
import { GameDataLoader } from "./data/GameDataLoader";
import { appMemory } from "./state/AppMemory";
import { resolveJobBackgroundUrl } from "./utils/backgroundUtils";

const App: React.FC = () => {
  const gameData = useMemo(() => {
    return GameDataLoader.load();
  }, []);
  const [characterJobId, setCharacterJobId] = useState<number>(() => {
    return appMemory.getState().characterJobId;
  });

  useEffect(() => {
    return appMemory.subscribe((nextState) => {
      setCharacterJobId(nextState.characterJobId);
    });
  }, []);

  const backgroundUrl = useMemo(() => {
    return resolveJobBackgroundUrl(gameData.jobs, characterJobId);
  }, [gameData.jobs, characterJobId]);

  return (
    <div
      className="min-h-screen"
      style={{
        position: "relative",
        isolation: "isolate",
        background: "linear-gradient(180deg, #1f2937 0%, #020617 100%)",
        color: "#e5e7eb",
      }}
    >
      {backgroundUrl && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage: `url("${backgroundUrl}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 0.3,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <MainFrame />
      </div>
    </div>
  );
};

export default App;
