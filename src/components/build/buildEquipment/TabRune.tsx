import React from "react";

// --- Configuration Data ---
const Rarity = {
  Purple: { border: "border-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.6)]", bg: "bg-purple-900/30" },
  Orange: { border: "border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]", bg: "bg-orange-950/30" },
  None: { border: "border-zinc-700", bg: "bg-zinc-800/40" },
};

const runePlacement = [
  { row: 1, col: 3, style: "scale-100", id: "sword", rarity: Rarity.Purple },
  { row: 2, col: 2, style: "scale-75 -rotate-12 opacity-90", rarity: Rarity.None },
  { row: 3, col: 1, style: "scale-100", id: "shield", rarity: Rarity.Purple },
  { row: 2, col: 4, style: "scale-75 rotate-12 opacity-90", rarity: Rarity.None },
  { row: 3, col: 5, style: "scale-100", id: "rune_mark", rarity: Rarity.Orange },
  { row: 4, col: 2, style: "scale-90 rotate-6", rarity: Rarity.None },
  { row: 5, col: 3, style: "scale-100", id: "sword", rarity: Rarity.Purple },
  { row: 4, col: 4, style: "scale-90 -rotate-6", rarity: Rarity.None },
];

const runeStats = [
  { label: "STR", value: "144" },
  { label: "Paralyze", value: "560" },
  { label: "Attk Power", value: "300-300" },
  { label: "Final Damage", value: "100" },
  { label: "Critical Rate", value: "15%" },
  { label: "HP Max", value: "2,450" },
  { label: "MP Max", value: "1,200" },
  { label: "Defense", value: "85" },
];

const RuneIcon: React.FC<{ id: string }> = ({ id }) => {
  const iconStyle = "w-7 h-7 text-cyan-200 drop-shadow-[0_0_4px_rgba(34,211,238,0.7)] flex items-center justify-center font-bold";
  switch (id) {
    case "sword": return <span className={iconStyle}>⚔</span>;
    case "shield": return <span className={iconStyle}>🛡</span>;
    case "rune_mark": return <span className={iconStyle}>🌀</span>;
    default: return null;
  }
};

const TabRune: React.FC = () => {
  return (
    <div className="flex flex-col w-full h-full bg-zinc-950 p-4 space-y-4 select-none font-sans text-zinc-300">
      
      {/* --- ส่วนบน: วงเวท --- */}
      <div className="flex-1 bg-zinc-900 border border-white/5 rounded-xl shadow-inner relative overflow-hidden flex items-center justify-center min-h-[300px]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-dotted-2.png')] opacity-10 pointer-events-none" />
        <div className="absolute w-[80%] h-[80%] opacity-20 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-zinc-500 stroke-[0.5]">
            <ellipse cx="50" cy="50" rx="45" ry="48" />
            <ellipse cx="50" cy="50" rx="30" ry="32" className="stroke-[0.3]" />
            <path d="M50 2 L50 98 M2 50 L98 50 M15 16 L85 84 M15 84 L85 16" className="stroke-[0.2]" />
          </svg>
        </div>

        <div className="grid grid-cols-5 grid-rows-5 gap-2 w-[80%] h-[80%] relative z-10 p-2">
          {runePlacement.map((rune, index) => {
            const hasRune = !!rune.id;
            const style = rune.rarity || Rarity.None;
            return (
              <div
                key={index}
                className={`flex items-center justify-center p-0.5 border rounded-md transition-all duration-300 ${style.bg} ${style.border} ${rune.style || ""}`}
                style={{ gridRow: rune.row, gridColumn: rune.col }}
              >
                <div className="w-full h-full border border-dashed border-zinc-600/30 flex items-center justify-center rounded-sm overflow-hidden">
                  {hasRune ? <RuneIcon id={rune.id!} /> : <div className="w-1.5 h-1.5 bg-zinc-800 rotate-45 opacity-40" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- ส่วนล่าง: แสดงผล Stats (ปรับให้กระชับขึ้น) --- */}
      <div className="w-full max-w-md mx-auto bg-zinc-900/90 border border-white/10 rounded-lg shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header กระชับ */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 bg-black/40">
          <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
            Rune Stats
          </h2>
          <span className="text-zinc-600 text-[10px]">▼</span>
        </div>

        <div className="px-4 py-2 max-h-[300px] overflow-y-auto custom-scrollbar">
          <div className="flex flex-col space-y-1">
            {runeStats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center py-0.5 border-b border-white/5 last:border-0">
                <span className="text-[12px] text-zinc-500 font-semibold uppercase tracking-wide">
                  {stat.label}
                </span>
                <span className="text-[16px] font-black text-zinc-100 tabular-nums tracking-tight">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>

    </div>
  );
};

export default TabRune;