import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { PageIntro } from '@/components/marketing/page-intro';
import { Card, CardContent } from '@/components/ui/card';
import { appConfig } from '@/config/app';

export const metadata: Metadata = { title: 'Contato' };

export default function ContatoPage() {
  return (
    <>
      <PageIntro
        eyebrow="Contato"
        title="Fale com a gente"
        description="Tem dúvidas, sugestões ou quer saber mais? Entre em contato."
      />
      <section className="container max-w-xl py-16">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">E-mail</p>
              <a href={`mailto:${appConfig.contactEmail}`} className="font-medium text-primary hover:underline">
                {appConfig.contactEmail}
              </a>
            </div>
          </CardContent>
        </Card>
        <p className="mt-4 text-xs text-muted-foreground">
          Canal demonstrativo. Um formulário de contato completo faz parte das próximas fases.
        </p>
      </section>
    </>
  );
}
