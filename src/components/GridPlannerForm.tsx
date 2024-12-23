"use client";

import { useAtom } from "jotai";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { formDimensionsAtom, measurementUnitAtom } from "~/atoms/form";
import { Switch } from "~/components/ui/switch";
import { X } from "lucide-react";
import { materialSettingsAtom } from "~/atoms/grid";
import { selectedModelsAtom, availableModelsAtom } from "~/atoms/models";
import { exportConfig, importConfig } from "~/lib/config";
import { Button } from "~/components/ui/button";
import { Download, Upload } from "lucide-react";
import { Separator } from "~/components/ui/separator";

const MM_PER_INCH = 25.4;

export default function GridPlannerForm() {
  const [dimensions, setDimensions] = useAtom(formDimensionsAtom);
  const [unit, setUnit] = useAtom(measurementUnitAtom);
  const [materialSettings] = useAtom(materialSettingsAtom);
  const [selectedModels, setSelectedModels] = useAtom(selectedModelsAtom);
  const [availableModels] = useAtom(availableModelsAtom);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const convertToDisplay = (value: number) => {
    return unit === "inches" ? Number((value / MM_PER_INCH).toFixed(3)) : value;
  };

  const convertToMM = (value: number) => {
    return unit === "inches" ? value * MM_PER_INCH : value;
  };

  const handleExport = () => {
    const config = exportConfig({
      dimensions,
      measurementUnit: unit,
      materialSettings,
      selectedModels,
    });

    const blob = new Blob([config], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gridfinity-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const { config, models } = await importConfig(text, availableModels);

      setDimensions(config.dimensions);
      setUnit(config.measurementUnit);
      setSelectedModels(models);

      e.target.value = "";
    } catch (error) {
      console.error("Error importing configuration:", error);
      alert("Failed to import configuration. Please check the file format.");
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Base Dimensions</h2>
        <div className="flex items-center gap-2">
          <span
            className={unit === "mm" ? "font-medium" : "text-muted-foreground"}
          >
            mm
          </span>
          <Switch
            className="text-sm"
            checked={unit === "inches"}
            onCheckedChange={(checked) => setUnit(checked ? "inches" : "mm")}
          />
          <span
            className={
              unit === "inches" ? "font-medium" : "text-muted-foreground"
            }
          >
            inches
          </span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="width">Width ({unit})</Label>
            <Input
              id="width"
              type="number"
              step={unit === "inches" ? "0.001" : "1"}
              value={convertToDisplay(dimensions.width)}
              onChange={(e) =>
                setDimensions({
                  ...dimensions,
                  width: convertToMM(Number(e.target.value)),
                })
              }
              className="mt-1"
              required
            />
            <p className="text-xs text-gray-500">Base width in {unit}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Depth ({unit})</Label>
            <Input
              id="height"
              type="number"
              step={unit === "inches" ? "0.001" : "1"}
              value={convertToDisplay(dimensions.height)}
              onChange={(e) =>
                setDimensions({
                  ...dimensions,
                  height: convertToMM(Number(e.target.value)),
                })
              }
              className="mt-1"
              required
            />
            <p className="text-xs text-gray-500">Base depth in {unit}</p>
          </div>
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium">
            Maximum printable grid size (1-10)
          </span>
          <div className="my-0 flex items-start justify-start gap-2">
            <div>
              <Input
                id="maxGridX"
                type="number"
                min={1}
                max={10}
                value={dimensions.maxGridX}
                onChange={(e) =>
                  setDimensions({
                    ...dimensions,
                    maxGridX: Number(e.target.value),
                  })
                }
                className="mt-0 w-20"
                required
              />
            </div>
            <div className="flex h-[38px] items-center justify-center text-center">
              <X className="h-4 w-4" />
            </div>
            <div>
              {/* <Label htmlFor="maxGridY">&nbsp;</Label> */}
              <Input
                id="maxGridY"
                type="number"
                min={1}
                max={10}
                value={dimensions.maxGridY}
                onChange={(e) =>
                  setDimensions({
                    ...dimensions,
                    maxGridY: Number(e.target.value),
                  })
                }
                className="w-20"
                required
              />
            </div>
          </div>
        </div>
      </form>
      <Separator className="my-4" />
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Config
        </Button>
        <label className="cursor-pointer">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => document.getElementById("config-import")?.click()}
          >
            <Upload className="h-4 w-4" />
            Import Config
          </Button>
          <input
            id="config-import"
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </label>
      </div>
    </div>
  );
}
