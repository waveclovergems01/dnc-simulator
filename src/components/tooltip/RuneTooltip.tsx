import React, { useLayoutEffect, useRef, useState } from "react";
import type {
  PlateTooltipDiffTone,
  RuneTooltipData,
  RuneTooltipStat,
  TooltipPosition,
} from "./tooltipModels";

const TOOLTIP_WIDTH = 268;
const CURSOR_OFFSET_X = 18;
const CURSOR_OFFSET_Y = 18;

const getViewportSafePosition = (
  x: number,
  y: number,
  tooltipHeight = 360,
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

const getDiffText = (stat: RuneTooltipStat): string | null => {
  if (!stat.diffText || stat.diffTone === null) {
    return null;
  }

  return stat.diffTone === "up" ? `+${stat.diffText}` : `-${stat.diffText}`;
};

const RuneTooltip: React.FC<{
  data: RuneTooltipData;
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

      const resolvedMaxHeight =
        maxHeight ?? getViewportSafePosition(position.x, position.y).maxHeight;
      const viewportMaxColumns = Math.max(
        1,
        Math.floor((window.innerWidth - 16) / (TOOLTIP_WIDTH + 12)),
      );
      const resolvedMaxColumns = Math.max(
        1,
        Math.min(maxColumns ?? viewportMaxColumns, viewportMaxColumns),
      );
      const nextColumnCount = Math.min(
        resolvedMaxColumns,
        Math.max(1, Math.ceil(tooltipElement.scrollHeight / resolvedMaxHeight)),
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
      }}
    >
      <div
        style={{
          border: "2px solid #6b5a3a",
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
            "linear-gradient(180deg, rgba(8,8,12,0.97) 0%, rgba(9,11,18,0.96) 60%, rgba(13,17,28,0.97) 100%)",
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
              marginBottom: "8px",
              wordBreak: "break-word",
            }}
          >
            {data.title}
          </div>
          <div style={{ color: "#ffe600", fontSize: "13px", textAlign: "center" }}>
            {data.bindText}
          </div>
        </div>

        <div style={{ padding: "10px 14px 12px 14px", fontSize: "14px", lineHeight: 1.25 }}>
          <div style={{ color: "#f59e0b" }}>{data.levelReqText}</div>
          <div style={{ color: "#f59e0b" }}>{data.typeText}</div>
          <div style={{ color: "#f59e0b" }}>{data.itemLevelText}</div>
          <div style={{ color: "#d1d5db" }}>{data.resealText}</div>
          <div style={{ color: "#f59e0b", marginBottom: "12px" }}>
            {data.enhanceText}
          </div>

          <div style={{ color: "#f3f4f6", marginBottom: "6px" }}>
            [{data.categoryLabel}]
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {data.primaryStats.map((stat) => {
              const diffText = getDiffText(stat);

              return (
                <div
                  key={stat.key}
                  style={{
                    color: stat.rarityColor,
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <span>
                    {stat.label} : {stat.valueText}
                  </span>
                  {diffText ? (
                    <span style={{ color: getDiffColor(stat.diffTone), fontWeight: 700 }}>
                      {diffText}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuneTooltip;
