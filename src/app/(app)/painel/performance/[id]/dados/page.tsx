import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Newspaper,
  ClipboardList,
  Filter,
  ArrowRight,
  Tv,
  Users,
  PartyPopper,
  Package,
  Store,
} from 'lucide-react';
import { requireRole } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { ClippingForm, SurveyForm, LeadForm } from '@/features/performance/media-forms';
import {
  summarizeClippings,
  summarizeLeads,
  outletLabel,
  sourceLabel,
  metricLabel,
  type Clipping,
  type LeadRow,
} from '@/lib/performance/media';
import {
  TvForm,
  AudienceForm,
  HospitalityForm,
  LicensingForm,
  MerchForm,
} from '@/features/performance/nivelb-forms';
import {
  summarizeTv,
  groupAudience,
  summarizeHospitality,
  summarizeLicensing,
  summarizeMerch,
  tvTypeLabel,
  audDimLabel,
  merchTypeLabel,
} from '@/lib/performance/nivelb';
import { formatCompact } from '@/lib/performance/engine';
import { formatCurrency } from '@/lib/format';

export default async function PerfDadosPage({ params }: { params: { id: string } }) {
  await requireRole('company');
  const supabase = createClient();

  const { data: deal } = await supabase.from('deals').select('id, title').eq('id', params.id).maybeSingle();
  if (!deal) notFound();

  const [{ data: clipRows }, { data: surveyRows }, { data: leadRows }] = await Promise.all([
    supabase
      .from('media_clippings')
      .select('id, outlet_type, outlet_name, title, url, reach, ave_cents, sentiment, published_at')
      .eq('deal_id', params.id)
      .order('ave_cents', { ascending: false }),
    supabase
      .from('brand_surveys')
      .select('id, metric, before_value, after_value, unit')
      .eq('deal_id', params.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('sponsorship_leads')
      .select('id, source, captured, converted')
      .eq('deal_id', params.id)
      .order('created_at', { ascending: true }),
  ]);

  const clips = (clipRows ?? []) as Clipping[];
  const leads = (leadRows ?? []) as LeadRow[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const surveys = (surveyRows ?? []) as any[];

  const cs = summarizeClippings(clips);
  const ls = summarizeLeads(leads);
  const maxTypeAve = Math.max(1, ...Object.values(cs.byType));
  const maxSource = Math.max(1, ...Object.values(ls.bySource));

  const [{ data: tvRows }, { data: audRows }, { data: hospRows }, { data: licRows }, { data: merchRows }] =
    await Promise.all([
      supabase.from('tv_exposures').select('program, exposure_type, seconds, insertions, audience, ave_cents').eq('deal_id', params.id),
      supabase.from('audience_segments').select('dimension, label, pct').eq('deal_id', params.id),
      supabase.from('hospitality_events').select('event_name, guests, clients, executives, deals_started, deals_closed, satisfaction').eq('deal_id', params.id),
      supabase.from('licensing_records').select('product, region, units_sold, revenue_cents, royalties_cents').eq('deal_id', params.id),
      supabase.from('merchandising_points').select('pdv_name, region, material_type, points').eq('deal_id', params.id),
    ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tv = summarizeTv((tvRows ?? []) as any[]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aud = groupAudience((audRows ?? []) as any[]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hosp = summarizeHospitality((hospRows ?? []) as any[]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lic = summarizeLicensing((licRows ?? []) as any[]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const merch = summarizeMerch((merchRows ?? []) as any[]);
  const maxTvType = Math.max(1, ...Object.values(tv.byType));
  const maxLicProduct = Math.max(1, ...Object.values(lic.byProduct));
  const maxMerchRegion = Math.max(1, ...Object.values(merch.byRegion));
  const maxMerchType = Math.max(1, ...Object.values(merch.byType));

  const sentimentRows = [
    { key: 'positive' as const, label: 'Positivo', cls: 'bg-success', n: cs.sentiment.positive },
    { key: 'neutral' as const, label: 'Neutro', cls: 'bg-muted-foreground/50', n: cs.sentiment.neutral },
    { key: 'negative' as const, label: 'Negativo', cls: 'bg-destructive', n: cs.sentiment.negative },
  ];

  return (
    <div className="space-y-6">
      <Link
        href={`/painel/performance/${params.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao painel do patrocínio
      </Link>

      <PageHeader title={`Mídia & Dados · ${deal.title}`} description="Registre e consolide mídia espontânea, pesquisa de marca e leads." />

      {/* MÍDIA ESPONTÂNEA */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Newspaper className="h-4 w-4 text-primary" /> Mídia espontânea (clipping)
            </h2>
            <ClippingForm dealId={params.id} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Matérias</p>
              <p className="text-xl font-bold">{cs.total}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Alcance somado</p>
              <p className="text-xl font-bold">{formatCompact(cs.reach)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Valor de mídia (AVE)</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(cs.ave)}</p>
            </div>
          </div>

          {cs.total > 0 ? (
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Sentimento das matérias</p>
                <div className="space-y-2">
                  {sentimentRows.map((s) => (
                    <div key={s.key} className="grid grid-cols-[70px_1fr_28px] items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{s.label}</span>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <div className={`h-full rounded-full ${s.cls}`} style={{ width: `${cs.total ? (s.n / cs.total) * 100 : 0}%` }} />
                      </div>
                      <span className="text-right font-semibold tabular-nums">{s.n}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">AVE por tipo de mídia</p>
                <div className="space-y-2">
                  {Object.entries(cs.byType)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, ave]) => (
                      <div key={type} className="grid grid-cols-[90px_1fr_70px] items-center gap-2 text-sm">
                        <span className="text-muted-foreground">{outletLabel(type)}</span>
                        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${(ave / maxTypeAve) * 100}%` }} />
                        </div>
                        <span className="text-right text-xs font-medium tabular-nums">{formatCurrency(ave)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Nenhuma matéria registrada. Adicione a primeira acima.</p>
          )}

          {clips.length > 0 ? (
            <div className="mt-5 divide-y rounded-lg border">
              {clips.slice(0, 8).map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <span className="font-medium">{c.outlet_name}</span>
                    <span className="text-muted-foreground"> · {outletLabel(c.outlet_type)}</span>
                    {c.title ? <span className="text-muted-foreground"> — {c.title}</span> : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{formatCompact(Number(c.reach))}</span>
                    <span className="text-xs font-medium">{formatCurrency(Number(c.ave_cents))}</span>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        c.sentiment === 'positive'
                          ? 'bg-success'
                          : c.sentiment === 'negative'
                            ? 'bg-destructive'
                            : 'bg-muted-foreground/50'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* PESQUISA DE MARCA */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <ClipboardList className="h-4 w-4 text-primary" /> Pesquisa de marca (antes × depois)
            </h2>
            <SurveyForm dealId={params.id} />
          </div>

          {surveys.length > 0 ? (
            <div className="mt-4 space-y-4">
              {surveys.map((s) => {
                const before = Number(s.before_value);
                const after = Number(s.after_value);
                const lift = after - before;
                const scaleMax = Math.max(after, before, s.unit === 'pts' ? 100 : 100, 1);
                return (
                  <div key={s.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{metricLabel(s.metric)}</span>
                      <Badge variant={lift >= 0 ? 'default' : 'secondary'} className="tabular-nums">
                        {lift >= 0 ? '+' : ''}
                        {lift.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} {s.unit}
                      </Badge>
                    </div>
                    <div className="mt-1.5 space-y-1">
                      <div className="grid grid-cols-[52px_1fr_70px] items-center gap-2">
                        <span className="text-xs text-muted-foreground">Antes</span>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-muted-foreground/50" style={{ width: `${(before / scaleMax) * 100}%` }} />
                        </div>
                        <span className="text-right text-xs tabular-nums">{before.toLocaleString('pt-BR')} {s.unit}</span>
                      </div>
                      <div className="grid grid-cols-[52px_1fr_70px] items-center gap-2">
                        <span className="text-xs text-muted-foreground">Depois</span>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${(after / scaleMax) * 100}%` }} />
                        </div>
                        <span className="text-right text-xs font-medium tabular-nums">{after.toLocaleString('pt-BR')} {s.unit}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Nenhuma métrica de pesquisa registrada ainda.</p>
          )}
        </CardContent>
      </Card>

      {/* LEADS */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Filter className="h-4 w-4 text-primary" /> Leads gerados
            </h2>
            <LeadForm dealId={params.id} />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Capturados</p>
              <p className="text-xl font-bold">{formatCompact(ls.captured)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Convertidos</p>
              <p className="text-xl font-bold text-primary">{formatCompact(ls.converted)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Taxa de conversão</p>
              <p className="text-xl font-bold">{ls.rate.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%</p>
            </div>
          </div>

          {Object.keys(ls.bySource).length > 0 ? (
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Capturados por origem</p>
              <div className="space-y-2">
                {Object.entries(ls.bySource)
                  .sort((a, b) => b[1] - a[1])
                  .map(([src, n]) => (
                    <div key={src} className="grid grid-cols-[110px_1fr_60px] items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{sourceLabel(src)}</span>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(n / maxSource) * 100}%` }} />
                      </div>
                      <span className="text-right text-xs font-medium tabular-nums">{formatCompact(n)}</span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Nenhum lead registrado ainda.</p>
          )}
        </CardContent>
      </Card>

      {/* EXPOSIÇÃO EM TV */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Tv className="h-4 w-4 text-primary" /> Exposição em TV
            </h2>
            <TvForm dealId={params.id} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Tempo de marca</p><p className="text-lg font-bold">{Math.floor(tv.seconds / 60)}min {tv.seconds % 60}s</p></div>
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Inserções</p><p className="text-lg font-bold">{tv.insertions.toLocaleString('pt-BR')}</p></div>
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Audiência</p><p className="text-lg font-bold">{formatCompact(tv.audience)}</p></div>
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Valor equivalente</p><p className="text-lg font-bold text-primary">{formatCurrency(tv.ave)}</p></div>
          </div>
          {tv.count > 0 ? (
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Tempo por tipo de exposição</p>
              <div className="space-y-2">
                {Object.entries(tv.byType).sort((a, b) => b[1] - a[1]).map(([type, secs]) => (
                  <div key={type} className="grid grid-cols-[110px_1fr_54px] items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{tvTypeLabel(type)}</span>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(secs / maxTvType) * 100}%` }} /></div>
                    <span className="text-right text-xs font-medium tabular-nums">{secs}s</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Nenhuma exposição em TV registrada.</p>
          )}
        </CardContent>
      </Card>

      {/* PÚBLICO */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Users className="h-4 w-4 text-primary" /> Público (demografia)
            </h2>
            <AudienceForm dealId={params.id} />
          </div>
          {Object.keys(aud).length > 0 ? (
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {Object.entries(aud).map(([dim, segs]) => (
                <div key={dim}>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">{audDimLabel(dim)}</p>
                  <div className="space-y-1.5">
                    {segs.map((s, i) => (
                      <div key={`${dim}-${i}`} className="grid grid-cols-[110px_1fr_46px] items-center gap-2 text-sm">
                        <span className="truncate text-muted-foreground">{s.label}</span>
                        <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, s.pct)}%` }} /></div>
                        <span className="text-right text-xs font-medium tabular-nums">{s.pct.toLocaleString('pt-BR')}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Nenhum dado demográfico registrado.</p>
          )}
        </CardContent>
      </Card>

      {/* HOSPITALIDADE */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <PartyPopper className="h-4 w-4 text-primary" /> Hospitalidade
            </h2>
            <HospitalityForm dealId={params.id} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { l: 'Convidados', v: hosp.guests },
              { l: 'Clientes', v: hosp.clients },
              { l: 'Executivos', v: hosp.executives },
              { l: 'Neg. iniciados', v: hosp.started },
              { l: 'Neg. fechados', v: hosp.closed },
            ].map((k) => (
              <div key={k.l} className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">{k.l}</p><p className="text-lg font-bold">{k.v.toLocaleString('pt-BR')}</p></div>
            ))}
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Satisfação</p><p className="text-lg font-bold">{hosp.satisfaction.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}<span className="text-xs text-muted-foreground">/10</span></p></div>
          </div>
          {hosp.count === 0 ? <p className="mt-4 text-sm text-muted-foreground">Nenhum evento de hospitalidade registrado.</p> : null}
        </CardContent>
      </Card>

      {/* LICENCIAMENTO */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Package className="h-4 w-4 text-primary" /> Licenciamento
            </h2>
            <LicensingForm dealId={params.id} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Unidades vendidas</p><p className="text-lg font-bold">{formatCompact(lic.units)}</p></div>
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Receita</p><p className="text-lg font-bold text-primary">{formatCurrency(lic.revenue)}</p></div>
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Royalties</p><p className="text-lg font-bold">{formatCurrency(lic.royalties)}</p></div>
          </div>
          {Object.keys(lic.byProduct).length > 0 ? (
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Receita por produto</p>
              <div className="space-y-2">
                {Object.entries(lic.byProduct).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([prod, rev]) => (
                  <div key={prod} className="grid grid-cols-[140px_1fr_80px] items-center gap-2 text-sm">
                    <span className="truncate text-muted-foreground">{prod}</span>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(rev / maxLicProduct) * 100}%` }} /></div>
                    <span className="text-right text-xs font-medium tabular-nums">{formatCurrency(rev)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Nenhum produto licenciado registrado.</p>
          )}
        </CardContent>
      </Card>

      {/* MERCHANDISING */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Store className="h-4 w-4 text-primary" /> Merchandising (PDV)
            </h2>
            <MerchForm dealId={params.id} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Pontos de venda</p><p className="text-lg font-bold">{merch.count.toLocaleString('pt-BR')}</p></div>
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Pontos de exposição</p><p className="text-lg font-bold">{merch.points.toLocaleString('pt-BR')}</p></div>
          </div>
          {Object.keys(merch.byRegion).length > 0 ? (
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">PDVs por região</p>
                <div className="space-y-2">
                  {Object.entries(merch.byRegion).sort((a, b) => b[1] - a[1]).map(([reg, n]) => (
                    <div key={reg} className="grid grid-cols-[110px_1fr_40px] items-center gap-2 text-sm">
                      <span className="truncate text-muted-foreground">{reg}</span>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(n / maxMerchRegion) * 100}%` }} /></div>
                      <span className="text-right text-xs font-medium tabular-nums">{n}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Por tipo de material</p>
                <div className="space-y-2">
                  {Object.entries(merch.byType).sort((a, b) => b[1] - a[1]).map(([t, n]) => (
                    <div key={t} className="grid grid-cols-[110px_1fr_40px] items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{merchTypeLabel(t)}</span>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(n / maxMerchType) * 100}%` }} /></div>
                      <span className="text-right text-xs font-medium tabular-nums">{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Nenhum PDV registrado.</p>
          )}
        </CardContent>
      </Card>

      <div className="text-center">
        <Link
          href={`/painel/performance/${params.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Ver o painel consolidado do patrocínio <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
