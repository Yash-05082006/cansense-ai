import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend,
} from 'recharts';
import { generateHistoricalReadings, getSupplierAnalytics } from '@/lib/mockData';
import GradeBadge from '@/components/GradeBadge';
import { Download, Trophy } from 'lucide-react';

export default function SupplierAnalytics() {
  const [dateRange] = useState('Today');
  const data = useMemo(() => generateHistoricalReadings(200, 24), []);
  const analytics = useMemo(() => getSupplierAnalytics(data), [data]);

  // Top 3 suppliers
  const topSuppliers = useMemo(
    () => [...analytics].sort((a, b) => b.avg_pol - a.avg_pol).slice(0, 3),
    [analytics]
  );

  // Bar chart data
  const barData = useMemo(
    () => analytics.map(s => ({
      supplier: s.supplier_id,
      avg_pol: s.avg_pol,
      color: s.avg_pol >= 18 ? 'hsl(142, 71%, 45%)' : s.avg_pol >= 14 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 84%, 60%)',
    })),
    [analytics]
  );

  // Multi-day comparison (mock 5 days)
  const comparisonData = useMemo(() => {
    return Array.from({ length: 5 }, (_, dayIdx) => {
      const day: Record<string, any> = { day: `Day ${dayIdx + 1}` };
      analytics.forEach(s => {
        day[s.supplier_id] = +(s.avg_pol + (Math.random() - 0.5) * 4).toFixed(1);
      });
      return day;
    });
  }, [analytics]);

  const supplierColors = [
    'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(213, 94%, 68%)',
    'hsl(0, 84%, 60%)', 'hsl(280, 60%, 60%)', 'hsl(180, 60%, 50%)',
    'hsl(60, 70%, 50%)', 'hsl(320, 60%, 55%)',
  ];

  const handleExportCSV = () => {
    const header = 'Supplier,Batches,Avg Pol %,Grade A,Grade B,Grade C\n';
    const rows = analytics.map(s =>
      `${s.supplier_id},${s.batches},${s.avg_pol},${s.grades.A},${s.grades.B},${s.grades.C}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supplier_analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Supplier Analytics</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{dateRange}</span>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Top Performing Suppliers */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-4 w-4 text-grade-a" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top Performing Suppliers</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {topSuppliers.map((s, i) => (
            <div key={s.supplier_id} className="flex items-center gap-3 rounded-lg border border-border bg-accent/30 p-3">
              <span className="font-mono text-lg font-bold text-muted-foreground">{i + 1}.</span>
              <div>
                <p className="font-mono text-sm font-bold text-foreground">{s.supplier_id}</p>
                <p className={`font-mono text-lg font-bold ${s.avg_pol >= 18 ? 'text-grade-a' : 'text-grade-b'}`}>{s.avg_pol}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Average Pol % per Supplier</span>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 24%)" />
              <XAxis dataKey="supplier" stroke="hsl(215, 25%, 65%)" fontSize={10} fontFamily="Roboto Mono" />
              <YAxis domain={[0, 25]} stroke="hsl(215, 25%, 65%)" fontSize={11} fontFamily="Roboto Mono" />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(217, 33%, 17%)', border: '1px solid hsl(217, 33%, 24%)', borderRadius: '8px', fontSize: '12px', fontFamily: 'Roboto Mono', color: 'white' }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'white' }}
              />
              <Bar dataKey="avg_pol" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supplier Table */}
      <div className="rounded-xl border border-border bg-card p-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Supplier Breakdown</span>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 pl-2 font-semibold text-muted-foreground">Supplier</th>
                <th className="pb-2 pr-4 font-semibold text-muted-foreground text-right">Batches</th>
                <th className="pb-2 pr-4 font-semibold text-muted-foreground text-right">Avg Pol %</th>
                <th className="pb-2 px-4 font-semibold text-muted-foreground text-center w-20">Grade A</th>
                <th className="pb-2 px-4 font-semibold text-muted-foreground text-center w-20">Grade B</th>
                <th className="pb-2 px-4 font-semibold text-muted-foreground text-center w-20">Grade C</th>
              </tr>
            </thead>
            <tbody>
              {analytics.map(s => (
                <tr key={s.supplier_id} className="border-b border-border/50">
                  <td className="py-2.5 pl-2 font-mono font-semibold text-foreground">{s.supplier_id}</td>
                  <td className="py-2.5 pr-4 font-mono text-right text-foreground">{s.batches}</td>
                  <td className={`py-2.5 pr-4 font-mono font-semibold text-right ${
                    s.avg_pol >= 18 ? 'text-grade-a' : s.avg_pol >= 14 ? 'text-grade-b' : 'text-grade-c'
                  }`}>
                    {s.avg_pol}%
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono text-grade-a">{s.grades.A}</td>
                  <td className="py-2.5 px-4 text-center font-mono text-grade-b">{s.grades.B}</td>
                  <td className="py-2.5 px-4 text-center font-mono text-grade-c">{s.grades.C}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-day Comparison */}
      <div className="rounded-xl border border-border bg-card p-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Supplier Comparison (Multi-Day)</span>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 24%)" />
              <XAxis dataKey="day" stroke="hsl(215, 25%, 65%)" fontSize={11} />
              <YAxis domain={[0, 25]} stroke="hsl(215, 25%, 65%)" fontSize={11} fontFamily="Roboto Mono" />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(217, 33%, 17%)', border: '1px solid hsl(217, 33%, 24%)', borderRadius: '8px', fontSize: '11px', fontFamily: 'Roboto Mono', color: 'white' }}
                itemStyle={{ color: 'white' }}
                labelStyle={{ color: 'white' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              {analytics.slice(0, 5).map((s, i) => (
                <Line
                  key={s.supplier_id}
                  type="monotone"
                  dataKey={s.supplier_id}
                  stroke={supplierColors[i]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
