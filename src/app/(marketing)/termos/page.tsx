import type { Metadata } from 'next';
import { PageIntro } from '@/components/marketing/page-intro';
import { appConfig } from '@/config/app';

export const metadata: Metadata = { title: 'Termos de uso' };

export default function TermosPage() {
  return (
    <>
      <PageIntro eyebrow="Legal" title="Termos de uso" description="Versão 1.0 — documento demonstrativo." />
      <section className="container max-w-3xl space-y-4 py-16 text-sm text-muted-foreground">
        <p>
          Este documento é uma versão demonstrativa dos Termos de Uso do {appConfig.name}, criada
          para fins de MVP. Ele não constitui aconselhamento jurídico.
        </p>
        <p>
          Ao utilizar a plataforma, o usuário concorda em fornecer informações verdadeiras, respeitar
          os demais usuários e utilizar os recursos de forma ética. A plataforma conecta partes
          interessadas em patrocínio esportivo e não é parte nas negociações realizadas entre elas.
        </p>
        <p>
          As informações e documentos cadastrados podem depender de validação. O {appConfig.name} não
          garante resultados de captação nem realiza, nesta versão, movimentação financeira,
          emissão fiscal ou prestação de contas.
        </p>
        <p className="rounded-md border border-warning/40 bg-warning/10 p-4 text-foreground">
          Aviso: este texto deve ser revisado por profissionais especializados antes de qualquer uso
          em produção. Nenhuma conformidade jurídica é garantida automaticamente.
        </p>
      </section>
    </>
  );
}
