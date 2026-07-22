import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { PageIntro } from '@/components/marketing/page-intro';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Benefit {
  title: string;
  description: string;
}

export function AudiencePage({
  eyebrow,
  title,
  description,
  benefits,
  ctaLabel = 'Criar conta gratuita',
}: {
  eyebrow: string;
  title: string;
  description: string;
  benefits: Benefit[];
  ctaLabel?: string;
}) {
  return (
    <>
      <PageIntro eyebrow={eyebrow} title={title} description={description} />
      <section className="container py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {benefits.map((b) => (
            <Card key={b.title}>
              <CardContent className="flex gap-4 p-6">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-success" />
                <div>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{b.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Button asChild size="lg">
            <Link href="/cadastro">{ctaLabel}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
