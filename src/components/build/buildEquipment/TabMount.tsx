import React from "react";

// --- Helper Component: ช่องใส่ไอเทม (Item Slot) ---
const ItemSlot: React.FC<{ rarity?: "purple" | "empty"; hasItem?: boolean }> = ({ rarity, hasItem }) => {
  const isPurple = rarity === "purple";
  
  return (
    <div className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center border-2 rounded-xl transition-all shadow-lg overflow-hidden relative
      ${isPurple 
        ? "bg-purple-900/40 border-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.6)]" 
        : "bg-zinc-800/60 border-zinc-700 hover:border-zinc-500 cursor-pointer"}`}
    >
      {/* Glass reflection */}
      <div className="absolute top-0.5 right-0.5 w-[60%] h-px bg-white opacity-20 rotate-12 blur-[0.5px] pointer-events-none" />
      
      {/* Inner Slot */}
      <div className={`w-full h-full flex items-center justify-center rounded-lg 
        ${hasItem ? (isPurple ? "bg-purple-900/30" : "bg-zinc-800/40") : "bg-black/30 border border-dashed border-zinc-700"}`}
      >
        {hasItem && (
          <div className="text-zinc-100 text-3xl drop-shadow-md">
            {/* ใส่ Icon หรือรูปภาพสัตว์ขี่ตรงนี้ */}
            🐎
          </div>
        )}
        {isPurple && (
          <div className="absolute top-1 left-1 px-1 py-0.5 bg-black/60 rounded text-[9px] font-black text-amber-400 uppercase shadow-md">
            C
          </div>
        )}
        {!hasItem && <div className="w-1.5 h-1.5 bg-zinc-700 rotate-45 opacity-60" />}
      </div>
    </div>
  );
};

const TabMount: React.FC = () => {
  return (
    <div className="flex flex-col w-full h-full bg-zinc-950 p-4 space-y-4 select-none text-zinc-300 font-sans">
      
      {/* --- ส่วนบน: กรอบแสดงสัตว์ขี่ (Mount Visual) --- */}
      <div className="flex-1 bg-zinc-900 border-2 border-zinc-800 rounded-2xl relative overflow-hidden flex items-center justify-center min-h-[300px]">
        
        {/* Magic Effect: ควันสีน้ำเงินคราม */}
        <div className="absolute w-40 h-60 bg-blue-600/20 rounded-full blur-[60px] animate-pulse" />
        <div className="absolute bottom-10 w-48 h-1 bg-cyan-400/50 blur-sm shadow-[0_0_20px_cyan]" />

        {/* Mockup ดวงดาว (Sparkles) แบบปลอดภัย */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full animate-ping" />
            <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full animate-pulse" />
            <div className="absolute bottom-20 left-1/4 w-1 h-1 bg-cyan-300 rounded-full animate-ping" />
        </div>

        {/* ปุ่มควบคุม Front / Back */}
        <div className="absolute bottom-4 flex items-center space-x-3">
          <button className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-amber-500 hover:bg-zinc-700">◀</button>
          <div className="px-6 py-1 bg-zinc-800/90 border border-zinc-700 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-200">
            Front
          </div>
          <button className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-amber-500 hover:bg-zinc-700">▶</button>
        </div>
      </div>

      {/* --- ส่วนกลาง: Item Slots --- */}
      <div className="flex justify-center gap-3">
        <ItemSlot rarity="purple" hasItem />
        <ItemSlot />
        <ItemSlot />
      </div>

      {/* --- ส่วนล่าง: Effect Stats --- */}
      <div className="bg-zinc-900/80 border border-white/5 rounded-xl p-4 shadow-xl">
        <div className="flex flex-col space-y-2">
          <div className="text-orange-400 font-black text-lg tracking-tight">
            Movement Speed: <span className="text-2xl">+70%</span>
          </div>
          <div className="h-px bg-white/5 w-full" />
          <div className="text-green-400 text-xs font-bold flex items-center">
             <span className="mr-2">■</span> Effect of Movement Speed Increase
          </div>
          <div className="text-zinc-500 text-[11px] leading-relaxed">
            - สัตว์ขี่ระดับพรีเมียม เพิ่มความเร็วในการเคลื่อนที่อย่างมาก <br/>
            - สามารถใช้งานได้ในพื้นที่ทั่วไป
          </div>
        </div>
      </div>

    </div>
  );
};

export default TabMount;