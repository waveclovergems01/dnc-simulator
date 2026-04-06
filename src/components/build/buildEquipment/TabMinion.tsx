import React from "react";

// --- Configuration & Mock Data ---

// กำหนด Rarity และสีขอบสำหรับ Slots
const SlotRarity = {
  Unique: { border: "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]", bg: "bg-amber-950/30" },
  Empty: { border: "border-zinc-700/70", bg: "bg-zinc-800/40" },
};

// ข้อมูลไอเทมใน Slots (จำลอง)
const minionSlots = [
  { id: 1, icon: "🐾", rarity: SlotRarity.Unique, hasItem: true, rarityMark: "C" }, // ช่องแรกมีไอเทม
  { id: 2, icon: null, rarity: SlotRarity.Empty, hasItem: false },
  { id: 3, icon: null, rarity: SlotRarity.Empty, hasItem: false },
  { id: 4, icon: null, rarity: SlotRarity.Empty, hasItem: false },
];

// ข้อมูล Minion
const minionInfo = {
  name: "Rose",
  level: 1,
  status: "Full", // สำหรับหลอดสถานะด้านล่าง
};


// --- Helper Component: ช่องใส่ไอเทม (Item Slot) ---
const MinionItemSlot: React.FC<{ slot: typeof minionSlots[0] }> = ({ slot }) => {
  const { rarity, hasItem, icon, rarityMark } = slot;
  
  return (
    <div className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center border-2 rounded-xl transition-all shadow-lg overflow-hidden relative
      ${rarity.bg} ${rarity.border} ${hasItem ? "cursor-pointer hover:scale-105" : "opacity-80"}`}
    >
      {/* เอฟเฟกต์สะท้อนแสงบนหน้ากระจก (Glass reflection) */}
      <div className="absolute top-0.5 right-0.5 w-[60%] h-px bg-white opacity-20 rotate-12 blur-[0.5px] pointer-events-none" />
      
      {/* Inner Slot (กรอบด้านใน) */}
      <div className={`w-full h-full flex items-center justify-center rounded-lg 
        ${hasItem ? "" : "border border-dashed border-zinc-700/50"} ${hasItem ? rarity.bg : "bg-black/30"}`}
      >
        {/* ไอคอนไอเทม (ถ้ามี) */}
        {hasItem && (
          <div className="text-zinc-100 text-3xl sm:text-4xl drop-shadow-md">
            {icon}
          </div>
        )}
        
        {/* เครื่องหมาย Rarity (เช่น 'C' - จำลอง) */}
        {hasItem && rarityMark && (
          <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-black/60 rounded text-[9px] font-black text-amber-400 uppercase tracking-tighter shadow-md">
            {rarityMark}
          </div>
        )}
        
        {/* ไอคอนช่องว่าง (ถ้าไม่มี) */}
        {!hasItem && <div className="w-2 h-2 bg-zinc-700 rotate-45 opacity-50" />}
      </div>
    </div>
  );
};


// --- Component หลัก ---
const TabMinion: React.FC = () => {
  return (
    <div className="flex flex-col w-full h-full bg-zinc-950 p-4 space-y-5 select-none font-sans text-zinc-300">
      
      {/* --- 1. ส่วนบน: กรอบแสดง Minion (Minion Visual Area) --- */}
      <div className="flex-1 bg-zinc-900 border-2 border-zinc-800 rounded-2xl relative overflow-hidden flex items-center justify-center min-h-[300px]">
        
        {/* Background Texture จางๆ */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-dotted-2.png')] opacity-10 pointer-events-none" />

        {/* --- จำลองรูปภาพ Minion --- */}
        {/* ในงานจริงให้แทนที่ <div> นี้ด้วย <img> หรือ Component แสดงโมเดล 3D */}
        <div className="w-40 h-40 sm:w-48 sm:h-48 bg-[url('/path-to-your-minion-image.png')] bg-contain bg-center bg-no-repeat flex items-center justify-center font-bold text-amber-700 text-6xl drop-shadow-[0_0_15px_rgba(251,191,36,0.3)] animate-pulse-slow">
           🐻 
        </div>

        {/* --- ปุ่มควบคุมด้านล่าง (Front, +, -) --- */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-10">
          {/* ปุ่มบวก (+) */}
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-700 text-xl font-bold text-amber-400 shadow-md">
            +
          </button>
          
          {/* ป้ายบอกมุมมอง (Front) */}
          <div className="px-5 py-1.5 bg-zinc-800/90 border border-zinc-700/50 rounded-full text-sm font-bold text-zinc-100 shadow-inner tracking-wide">
            Front
          </div>
          
          {/* ปุ่มลบ (-) */}
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-700 text-xl font-bold text-amber-400 shadow-md">
            −
          </button>
        </div>
      </div>

      {/* --- 2. ส่วนกลาง: ช่องใส่ไอเทม (Item Slots Area) --- */}
      <div className="flex justify-center gap-3 sm:gap-4 px-2">
        {minionSlots.map((slot) => (
          <MinionItemSlot key={slot.id} slot={slot} />
        ))}
      </div>

      {/* --- 3. ส่วนล่าง: แผงข้อมูล (Info Panel Area) --- */}
      <div className="bg-zinc-900/90 border border-white/5 rounded-xl p-5 shadow-2xl relative flex flex-col space-y-4">
        
        {/* ข้อมูล Text */}
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <div className="text-base font-semibold text-zinc-400 uppercase tracking-wider">
            Name: <span className="text-lg font-black text-white ml-1 drop-shadow-sm">{minionInfo.name}</span>
          </div>
          <div className="text-base font-semibold text-zinc-400 uppercase tracking-wider">
            Minion Level: <span className="text-lg font-black text-amber-400 ml-1 drop-shadow-sm">{minionInfo.level}</span>
          </div>
        </div>

        {/* --- หลอดสถานะด้านล่าง (Full Bar Mockup) --- */}
        <div className="w-full h-6 bg-black border border-zinc-700 rounded-full flex items-center justify-center p-0.5 overflow-hidden shadow-inner relative">
          {/* หลอดสี (จำลองว่าเต็ม - Full) */}
          <div className="absolute inset-0.5 bg-linear-to-r from-amber-700/60 via-amber-500/80 to-amber-700/60 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.4)]" />
          
          {/* ข้อความสถานะ */}
          <span className="text-xs font-black text-amber-100 uppercase tracking-[0.3em] relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {minionInfo.status}
          </span>
        </div>

        {/* ขอบล่าง (mockup scrollbar จางๆ มุมขวา) */}
        <div className="absolute top-1/2 -translate-y-1/2 right-2 w-1.5 h-20 bg-zinc-700/30 rounded-full opacity-40" />
      </div>

      {/* สไตล์ CSS สำหรับ Animation จางๆ */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.02); opacity: 0.9; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 5s ease-in-out infinite;
        }
      `}</style>

    </div>
  );
};

export default TabMinion;