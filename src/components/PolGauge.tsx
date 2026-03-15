interface PolGaugeProps {
  value: number;
  size?: number;
  confidence?: number;
}

export default function PolGauge({ value, size = 240, confidence }: PolGaugeProps) {
  const minVal = 10;
  const maxVal = 25;
  const clampedValue = Math.max(minVal, Math.min(maxVal, value));
  const percentage = (clampedValue - minVal) / (maxVal - minVal);

  // Arc geometry - semi-circle arc from left to right (180 degrees), centered in viewport
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 35;

  // Angles in radians: start at PI (left), end at 0 (right)
  const startAngle = Math.PI; // 180 degrees - left side
  const endAngle = 0; // 0 degrees - right side
  const totalArc = Math.PI; // 180 degrees (semi-circle)

  // Quality zone boundaries as fractions of arc (10 → 14 → 18 → 25)
  const redEnd = (14 - minVal) / (maxVal - minVal);
  const yellowEnd = (18 - minVal) / (maxVal - minVal);
  const redAngle = startAngle - totalArc * redEnd;
  const yellowAngle = startAngle - totalArc * yellowEnd;

  const polarToCartesian = (angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy - r * Math.sin(angle),
  });

  const arcPath = (start: number, end: number) => {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArc = Math.abs(start - end) > Math.PI ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  // Needle position - sweep from start (left) to end (right) as value increases
  const needleAngle = startAngle - totalArc * percentage;
  const needleLength = r - 12;
  const needleTip = {
    x: cx + needleLength * Math.cos(needleAngle),
    y: cy - needleLength * Math.sin(needleAngle),
  };

  // Determine color
  const color =
    clampedValue >= 18
      ? 'hsl(142, 71%, 45%)'
      : clampedValue >= 14
      ? 'hsl(38, 92%, 50%)'
      : 'hsl(0, 84%, 60%)';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
        {/* Static three-zone arc (10 → 14 → 18 → 25) — behind the needle */}
        <path
          d={arcPath(startAngle, redAngle)}
          stroke="hsl(0, 84%, 60%)"
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={arcPath(redAngle, yellowAngle)}
          stroke="hsl(38, 92%, 50%)"
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={arcPath(yellowAngle, endAngle)}
          stroke="hsl(142, 71%, 45%)"
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
        />

        {/* Needle only - rotates based on value */}
        <line
          x1={cx}
          y1={cy}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={6} fill={color} />

        {/* Labels at arc endpoints */}
        <text x={polarToCartesian(startAngle).x - 12} y={polarToCartesian(startAngle).y + 5} fill="hsl(215, 25%, 65%)" fontSize="11" fontFamily="Roboto Mono" textAnchor="middle">10</text>
        <text x={polarToCartesian(endAngle).x + 12} y={polarToCartesian(endAngle).y + 5} fill="hsl(215, 25%, 65%)" fontSize="11" fontFamily="Roboto Mono" textAnchor="middle">25</text>
      </svg>

      {/* Digital readout */}
      <div className="flex flex-col items-center -mt-2 space-y-4">
        <div className="flex flex-col items-center">
          <span className="font-mono text-5xl font-bold" style={{ color }}>
            {value.toFixed(1)}
          </span>
          <span className="text-sm font-medium text-muted-foreground mt-1">Pol %</span>
        </div>

        {/* Prediction Confidence */}
        {confidence !== undefined && (
          <div className="w-full px-2 pt-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confidence</span>
              <span className="font-mono text-xs font-bold text-foreground">- {(confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${confidence * 100}%`,
                  backgroundColor: confidence >= 0.9 ? 'hsl(142, 71%, 45%)' : confidence >= 0.75 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 84%, 60%)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
