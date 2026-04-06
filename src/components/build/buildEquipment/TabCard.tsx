import React, { useState, useRef, useCallback } from "react";

// --- Types & Configuration ---
type CardSubTab = "cards" | "mastery";

const TOTAL_CARD_SLOTS = 70; 
const CARDS_PER_PAGE = 16;
const MAX_LEVEL = 20;

const TabCard: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<CardSubTab>("cards");
  const [currentPage, setCurrentPage] = useState(1);
  
  // ใช้ number สำหรับ Browser Interval แทน NodeJS.Timeout
  const timerRef = useRef<number | null>(null);

  const initialMastery = [
    { id: 1, name: "Destruction Mastery", icon: "†" },
    { id: 2, name: "Magic Mastery", icon: "✨" },
    { id: 3, name: "Giant Bear Mastery", icon: "✊" },
    { id: 4, name: "Wind Mastery", icon: "🏃" },
    { id: 5, name: "Wisdom Mastery", icon: "💡" },
    { id: 6, name: "Health Mastery", icon: "♥" },
    { id: 7, name: "Lethal Mastery", icon: "🎯" },
    { id: 8, name: "Final Mastery", icon: "🔱" },
  ];

  const [masteryLevels, setMasteryLevels] = useState<{ [key: number]: number }>(
    Object.fromEntries(initialMastery.map((m) => [m.id, 0]))
  );

  // --- Logic: ปรับเลเวล ---
  const updateLevel = useCallback((id: number, delta: number) => {
    setMasteryLevels((prev) => {
      const currentLv = prev[id] || 0;
      const newLv = Math.max(0, Math.min(MAX_LEVEL, currentLv + delta));
      return { ...prev, [id]: newLv };
    });
  }, []);

  const setMaxLevel = (id: number) => {
    setMasteryLevels((prev) => ({ ...prev, [id]: MAX_LEVEL }));
  };

  // --- Logic: ระบบกดค้าง (Hold to Auto Increment/Decrement) ---
  const startCounter = (id: number, delta: number) => {
    updateLevel(id, delta); // ทำงานทันทีที่คลิกครั้งแรก
    if (timerRef.current) window.clearInterval(timerRef.current);
    
    timerRef.current = window.setInterval(() => {
      updateLevel(id, delta);
    }, 120); // ความเร็วในการรันเลข (120ms)
  };

  const stopCounter = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // --- Logic: Pagination ---
  const totalPages = Math.ceil(TOTAL_CARD_SLOTS / CARDS_PER_PAGE);
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const currentSlots = Array.from({ length: CARDS_PER_PAGE }, (_, i) => startIndex + i + 1)
    .filter((slotIdx) => slotIdx <= TOTAL_CARD_SLOTS);

  return (
    <div className="flex flex-col items-center w-full h-full p-4 space-y-6 text-zinc-200 select-none">
      
      {/* --- Sub-Tab Header --- */}
      <div className="flex space-x-1 border-b border-white/10 w-full max-w-2xl">
        <button
          className={`px-6 py-3 text-sm font-bold transition-all ${
            activeSubTab === "cards" ? "text-amber-400 border-b-2 border-amber-400 bg-white/5" : "text-zinc-500 hover:text-zinc-300"
          }`}
          onClick={() => setActiveSubTab("cards")}
        >
          Monster Cards
        </button>
        <button
          className={`px-6 py-3 text-sm font-bold transition-all ${
            activeSubTab === "mastery" ? "text-amber-400 border-b-2 border-amber-400 bg-white/5" : "text-zinc-500 hover:text-zinc-300"
          }`}
          onClick={() => setActiveSubTab("mastery")}
        >
          The Power of Mastery
        </button>
      </div>

      {/* --- Main Content Area --- */}
      <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-6 w-full max-w-2xl min-h-[550px] shadow-2xl backdrop-blur-xl flex flex-col">
        
        {activeSubTab === "cards" ? (
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="grid grid-cols-4 gap-4 sm:gap-6 justify-items-center">
              {currentSlots.map((slotIdx) => (
                <div key={slotIdx} className="flex flex-col items-center space-y-2 group">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-900/50 border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden transition-all hover:border-amber-500/50 cursor-pointer">
                    <div className="w-10 h-10 border border-zinc-700 rotate-45 opacity-20" />
                    <span className="absolute bottom-1 right-1.5 text-[9px] text-zinc-600">{slotIdx}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 tracking-widest uppercase">Empty</span>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-auto pt-8 flex justify-center items-center space-x-3">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-amber-500 disabled:opacity-10">&laquo;</button>
              <div className="flex space-x-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg text-sm font-black transition-all ${currentPage === page ? "bg-amber-500 text-black" : "text-zinc-500 hover:text-zinc-200"}`}>{page}</button>
                ))}
              </div>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-amber-500 disabled:opacity-10">&raquo;</button>
            </div>
          </div>
        ) : (
          /* --- Mastery List (Hold Click & 75/25 Layout) --- */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2 duration-300">
            {initialMastery.map((m) => (
              <div
                key={m.id}
                className="group relative flex items-center p-4 bg-linear-to-br from-zinc-900/80 to-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/40 transition-all h-24"
              >
                {/* Information Layer (คลิกทะลุได้) */}
                <div className="flex items-center w-full pointer-events-none z-0">
                  <div className="w-10 h-10 bg-black rounded-full border border-white/10 flex items-center justify-center mr-3 shrink-0 shadow-xl">
                    <span className="text-cyan-400 text-xl">{m.icon}</span>
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{m.name}</span>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-xl font-black text-amber-400 tabular-nums drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                        {masteryLevels[m.id]}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-600 italic">/ {MAX_LEVEL}</span>
                    </div>
                  </div>
                </div>

                {/* --- Hover Controls Layer (อยู่ด้านบนสุด) --- */}
                <div className="absolute inset-0 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20">
                  {/* Top 75%: Plus / Minus */}
                  <div className="flex h-[75%] w-full">
                    <button
                      onMouseDown={() => startCounter(m.id, 1)}
                      onMouseUp={stopCounter}
                      onMouseLeave={stopCounter}
                      className="w-1/2 h-full bg-green-500/10 hover:bg-green-500/30 border-r border-white/5 flex items-center justify-center text-green-400 text-3xl font-black transition-colors pointer-events-auto"
                    >
                      +
                    </button>
                    <button
                      onMouseDown={() => startCounter(m.id, -1)}
                      onMouseUp={stopCounter}
                      onMouseLeave={stopCounter}
                      className="w-1/2 h-full bg-red-500/10 hover:bg-red-500/30 flex items-center justify-center text-red-400 text-3xl font-black transition-colors pointer-events-auto"
                    >
                      −
                    </button>
                  </div>

                  {/* Bottom 25%: Max Level */}
                  <button
                    onClick={() => setMaxLevel(m.id)}
                    className="h-[25%] w-full bg-amber-500/10 hover:bg-amber-500/40 border-t border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-amber-400 transition-colors pointer-events-auto"
                  >
                    Set Max Level
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TabCard;