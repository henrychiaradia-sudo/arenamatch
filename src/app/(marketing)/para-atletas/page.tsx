import type { Metadata } from 'next';
import { AudiencePage } from '@/components/marketing/audience-page';

export const metadata: Metadata = { title: 'Para atletas' };

export default function ParaAtletasPage() {
  return (
    <AudiencePage
      eyebrow="Para atletas"
      title="Seu perfil profissional para atrair patrocínio"
      description="Mostre sua trajetória, audiência e contrapartidas — e seja descoberto por marcas e projetos."
      benefits={[
        { title: 'Perfil profissional completo', description: 'Conquistas, calendário, redes sociais e audiência em um só lugar.' },
        { title: 'Contrapartidas claras', description: 'Deixe explícito o que você oferece: posts, eventos, uso de imagem e mais.' },
        { title: 'Descoberta por match', description: 'Apareça para empresas com objetivos compatíveis com o seu perfil.' },
        { title: 'Candidaturas a oportunidades', description: 'Candidate-se a oportunidades abertas por empresas patrocinadoras.' },
        { title: 'Conexões e mensagens', description: 'Converse diretamente com marcas interessadas após a conexão.' },
        { title: 'Selo de verificado', description: 'Ganhe credibilidade com a verificação de documentos e ranking.' },
      ]}
    />
  );
}
