import React, { useMemo } from "react";
import type { InventoryTooltipProps, PlateTooltipPrimaryStat } from "./tooltipModels";

const TOOLTIP_WIDTH = 268;
const CURSOR_OFFSET_X = 18;
const CURSOR_OFFSET_Y = 18;

const getViewportSafePosition = (
  x: number,
  y: number,
): { left: number; top: number } => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = x + CURSOR_OFFSET_X;
  let top = y + CURSOR_OFFSET_Y;

  if (left + TOOLTIP_WIDTH > viewportWidth - 8) {
    left = Math.max(8, x - TOOLTIP_WIDTH - 16);
  }

  if (top + 420 > viewportHeight - 8) {
    top = Math.max(8, viewportHeight - 428);
  }

  return {
    left,
    top,
  };
};

const PlateTooltip: React.FC<InventoryTooltipProps> = ({ data, position }) => {
  const safePosition = useMemo(() => {
    return getViewportSafePosition(position.x, position.y);
  }, [position.x, position.y]);

  return (
    <div
      style={{
        position: "fixed",
        left: `${safePosition.left}px`,
        top: `${safePosition.top}px`,
        width: `${TOOLTIP_WIDTH}px`,
        pointerEvents: "none",
        zIndex: 9999,
        color: "#f3f4f6",
        fontFamily: "Arial, sans-serif",
        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)",
      }}
    >
      <div
        style={{
          border: "2px solid #6b5a3a",
          borderRadius: "10px",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(10,10,16,0.96) 0%, rgba(8,10,20,0.95) 60%, rgba(12,16,34,0.96) 100%)",
          boxShadow:
            "0 0 0 2px rgba(255,255,255,0.05) inset, 0 8px 18px rgba(0,0,0,0.55)",
        }}
      >
        <div
          style={{
            padding: "12px 14px 10px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              color: data.rarityColor,
              fontSize: "15px",
              lineHeight: 1.2,
              textAlign: "center",
              fontWeight: 400,
              marginBottom: "6px",
              wordBreak: "break-word",
            }}
          >
            {data.title}
          </div>

          <div
            style={{
              color: "#ffe600",
              fontSize: "13px",
              lineHeight: 1.2,
              textAlign: "center",
            }}
          >
            {data.bindText}
          </div>
        </div>

        <div
          style={{
            padding: "10px 14px 12px 14px",
            fontSize: "13px",
            lineHeight: 1.25,
          }}
        >
          <div style={{ color: "#d1d5db" }}>{data.levelReqText}</div>
          <div style={{ color: "#d1d5db" }}>{data.itemLevelText}</div>
          <div style={{ color: "#d1d5db", marginBottom: "10px" }}>
            {data.tradableText}
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              margin: "0 -2px 10px -2px",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              marginBottom: "10px",
            }}
          >
            {data.primaryStats.map((stat: PlateTooltipPrimaryStat) => {
              return (
                <div
                  key={`${stat.statId}-${stat.valueText}`}
                  style={{
                    color: "#f3f4f6",
                  }}
                >
                  {stat.label}: {stat.valueText}
                </div>
              );
            })}

            {data.thirdStatText ? (
              <div
                style={{
                  color: "#f472b6",
                }}
              >
                {data.thirdStatText}
              </div>
            ) : null}
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              margin: "0 -2px 10px -2px",
            }}
          />

          <div
            style={{
              color: "#60a5fa",
              marginBottom: "4px",
            }}
          >
            [{data.categoryLabel}]
          </div>

          <div
            style={{
              color: "#f3f4f6",
              marginBottom: "10px",
            }}
          >
            {data.description}
          </div>

          <div
            style={{
              color: "#f3f4f6",
            }}
          >
            {data.effectText}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlateTooltip;