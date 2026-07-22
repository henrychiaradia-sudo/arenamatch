'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { completeOnboarding } from '@/features/profile/actions';
import { cn } from '@/lib/utils';

export interface WizardStep {
  title: string;
  node: React.ReactNode;
}

export function OnboardingWizard({ steps }: { steps: WizardStep[] }) {
  const router = useRouter();
  const [current, setCurrent] = React.useState(0);
  const [finishing, setFinishing] = React.useState(false);

  const isLast = current === steps.length - 1;
  const progress = Math.round(((current + 1) / steps.length) * 100);

  async function finish() {
    setFinishing(true);
    const res = await completeOnboarding();
    setFinishing(false);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Onboarding concluído! 🎉');
    router.push('/painel');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Etapa {current + 1} de {steps.length} — {steps[current]!.title}
          </span>
          <button
            type="button"
            onClick={() => router.push('/painel')}
            className="text-muted-foreground hover:text-foreground"
          >
            Continuar depois
          </button>
        </div>
        <Progress value={progress} />
        <div className="flex flex-wrap gap-2">
          {steps.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setCurrent(i)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs',
                i === current
                  ? 'border-primary bg-primary/10 text-primary'
                  : i < current
                    ? 'border-success/40 bg-success/10 text-success'
                    : 'text-muted-foreground',
              )}
            >
              {i < current ? <Check className="h-3 w-3" /> : null}
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Dica: salve cada etapa (botão dentro do bloco) antes de avançar.
      </p>

      <div>{steps[current]!.node}</div>

      <div className="flex items-center justify-between border-t pt-4">
        <Button
          variant="outline"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        {isLast ? (
          <Button onClick={finish} disabled={finishing}>
            {finishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Concluir onboarding
          </Button>
        ) : (
          <Button onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))}>
            Próximo <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
