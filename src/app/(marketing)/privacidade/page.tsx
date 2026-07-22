import type { Metadata } from 'next';
import { PageIntro } from '@/components/marketing/page-intro';
import { appConfig } from '@/config/app';

export const metadata: Metadata = { title: 'Política de privacidade' };

export default function PrivacidadePage() {
  return (
    <>
      <PageIntro
        eyebrow="Legal"
        title="Política de privacidade"
        description="Versão 1.0 — documento demonstrativo."
      />
      <section className="container max-w-3xl space-y-4 py-16 text-sm text-muted-foreground">
        <p>
          Esta é uma versão demonstrativa da Política de Privacidade do {appConfig.name}. O objetivo é
          ilustrar o compromisso com a proteção de dados pessoais, em linha com a LGPD.
        </p>
        <p>
          Coletamos apenas os dados necessários para o funcionamento da plataforma. Campos são
          classificados como públicos (exibidos no perfil) ou privados (visíveis apenas ao titular e a
          administradores autorizados). Documentos são armazenados de forma privada e acessados por
          links temporários assinados.
        </p>
        <p>
          O titular pode solicitar a exclusão da conta e, futuramente, a exportação dos seus dados.
          Registramos o aceite dos termos e da política, com data e versão.
        </p>
        <p className="rounded-md border border-warning/40 bg-warning/10 p-4 text-foreground">
          Aviso: este texto é demonstrativo e deve ser revisado por profissionais especializados
          antes de qualquer uso em produção.
        </p>
      </section>
    </>
  );
}
