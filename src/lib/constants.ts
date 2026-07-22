/**
 * Dados de referência estáticos usados na UI e nos formulários.
 * As modalidades e categorias também existem no banco (tabelas `sports` /
 * `sport_categories`) — esta lista serve para seeds e filtros no cliente.
 */

export interface SportOption {
  slug: string;
  label: string;
  paralympic?: boolean;
}

export const SPORTS: SportOption[] = [
  { slug: 'atletismo', label: 'Atletismo' },
  { slug: 'natacao', label: 'Natação' },
  { slug: 'judo', label: 'Judô' },
  { slug: 'ciclismo', label: 'Ciclismo' },
  { slug: 'ginastica', label: 'Ginástica' },
  { slug: 'volei', label: 'Vôlei' },
  { slug: 'surfe', label: 'Surfe' },
  { slug: 'skate', label: 'Skate' },
  { slug: 'triatlo', label: 'Triatlo' },
  { slug: 'basquete', label: 'Basquete' },
  { slug: 'futebol', label: 'Futebol' },
  { slug: 'tenis', label: 'Tênis' },
  { slug: 'paratletismo', label: 'Paratletismo', paralympic: true },
  { slug: 'paranatacao', label: 'Paranatação', paralympic: true },
  { slug: 'basquete-cadeira', label: 'Basquete em cadeira de rodas', paralympic: true },
];

/** Categorias esportivas (nível competitivo). */
export const ATHLETE_CATEGORIES = [
  { slug: 'base', label: 'Atleta de base' },
  { slug: 'amador', label: 'Amador' },
  { slug: 'profissional', label: 'Profissional' },
  { slug: 'olimpico', label: 'Olímpico' },
  { slug: 'paralimpico', label: 'Paralímpico' },
] as const;

/** Tipos de contrapartida oferecidas por atletas. */
export const BENEFIT_TYPES = [
  { slug: 'social-post', label: 'Publicações em redes sociais' },
  { slug: 'campaign', label: 'Participação em campanhas' },
  { slug: 'image-rights', label: 'Uso de imagem' },
  { slug: 'events', label: 'Presença em eventos' },
  { slug: 'talks', label: 'Palestras' },
  { slug: 'behind-scenes', label: 'Conteúdo de bastidores' },
  { slug: 'uniform-brand', label: 'Aplicação de marca em uniforme' },
  { slug: 'internal-actions', label: 'Ações internas com colaboradores' },
  { slug: 'clinics', label: 'Clínicas esportivas' },
  { slug: 'exclusive-content', label: 'Produção de conteúdo exclusivo' },
] as const;

/** Portes de empresa. */
export const COMPANY_SIZES = [
  { slug: 'mei', label: 'MEI' },
  { slug: 'small', label: 'Pequena' },
  { slug: 'medium', label: 'Média' },
  { slug: 'large', label: 'Grande' },
  { slug: 'enterprise', label: 'Corporação' },
] as const;

/** Unidades federativas do Brasil. */
export const BRAZIL_STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
] as const;

export type BrazilStateUF = (typeof BRAZIL_STATES)[number]['uf'];

/** Segmentos de empresa (exemplos). */
export const COMPANY_SEGMENTS = [
  'Alimentos e bebidas',
  'Suplementos e nutrição',
  'Moda e vestuário esportivo',
  'Tecnologia',
  'Serviços financeiros',
  'Saúde e bem-estar',
  'Varejo',
  'Educação',
  'Energia',
  'Automotivo',
  'Telecomunicações',
  'Outro',
] as const;
