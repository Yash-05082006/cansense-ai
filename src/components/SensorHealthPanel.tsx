import { Circle } from 'lucide-react';
import type { SensorHealth } from '@/lib/mockData';

interface SensorHealthPanelProps {
  health: SensorHealth;
}

function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Circle
        className={`h-3 w-3 ${ok ? 'fill-grade-a text-grade-a' : 'fill-grade-c text-grade-c animate-pulse-glow'}`}
      />
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  );
}

export default function SensorHealthPanel({ health }: SensorHealthPanelProps) {
  const tempColor =
    health.rpi_cpu_temp_c > 85
      ? 'text-grade-c'
      : health.rpi_cpu_temp_c >= 75
      ? 'text-grade-b'
      : 'text-foreground';

  return (
    <div className="space-y-4">
      {/* Sensors Section */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sensors</span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <StatusDot ok={health.rgb_camera_ok} label="RGB Camera" />
          <StatusDot ok={health.webcam_ok} label="Webcam" />
          <StatusDot ok={health.ir_sensor_ok} label="IR Trigger" />
          <StatusDot ok={health.led_on} label="LED System" />
          <StatusDot ok={health.nir_camera_ok} label="NIR Camera" />
          <StatusDot ok={health.environmental_ok} label="Environmental" />
        </div>
      </div>

      {/* System Section */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System</span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <StatusDot ok={health.edge_device_ok} label="Edge Device" />
          <StatusDot ok={health.ai_model_ok} label="AI Model" />
        </div>
      </div>

      {/* Stats */}
      <div className="pt-2 border-t border-border grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">CPU Temp:</span>
          <span className={`font-mono text-sm font-semibold ${tempColor}`}>
            {health.rpi_cpu_temp_c}°C
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Inference:</span>
          <span className="font-mono text-sm font-semibold text-foreground">{health.last_inference_ms}ms</span>
        </div>
      </div>
    </div>
  );
}
