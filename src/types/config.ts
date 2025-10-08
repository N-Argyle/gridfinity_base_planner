import type { MaterialSettings } from "./index";

export interface GridfinityConfig {
  dimensions: {
    width: number;
    height: number;
    maxGridX: number;
    maxGridY: number;
  };
  measurementUnit: "mm" | "inches";
  materialSettings: MaterialSettings;
  modelPlacements: {
    modelId: string;
    instanceId: string;
    position: {
      x: number;
      y: number;
      z: number;
    };
    gridPosition: {
      x: number;
      y: number;
    };
    rotation?: number;
  }[];
}
