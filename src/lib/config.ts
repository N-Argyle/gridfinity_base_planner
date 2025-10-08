import type { GridfinityConfig } from "~/types/config";
import type { GridfinityModel } from "~/atoms/models";
import * as THREE from "three";

export function exportConfig({
  dimensions,
  measurementUnit,
  materialSettings,
  selectedModels,
}: {
  dimensions: GridfinityConfig["dimensions"];
  measurementUnit: GridfinityConfig["measurementUnit"];
  materialSettings: GridfinityConfig["materialSettings"];
  selectedModels: GridfinityModel[];
}): string {
  console.log("Exporting models:", selectedModels.map(model => ({
    id: model.id,
    position: model.position,
    gridPosition: model.gridPosition
  })));

  const config: GridfinityConfig = {
    dimensions,
    measurementUnit,
    materialSettings,
    modelPlacements: selectedModels.map(model => {
      const pos = model.position ?? { x: 0, y: 0.004, z: 0 };
      const position = pos instanceof THREE.Vector3 
        ? { x: pos.x, y: pos.y, z: pos.z }
        : { x: pos.x, y: 0.004, z: pos.y };

      return {
        modelId: model.id,
        instanceId: model.instanceId!,
        position,
        gridPosition: model.gridPosition ?? {
          x: Math.round(position.x / 0.042),
          y: Math.round(position.z / 0.042)
        },
        rotation: model.rotation ?? 0,
      };
    })
  };

  return JSON.stringify(config, null, 2);
}

export async function importConfig(
  jsonString: string,
  availableModels: GridfinityModel[]
): Promise<{
  config: Omit<GridfinityConfig, "modelPlacements">;
  models: GridfinityModel[];
}> {
  const config = JSON.parse(jsonString) as GridfinityConfig;
  
  // Map model placements back to full model objects
  const models = config.modelPlacements.map(placement => {
    const baseModel = availableModels.find(m => m.id === placement.modelId);
    if (!baseModel) {
      console.warn(`Model ${placement.modelId} not found, skipping`);
      return null;
    }
    
    return {
      ...baseModel,
      instanceId: placement.instanceId,
      position: new THREE.Vector3(
        placement.position.x,
        placement.position.y,
        placement.position.z
      ),
      gridPosition: placement.gridPosition,
      rotation: placement.rotation ?? 0,
    };
  }).filter((model): model is NonNullable<typeof model> => model !== null);

  return {
    config: {
      dimensions: config.dimensions,
      measurementUnit: config.measurementUnit,
      materialSettings: config.materialSettings,
    },
    models: models as GridfinityModel[],
  };
}

// URL sharing utilities
export function encodeConfigToURL({
  dimensions,
  measurementUnit,
  materialSettings,
  selectedModels,
}: {
  dimensions: GridfinityConfig["dimensions"];
  measurementUnit: GridfinityConfig["measurementUnit"];
  materialSettings: GridfinityConfig["materialSettings"];
  selectedModels: GridfinityModel[];
}): string {
  const configJson = exportConfig({
    dimensions,
    measurementUnit,
    materialSettings,
    selectedModels,
  });
  
  // Compress the JSON string for shorter URLs
  const compressed = btoa(encodeURIComponent(configJson));
  
  const url = new URL(window.location.href);
  url.searchParams.set('config', compressed);
  
  return url.toString();
}

export function decodeConfigFromURL(): string | null {
  if (typeof window === 'undefined') return null;
  
  const url = new URL(window.location.href);
  const compressed = url.searchParams.get('config');
  
  if (!compressed) return null;
  
  try {
    const configJson = decodeURIComponent(atob(compressed));
    // Validate that it's valid JSON before returning
    JSON.parse(configJson);
    return configJson;
  } catch (error) {
    console.warn('Failed to decode config from URL:', error);
    return null;
  }
}
