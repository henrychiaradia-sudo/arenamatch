import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Landmark,
  Percent,
  GraduationCap,
  Users,
  Trophy,
  FileCheck2,
  Search,
  Handshake,
  ClipboardCheck,
  Building2,
  User,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SectionHeading } from '@/components/ui/section-heading';
import { appConfig } from '@/config/app';

export const metadata: Metadata = {
  title: 'Lei de Incentivo ao Esporte',
  description:
    'Entenda a Lei de Incentivo ao Esporte (Lei 11.438/2006, permanente pela LC 222/2025) e como o ArenaMatch conecta projetos incentivados a patrocinadores.',
};

const deductions = [
  {
    icon: User,
    title: 'Pessoa Física',
    limit: 'até 7%',
    description:
      'Pessoas físicas podem deduzir até 7% do Imposto de Renda devido na Declaração de Ajuste Anual ao apoiar projetos aprovados.',
  },
  {
    icon: Building2,
    title: 'Pessoa Jurídica (lucro real)',
    limit: 'até 2%',
    description:
      'Empresas tributadas pelo lucro real podem deduzir até 2% do imposto devido — com aumento previsto para 3% a partir de 2028, e até 4% em projetos de inclusão social em comunidades vulneráveis.',
  },
];

const categories = [
  {
    icon: GraduationCap,
    title: 'Esporte educacional',
    description:
      'Praticado em escolas e instituições de ensino, com foco no desenvolvimento integral de crianças e jovens.',
  },
  {
    icon: Users,
    title: 'Esporte de participação',
    description:
      'Praticado de forma voluntária pela comunidade, promovendo saúde, integração social e qualidade de vida.',
  },
  {
    icon: Trophy,
    title: 'Esporte de rendimento',
    description:
      'Da formação de base ao alto rendimento, incluindo modalidades olímpicas, paralímpicas e não olímpicas.',
  },
];

const process = [
  {
    title: 'Aprovação do projeto',
    description:
      'O proponente inscreve o projeto no Ministério do Esporte. Aprovado, ele é publicado no Diário Oficial da União e liberado para captação.',
  },
  {
    title: 'Captação de recursos',
    description:
      'Empresas e pessoas físicas destinam parte do Imposto de Renda ao projeto, via depósito em conta específica, recebendo o recibo para dedução.',
  },
  {
    title: 'Execução',
    description:
      'Com os recursos captados, o projeto é executado conforme o plano aprovado — treinos, competições, formação, estrutura e contrapartidas.',
  },
  {
    title: 'Prestação de contas',
    description:
      'Ao final, o proponente presta contas ao Ministério do Esporte, comprovando a aplicação dos recursos conforme aprovado.',
  },
];

const arenaSteps = [
  {
    icon: Search,
    title: 'Descoberta de projetos',
    description:
      'Empresas encontram projetos incentivados aprovados, filtrando por modalidade, região, impacto social e faixa de investimento.',
  },
  {
    icon: Handshake,
    title: 'Conexão e negociação',
    description:
      'Nosso match aproxima marcas e projetos alinhados. A conversa e a negociação acontecem no pipeline, de forma organizada.',
  },
  {
    icon: ClipboardCheck,
    title: 'Gestão de contrapartidas',
    description:
      'Depois do acordo, acompanhe as contrapartidas combinadas e o andamento da parceria em um só lugar.',
  },
];

export default function LeiDeIncentivoPage() {
  return (
    <>
      {/* Cabeçalho */}
      <section className="border-b bg-muted/30">
        <div className="container py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="gap-1.5 py-1">
              <Landmark className="h-3.5 w-3.5" />
              Patrocínio incentivado
            </Badge>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Lei de Incentivo ao Esporte
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Uma das principais ferramentas de financiamento do esporte no Brasil: empresas e
              pessoas físicas apoiam projetos esportivos aprovados e deduzem o valor do Imposto de
              Renda. O {appConfig.name} conecta esses projetos a quem quer patrocinar.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/explorar/projetos">
                  Ver projetos incentivados <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/cadastro">Cadastrar meu projeto</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* O que é */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            align="left"
            eyebrow="O que é"
            title="Como o esporte vira patrocínio incentivado"
          />
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              A Lei de Incentivo ao Esporte (Lei Federal nº 11.438/2006) permite que empresas e
              cidadãos direcionem parte do que pagariam de Imposto de Renda para projetos esportivos
              aprovados pelo Ministério do Esporte — em vez de recolher todo o imposto, parte dele
              vira investimento direto no esporte.
            </p>
            <p>
              Em novembro de 2025, a <strong className="text-foreground">Lei Complementar nº 222/2025</strong>{' '}
              tornou esse incentivo fiscal <strong className="text-foreground">permanente</strong>, encerrando
              o ciclo de prorrogações que limitava sua vigência. Isso traz mais segurança e
              previsibilidade para marcas e projetos planejarem parcerias de longo prazo.
            </p>
          </div>
        </div>
      </section>

      {/* Como funciona a dedução */}
      <section className="border-y bg-muted/30">
        <div className="container py-16 md:py-24">
          <SectionHeading
            eyebrow="Como funciona"
            title="Quem apoia e quanto pode deduzir"
            description="Dentro dos limites legais, a dedução pode chegar a 100% do valor destinado ao projeto."
          />
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            {deductions.map((d) => (
              <Card key={d.title}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                      <d.icon className="h-5 w-5" />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                      <Percent className="h-3.5 w-3.5" />
                      {d.limit}
                    </span>
                  </div>
                  <CardTitle className="mt-2">{d.title}</CardTitle>
                  <CardDescription>{d.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Manifestações esportivas */}
      <section className="container py-16 md:py-24">
        <SectionHeading
          eyebrow="Manifestações esportivas"
          title="Quais projetos podem ser incentivados"
          description="A lei abrange todo o espectro do esporte — não apenas modalidades olímpicas."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {categories.map((c) => (
            <Card key={c.title}>
              <CardHeader>
                <div className="mb-2 grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
                <CardTitle>{c.title}</CardTitle>
                <CardDescription>{c.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* O processo */}
      <section className="border-y bg-muted/30">
        <div className="container py-16 md:py-24">
          <SectionHeading
            eyebrow="Passo a passo"
            title="Como funciona na prática"
            description="Do projeto aprovado à prestação de contas."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {process.map((p, i) => (
              <div key={p.title} className="relative rounded-xl border bg-background p-6">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <span className="absolute right-5 top-5 font-display text-3xl font-bold text-muted-foreground/20">
                  {i + 1}
                </span>
                <h3 className="text-base font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como o ArenaMatch trabalha com a lei */}
      <section className="container py-16 md:py-24">
        <SectionHeading
          eyebrow={`Como o ${appConfig.name} trabalha com a lei`}
          title="Conectamos projetos incentivados a patrocinadores"
          description="A plataforma cuida da descoberta, da conexão e da gestão da parceria. As etapas fiscais e a aprovação do projeto seguem pelo Ministério do Esporte, entre as partes."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {arenaSteps.map((s) => (
            <Card key={s.title} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <CardTitle>{s.title}</CardTitle>
                <CardDescription>{s.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mx-auto mt-12 flex max-w-4xl gap-3 rounded-xl border bg-muted/40 p-5 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p>
            <strong className="text-foreground">Aviso.</strong> Este conteúdo é informativo e não
            constitui orientação jurídica ou fiscal. Percentuais e regras seguem a legislação vigente
            e podem mudar — confirme os detalhes com um contador ou assessoria especializada. O{' '}
            {appConfig.name} não movimenta recursos, não aprova projetos e não emite documentos
            fiscais; a plataforma conecta as partes e organiza a negociação.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-16 md:pb-24">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground md:px-12">
          <div className="relative z-10 mx-auto max-w-2xl space-y-5">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Tem um projeto incentivado ou quer patrocinar um?
            </h2>
            <p className="text-lg text-primary-foreground/80">
              Cadastre-se gratuitamente e comece a construir conexões de patrocínio incentivado hoje.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" variant="secondary">
                <Link href="/cadastro">
                  Criar conta gratuita <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white hover:text-primary"
              >
                <Link href="/explorar/projetos">Explorar projetos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
