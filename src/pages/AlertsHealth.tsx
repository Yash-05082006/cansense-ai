import { useState, useMemo } from 'react';
import { generateAlerts, generateSensorHealth, type Alert } from '@/lib/mockData';
import SensorHealthPanel from '@/components/SensorHealthPanel';
import { AlertTriangle, Info, AlertOctagon, Check } from 'lucide-react';

const severityConfig = {
  INFO: { icon: Info, colorClass: 'text-info-color', bgClass: 'bg-info-color/10', borderClass: 'border-info-color/20' },
  WARNING: { icon: AlertTriangle, colorClass: 'text-warning-color', bgClass: 'bg-warning-color/10', borderClass: 'border-warning-color/20' },
  CRITICAL: { icon: AlertOctagon, colorClass: 'text-critical-color', bgClass: 'bg-critical-color/10', borderClass: 'border-critical-color/20' },
};

export default function AlertsHealth() {
  const [alerts, setAlerts] = useState<Alert[]>(() => generateAlerts(20));
  const health = useMemo(() => generateSensorHealth(), []);
  const [filter, setFilter] = useState<'ALL' | Alert['severity']>('ALL');

  const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.severity === filter);

  const handleAcknowledge = (id: number) => {
    setAlerts(prev =>
      prev.map(a => a.alert_id === id ? { ...a, acknowledged: true, ack_timestamp: new Date().toISOString() } : a)
    );
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Alerts & System Health</h1>

      <div className="grid grid-cols-12 gap-4">
        {/* Sensor Health */}
        <div className="col-span-12 lg:col-span-4 rounded-xl border border-border bg-card p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sensor Health</span>
          <div className="mt-4">
            <SensorHealthPanel health={health} />
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Disk Free</span>
              <span className="font-mono font-semibold text-foreground">{health.rpi_disk_free_gb} GB</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">System Status</span>
              <span className={`font-mono font-bold ${health.system_status === 'OK' ? 'text-grade-a' : health.system_status === 'DEGRADED' ? 'text-grade-b' : 'text-grade-c'}`}>
                {health.system_status}
              </span>
            </div>
          </div>
        </div>

        {/* Alert Feed */}
        <div className="col-span-12 lg:col-span-8 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alert Feed</span>
            <div className="flex gap-1">
              {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                    filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filtered.map(alert => {
              const config = severityConfig[alert.severity];
              const Icon = config.icon;
              return (
                <div
                  key={alert.alert_id}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    alert.acknowledged ? 'border-border/50 opacity-50' : `${config.bgClass} ${config.borderClass}`
                  }`}
                >
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${config.colorClass}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${config.colorClass}`}>{alert.severity}</span>
                      <span className="text-xs font-mono text-muted-foreground">{alert.alert_type}</span>
                    </div>
                    <p className="text-sm text-foreground mt-0.5">{alert.message}</p>
                    <span className="text-xs font-mono text-muted-foreground">{formatTime(alert.alert_timestamp)}</span>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(alert.alert_id)}
                      className="shrink-0 flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Check className="h-3 w-3" /> ACK
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
