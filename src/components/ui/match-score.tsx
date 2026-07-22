import { cn } from '@/lib/utils';
import { matchTier } from '@/lib/matching/engine';

interface MatchScoreProps {
  score: number;
  showLabel?: boolean;
  className?: string;
}

const tierStyles: Record<ReturnType<typeof matchTier>, string> = {
  alto: 'bg-success/15 text-success ring-success/30',
  medio: 'bg-warning/15 text-warning ring-warning/30',
  baixo: 'bg-muted text-muted-foreground ring-border',
};

/** Selo de compatibilidade (0–100) com faixa de cor. */
export function MatchScore({ score, showLabel = true, className }: MatchScoreProps) {
  const tier = matchTier(score);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        tierStyles[tier],
        className,
      )}
      title={`Compatibilidade de ${score}%`}
    >
      {score}%{showLabel ? <span className="font-normal opacity-80">match</span> : null}
    </span>
  );
}
