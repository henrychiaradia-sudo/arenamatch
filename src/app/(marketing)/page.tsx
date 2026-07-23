import Link from 'next/link';
import {
  ArrowRight,
  Trophy,
  Building2,
  FolderKanban,
  Search,
  Handshake,
  Sparkles,
  Instagram,
  MapPin,
  BadgeCheck,
  Mail,
  MessageSquare,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SectionHeading } from '@/components/ui/section-heading';
import { appConfig } from '@/config/app';
import { formatCurrency, formatPercent } from '@/lib/format';
import { HeroVideo } from '@/features/marketing/hero-video';
import { BrandStrip } from '@/features/marketing/brand-strip';
import { ContactForm } from '@/features/marketing/contact-form';
import { NewsletterForm } from '@/features/marketing/newsletter-form';
import { HERO_VIDEO, HERO_POSTER, ATHLETE_PHOTOS } from '@/features/marketing/assets';

// ---- Dados demonstrativos (fictícios) ------------------------------------
const demoAthletes = [
  { name: 'Marina Costa', sport: 'Surfe', city: 'Florianópolis/SC', need: 4500000, match: 92, followers: '125k', photo: ATHLETE_PHOTOS[0] },
  { name: 'Camila Rocha', sport: 'Natação', city: 'Rio de Janeiro/RJ', need: 6000000, match: 88, followers: '180k', photo: ATHLETE_PHOTOS[1] },
  { name: 'Bianca Alves', sport: 'Ginástica', city: 'São Paulo/SP', need: 2800000, match: 84, followers: '210k', photo: ATHLETE_PHOTOS[2] },
  { name: 'Ana Beatriz', sport: 'Atletismo', city: 'São Paulo/SP', need: 5800000, match: 81, followers: '95k', photo: ATHLETE_PHOTOS[3] },
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
      {/* HERO com vídeo */}
      <section className="relative isolate overflow-hidden bg-neutral-950 text-white">
        <HeroVideo src={HERO_VIDEO} poster={HERO_POSTER} />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-neutral-950/50" />
        <div className="absolute inset-0 bg-neutral-950/30" />
        <div className="container relative z-10 flex min-h-[82vh] flex-col justify-center gap-6 py-24">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="inline-block h-2 w-2 rounded-full bg-success" />
            Marketplace · Rede · CRM de patrocínio esportivo
          </span>
          <h1 className="max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {appConfig.tagline}
          </h1>
          <p className="max-w-xl text-lg text-white/80">
            O {appConfig.name} conecta atletas de alto rendimento, projetos esportivos e empresas —
            em patrocínio direto ou incentivado. Descubra, conecte, negocie e gerencie em um só lugar.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/cadastro">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/5 text-white hover:bg-white hover:text-neutral-900"
            >
              <Link href="/como-funciona">Como funciona</Link>
            </Button>
          </div>
          <p className="text-xs text-white/60">
            Ambiente demonstrativo (MVP). Nenhum dado abaixo representa usuários reais.
          </p>
        </div>
      </section>

      {/* MARCAS QUE APOIAM */}
      <BrandStrip />

      {/* ATLETAS EM DESTAQUE (com fotos) */}
      <section className="container py-16 md:py-24">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading
            align="left"
            eyebrow="Descubra nossos atletas"
            title="Atletas em destaque"
            description="Uma seleção de atletas de diversas modalidades e regiões (demonstração)."
          />
          <Button asChild variant="outline" className="hidden shrink-0 sm:inline-flex">
            <Link href="/explorar/atletas">Ver todos</Link>
          </Button>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {demoAthletes.map((a) => (
            <Card key={a.name} className="group overflow-hidden">
              <div className="relative aspect-[4/5] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.photo}
                  alt={`${a.name} — ${a.sport}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-white">{a.name}</p>
                    <BadgeCheck className="h-4 w-4 text-sky-400" />
                  </div>
                  <p className="flex items-center gap-1 text-sm text-white/80">
                    <MapPin className="h-3.5 w-3.5" /> {a.sport} · {a.city}
                  </p>
                </div>
                <Badge className="absolute right-3 top-3 bg-primary/90">{a.match}% match</Badge>
              </div>
              <CardContent className="flex items-center justify-between p-4">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <Instagram className="h-4 w-4 text-muted-foreground" /> {a.followers}
                </span>
                <span className="text-right text-xs text-muted-foreground">
                  Necessidade
                  <br />
                  <span className="font-medium text-foreground">{formatCurrency(a.need)}</span>
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline">
            <Link href="/explorar/atletas">Ver todos os atletas</Link>
          </Button>
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

      {/* INDICADORES */}
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

      {/* CONTATO */}
      <section id="contato" className="border-t bg-muted/30">
        <div className="container grid gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Fale com a gente"
              title="Entre em contato"
              description="Dúvidas, parcerias ou imprensa? Envie uma mensagem — respondemos por e-mail."
            />
            <div className="mt-8 space-y-4 text-sm">
              <p className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </span>
                <span>
                  E-mail
                  <br />
                  <span className="font-medium text-foreground">{appConfig.contactEmail}</span>
                </span>
              </p>
              <p className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <MessageSquare className="h-5 w-5" />
                </span>
                <span>
                  Suporte
                  <br />
                  <span className="font-medium text-foreground">Resposta em até 2 dias úteis</span>
                </span>
              </p>
              <p className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </span>
                <span>
                  Atendimento
                  <br />
                  <span className="font-medium text-foreground">Seg. a sex., 9h às 18h</span>
                </span>
              </p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-primary text-primary-foreground">
        <div className="container flex flex-col items-center gap-6 py-14 text-center md:py-16">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Receba novidades do {appConfig.name}
          </h2>
          <p className="max-w-xl text-primary-foreground/80">
            Oportunidades, histórias do esporte e novidades da plataforma direto no seu e-mail.
          </p>
          <div className="flex justify-center">
            <NewsletterForm tone="dark" />
          </div>
          <p className="text-xs text-primary-foreground/70">
            Sem spam. Você pode cancelar quando quiser.
          </p>
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
