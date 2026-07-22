import type { Metadata } from 'next';
import { AudiencePage } from '@/components/marketing/audience-page';

export const metadata: Metadata = { title: 'Para empresas' };

export default function ParaEmpresasPage() {
  return (
    <AudiencePage
      eyebrow="Para empresas"
      title="Patrocine com estratégia e mensuração"
      description="Encontre atletas e projetos alinhados à sua marca — em patrocínio direto ou incentivado — e gerencie tudo em um pipeline."
      benefits={[
        { title: 'Busca avançada', description: 'Filtre por modalidade, região, faixa de investimento e objetivos de marca.' },
        { title: 'Match inteligente', description: 'Score de compatibilidade que prioriza os perfis mais aderentes.' },
        { title: 'Oportunidades', description: 'Publique oportunidades e receba candidaturas de atletas e projetos.' },
        { title: 'Pipeline de negociações', description: 'Organize o funil do primeiro contato ao fechamento.' },
        { title: 'Gestão de contrapartidas', description: 'Acompanhe entregas, prazos e evidências com aprovação.' },
        { title: 'Direto ou incentivado', description: 'Trabalhe com recursos próprios de marketing ou projetos incentivados.' },
      ]}
      ctaLabel="Cadastrar empresa"
    />
  );
}
