import React from "react";
import PlateTooltip from "./PlateTooltip";
import type { InventoryTooltipProps } from "./tooltipModels";

const TooltipRouter: React.FC<InventoryTooltipProps> = (props) => {
  if (props.data.kind === "plate") {
    return <PlateTooltip {...props} />;
  }

  return null;
};

export default TooltipRouter;