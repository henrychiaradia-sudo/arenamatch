/**
 * Configuração central da marca e da aplicação.
 * O nome do produto é intencionalmente configurável (env NEXT_PUBLIC_APP_NAME)
 * para permitir troca de marca / white-label no futuro sem tocar no código.
 */
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? 'ArenaMatch',
  tagline: 'Conectando marcas, atletas e projetos que transformam o esporte.',
  description:
    'Plataforma de descoberta, conexão, negociação e gestão de oportunidades de patrocínio esportivo. ' +
    'Conecta atletas de alto rendimento, projetos esportivos e empresas — em patrocínio direto ou incentivado.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',

  // Localização (preparado para i18n futuro)
  locale: 'pt-BR',
  currency: 'BRL',
  timezone: 'America/Sao_Paulo',

  // Contato institucional (demonstração)
  contactEmail: 'contato@arenamatch.com.br',

  // Redes sociais (placeholder)
  links: {
    instagram: '#',
    linkedin: '#',
    youtube: '#',
  },
} as const;

export type AppConfig = typeof appConfig;
