import type { Metadata } from 'next';
import { PageIntro } from '@/components/marketing/page-intro';
import { appConfig } from '@/config/app';

export const metadata: Metadata = { title: 'Sobre' };

export default function SobrePage() {
  return (
    <>
      <PageIntro eyebrow="Sobre" title={`O que é o ${appConfig.name}`} />
      <section className="container max-w-3xl space-y-4 py-16 text-muted-foreground">
        <p>
          O {appConfig.name} é uma plataforma de descoberta, conexão, negociação e gestão de
          oportunidades de patrocínio esportivo. Conectamos atletas de alto rendimento, projetos
          esportivos e empresas interessadas em investir no esporte — tanto por patrocínio direto
          quanto por meio de projetos aprovados em mecanismos de incentivo.
        </p>
        <p>
          Nosso objetivo é reduzir o atrito entre quem busca e quem oferece patrocínio, com uma
          experiência profissional, transparente e orientada por compatibilidade real entre os
          perfis.
        </p>
        <p className="text-sm">
          Este é um ambiente demonstrativo (MVP). Dados, números e depoimentos exibidos são
          fictícios e servem apenas para ilustrar o funcionamento da plataforma.
        </p>
      </section>
    </>
  );
}
