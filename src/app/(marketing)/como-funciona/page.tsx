import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, Sparkles, Handshake, ClipboardCheck } from 'lucide-react';
import { PageIntro } from '@/components/marketing/page-intro';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Como funciona' };

const steps = [
  {
    icon: Search,
    title: '1. Descubra',
    description:
      'Crie seu perfil e busque atletas, projetos e oportunidades com filtros por modalidade, região, faixa de investimento e objetivos.',
  },
  {
    icon: Sparkles,
    title: '2. Conecte com match',
    description:
      'Um score de compatibilidade de 0 a 100 aproxima os perfis mais alinhados, mostrando os motivos do match.',
  },
  {
    icon: Handshake,
    title: '3. Negocie',
    description:
      'Demonstre interesse, converse com as partes conectadas e avance a negociação em um pipeline organizado.',
  },
  {
    icon: ClipboardCheck,
    title: '4. Gerencie contrapartidas',
    description:
      'Acompanhe as contrapartidas acordadas, prazos e evidências, com aprovação da empresa.',
  },
];

export default function ComoFuncionaPage() {
  return (
    <>
      <PageIntro
        eyebrow="Como funciona"
        title="Do descobrir ao gerenciar, em um só lugar"
        description="Um fluxo simples que conecta marcas, atletas e projetos com base em compatibilidade real."
      />
      <section className="container py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((s) => (
            <Card key={s.title}>
              <CardHeader>
                <div className="mb-2 grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <CardTitle>{s.title}</CardTitle>
                <CardDescription>{s.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Button asChild size="lg">
            <Link href="/cadastro">Criar conta gratuita</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
