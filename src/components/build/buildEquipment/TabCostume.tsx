import React from "react";

// --- Configuration (เหมือนเดิม) ---
const initialMainCostumeSlots = [
  { id: 1, label: "C.Head", rarity: "cyan", isHidden: false },
  { id: 2, label: "C.Top", rarity: "cyan", isHidden: false },
  { id: 3, label: "C.Bottom", rarity: "cyan", isHidden: false },
  { id: 4, label: "C.Gloves", rarity: "cyan", isHidden: false },
  { id: 5, label: "C.Boots", rarity: "cyan", isHidden: false },
  { id: 6, label: "C.Weapon", rarity: "cyan", isHidden: false },
  { id: 7, label: "C.Sub-Weapon", rarity: "cyan", isHidden: false },
];

const initialWingCostumeSlots = [
  { id: 8, label: "Wings", rarity: "cyan", isHidden: false },
  { id: 9, label: "Aura", rarity: "orange", isHidden: false },
  { id: 10, label: "Tail/Acc", rarity: "orange", isHidden: false },
];

const initialAccessoryCostumeSlots = [
  { id: 11, label: "C.Necklace", rarity: "cyan", isHidden: false },
  { id: 12, label: "C.Earring", rarity: "cyan", isHidden: false },
  { id: 13, label: "C.Ring 1", rarity: "cyan", isHidden: false },
  { id: 14, label: "C.Ring 2", rarity: "cyan", isHidden: false },
  { id: 15, label: "C.Special", rarity: "purple", isHidden: true },
];

// --- Sub-Component: Item Slot ---
const EquipmentSlot: React.FC<{ 
  rarity: string; 
  isHidden?: boolean;
}> = ({ rarity, isHidden = false }) => {
  const getRarityClass = () => {
    switch (rarity) {
      case "cyan": return "border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]";
      case "orange": return "border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]";
      case "purple": return "border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]";
      default: return "border-zinc-700";
    }
  };

  return (
    /* เราใช้ Container ชั้นนอกสุด (w-14 h-14) เพื่อจองพื้นที่ไว้เสมอ 
       แล้วใช้ invisible (visibility: hidden) ในการซ่อนเนื้อหาข้างใน
    */
    <div className={`w-13 h-13 sm:w-14 sm:h-14 relative shrink-0 ${isHidden ? "invisible" : "visible"}`}>
      {/* สัญลักษณ์ 'C' */}
      <div className="absolute -top-0.5 -left-0.5 z-20 w-4 h-4 bg-black/80 border border-amber-500 rounded flex items-center justify-center">
        <span className="text-[9px] font-black text-amber-500">C</span>
      </div>

      {/* กรอบ Rarity */}
      <div className={`absolute inset-0 rounded-lg border-2 z-10 pointer-events-none ${getRarityClass()}`} />
      
      {/* ตัว Slot ด้านใน */}
      <div className="w-full h-full bg-zinc-900 rounded-lg border border-white/5 flex items-center justify-center overflow-hidden">
        <div className="w-9 h-9 bg-zinc-800/40 rounded-md" />
        {/* สัญลักษณ์ Refresh */}
        <div className="absolute bottom-1 right-1 w-3 h-3 bg-cyan-950 border border-cyan-500/40 rounded-full flex items-center justify-center">
          <span className="text-[7px] text-cyan-400 leading-none">↺</span>
        </div>
      </div>
    </div>
  );
};

const TabCostume: React.FC = () => {
  return (
    <div className="w-full h-full bg-zinc-950/50 flex flex-col items-end p-4 select-none relative overflow-hidden">
      
      <div className="flex flex-col items-end space-y-4 z-10">
        <div className="flex items-end space-x-2">
          {/* Main Costume Column */}
          <div className="flex flex-col space-y-1.5">
            {initialMainCostumeSlots.map((item) => (
              <EquipmentSlot key={item.id} rarity={item.rarity} isHidden={item.isHidden} />
            ))}
          </div>

          {/* Wing Column */}
          <div className="flex flex-col space-y-1.5 justify-end">
             <div className="h-14" /><div className="h-14" /><div className="h-14" /><div className="h-14" />
             {initialWingCostumeSlots.map((item) => (
               <EquipmentSlot key={item.id} rarity={item.rarity} isHidden={item.isHidden} />
             ))}
          </div>
        </div>

        <div className="w-full h-px bg-white/10" />

        {/* Accessory Row (5 slots) */}
        <div className="flex flex-row-reverse gap-2 pr-16 sm:pr-[72px]">
          {[...initialAccessoryCostumeSlots].reverse().map((item) => (
            <EquipmentSlot key={item.id} rarity={item.rarity} isHidden={item.isHidden} />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
         <span className="text-zinc-600 italic text-sm">Costume Preview Area</span>
      </div>
    </div>
  );
};

export default TabCostume;