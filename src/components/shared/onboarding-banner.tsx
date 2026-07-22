import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function OnboardingBanner({ completed }: { completed: boolean }) {
  if (completed) return null;
  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardContent className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Complete seu cadastro</p>
            <p className="text-sm text-muted-foreground">
              Finalize o onboarding para aproveitar todos os recursos.
            </p>
          </div>
        </div>
        <Button asChild size="sm">
          <Link href="/onboarding">
            Continuar <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
