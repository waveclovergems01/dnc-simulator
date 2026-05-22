import React, { useMemo } from "react";
import type {
  EquipmentTooltipData,
  EquipmentTooltipStat,
  PlateTooltipDiffTone,
  TooltipPosition,
} from "./tooltipModels";

const TOOLTIP_WIDTH = 340;
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

const getDiffColor = (tone: PlateTooltipDiffTone): string => {
  if (tone === "up") {
    return "#22c55e";
  }

  if (tone === "down") {
    return "#ef4444";
  }

  return "#f3f4f6";
};

const getDiffText = (stat: EquipmentTooltipStat): string | null => {
  if (!stat.diffText || stat.diffTone === null) {
    return null;
  }

  return stat.diffTone === "up" ? `+${stat.diffText}` : `-${stat.diffText}`;
};

const EquipmentTooltip: React.FC<{
  data: EquipmentTooltipData;
  position: TooltipPosition;
}> = ({ data, position }) => {
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
          border: "2px solid #4b5563",
          borderRadius: "10px",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(12,14,18,0.97) 0%, rgba(10,12,18,0.96) 56%, rgba(15,18,26,0.97) 100%)",
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
              fontWeight: 500,
              marginBottom: "6px",
              wordBreak: "break-word",
            }}
          >
            {data.title}
          </div>
          {data.subtitle ? (
            <div
              style={{
                color: "#ff4fd8",
                fontSize: "14px",
                lineHeight: 1.2,
                textAlign: "center",
                marginBottom: "6px",
              }}
            >
              {data.subtitle}
            </div>
          ) : null}

          <div
            style={{
              color: "#fde047",
              fontSize: "12px",
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
          <div style={{ color: "#f59e0b" }}>{data.classText}</div>
          <div style={{ color: "#f59e0b" }}>{data.typeText}</div>
          <div style={{ color: "#d1d5db" }}>{data.itemLevelText}</div>
          <div style={{ color: "#f59e0b" }}>{data.durabilityText}</div>
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
              gap: "4px",
              marginBottom: "10px",
            }}
          >
            {data.primaryStats.map((stat: EquipmentTooltipStat) => {
              const diffText = getDiffText(stat);

              return (
                <div
                  key={stat.key}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      color: "#f3f4f6",
                      minWidth: 0,
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {stat.label}: {stat.valueText}
                  </div>
                  <div
                    style={{
                      color: getDiffColor(stat.diffTone),
                      fontWeight: 700,
                      flexShrink: 0,
                      textAlign: "right",
                    }}
                  >
                    {diffText ?? ""}
                  </div>
                </div>
              );
            })}
          </div>

          {data.equipAbility ? (
            <>
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  margin: "0 -2px 10px -2px",
                }}
              />
              <div
                style={{
                  color: "#ff7bf0",
                  marginBottom: "4px",
                }}
              >
                {data.equipAbility.title}
              </div>
              <div
                style={{
                  color: "#f3f4f6",
                  marginBottom: "10px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {data.equipAbility.text}
              </div>
            </>
          ) : null}

          {data.enhanceStats.length > 0 ? (
            <>
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  margin: "0 -2px 10px -2px",
                }}
              />
              <div
                style={{
                  color: "#f3f4f6",
                  marginBottom: "4px",
                }}
              >
                [Enhanced Ability]
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  marginBottom: "10px",
                }}
              >
                {data.enhanceStats.map((stat: EquipmentTooltipStat) => {
                  return (
                    <div key={stat.key} style={{ color: "#a3e635" }}>
                      {stat.label}: {stat.valueText}
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}

          {data.hiddenPotentialStats.length > 0 ? (
            <>
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  margin: "0 -2px 10px -2px",
                }}
              />
              <div style={{ color: "#f3f4f6", marginBottom: "4px" }}>
                [Hidden Potential]
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  marginBottom: "10px",
                }}
              >
                {data.hiddenPotentialStats.map((stat: EquipmentTooltipStat) => {
                  return (
                    <div key={stat.key} style={{ color: "#38bdf8" }}>
                      {stat.label}: {stat.valueText}
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}

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
            [Equipment - {data.categoryLabel}]
          </div>

          <div
            style={{
              color: "#f3f4f6",
            }}
          >
            {data.description}
          </div>

          {data.setItemNames.length > 0 ? (
            <>
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  margin: "10px -2px 10px -2px",
                }}
              />
              <div style={{ color: "#f59e0b", marginBottom: "4px" }}>
                Set Items
              </div>
              <div
                style={{
                  color: "#f3f4f6",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1px",
                  marginBottom: "10px",
                }}
              >
                {data.setItemNames.map((name) => {
                  return <div key={name}>{name}</div>;
                })}
              </div>
            </>
          ) : null}

          {data.setBonusSteps.length > 0 ? (
            <>
              <div style={{ color: "#f59e0b", marginBottom: "4px" }}>
                Set Bonus
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                {data.setBonusSteps.map((step) => {
                  return (
                    <div
                      key={step.key}
                      style={{
                        color: step.isActive ? "#f3f4f6" : "#71717a",
                      }}
                    >
                      {step.text}
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EquipmentTooltip;
