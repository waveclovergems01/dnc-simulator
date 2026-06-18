import { useEffect, useMemo, useState } from "react";
import MainFrame from "./components/layout/MainFrame";
import { GameDataLoader } from "./data/GameDataLoader";
import { appMemory } from "./state/AppMemory";
import { resolveJobBackgroundUrl } from "./utils/backgroundUtils";

const App: React.FC = () => {
  const gameData = useMemo(() => {
    return GameDataLoader.load();
  }, []);
  const [contentOpacity, setContentOpacity] = useState<number>(() => {
    const savedOpacity = window.localStorage.getItem("dnc-content-opacity");
    const parsedOpacity = savedOpacity ? Number(savedOpacity) : 1;

    if (!Number.isFinite(parsedOpacity)) {
      return 1;
    }

    return Math.min(1, Math.max(0.2, parsedOpacity));
  });
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

  const backgroundOpacity = useMemo(() => {
    return 0.3 + (1 - contentOpacity) * 0.7;
  }, [contentOpacity]);

  useEffect(() => {
    window.localStorage.setItem("dnc-content-opacity", String(contentOpacity));
  }, [contentOpacity]);

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
            opacity: backgroundOpacity,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <MainFrame
          contentOpacity={contentOpacity}
          onContentOpacityChange={setContentOpacity}
        />
      </div>
    </div>
  );
};

export default App;
