// Mock data generators for CaneSense AI Dashboard
// All data structured to match future API endpoints:
// GET /api/live-data, GET /api/trends, GET /api/suppliers, GET /api/alerts, GET /api/health

export interface BatchReading {
  batch_id: number;
  timestamp: string;
  supplier_id: string;
  pol_percent: number;
  quality_grade: 'A' | 'B' | 'C';
  alert_flag: boolean;
  system_status: 'OK' | 'DEGRADED' | 'FAULT';
  nir_mean: number;
  nir_std: number;
  confidence: number;
  inference_ms: number;
}

export interface SensorHealth {
  poll_timestamp: string;
  rgb_camera_ok: boolean;
  webcam_ok: boolean;
  nir_camera_ok: boolean;
  ir_sensor_ok: boolean;
  led_on: boolean;
  environmental_ok: boolean;
  edge_device_ok: boolean;
  ai_model_ok: boolean;
  rpi_cpu_temp_c: number;
  rpi_disk_free_gb: number;
  last_inference_ms: number;
  system_status: 'OK' | 'DEGRADED' | 'FAULT';
}

export interface Alert {
  alert_id: number;
  alert_timestamp: string;
  alert_type: 'LOW_POL' | 'GRADE_C' | 'SENSOR_FAULT' | 'INFERENCE_TIMEOUT' | 'NO_READING' | 'QUALITY_TREND_DROP';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  batch_id: number | null;
  acknowledged: boolean;
  ack_timestamp: string | null;
}

export interface Report {
  id: number;
  type: 'Shift Report' | 'Daily Operations Report' | 'Supplier Quality Report' | 'Alert Summary Report';
  generated_at: string;
  period: string;
  status: 'Ready' | 'Generating';
  file_name: string;
}

const SUPPLIERS = ['SUPP-001', 'SUPP-002', 'SUPP-003', 'SUPP-004', 'SUPP-005', 'SUPP-006', 'SUPP-007', 'SUPP-008'];

function getGrade(pol: number): 'A' | 'B' | 'C' {
  if (pol >= 18) return 'A';
  if (pol >= 14) return 'B';
  return 'C';
}

function randomPol(): number {
  // Weighted towards normal range 15-22
  const base = 15 + Math.random() * 7;
  const noise = (Math.random() - 0.5) * 6;
  return Math.max(0, Math.min(25, +(base + noise).toFixed(1)));
}

function randomTimestamp(hoursAgo: number): string {
  const d = new Date(Date.now() - hoursAgo * 3600000 - Math.random() * 3600000);
  return d.toISOString();
}

export function generateLiveReading(batchId: number): BatchReading {
  const pol = randomPol();
  const grade = getGrade(pol);
  return {
    batch_id: batchId,
    timestamp: new Date().toISOString(),
    supplier_id: SUPPLIERS[Math.floor(Math.random() * SUPPLIERS.length)],
    pol_percent: pol,
    quality_grade: grade,
    alert_flag: grade === 'C',
    system_status: 'OK',
    nir_mean: 0.45 + Math.random() * 0.3,
    nir_std: 0.02 + Math.random() * 0.05,
    confidence: 0.85 + Math.random() * 0.14,
    inference_ms: 80 + Math.floor(Math.random() * 120),
  };
}

export function generateHistoricalReadings(count: number, hoursSpan: number = 24): BatchReading[] {
  const readings: BatchReading[] = [];
  for (let i = 0; i < count; i++) {
    const pol = randomPol();
    const grade = getGrade(pol);
    const hoursAgo = (i / count) * hoursSpan;
    readings.push({
      batch_id: 1000 + count - i,
      timestamp: randomTimestamp(hoursAgo),
      supplier_id: SUPPLIERS[Math.floor(Math.random() * SUPPLIERS.length)],
      pol_percent: pol,
      quality_grade: grade,
      alert_flag: grade === 'C',
      system_status: 'OK',
      nir_mean: 0.45 + Math.random() * 0.3,
      nir_std: 0.02 + Math.random() * 0.05,
      confidence: 0.85 + Math.random() * 0.14,
      inference_ms: 80 + Math.floor(Math.random() * 120),
    });
  }
  return readings.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function generateSensorHealth(): SensorHealth {
  return {
    poll_timestamp: new Date().toISOString(),
    rgb_camera_ok: Math.random() > 0.05,
    webcam_ok: Math.random() > 0.05,
    nir_camera_ok: Math.random() > 0.05,
    ir_sensor_ok: Math.random() > 0.03,
    led_on: Math.random() > 0.02,
    environmental_ok: Math.random() > 0.05,
    edge_device_ok: Math.random() > 0.05,
    ai_model_ok: Math.random() > 0.05,
    rpi_cpu_temp_c: +(55 + Math.random() * 35).toFixed(1),
    rpi_disk_free_gb: +(10 + Math.random() * 50).toFixed(1),
    last_inference_ms: 80 + Math.floor(Math.random() * 120),
    system_status: 'OK',
  };
}

export function generateAlerts(count: number): Alert[] {
  const types: Alert['alert_type'][] = ['LOW_POL', 'GRADE_C', 'SENSOR_FAULT', 'INFERENCE_TIMEOUT', 'NO_READING', 'QUALITY_TREND_DROP'];
  const severities: Record<string, Alert['severity']> = {
    LOW_POL: 'WARNING',
    GRADE_C: 'CRITICAL',
    SENSOR_FAULT: 'CRITICAL',
    INFERENCE_TIMEOUT: 'WARNING',
    NO_READING: 'INFO',
    QUALITY_TREND_DROP: 'WARNING',
  };
  const messages: Record<string, string> = {
    LOW_POL: 'Pol % 12.3 below threshold 14.0',
    GRADE_C: 'Grade C detected — batch quality below acceptable',
    SENSOR_FAULT: 'NIR camera not responding',
    INFERENCE_TIMEOUT: 'Inference latency exceeded 3000ms',
    NO_READING: 'No reading received for 30+ seconds',
    QUALITY_TREND_DROP: 'Quality Trend Drop Detected – Average Pol % decreasing rapidly',
  };

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      alert_id: 5000 + count - i,
      alert_timestamp: randomTimestamp(i * 0.5),
      alert_type: type,
      severity: severities[type],
      message: messages[type],
      batch_id: Math.random() > 0.3 ? 1000 + i : null,
      acknowledged: Math.random() > 0.6,
      ack_timestamp: null,
    };
  }).sort((a, b) => new Date(b.alert_timestamp).getTime() - new Date(a.alert_timestamp).getTime());
}

export function generateReports(): Report[] {
  return [
    { id: 1, type: 'Shift Report', generated_at: '2025-06-01T14:00:00Z', period: 'Shift A — Jun 1, 2025', status: 'Ready', file_name: 'shift_report_20250601_A.pdf' },
    { id: 2, type: 'Daily Operations Report', generated_at: '2025-06-01T00:00:00Z', period: 'Jun 1, 2025', status: 'Ready', file_name: 'daily_ops_20250601.pdf' },
    { id: 3, type: 'Supplier Quality Report', generated_at: '2025-05-31T18:00:00Z', period: 'May 25–31, 2025', status: 'Ready', file_name: 'supplier_quality_may25_31.csv' },
    { id: 4, type: 'Alert Summary Report', generated_at: '2025-06-01T06:00:00Z', period: 'Shift A — Jun 1, 2025', status: 'Ready', file_name: 'alert_summary_20250601_A.pdf' },
    { id: 5, type: 'Shift Report', generated_at: '2025-05-31T22:00:00Z', period: 'Shift C — May 31, 2025', status: 'Ready', file_name: 'shift_report_20250531_C.pdf' },
  ];
}

// API endpoint mapping for future backend integration
export const API_ENDPOINTS = {
  liveData: '/api/live-data',
  trends: '/api/trends',
  suppliers: '/api/suppliers',
  alerts: '/api/alerts',
  health: '/api/health',
  generateShiftReport: '/generate-shift-report',
  generateDailyReport: '/generate-daily-report',
  generateSupplierReport: '/generate-supplier-report',
  generateAlertSummary: '/generate-alert-summary',
} as const;

export function getSupplierAnalytics(readings: BatchReading[]) {
  const map = new Map<string, { batches: number; totalPol: number; grades: { A: number; B: number; C: number } }>();
  readings.forEach(r => {
    if (!map.has(r.supplier_id)) {
      map.set(r.supplier_id, { batches: 0, totalPol: 0, grades: { A: 0, B: 0, C: 0 } });
    }
    const s = map.get(r.supplier_id)!;
    s.batches++;
    s.totalPol += r.pol_percent;
    s.grades[r.quality_grade]++;
  });
  return Array.from(map.entries()).map(([id, data]) => ({
    supplier_id: id,
    batches: data.batches,
    avg_pol: +(data.totalPol / data.batches).toFixed(1),
    grades: data.grades,
  }));
}

export interface BatchParameters {
  color: string;
  nodeLength: string;
  caneLength: string;
  moisture: string;
  temperature: string;
}

/** Generate realistic sugarcane ML parameters based on quality grade (for batch details dialog). */
export function generateBatchParameters(grade: string): BatchParameters {
  const g = grade.toUpperCase() as 'A' | 'B' | 'C';
  if (g === 'A') {
    return {
      color: 'Bright Green',
      nodeLength: `${+(5.5 + Math.random() * 1).toFixed(1)} cm`,
      caneLength: `${+(2.4 + Math.random() * 0.4).toFixed(1)} m`,
      moisture: `${Math.floor(68 + Math.random() * 8)}%`,
      temperature: `${Math.floor(27 + Math.random() * 4)}°C`,
    };
  }
  if (g === 'B') {
    return {
      color: 'Light Green',
      nodeLength: `${+(4.5 + Math.random() * 1).toFixed(1)} cm`,
      caneLength: `${+(2.0 + Math.random() * 0.4).toFixed(1)} m`,
      moisture: `${Math.floor(60 + Math.random() * 8)}%`,
      temperature: `${Math.floor(28 + Math.random() * 5)}°C`,
    };
  }
  return {
    color: 'Yellowish Green',
    nodeLength: `${+(3.5 + Math.random() * 1).toFixed(1)} cm`,
    caneLength: `${+(1.6 + Math.random() * 0.4).toFixed(1)} m`,
    moisture: `${Math.floor(50 + Math.random() * 10)}%`,
    temperature: `${Math.floor(30 + Math.random() * 6)}°C`,
  };
}

/** Full set of 26 model input parameters + target (for View Details dialog). */
export interface FullBatchParameters {
  nirReflectance: string;
  redEdgeReflectance: string;
  greenReflectance: string;
  blueReflectance: string;
  thermalEmissivity: string;
  moistureIndex: string;
  rChannelMean: string;
  gChannelMean: string;
  bChannelMean: string;
  hue: string;
  saturation: string;
  defectScore: string;
  rotPresence: string;
  maturityGrade: string;
  nodeLength: string;
  caneLength: string;
  ambientTemperature: string;
  relativeHumidity: string;
  ambientLight: string;
  timeSinceHarvest: string;
  seasonMonth: string;
  conveyorSpeed: string;
  batchWeight: string;
  caneVariety: string;
  supplierId: string;
  fieldZone: string;
  polPercent: string;
}

/** Generate all 26 model parameters + polPercent based on batch reading (once per click). */
export function generateFullBatchParameters(reading: BatchReading): FullBatchParameters {
  const grade = reading.quality_grade;
  const pol = reading.pol_percent;
  const supplier = reading.supplier_id;

  const r = () => Math.random();
  const range = (min: number, max: number, decimals = 1) => +(min + r() * (max - min)).toFixed(decimals);
  const int = (min: number, max: number) => Math.floor(min + r() * (max - min + 1));

  // Grade-based ranges for multispectral / vision (higher grade = better values)
  const nirRange = grade === 'A' ? [0.42, 0.58] : grade === 'B' ? [0.35, 0.48] : [0.28, 0.42];
  const moistureIdx = grade === 'A' ? [0.68, 0.78] : grade === 'B' ? [0.58, 0.70] : [0.48, 0.62];
  const nodeLen = grade === 'A' ? [5.5, 6.5] : grade === 'B' ? [4.5, 5.5] : [3.5, 4.5];
  const caneLen = grade === 'A' ? [2.4, 2.8] : grade === 'B' ? [2.0, 2.4] : [1.6, 2.0];
  const defect = grade === 'A' ? [0, 0.15] : grade === 'B' ? [0.1, 0.35] : [0.25, 0.55];
  const rot = grade === 'A' ? [0, 0.05] : grade === 'B' ? [0.02, 0.12] : [0.08, 0.25];

  const month = int(1, 12);
  const seasonMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1];
  const varieties = ['Co 86032', 'Co 0238', 'Co 99004', 'Co 06022', 'Co 09022', 'Co 15023', 'Co 1148', 'Co 85019'];
  const zones = ['North', 'South', 'East', 'West', 'Central'];

  return {
    nirReflectance: String(range(nirRange[0], nirRange[1], 3)),
    redEdgeReflectance: String(range(0.35, 0.55, 3)),
    greenReflectance: String(range(0.40, 0.62, 3)),
    blueReflectance: String(range(0.28, 0.48, 3)),
    thermalEmissivity: String(range(0.88, 0.98, 3)),
    moistureIndex: String(range(moistureIdx[0], moistureIdx[1], 3)),
    rChannelMean: String(int(80, 220)),
    gChannelMean: String(int(100, 240)),
    bChannelMean: String(int(60, 180)),
    hue: String(range(90, 150, 1)),
    saturation: String(range(0.25, 0.65, 2)),
    defectScore: String(range(defect[0], defect[1], 2)),
    rotPresence: String(range(rot[0], rot[1], 2)),
    maturityGrade: grade === 'A' ? 'Mature' : grade === 'B' ? 'Mid' : 'Early',
    nodeLength: `${range(nodeLen[0], nodeLen[1])} cm`,
    caneLength: `${range(caneLen[0], caneLen[1])} m`,
    ambientTemperature: `${int(26, 34)} °C`,
    relativeHumidity: String(int(55, 85)),
    ambientLight: `${range(200, 800, 0)} lux`,
    timeSinceHarvest: `${int(2, 48)} h`,
    seasonMonth,
    conveyorSpeed: `${range(0.3, 1.2, 2)} m/s`,
    batchWeight: `${range(800, 2200, 0)} kg`,
    caneVariety: varieties[int(0, varieties.length - 1)],
    supplierId: supplier,
    fieldZone: zones[int(0, zones.length - 1)],
    polPercent: `${pol.toFixed(1)}%`,
  };
}
