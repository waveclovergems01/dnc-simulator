import React from "react";
import EquipmentTooltip from "./EquipmentTooltip";
import PlateTooltip from "./PlateTooltip";
import type { InventoryTooltipProps } from "./tooltipModels";

const TooltipRouter: React.FC<InventoryTooltipProps> = (props) => {
  if (props.data.kind === "plate") {
    return <PlateTooltip data={props.data} position={props.position} />;
  }

  if (props.data.kind === "equipment") {
    return <EquipmentTooltip data={props.data} position={props.position} />;
  }

  return null;
};

export default TooltipRouter;
