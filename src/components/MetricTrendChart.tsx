import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type MetricDirection = 'up' | 'down' | 'neutral';

export interface MetricPoint {
  label: string;
  value: number | null | undefined;
}

interface MetricTrendChartProps {
  title: string;
  unit?: string;
  points: MetricPoint[];
  /** Qué dirección representa una mejora: 'up' (más es mejor), 'down' (menos es mejor) o 'neutral'. */
  betterDirection?: MetricDirection;
  /** Cantidad de decimales a mostrar. */
  decimals?: number;
}

const WIDTH = 320;
const HEIGHT = 120;
const PADDING = { top: 12, right: 12, bottom: 24, left: 12 };

const formatValue = (value: number, decimals: number, unit?: string): string => {
  const formatted = Number.isInteger(value) && decimals === 0
    ? value.toLocaleString()
    : value.toFixed(decimals);
  return unit ? `${formatted}${unit}` : formatted;
};

export function MetricTrendChart({
  title,
  unit,
  points,
  betterDirection = 'neutral',
  decimals = 0,
}: MetricTrendChartProps) {
  const valid = points.filter(
    (p): p is { label: string; value: number } =>
      typeof p.value === 'number' && Number.isFinite(p.value)
  );

  if (valid.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
        <p className="text-xs text-gray-400 py-6 text-center">Sin datos disponibles</p>
      </div>
    );
  }

  const values = valid.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const innerW = WIDTH - PADDING.left - PADDING.right;
  const innerH = HEIGHT - PADDING.top - PADDING.bottom;

  const xFor = (i: number) =>
    PADDING.left + (valid.length === 1 ? innerW / 2 : (i / (valid.length - 1)) * innerW);
  const yFor = (v: number) =>
    PADDING.top + innerH - ((v - min) / range) * innerH;

  const linePath = valid
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(p.value).toFixed(1)}`)
    .join(' ');

  const first = valid[0].value;
  const last = valid[valid.length - 1].value;
  const delta = last - first;
  const pctChange = first !== 0 ? (delta / Math.abs(first)) * 100 : 0;

  let improved: boolean | null = null;
  if (betterDirection === 'up') improved = delta > 0 ? true : delta < 0 ? false : null;
  else if (betterDirection === 'down') improved = delta < 0 ? true : delta > 0 ? false : null;

  const deltaColor =
    improved === null ? 'text-gray-500' : improved ? 'text-green-600' : 'text-red-600';
  const DeltaIcon = delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const lineColor =
    improved === null ? '#6b7280' : improved ? '#16a34a' : '#dc2626';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-1">
        <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
        <div className={`flex items-center gap-1 text-xs font-medium ${deltaColor}`}>
          <DeltaIcon className="w-3.5 h-3.5" />
          <span>
            {delta > 0 ? '+' : ''}{formatValue(delta, decimals, unit)}
            {first !== 0 && (
              <span className="ml-1 text-[10px] opacity-80">
                ({pctChange > 0 ? '+' : ''}{pctChange.toFixed(1)}%)
              </span>
            )}
          </span>
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold text-gray-900">{formatValue(last, decimals, unit)}</span>
        <span className="text-xs text-gray-400">actual</span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label={`Tendencia de ${title}`}
      >
        <line
          x1={PADDING.left}
          y1={PADDING.top + innerH}
          x2={WIDTH - PADDING.right}
          y2={PADDING.top + innerH}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2" />
        {valid.map((p, i) => (
          <g key={`${p.label}-${i}`}>
            <circle cx={xFor(i)} cy={yFor(p.value)} r="3" fill={lineColor} />
            <title>{`${p.label}: ${formatValue(p.value, decimals, unit)}`}</title>
            <text
              x={xFor(i)}
              y={HEIGHT - 6}
              textAnchor="middle"
              className="fill-gray-400"
              fontSize="8"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
