import { useState } from "react";
import PolGauge from "@/components/PolGauge";
import GradeBadge from "@/components/GradeBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

type ColorOption = "Bright Green" | "Green" | "Yellowish Green" | "Yellow" | "Dry Brown";

interface PredictorInputs {
  color: ColorOption;
  hueIndex: number;          // 0–1
  defectScore: number;       // 0–1
  nodeLength: number;        // cm
  caneLength: number;        // m
  caneDiameter: number;      // cm
  moisture: number;          // %
  brix: number;              // %
  temperature: number;       // °C
  humidity: number;          // %
  ambientLight: number;      // lux
  nirReflectance: number;    // 0–1
  redEdgeIndex: number;      // 0–1
  conveyorSpeed: number;     // m/s
  caneAge: number;           // months
}

interface PredictionResult {
  pol: number;
  grade: "A" | "B" | "C";
  confidence: number; // 0–1
}

const defaultInputs: PredictorInputs = {
  color: "Green",
  hueIndex: 0.5,
  defectScore: 0.2,
  nodeLength: 5.5,
  caneLength: 2.3,
  caneDiameter: 3.2,
  moisture: 70,
  brix: 18,
  temperature: 27,
  humidity: 65,
  ambientLight: 350,
  nirReflectance: 0.65,
  redEdgeIndex: 0.58,
  conveyorSpeed: 0.8,
  caneAge: 12,
};

function predictPol(params: PredictorInputs): number {
  let base = 18;

  // Moisture & chemistry
  const moistureFactor = params.moisture * 0.02;
  const brixFactor = params.brix * 0.25;

  // Physical structure
  const nodeFactor = params.nodeLength * 0.08;
  const diameterFactor = params.caneDiameter * 0.1;

  // Spectral features
  const nirFactor = params.nirReflectance * 3;
  const redEdgeFactor = params.redEdgeIndex * 2;

  // Environmental effects
  const tempFactor = (30 - params.temperature) * 0.04;
  const humidityFactor = params.humidity * 0.01;

  // Defects penalize quality
  const defectPenalty = params.defectScore * -2;

  // Color heuristic (vision / appearance)
  let colorBonus = 0;
  switch (params.color) {
    case "Bright Green":
      colorBonus = 1.2;
      break;
    case "Green":
      colorBonus = 0.8;
      break;
    case "Yellowish Green":
      colorBonus = 0.2;
      break;
    case "Yellow":
      colorBonus = -0.6;
      break;
    case "Dry Brown":
      colorBonus = -1.2;
      break;
  }

  let pol =
    base +
    moistureFactor +
    brixFactor +
    nodeFactor +
    diameterFactor +
    nirFactor +
    redEdgeFactor +
    tempFactor +
    humidityFactor +
    defectPenalty +
    colorBonus;

  // Clamp to sensible range 10–25
  pol = Math.max(10, Math.min(25, pol));
  return pol;
}

function mapGrade(pol: number): "A" | "B" | "C" {
  if (pol >= 18) return "A";
  if (pol >= 14) return "B";
  return "C";
}

function mockConfidence(grade: "A" | "B" | "C"): number {
  // 0.85 – 0.96
  const base =
    grade === "A" ? 0.9 :
    grade === "B" ? 0.88 :
    0.86;
  const jitter = (Math.random() - 0.5) * 0.04;
  const value = Math.max(0.85, Math.min(0.96, base + jitter));
  return value;
}

export default function CaneQualityPredictor() {
  const [inputs, setInputs] = useState<PredictorInputs>(defaultInputs);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const handlePredict = () => {
    const pol = predictPol(inputs);
    const grade = mapGrade(pol);
    const confidence = mockConfidence(grade);
    setPrediction({ pol, grade, confidence });
  };

  const polValue = prediction?.pol ?? 18;
  const gradeValue = prediction?.grade ?? "B";
  const confidencePct = prediction ? Math.round(prediction.confidence * 100) : 90;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cane Quality Predictor</h1>
        <p className="text-sm text-muted-foreground">
          Simulate cane quality predictions using the CaneSense AI model with manual input parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>Adjust cane properties and run a what-if prediction.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Section 1 — Vision / Appearance */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Vision / Appearance
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Select
                    value={inputs.color}
                    onValueChange={(value) =>
                      setInputs((prev) => ({ ...prev, color: value as ColorOption }))
                    }
                  >
                    <SelectTrigger id="color">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bright Green">Bright Green</SelectItem>
                      <SelectItem value="Green">Green</SelectItem>
                      <SelectItem value="Yellowish Green">Yellowish Green</SelectItem>
                      <SelectItem value="Yellow">Yellow</SelectItem>
                      <SelectItem value="Dry Brown">Dry Brown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Hue Index</Label>
                    <span className="text-xs font-mono text-muted-foreground">
                      {inputs.hueIndex.toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    value={[inputs.hueIndex]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={([value]) =>
                      setInputs((prev) => ({ ...prev, hueIndex: value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Surface Defect Score</Label>
                  <span className="text-xs font-mono text-muted-foreground">
                    {inputs.defectScore.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[inputs.defectScore]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([value]) =>
                    setInputs((prev) => ({ ...prev, defectScore: value }))
                  }
                />
              </div>
            </div>

            {/* Section 2 — Physical Cane Structure */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Physical Structure
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nodeLength">Node Length (cm)</Label>
                  <Input
                    id="nodeLength"
                    type="number"
                    value={inputs.nodeLength}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        nodeLength: Number(e.target.value),
                      }))
                    }
                    min={3}
                    max={8}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caneLength">Cane Length (m)</Label>
                  <Input
                    id="caneLength"
                    type="number"
                    value={inputs.caneLength}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        caneLength: Number(e.target.value),
                      }))
                    }
                    min={1.5}
                    max={3}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caneDiameter">Cane Diameter (cm)</Label>
                  <Input
                    id="caneDiameter"
                    type="number"
                    value={inputs.caneDiameter}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        caneDiameter: Number(e.target.value),
                      }))
                    }
                    min={2}
                    max={5}
                    step={0.1}
                  />
                </div>
              </div>
            </div>

            {/* Section 3 — Moisture & Chemistry */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Moisture & Chemistry
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="moisture">Moisture (%)</Label>
                  <Input
                    id="moisture"
                    type="number"
                    value={inputs.moisture}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        moisture: Number(e.target.value),
                      }))
                    }
                    min={40}
                    max={85}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brix">Brix Estimate (%)</Label>
                  <Input
                    id="brix"
                    type="number"
                    value={inputs.brix}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        brix: Number(e.target.value),
                      }))
                    }
                    min={10}
                    max={25}
                    step={0.5}
                  />
                </div>
              </div>
            </div>

            {/* Section 4 — Environmental Conditions */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Environmental
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    value={inputs.temperature}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        temperature: Number(e.target.value),
                      }))
                    }
                    min={20}
                    max={40}
                    step={0.5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="humidity">Humidity (%)</Label>
                  <Input
                    id="humidity"
                    type="number"
                    value={inputs.humidity}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        humidity: Number(e.target.value),
                      }))
                    }
                    min={30}
                    max={95}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ambientLight">Ambient Light (lux)</Label>
                  <Input
                    id="ambientLight"
                    type="number"
                    value={inputs.ambientLight}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        ambientLight: Number(e.target.value),
                      }))
                    }
                    min={100}
                    max={1000}
                    step={10}
                  />
                </div>
              </div>
            </div>

            {/* Section 5 — Spectral Imaging */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Spectral Features
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>NIR Reflectance</Label>
                    <span className="text-xs font-mono text-muted-foreground">
                      {inputs.nirReflectance.toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    value={[inputs.nirReflectance]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={([value]) =>
                      setInputs((prev) => ({ ...prev, nirReflectance: value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Red Edge Index</Label>
                    <span className="text-xs font-mono text-muted-foreground">
                      {inputs.redEdgeIndex.toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    value={[inputs.redEdgeIndex]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={([value]) =>
                      setInputs((prev) => ({ ...prev, redEdgeIndex: value }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Section 6 — Process Context */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Process Context
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="conveyorSpeed">Conveyor Speed (m/s)</Label>
                  <Input
                    id="conveyorSpeed"
                    type="number"
                    value={inputs.conveyorSpeed}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        conveyorSpeed: Number(e.target.value),
                      }))
                    }
                    min={0.2}
                    max={1.5}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caneAge">Cane Age (months)</Label>
                  <Input
                    id="caneAge"
                    type="number"
                    value={inputs.caneAge}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        caneAge: Number(e.target.value),
                      }))
                    }
                    min={6}
                    max={24}
                    step={1}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button type="button" onClick={handlePredict}>
                Predict Quality
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInputs(defaultInputs);
                  setPrediction(null);
                }}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Prediction output */}
        <Card>
          <CardHeader>
            <CardTitle>Prediction Output</CardTitle>
            <CardDescription>
              Mock prediction based on current parameters. Backend integration will replace this logic.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              {/* Optional Pol gauge */}
              <PolGauge value={polValue} size={220} confidence={prediction ? prediction.confidence : 0.9} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Predicted Pol %
                </span>
                <p className="font-mono text-3xl font-bold">
                  {polValue.toFixed(1)}
                </p>
              </div>
              <div className="space-y-1 flex flex-col items-start">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Grade
                </span>
                <GradeBadge grade={gradeValue} size="lg" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Confidence
                </span>
                <span className="font-mono text-xs text-foreground">
                  {confidencePct}%
                </span>
              </div>
              <Progress value={confidencePct} />
            </div>

            {/* Feature importance */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Feature Importance
              </span>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Moisture", pct: 22 },
                  { label: "Brix Estimate", pct: 18 },
                  { label: "Color", pct: 12 },
                  { label: "Node Length", pct: 10 },
                  { label: "NIR Reflectance", pct: 9 },
                  { label: "Red Edge Index", pct: 7 },
                  { label: "Cane Diameter", pct: 5 },
                  { label: "Temperature", pct: 4 },
                  { label: "Humidity", pct: 3 },
                  { label: "Surface Defect Score", pct: 3 },
                  { label: "Cane Length", pct: 2 },
                  { label: "Ambient Light", pct: 2 },
                  { label: "Conveyor Speed", pct: 1 },
                  { label: "Cane Age", pct: 1 },
                  { label: "Hue Index", pct: 1 },
                ].map(({ label, pct }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="w-32 text-muted-foreground">{label}</span>
                    <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
                      <div
                        className="h-2 rounded bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 font-mono text-muted-foreground text-right">
                      {pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

