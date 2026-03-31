import React from "react";

interface SlotPosition {
  key: string;
  label: string;
  x: number;
  y: number;
  type: "stat" | "skill" | "corner" | "special";
}

interface HeraldrySlotButtonProps {
  label: string;
  type: "stat" | "skill" | "corner" | "special";
  onClick?: () => void;
}

const bgPlate = new URL(
  "/assets/img/plate/bg.png",
  import.meta.url
).href;

const bgCorner = new URL(
  "/assets/img/plate/bgcorner.png",
  import.meta.url
).href;

const HeraldrySlotButton: React.FC<HeraldrySlotButtonProps> = ({
  label,
  type,
  onClick,
}) => {
  const isCorner = type === "corner";
  const isSkill = type === "skill";
  const isSpecial = type === "special";

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: isCorner ? "52px" : "56px",
        height: isCorner ? "52px" : "56px",
        border: "none",
        outline: "none",
        borderRadius: isCorner ? "8px" : "14px",

        // ✅ เลือก bg ตาม type
        backgroundImage: `url(${isCorner ? bgCorner : bgPlate})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",

        backgroundColor: "transparent",
        boxShadow: "none",

        color: isCorner
          ? "#777"
          : isSpecial
          ? "#7dff5d"
          : isSkill
          ? "#f0df2d"
          : "#2df4ef",

        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0",
        fontSize: isCorner ? "14px" : "22px",
        fontWeight: 700,
        textShadow: isCorner ? "none" : "0 0 8px currentColor",
        position: "relative",
      }}
    >
      {isCorner ? "" : label}
    </button>
  );
};

const TabHeraldry: React.FC = () => {
  const statSlots: SlotPosition[] = [
    { key: "stat-1", label: "", x: -115, y: -50, type: "stat" },
    { key: "stat-2", label: "", x: -61, y: -95, type: "stat" },
    { key: "stat-3", label: "", x: 61, y: -95, type: "stat" },
    { key: "stat-4", label: "", x: 115, y: -50, type: "stat" },
    { key: "stat-5", label: "", x: 115, y: 50, type: "stat" },
    { key: "stat-6", label: "", x: 61, y: 95, type: "stat" },
    { key: "stat-7", label: "", x: -61, y: 95, type: "stat" },
    { key: "stat-8", label: "", x: -115, y: 50, type: "stat" },
    { key: "stat-9", label: "", x: -70, y: 170, type: "stat" },
    { key: "stat-10", label: "", x: 0, y: 170, type: "stat" },
    { key: "stat-11", label: "", x: 70, y: 170, type: "stat" },
  ];

  const skillSlots: SlotPosition[] = [
    { key: "skill-1", label: "", x: -55, y: -35, type: "skill" },
    { key: "skill-2", label: "", x: 55, y: -35, type: "skill" },
    { key: "skill-3", label: "", x: 55, y: 35, type: "skill" },
    { key: "skill-4", label: "", x: -55, y: 35, type: "skill" },
  ];

  const cornerSlots: SlotPosition[] = [
    { key: "corner-1", label: "", x: -125, y: -110, type: "corner" },
    { key: "corner-2", label: "", x: 125, y: -110, type: "corner" },
    { key: "corner-3", label: "", x: 125, y: 110, type: "corner" },
    { key: "corner-4", label: "", x: -125, y: 110, type: "corner" },
  ];

  const specialSlot: SlotPosition = {
    key: "special",
    label: "",
    x: 0,
    y: 0,
    type: "special",
  };

  const allSlots: SlotPosition[] = [
    ...statSlots,
    ...skillSlots,
    ...cornerSlots,
    specialSlot,
  ];

  const centerX = 160;
  const centerY = 150;

  const handleSlotClick = (slot: SlotPosition): void => {
    console.log("clicked:", slot.key, slot.type);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "16px 0",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "320px",
          height: "400px",
          borderRadius: "12px",
          overflow: "hidden",
          background:
            "radial-gradient(circle at center, #3b3b3b 0%, #232323 55%, #111111 100%)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        }}
      >
        {/* วงกลาง */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: `${centerY}px`,
            width: "240px",
            height: "240px",
            transform: "translate(-50%, -50%)",
            borderRadius: "9999px",
            border: "2px solid rgba(160,160,160,0.12)",
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 50px rgba(0,0,0,0.2)",
          }}
        />

        {/* slots */}
        {allSlots.map((slot) => (
          <div
            key={slot.key}
            style={{
              position: "absolute",
              left: `${centerX + slot.x}px`,
              top: `${centerY + slot.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <HeraldrySlotButton
              label={slot.label}
              type={slot.type}
              onClick={() => handleSlotClick(slot)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabHeraldry;