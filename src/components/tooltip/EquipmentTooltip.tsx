import React, { useLayoutEffect, useRef, useState } from "react";
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
  tooltipHeight = 420,
  tooltipWidth = TOOLTIP_WIDTH,
): { left: number; top: number; maxHeight: number } => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const viewportPadding = 8;
  const maxHeight = Math.max(160, viewportHeight - viewportPadding * 2);
  const measuredHeight = Math.min(tooltipHeight, maxHeight);

  let left = x + CURSOR_OFFSET_X;
  let top = y + CURSOR_OFFSET_Y;

  if (left + tooltipWidth > viewportWidth - viewportPadding) {
    left = Math.max(8, x - tooltipWidth - 16);
  }

  if (top + measuredHeight > viewportHeight - viewportPadding) {
    top = Math.max(viewportPadding, viewportHeight - measuredHeight - viewportPadding);
  }

  return {
    left,
    top,
    maxHeight,
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

const estimateTextRows = (text: string, charsPerRow = 34): number => {
  return Math.max(1, Math.ceil(text.length / charsPerRow));
};

const estimateEquipmentTooltipRows = (data: EquipmentTooltipData): number => {
  let rows = 13 + data.primaryStats.length;

  if (data.equipAbility) {
    rows += 3 + estimateTextRows(data.equipAbility.text);
  }

  if (data.enhanceStats.length > 0) {
    rows += 2 + data.enhanceStats.length;
  }

  if (data.hiddenPotentialStats.length > 0) {
    rows += 2 + data.hiddenPotentialStats.length;
  }

  rows += 4;

  if (data.setItemNames.length > 0) {
    rows += 2 + data.setItemNames.length;
  }

  if (data.setBonusSteps.length > 0) {
    rows += 2 + data.setBonusSteps.length;
  }

  return rows;
};

const EquipmentTooltip: React.FC<{
  data: EquipmentTooltipData;
  position: TooltipPosition;
  variant?: "floating" | "inline";
  maxHeight?: number;
  maxColumns?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}> = ({
  data,
  position,
  variant = "floating",
  maxHeight,
  maxColumns,
  onMouseEnter,
  onMouseLeave,
}) => {
  const isInline = variant === "inline";
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [columnCount, setColumnCount] = useState<number>(1);
  const [safePosition, setSafePosition] = useState(() => {
    return getViewportSafePosition(position.x, position.y);
  });

  useLayoutEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const tooltipElement = tooltipRef.current;

      if (!tooltipElement) {
        setSafePosition(getViewportSafePosition(position.x, position.y));
        return;
      }

      const resolvedMaxHeight = maxHeight ?? getViewportSafePosition(
        position.x,
        position.y,
      ).maxHeight;
      const viewportMaxColumns = Math.max(
        1,
        Math.floor((window.innerWidth - 16) / (TOOLTIP_WIDTH + 12)),
      );
      const resolvedMaxColumns = Math.max(
        1,
        Math.min(maxColumns ?? viewportMaxColumns, viewportMaxColumns),
      );
      const estimatedRows = estimateEquipmentTooltipRows(data);
      const rowsPerColumn = Math.max(8, Math.floor(resolvedMaxHeight / 18));
      const nextColumnCount = Math.min(
        resolvedMaxColumns,
        Math.max(1, Math.ceil(estimatedRows / rowsPerColumn)),
      );
      const nextWidth = TOOLTIP_WIDTH * nextColumnCount + 12 * (nextColumnCount - 1);
      const nextPosition = getViewportSafePosition(
        position.x,
        position.y,
        tooltipElement.scrollHeight,
        nextWidth,
      );
      setColumnCount(nextColumnCount);
      setSafePosition(nextPosition);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [data, maxColumns, maxHeight, position.x, position.y]);

  const resolvedMaxHeight = maxHeight ?? safePosition.maxHeight;
  const tooltipWidth = TOOLTIP_WIDTH * columnCount + 12 * (columnCount - 1);

  return (
    <div
      ref={tooltipRef}
      data-inventory-tooltip="true"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: isInline ? "relative" : "fixed",
        left: isInline ? undefined : `${safePosition.left}px`,
        top: isInline ? undefined : `${safePosition.top}px`,
        width: `${tooltipWidth}px`,
        flexShrink: 0,
        maxWidth: "calc(100vw - 16px)",
        height: `${resolvedMaxHeight}px`,
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 9999,
        color: "#f3f4f6",
        fontFamily: "Arial, sans-serif",
        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.9)",
        scrollbarWidth: "thin",
      }}
    >
      <div
        style={{
          border: "2px solid #4b5563",
          borderRadius: "10px",
          width: `${tooltipWidth}px`,
          boxSizing: "border-box",
          height: `${resolvedMaxHeight}px`,
          overflow: "visible",
          columnCount,
          columnFill: "auto",
          columnGap: "12px",
          columnRule: columnCount > 1 ? "1px solid rgba(255,255,255,0.18)" : "none",
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
