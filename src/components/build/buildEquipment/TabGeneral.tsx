import React from "react";

// --- Configuration ---
// ใช้ชื่อเรียกแบบ General (ไม่มี C. นำหน้า) และใช้ rarity pink/purple ตามสไตล์ชุดหลัก
const initialArmorSlots = [
  { id: 1, label: "Head", rarity: "pink", plus: 11, isHidden: false },
  { id: 2, label: "Top", rarity: "pink", plus: 11, isHidden: false },
  { id: 3, label: "Bottom", rarity: "pink", plus: 11, isHidden: false },
  { id: 4, label: "Gloves", rarity: "pink", plus: 10, isHidden: false },
  { id: 5, label: "Boots", rarity: "pink", plus: 10, isHidden: false },
  { id: 6, label: "Weapon", rarity: "pink", plus: 12, isHidden: false },
  { id: 7, label: "Sub-Weapon", rarity: "pink", plus: 12, isHidden: false },
];

const initialExtraSlots = [
  { id: 8, label: "Wing", rarity: "pink", isHidden: true },
  { id: 9, label: "Tail", rarity: "pink", isHidden: true },
  { id: 10, label: "Decay", rarity: "pink", isHidden: true },
];

const initialAccessorySlots = [
  { id: 11, label: "Necklace", rarity: "purple", isHidden: false },
  { id: 12, label: "Earring 1", rarity: "purple", isHidden: false },
  { id: 13, label: "Earring 2", rarity: "purple", isHidden: false },
  { id: 14, label: "Ring 1", rarity: "purple", isHidden: false },
  { id: 15, label: "Ring 2", rarity: "purple", isHidden: true },
];

// --- Sub-Component: Item Slot ---
const EquipmentSlot: React.FC<{ 
  rarity: string; 
  isHidden?: boolean;
  plus?: number;
}> = ({ rarity, isHidden = false, plus }) => {
  const getRarityClass = () => {
    switch (rarity) {
      case "pink": return "border-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.4)]";
      case "purple": return "border-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.4)]";
      default: return "border-zinc-700";
    }
  };

  return (
    <div className={`w-13 h-13 sm:w-14 sm:h-14 relative shrink-0 ${isHidden ? "invisible" : "visible"}`}>
      {/* แสดงเลขบวกเฉพาะ Tab General */}
      {plus !== undefined && (
        <span className="absolute -top-1 -left-1 z-20 text-amber-400 font-black text-[11px] drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
          +{plus}
        </span>
      )}

      {/* กรอบ Rarity */}
      <div className={`absolute inset-0 rounded-lg border-2 z-10 pointer-events-none ${getRarityClass()}`} />
      
      {/* ตัว Slot ด้านใน */}
      <div className="w-full h-full bg-zinc-900 rounded-lg border border-white/5 flex items-center justify-center overflow-hidden">
        <div className="w-10 h-10 bg-zinc-800/50 rounded-md" />
        {/* สัญลักษณ์ Refresh */}
        <div className="absolute bottom-1 right-1 w-3 h-3 bg-cyan-950 border border-cyan-500/30 rounded-full flex items-center justify-center">
          <span className="text-[7px] text-cyan-400 leading-none">↺</span>
        </div>
      </div>
    </div>
  );
};

const TabGeneral: React.FC = () => {
  return (
    <div className="w-full h-full bg-zinc-950/50 flex flex-col items-end p-4 select-none relative overflow-hidden">
      
      <div className="flex flex-col items-end space-y-4 z-10">
        <div className="flex items-end space-x-2">
          {/* Main Armor Column */}
          <div className="flex flex-col space-y-1.5">
            {initialArmorSlots.map((item) => (
              <EquipmentSlot key={item.id} rarity={item.rarity} isHidden={item.isHidden} plus={item.plus} />
            ))}
          </div>

          {/* Wing/Tail/Decay Column */}
          <div className="flex flex-col space-y-1.5 justify-end">
             {/* เว้นพื้นที่ 4 ช่องบนเพื่อให้ตำแหน่ง Wing ตรงกับ Costume */}
             <div className="h-13 sm:h-14" /><div className="h-13 sm:h-14" /><div className="h-13 sm:h-14" /><div className="h-13 sm:h-14" />
             {initialExtraSlots.map((item) => (
               <EquipmentSlot key={item.id} rarity={item.rarity} isHidden={item.isHidden} />
             ))}
          </div>
        </div>

        <div className="w-full h-[1px] bg-white/10" />

        {/* Accessory Row (5 slots) */}
        {/* pr-[64px] เพื่อดันให้ Slot สุดท้ายมาอยู่ตรงกับคอลัมน์ Armor พอดี */}
        <div className="flex flex-row-reverse gap-2 pr-[60px] sm:pr-[64px]">
          {[...initialAccessorySlots].reverse().map((item) => (
            <EquipmentSlot key={item.id} rarity={item.rarity} isHidden={item.isHidden} />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
         <span className="text-zinc-600 italic text-sm">Character Preview Area</span>
      </div>
    </div>
  );
};

export default TabGeneral;