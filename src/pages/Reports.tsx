import { useState } from 'react';
import { generateReports, API_ENDPOINTS, type Report } from '@/lib/mockData';
import { FileText, Download, Loader2 } from 'lucide-react';

const REPORT_TYPES = [
  { label: 'Shift Report', endpoint: API_ENDPOINTS.generateShiftReport },
  { label: 'Daily Operations Report', endpoint: API_ENDPOINTS.generateDailyReport },
  { label: 'Supplier Quality Report', endpoint: API_ENDPOINTS.generateSupplierReport },
  { label: 'Alert Summary Report', endpoint: API_ENDPOINTS.generateAlertSummary },
] as const;

export default function Reports() {
  const [reports] = useState<Report[]>(generateReports);
  const [generating, setGenerating] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('pdf');

  const handleGenerate = async (type: string, endpoint: string) => {
    setGenerating(type);
    // Future: POST to endpoint with { format: exportFormat }
    // const response = await fetch(endpoint, { method: 'POST', body: JSON.stringify({ format: exportFormat }) });
    console.log(`[Reports] Would POST to ${endpoint} with format=${exportFormat}`);
    setTimeout(() => setGenerating(null), 2000);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Reports</h1>

      {/* Generate Reports */}
      <div className="rounded-xl border border-border bg-card p-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Generate Report</span>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {REPORT_TYPES.map(({ label, endpoint }) => (
            <button
              key={label}
              onClick={() => handleGenerate(label, endpoint)}
              disabled={generating === label}
              className="flex items-center gap-3 rounded-lg border border-border bg-accent/50 p-4 text-left hover:bg-accent transition-colors disabled:opacity-50"
            >
              {generating === label ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              ) : (
                <FileText className="h-5 w-5 text-primary" />
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">
                  {generating === label ? 'Generating...' : `Click to generate (${exportFormat.toUpperCase()})`}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Export Format */}
      <div className="rounded-xl border border-border bg-card p-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Export Format</span>
        <div className="mt-3 flex gap-3">
          <button
            onClick={() => setExportFormat('csv')}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              exportFormat === 'csv' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:bg-accent'
            }`}
          >
            <Download className="h-4 w-4" /> CSV
          </button>
          <button
            onClick={() => setExportFormat('pdf')}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              exportFormat === 'pdf' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:bg-accent'
            }`}
          >
            <Download className="h-4 w-4" /> PDF
          </button>
        </div>
      </div>

      {/* Report History */}
      <div className="rounded-xl border border-border bg-card p-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Report History</span>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 font-semibold text-muted-foreground">Type</th>
                <th className="pb-2 font-semibold text-muted-foreground">Period</th>
                <th className="pb-2 font-semibold text-muted-foreground">Generated</th>
                <th className="pb-2 font-semibold text-muted-foreground">File</th>
                <th className="pb-2 font-semibold text-muted-foreground text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} className="border-b border-border/50">
                  <td className="py-2.5 font-medium text-foreground">{r.type}</td>
                  <td className="py-2.5 text-muted-foreground">{r.period}</td>
                  <td className="py-2.5 font-mono text-xs text-muted-foreground">{formatDate(r.generated_at)}</td>
                  <td className="py-2.5 font-mono text-xs text-foreground">{r.file_name}</td>
                  <td className="py-2.5 text-right">
                    <button className="flex items-center gap-1 ml-auto rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                      <Download className="h-3 w-3" /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
