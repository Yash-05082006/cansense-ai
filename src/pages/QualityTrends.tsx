import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, PieChart, Pie, Cell,
} from 'recharts';
import { generateHistoricalReadings, type BatchReading } from '@/lib/mockData';

const TIME_WINDOWS = [
  { label: '1H', hours: 1, count: 30 },
  { label: '8H', hours: 8, count: 120 },
  { label: '24H', hours: 24, count: 300 },
];

const GRADE_COLORS: Record<string, string> = {
  A: 'hsl(142, 71%, 45%)',
  B: 'hsl(38, 92%, 50%)',
  C: 'hsl(0, 84%, 60%)',
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontFamily="Roboto Mono" fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function QualityTrends() {
  const [windowIdx, setWindowIdx] = useState(0);
  const tw = TIME_WINDOWS[windowIdx];

  const data = useMemo(() => generateHistoricalReadings(tw.count, tw.hours), [tw]);

  const avg = useMemo(() => +(data.reduce((s, d) => s + d.pol_percent, 0) / data.length).toFixed(1), [data]);
  const min = useMemo(() => Math.min(...data.map(d => d.pol_percent)), [data]);
  const max = useMemo(() => Math.max(...data.map(d => d.pol_percent)), [data]);

  // Grade distribution
  const gradeDist = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0 };
    data.forEach(d => counts[d.quality_grade]++);
    return [
      { grade: 'A', count: counts.A, color: GRADE_COLORS.A },
      { grade: 'B', count: counts.B, color: GRADE_COLORS.B },
      { grade: 'C', count: counts.C, color: GRADE_COLORS.C },
    ];
  }, [data]);

  // Heatmap: quality by hour
  const heatmapData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, avg: 0, count: 0, total: 0 }));
    data.forEach(d => {
      const h = new Date(d.timestamp).getHours();
      hours[h].total += d.pol_percent;
      hours[h].count++;
    });
    hours.forEach(h => { h.avg = h.count > 0 ? +(h.total / h.count).toFixed(1) : 0; });
    return hours;
  }, [data]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getHeatColor = (val: number) => {
    if (val === 0) return 'hsl(217, 33%, 17%)';
    if (val >= 18) return 'hsl(142, 71%, 45%)';
    if (val >= 14) return 'hsl(38, 92%, 50%)';
    return 'hsl(0, 84%, 60%)';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Quality Trends</h1>
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {TIME_WINDOWS.map((tw2, i) => (
            <button
              key={tw2.label}
              onClick={() => setWindowIdx(i)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                i === windowIdx ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tw2.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Running Average', value: `${avg}%`, cls: 'text-foreground' },
          { label: 'Minimum Pol %', value: `${min.toFixed(1)}%`, cls: min < 14 ? 'text-grade-c' : 'text-grade-b' },
          { label: 'Maximum Pol %', value: `${max.toFixed(1)}%`, cls: max >= 18 ? 'text-grade-a' : 'text-foreground' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</span>
            <p className={`mt-1 font-mono text-2xl font-bold ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pol % Line Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pol % Over Time</span>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 24%)" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                stroke="hsl(215, 25%, 65%)"
                fontSize={11}
                fontFamily="Roboto Mono"
              />
              <YAxis domain={[0, 25]} stroke="hsl(215, 25%, 65%)" fontSize={11} fontFamily="Roboto Mono" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(217, 33%, 17%)',
                  border: '1px solid hsl(217, 33%, 24%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'Roboto Mono',
                  color: 'white',
                }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'white' }}
                labelFormatter={formatTime}
              />
              <ReferenceLine y={18} stroke="hsl(142, 71%, 45%)" strokeDasharray="4 4" strokeOpacity={0.7} />
              <ReferenceLine y={14} stroke="hsl(0, 84%, 60%)" strokeDasharray="4 4" strokeOpacity={0.7} />
              <ReferenceLine y={avg} stroke="hsl(215, 25%, 65%)" strokeDasharray="6 3" label={{ value: `Avg ${avg}`, fill: 'hsl(215, 25%, 65%)', fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="pol_percent"
                stroke="hsl(142, 71%, 45%)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6" style={{ background: 'hsl(142, 71%, 45%)', borderTop: '2px dashed hsl(142, 71%, 45%)' }} />
            <span>High Quality Threshold (18%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6" style={{ background: 'hsl(0, 84%, 60%)', borderTop: '2px dashed hsl(0, 84%, 60%)' }} />
            <span>Low Quality Threshold (14%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 bg-muted-foreground" style={{ borderTop: '2px dashed hsl(215, 25%, 65%)' }} />
            <span>Average ({avg}%)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Grade Distribution — Donut Chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grade Distribution</span>
          <div className="mt-4 h-56 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDist}
                  dataKey="count"
                  nameKey="grade"
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={3}
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {gradeDist.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(217, 33%, 17%)',
                    border: '1px solid hsl(217, 33%, 24%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'white',
                  }}
                  itemStyle={{ color: 'white' }}
                  labelStyle={{ color: 'white' }}
                  formatter={(value: number, name: string) => [`${value} batches`, `Grade ${name}`]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">TOTAL</span>
              <span className="font-mono text-xl font-bold text-foreground">{gradeDist.reduce((sum, g) => sum + g.count, 0)} Batches</span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            {gradeDist.map(g => (
              <div key={g.grade} className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: g.color }} />
                <span>Grade {g.grade}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <div className="rounded-xl border border-border bg-card p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quality by Hour of Day</span>
          <div className="mt-4 grid grid-cols-12 gap-1">
            {heatmapData.map(h => (
              <div
                key={h.hour}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="h-8 w-full rounded-sm"
                  style={{ backgroundColor: getHeatColor(h.avg), opacity: h.count > 0 ? 0.8 : 0.2 }}
                  title={`${h.hour}:00 — Avg: ${h.avg}%`}
                />
                <span className="text-[9px] font-mono text-muted-foreground">{h.hour}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-sm bg-grade-c" /> {'< 14%'}</div>
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-sm bg-grade-b" /> 14–18%</div>
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-sm bg-grade-a" /> {'≥ 18%'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
