import { scoreLabel } from '@/lib/performance/engine';

/** Anel circular do Sponsor Performance Score (0–100). Puro SVG. */
export function ScoreRing({ score, size = 128 }: { score: number; size?: number }) {
  const { label, tone } = scoreLabel(score);
  const stroke = 11;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const color = tone === 'good' ? '#16a34a' : tone === 'ok' ? '#2563eb' : '#d97706';

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
          opacity={0.35}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold leading-none">{score}</span>
        <span className="mt-1 text-[11px] font-medium" style={{ color }}>
          {label}
        </span>
      </div>
    </div>
  );
}
