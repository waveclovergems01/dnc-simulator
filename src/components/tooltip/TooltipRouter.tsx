import React from "react";
import EquipmentTooltip from "./EquipmentTooltip";
import PlateTooltip from "./PlateTooltip";
import RuneTooltip from "./RuneTooltip";
import CardTooltip from "./CardTooltip";
import type { InventoryTooltipProps } from "./tooltipModels";

const TooltipRouter: React.FC<InventoryTooltipProps> = (props) => {
  if (props.data.kind === "plate") {
    return (
      <PlateTooltip
        data={props.data}
        position={props.position}
        variant={props.variant}
        maxHeight={props.maxHeight}
        maxColumns={props.maxColumns}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
      />
    );
  }

  if (props.data.kind === "equipment") {
    return (
      <EquipmentTooltip
        data={props.data}
        position={props.position}
        variant={props.variant}
        maxHeight={props.maxHeight}
        maxColumns={props.maxColumns}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
      />
    );
  }

  if (props.data.kind === "rune") {
    return (
      <RuneTooltip
        data={props.data}
        position={props.position}
        variant={props.variant}
        maxHeight={props.maxHeight}
        maxColumns={props.maxColumns}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
      />
    );
  }

  if (props.data.kind === "card") {
    return (
      <CardTooltip
        data={props.data}
        position={props.position}
        variant={props.variant}
        maxHeight={props.maxHeight}
        maxColumns={props.maxColumns}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
      />
    );
  }

  return null;
};

export default TooltipRouter;
