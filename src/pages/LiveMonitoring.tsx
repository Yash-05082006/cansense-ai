import { useState, useEffect, useRef } from 'react';
import PolGauge from '@/components/PolGauge';
import GradeBadge from '@/components/GradeBadge';
import SensorHealthPanel from '@/components/SensorHealthPanel';
import { generateLiveReading, generateSensorHealth, generateBatchParameters, generateFullBatchParameters, type BatchReading, type BatchParameters, type FullBatchParameters, type SensorHealth } from '@/lib/mockData';
import { AlertTriangle, Info, Check, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Future: replace with fetch from API_ENDPOINTS.liveData
export default function LiveMonitoring() {
  const batchCounter = useRef(1000);
  const [current, setCurrent] = useState<BatchReading>(generateLiveReading(batchCounter.current));
  const [health, setHealth] = useState<SensorHealth>(generateSensorHealth());
  const [history, setHistory] = useState<BatchReading[]>(() => {
    const h: BatchReading[] = [];
    for (let i = 0; i < 10; i++) {
      h.push(generateLiveReading(batchCounter.current - 10 + i));
    }
    return h;
  });
  const [selectedBatch, setSelectedBatch] = useState<BatchReading | null>(null);
  const [selectedBatchParams, setSelectedBatchParams] = useState<BatchParameters | null>(null);
  const [selectedBatchDetails, setSelectedBatchDetails] = useState<BatchReading | null>(null);
  const [selectedBatchFullParams, setSelectedBatchFullParams] = useState<FullBatchParameters | null>(null);

  const handleBatchInfo = (reading: BatchReading) => {
    setSelectedBatch(reading);
    setSelectedBatchParams(generateBatchParameters(reading.quality_grade));
  };

  const handleViewDetails = (reading: BatchReading) => {
    setSelectedBatchDetails(reading);
    setSelectedBatchFullParams(generateFullBatchParameters(reading));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      batchCounter.current++;
      const reading = generateLiveReading(batchCounter.current);
      setCurrent(reading);
      setHistory(prev => [...prev.slice(-9), reading]);
    }, 2000);

    const healthInterval = setInterval(() => {
      setHealth(generateSensorHealth());
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(healthInterval);
    };
  }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Live Monitoring</h1>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-grade-a animate-pulse-glow" />
              <span className="text-sm font-medium text-muted-foreground">Live — 2s refresh</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">Last updated: {formatTime(current.timestamp)}</span>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {current.alert_flag && (
        <div className="flex items-center gap-3 rounded-lg bg-grade-c/15 border border-grade-c/30 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-grade-c" />
          <span className="text-sm font-semibold text-grade-c">
            ALERT: Low quality detected — Pol {current.pol_percent}% (Grade {current.quality_grade})
          </span>
        </div>
      )}

      {/* Main Bento Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Pol Gauge — dominates top left */}
        <div className="col-span-12 lg:col-span-5 rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center">
          <PolGauge value={current.pol_percent} size={260} confidence={current.confidence} />
        </div>

        {/* Quality Grade + Supplier/Batch — top right */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 space-y-4">
          {/* Quality Grade */}
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Quality Grade</span>
            <GradeBadge grade={current.quality_grade} size="lg" />
          </div>

          {/* Supplier + Batch */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Supplier</span>
              <p className="mt-1 font-mono text-lg font-bold text-foreground">{current.supplier_id}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Batch #</span>
              <p className="mt-1 font-mono text-lg font-bold text-foreground">{current.batch_id}</p>
            </div>
          </div>
        </div>

        {/* Sensor Health — top far right */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 rounded-xl border border-border bg-card p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sensor Health</span>
          <div className="mt-4">
            <SensorHealthPanel health={health} />
          </div>
        </div>

        {/* Last 10 Readings Table — bottom */}
        <div className="col-span-12 rounded-xl border border-border bg-card p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Readings</span>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 px-4 font-semibold text-muted-foreground w-28">Time</th>
                  <th className="pb-2 px-4 font-semibold text-muted-foreground w-32">Supplier</th>
                  <th className="pb-2 px-4 font-semibold text-muted-foreground text-right w-24">Pol %</th>
                  <th className="pb-2 px-6 font-semibold text-muted-foreground text-center w-28">Grade</th>
                  <th className="pb-2 px-4 font-semibold text-muted-foreground text-right w-28">Confidence</th>
                  <th className="pb-2 px-4 font-semibold text-muted-foreground text-right w-24">Latency</th>
                  <th className="pb-2 px-4 font-semibold text-muted-foreground w-28">Detailed Info</th>
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((r) => (
                  <tr key={r.batch_id} className="border-b border-border/50">
                    <td className="py-2.5 px-4 font-mono text-foreground">{formatTime(r.timestamp)}</td>
                    <td className="py-2.5 px-4 font-mono text-foreground">
                      <div className="flex items-center gap-2">
                        <span>{r.supplier_id}</span>
                        <button
                          type="button"
                          onClick={() => handleBatchInfo(r)}
                          className="rounded p-0.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          aria-label="Batch details"
                        >
                          <Info size={16} />
                        </button>
                      </div>
                    </td>
                    <td className={`py-2.5 px-4 font-mono font-semibold text-right ${
                      r.quality_grade === 'A' ? 'text-grade-a' : r.quality_grade === 'B' ? 'text-grade-b' : 'text-grade-c'
                    }`}>
                      {r.pol_percent.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-6 text-center">
                      <div className="flex justify-center">
                        <GradeBadge grade={r.quality_grade} size="sm" />
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-right text-muted-foreground">{(r.confidence * 100).toFixed(0)}%</td>
                    <td className="py-2.5 px-4 font-mono text-right text-muted-foreground">{r.inference_ms}ms</td>
                    <td className="py-2.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(r)}
                        className="text-sm text-primary hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Batch details dialog */}
      <Dialog
        open={!!selectedBatch}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBatch(null);
            setSelectedBatchParams(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Batch Analysis Details</DialogTitle>
          </DialogHeader>
          {selectedBatch && (
            <div className="space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono">
                <span className="text-muted-foreground">Supplier:</span>
                <span className="font-semibold text-foreground">{selectedBatch.supplier_id}</span>
                <span className="text-muted-foreground">Batch:</span>
                <span className="font-semibold text-foreground">{selectedBatch.batch_id}</span>
                <span className="text-muted-foreground">Pol %:</span>
                <span className={`font-semibold ${selectedBatch.quality_grade === 'A' ? 'text-grade-a' : selectedBatch.quality_grade === 'B' ? 'text-grade-b' : 'text-grade-c'}`}>
                  {selectedBatch.pol_percent.toFixed(1)}
                </span>
                <span className="text-muted-foreground">Grade:</span>
                <div>
                  <GradeBadge grade={selectedBatch.quality_grade} size="sm" />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Parameters Used for Prediction
                </h4>
                <ul className="space-y-1.5 font-mono text-foreground">
                  {selectedBatchParams && (
                    <>
                      <li>Color: {selectedBatchParams.color}</li>
                      <li>Node Length: {selectedBatchParams.nodeLength}</li>
                      <li>Cane Length: {selectedBatchParams.caneLength}</li>
                      <li>Moisture: {selectedBatchParams.moisture}</li>
                      <li>Temperature: {selectedBatchParams.temperature}</li>
                    </>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Feature Impact on Prediction
                </h4>
                <ul className="space-y-1.5">
                  {selectedBatch.quality_grade === 'A' && (
                    <>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-grade-a shrink-0" /> Moisture: Optimal</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-grade-a shrink-0" /> Color: Healthy sucrose profile</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-grade-a shrink-0" /> Node Length: Ideal node spacing</li>
                    </>
                  )}
                  {selectedBatch.quality_grade === 'B' && (
                    <>
                      <li className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-grade-b shrink-0" /> Moisture: Within range</li>
                      <li className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-grade-b shrink-0" /> Color: Acceptable profile</li>
                      <li className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-grade-b shrink-0" /> Node Length: Moderate spacing</li>
                    </>
                  )}
                  {selectedBatch.quality_grade === 'C' && (
                    <>
                      <li className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-grade-c shrink-0" /> Moisture: Below optimal</li>
                      <li className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-grade-c shrink-0" /> Color: Suboptimal profile</li>
                      <li className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-grade-c shrink-0" /> Node Length: Tight spacing</li>
                    </>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Top Features Affecting Prediction
                </h4>
                <div className="space-y-2">
                  {[
                    { label: 'Moisture', pct: 35 },
                    { label: 'Color', pct: 28 },
                    { label: 'Node Length', pct: 20 },
                    { label: 'Temperature', pct: 10 },
                    { label: 'Cane Length', pct: 7 },
                  ].map(({ label, pct }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="w-28 text-foreground">{label}</span>
                      <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
                        <div
                          className="h-2 rounded bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-muted-foreground w-8">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full 26 parameters dialog (View Details) */}
      <Dialog
        open={!!selectedBatchDetails}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBatchDetails(null);
            setSelectedBatchFullParams(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Model Input Parameters</DialogTitle>
          </DialogHeader>
          {selectedBatchDetails && selectedBatchFullParams && (
            <div className="space-y-5 text-sm">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Multispectral Camera
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono">
                  <div className="flex justify-between"><span className="text-muted-foreground">nirReflectance</span><span>{selectedBatchFullParams.nirReflectance}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">redEdgeReflectance</span><span>{selectedBatchFullParams.redEdgeReflectance}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">greenReflectance</span><span>{selectedBatchFullParams.greenReflectance}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">blueReflectance</span><span>{selectedBatchFullParams.blueReflectance}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">thermalEmissivity</span><span>{selectedBatchFullParams.thermalEmissivity}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">moistureIndex</span><span>{selectedBatchFullParams.moistureIndex}</span></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  RGB Vision Analysis
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono">
                  <div className="flex justify-between"><span className="text-muted-foreground">rChannelMean</span><span>{selectedBatchFullParams.rChannelMean}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">gChannelMean</span><span>{selectedBatchFullParams.gChannelMean}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">bChannelMean</span><span>{selectedBatchFullParams.bChannelMean}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">hue</span><span>{selectedBatchFullParams.hue}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">saturation</span><span>{selectedBatchFullParams.saturation}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">defectScore</span><span>{selectedBatchFullParams.defectScore}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">rotPresence</span><span>{selectedBatchFullParams.rotPresence}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">maturityGrade</span><span>{selectedBatchFullParams.maturityGrade}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">nodeLength</span><span>{selectedBatchFullParams.nodeLength}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">caneLength</span><span>{selectedBatchFullParams.caneLength}</span></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Environmental Sensors
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono">
                  <div className="flex justify-between"><span className="text-muted-foreground">ambientTemperature</span><span>{selectedBatchFullParams.ambientTemperature}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">relativeHumidity</span><span>{selectedBatchFullParams.relativeHumidity}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">ambientLight</span><span>{selectedBatchFullParams.ambientLight}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">timeSinceHarvest</span><span>{selectedBatchFullParams.timeSinceHarvest}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">seasonMonth</span><span>{selectedBatchFullParams.seasonMonth}</span></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Process Signals
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono">
                  <div className="flex justify-between"><span className="text-muted-foreground">conveyorSpeed</span><span>{selectedBatchFullParams.conveyorSpeed}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">batchWeight</span><span>{selectedBatchFullParams.batchWeight}</span></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Metadata
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono">
                  <div className="flex justify-between"><span className="text-muted-foreground">caneVariety</span><span>{selectedBatchFullParams.caneVariety}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">supplierId</span><span>{selectedBatchFullParams.supplierId}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">fieldZone</span><span>{selectedBatchFullParams.fieldZone}</span></div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Prediction Output
                </h4>
                <div className="font-mono">
                  <div className="flex justify-between"><span className="text-muted-foreground">polPercent</span><span className="font-semibold text-primary">{selectedBatchFullParams.polPercent}</span></div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
