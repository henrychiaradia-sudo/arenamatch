import type { Metadata } from 'next';
import { AudiencePage } from '@/components/marketing/audience-page';

export const metadata: Metadata = { title: 'Para gestores de projetos' };

export default function ParaGestoresPage() {
  return (
    <AudiencePage
      eyebrow="Para gestores de projetos"
      title="Conecte seu projeto esportivo a patrocinadores"
      description="Cadastre projetos, vincule atletas, informe metas de captação e encontre empresas dispostas a apoiar."
      benefits={[
        { title: 'Cadastro completo de projetos', description: 'Objetivos, cronograma, abrangência, público beneficiado e documentos.' },
        { title: 'Metas de captação', description: 'Informe valor total, valor captado e prazos com barra de progresso.' },
        { title: 'Vínculo de atletas', description: 'Associe atletas ao projeto para fortalecer a proposta.' },
        { title: 'Descoberta por empresas', description: 'Apareça para empresas com interesse na sua modalidade e região.' },
        { title: 'Gestão de interessados', description: 'Receba e organize as manifestações de interesse.' },
        { title: 'Verificação de projeto', description: 'Envie documentação e conquiste o selo de verificado.' },
      ]}
      ctaLabel="Cadastrar projeto"
    />
  );
}
