import Link from 'next/link';
import {
  ArrowRight,
  Trophy,
  Building2,
  FolderKanban,
  Search,
  Handshake,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { SectionHeading } from '@/components/ui/section-heading';
import { MatchScore } from '@/components/ui/match-score';
import { appConfig } from '@/config/app';
import { formatCurrency, formatPercent } from '@/lib/format';
import { getInitials } from '@/lib/utils';

// ---- Dados demonstrativos (fictícios) ------------------------------------
const demoAthletes = [
  { name: 'Marina Costa', sport: 'Surfe', city: 'Florianópolis/SC', need: 4500000, match: 92 },
  { name: 'Rafael Nunes', sport: 'Paratletismo', city: 'Curitiba/PR', need: 3200000, match: 88 },
  { name: 'Bianca Alves', sport: 'Ginástica', city: 'São Paulo/SP', need: 2800000, match: 84 },
  { name: 'Diego Martins', sport: 'Ciclismo', city: 'Belo Horizonte/MG', need: 5200000, match: 81 },
];

const demoProjects = [
  { title: 'Núcleo de Natação Inclusiva', sport: 'Paranatação', goal: 12000000, raised: 7200000 },
  { title: 'Escolinha de Atletismo Comunitária', sport: 'Atletismo', goal: 8000000, raised: 3600000 },
  { title: 'Time de Vôlei de Base', sport: 'Vôlei', goal: 15000000, raised: 12750000 },
];

const audiences = [
  {
    icon: Trophy,
    title: 'Para atletas',
    description:
      'Monte um perfil profissional, mostre conquistas e contrapartidas e seja descoberto por marcas e projetos.',
    href: '/para-atletas',
  },
  {
    icon: Building2,
    title: 'Para empresas',
    description:
      'Encontre atletas e projetos alinhados à sua marca, com patrocínio direto ou incentivado, e gerencie tudo em um pipeline.',
    href: '/para-empresas',
  },
  {
    icon: FolderKanban,
    title: 'Para gestores',
    description:
      'Cadastre projetos, vincule atletas, informe metas de captação e conecte-se a empresas patrocinadoras.',
    href: '/para-gestores',
  },
];

const steps = [
  {
    icon: Search,
    title: 'Descubra',
    description: 'Busque e filtre atletas, projetos e oportunidades por modalidade, região e objetivos.',
  },
  {
    icon: Sparkles,
    title: 'Conecte com match',
    description: 'Nosso score de compatibilidade aproxima os perfis mais alinhados — de 0 a 100.',
  },
  {
    icon: Handshake,
    title: 'Negocie e gerencie',
    description: 'Converse, avance a negociação no pipeline e acompanhe as contrapartidas acordadas.',
  },
];

const demoStats = [
  { label: 'Atletas cadastrados', value: '1.200+' },
  { label: 'Projetos ativos', value: '180+' },
  { label: 'Empresas patrocinadoras', value: '90+' },
  { label: 'Conexões realizadas', value: '3.400+' },
];

const demoTestimonials = [
  {
    quote:
      'Encontramos dois atletas alinhados à nossa marca em menos de uma semana. O match economizou muito tempo.',
    author: 'Personagem Fictícia',
    role: 'Gerente de Marketing (demonstração)',
  },
  {
    quote:
      'Consegui organizar minhas contrapartidas e finalmente ter um perfil profissional para apresentar a patrocinadores.',
    author: 'Atleta Fictício',
    role: 'Atleta de base (demonstração)',
  },
];

const faqs = [
  {
    q: 'O que é patrocínio direto e patrocínio incentivado?',
    a: 'Direto usa recursos próprios de marketing da empresa. Incentivado usa projetos aprovados em mecanismos de incentivo ao esporte. A plataforma suporta os dois modelos.',
  },
  {
    q: `O ${appConfig.name} movimenta dinheiro entre as partes?`,
    a: 'Não nesta versão. A plataforma conecta, aproxima e organiza a negociação. Pagamentos, contratos e prestação de contas são etapas conduzidas fora do sistema (e estão no roadmap).',
  },
  {
    q: 'Os perfis são verificados?',
    a: 'Há um fluxo de verificação com envio de documentos e análise administrativa. O selo de verificado indica que a documentação foi revisada.',
  },
  {
    q: 'Preciso pagar para usar?',
    a: 'Há planos gratuitos para atletas e empresas. Recursos avançados (busca avançada, pipeline, relatórios) fazem parte dos planos pagos.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-hero-grid">
        <div className="container flex flex-col items-center gap-6 py-20 text-center md:py-28">
          <Badge variant="secondary" className="gap-1.5 py-1">
            <span className="inline-block h-2 w-2 rounded-full bg-success" />
            Marketplace · Rede · CRM de patrocínio esportivo
          </Badge>
          <h1 className="max-w-4xl font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {appConfig.tagline}
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            O {appConfig.name} conecta atletas de alto rendimento, projetos esportivos e empresas —
            em patrocínio direto ou incentivado. Descubra, conecte, negocie e gerencie em um só lugar.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/cadastro">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/como-funciona">Como funciona</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Ambiente demonstrativo (MVP). Nenhum dado abaixo representa usuários reais.
          </p>
        </div>
      </section>

      {/* AUDIÊNCIAS */}
      <section className="container py-16 md:py-24">
        <SectionHeading
          eyebrow="Um produto, três públicos"
          title="Feito para quem move o esporte"
          description="Atletas, empresas e gestores de projeto em uma plataforma pensada para gerar conexões reais."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {audiences.map((a) => (
            <Card key={a.title} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                  <a.icon className="h-5 w-5" />
                </div>
                <CardTitle>{a.title}</CardTitle>
                <CardDescription>{a.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={a.href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Saiba mais <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="border-y bg-muted/30">
        <div className="container py-16 md:py-24">
          <SectionHeading
            eyebrow="Como funciona"
            title="Do descobrir ao gerenciar"
            description="Um fluxo simples que aproxima marcas, atletas e projetos com base em compatibilidade."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="relative rounded-xl border bg-background p-6">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="absolute right-5 top-5 font-display text-3xl font-bold text-muted-foreground/20">
                  {i + 1}
                </span>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ATLETAS EM DESTAQUE */}
      <section className="container py-16 md:py-24">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading
            align="left"
            eyebrow="Descoberta"
            title="Atletas em destaque"
            description="Exemplos demonstrativos de como os atletas aparecem na busca."
          />
          <Button asChild variant="outline" className="hidden shrink-0 sm:inline-flex">
            <Link href="/explorar/atletas">Ver todos</Link>
          </Button>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {demoAthletes.map((a) => (
            <Card key={a.name} className="overflow-hidden">
              <div className="h-20 bg-gradient-to-br from-primary/20 to-success/20" />
              <CardContent className="-mt-10 flex flex-col items-center text-center">
                <Avatar className="h-16 w-16 border-4 border-background">
                  <AvatarFallback>{getInitials(a.name)}</AvatarFallback>
                </Avatar>
                <h3 className="mt-3 font-semibold">{a.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {a.sport} · {a.city}
                </p>
                <div className="mt-3">
                  <MatchScore score={a.match} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Necessidade estimada</p>
                <p className="text-sm font-medium">{formatCurrency(a.need)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* PROJETOS EM DESTAQUE */}
      <section className="border-t bg-muted/30">
        <div className="container py-16 md:py-24">
          <SectionHeading
            align="left"
            eyebrow="Projetos"
            title="Projetos em captação"
            description="Acompanhe metas e evolução da captação (dados demonstrativos)."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {demoProjects.map((p) => {
              const pct = Math.round((p.raised / p.goal) * 100);
              return (
                <Card key={p.title}>
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit">
                      {p.sport}
                    </Badge>
                    <CardTitle className="mt-2 text-lg">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Progress value={pct} />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatCurrency(p.raised)} de {formatCurrency(p.goal)}
                      </span>
                      <span className="font-semibold">{formatPercent(pct)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* INDICADORES DEMONSTRATIVOS */}
      <section className="container py-16 md:py-24">
        <div className="rounded-2xl border bg-primary/5 p-8 md:p-12">
          <p className="text-center text-sm font-medium uppercase tracking-wide text-primary">
            Dados demonstrativos
          </p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {demoStats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-4xl font-bold">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="border-t bg-muted/30">
        <div className="container py-16 md:py-24">
          <SectionHeading
            eyebrow="Depoimentos"
            title="Histórias (fictícias) de conexão"
            description="Exemplos ilustrativos — claramente marcados como demonstração."
          />
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            {demoTestimonials.map((t) => (
              <Card key={t.author}>
                <CardContent className="p-6">
                  <p className="text-lg">“{t.quote}”</p>
                  <div className="mt-4 flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(t.author)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{t.author}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container py-16 md:py-24">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground md:px-12">
          <div className="relative z-10 mx-auto max-w-2xl space-y-5">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Pronto para transformar o esporte?
            </h2>
            <p className="text-lg text-primary-foreground/80">
              Crie seu perfil gratuito e comece a construir conexões de patrocínio hoje.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/cadastro">
                Criar conta gratuita <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t">
        <div className="container py-16 md:py-24">
          <SectionHeading eyebrow="Dúvidas" title="Perguntas frequentes" />
          <div className="mx-auto mt-10 max-w-3xl divide-y rounded-xl border">
            {faqs.map((f) => (
              <details key={f.q} className="group p-5 [&_summary]:cursor-pointer">
                <summary className="flex list-none items-center justify-between font-medium">
                  {f.q}
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
