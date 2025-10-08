"use client";

import { useAtom } from "jotai";
import { useEffect } from "react";
import GridPlannerForm from "./GridPlannerForm";
import GridVisualizer from "./GridVisualizer";
import { calculateGridPlacements } from "../lib/gridPlacement";
// import MaterialControls from "./MaterialControls";
import {
  gridDimensionsAtom,
  placedGridsAtom,
  freeSpacesAtom,
  materialSettingsAtom,
} from "~/atoms/grid";
import { formDimensionsAtom, measurementUnitAtom } from "~/atoms/form";
import { selectedModelsAtom, availableModelsAtom } from "~/atoms/models";
import { GridSummary } from "./GridSummary";
import { InfoIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";
import { ModelSelector } from "./ModelSelector";
import { decodeConfigFromURL, importConfig } from "~/lib/config";

export default function GridPlanner() {
  const [, setGridDimensions] = useAtom(gridDimensionsAtom);
  const [placedGrids, setPlacedGrids] = useAtom(placedGridsAtom);
  const [, setFreeSpaces] = useAtom(freeSpacesAtom);
  const [formDimensions, setFormDimensions] = useAtom(formDimensionsAtom);
  const [, setMaterialSettings] = useAtom(materialSettingsAtom);
  const [, setMeasurementUnit] = useAtom(measurementUnitAtom);
  const [, setSelectedModels] = useAtom(selectedModelsAtom);
  const [availableModels] = useAtom(availableModelsAtom);

  // Load config from URL on component mount
  useEffect(() => {
    const loadConfigFromURL = async () => {
      const configJson = decodeConfigFromURL();
      if (!configJson) return;

      try {
        const { config, models } = await importConfig(configJson, availableModels);
        
        setFormDimensions(config.dimensions);
        setMeasurementUnit(config.measurementUnit);
        setMaterialSettings(config.materialSettings);
        setSelectedModels(models);

        // Clean up URL after loading
        const url = new URL(window.location.href);
        url.searchParams.delete('config');
        window.history.replaceState({}, '', url.toString());
      } catch (error) {
        console.error("Error loading config from URL:", error);
      }
    };

    void loadConfigFromURL();
  }, [availableModels, setFormDimensions, setMeasurementUnit, setMaterialSettings, setSelectedModels]);

  useEffect(() => {
    const { width, height, maxGridX, maxGridY } = formDimensions;
    console.log("Form dimensions:", formDimensions);

    setGridDimensions({
      width: width / 1000,
      height: height / 1000,
    });

    const result = calculateGridPlacements(width, height, maxGridX, maxGridY);
    console.log("Calculation result:", result);

    setPlacedGrids(result.placedGrids);
    setFreeSpaces(result.freeSpaces);
  }, [formDimensions, setGridDimensions, setPlacedGrids, setFreeSpaces]);

  return (
    <div className="flex w-full flex-col gap-6 lg:flex-row">
      <div className="w-full lg:w-1/4 lg:max-w-[400px]">
        <GridPlannerForm />
        {placedGrids.length > 0 && (
          <>
            <GridSummary placedGrids={placedGrids} />
          </>
        )}
      </div>
      <div className="w-full select-none lg:w-3/4">
        {placedGrids.length > 0 && (
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex w-full select-none flex-col gap-2">
              <GridVisualizer />
              <Alert>
                <InfoIcon className="h-5 w-5" />
                <AlertTitle>Visualizer Controls</AlertTitle>
                <AlertDescription>
                  Click and drag to rotate. Scroll to zoom. Hold shift while
                  dragging to pan.
                </AlertDescription>
              </Alert>
            </div>
            {/* <div className="w-full lg:w-1/3">
              <MaterialControls />
            </div> */}
            <div className="mt-4 lg:mt-0 rounded-lg border bg-white p-4">
              <h3 className="mb-2 font-medium">STL Models (Work in progress)</h3>
              <ModelSelector />
              <p className="mt-4 text-sm text-gray-600">
                Select a model to preview and place on the grid
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
