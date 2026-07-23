/** Constantes, rótulos e agregações do Nível B restante (TV, público, hospitalidade, licenciamento, merchandising). */

export const TV_TYPES = [
  { value: 'logo', label: 'Logo em destaque' },
  { value: 'backdrop', label: 'Backdrop' },
  { value: 'uniforme', label: 'Uniforme' },
  { value: 'placas', label: 'Placas' },
  { value: 'led', label: 'LED' },
  { value: 'entrevista', label: 'Entrevista' },
] as const;

export const AUD_DIMENSIONS = [
  { value: 'genero', label: 'Gênero' },
  { value: 'faixa_etaria', label: 'Faixa etária' },
  { value: 'classe', label: 'Classe social' },
  { value: 'regiao', label: 'Região' },
  { value: 'interesse', label: 'Interesses' },
] as const;

export const MERCH_TYPES = [
  { value: 'display', label: 'Display' },
  { value: 'ilha', label: 'Ilha' },
  { value: 'encarte', label: 'Encarte' },
  { value: 'pdv', label: 'Material de PDV' },
  { value: 'banner', label: 'Banner' },
] as const;

const labelOf = (list: readonly { value: string; label: string }[], v: string) =>
  list.find((o) => o.value === v)?.label ?? v;
export const tvTypeLabel = (v: string) => labelOf(TV_TYPES, v);
export const audDimLabel = (v: string) => labelOf(AUD_DIMENSIONS, v);
export const merchTypeLabel = (v: string) => labelOf(MERCH_TYPES, v);

const num = (v: unknown) => Number(v ?? 0) || 0;

export function summarizeTv(rows: { exposure_type: string; seconds: unknown; insertions: unknown; audience: unknown; ave_cents: unknown }[]) {
  let seconds = 0, insertions = 0, audience = 0, ave = 0;
  const byType: Record<string, number> = {};
  for (const r of rows) {
    seconds += num(r.seconds);
    insertions += num(r.insertions);
    audience += num(r.audience);
    ave += num(r.ave_cents);
    byType[r.exposure_type] = (byType[r.exposure_type] ?? 0) + num(r.seconds);
  }
  return { seconds, insertions, audience, ave, byType, count: rows.length };
}

export function groupAudience(rows: { dimension: string; label: string; pct: unknown }[]) {
  const groups: Record<string, { label: string; pct: number }[]> = {};
  for (const r of rows) {
    (groups[r.dimension] ??= []).push({ label: r.label, pct: num(r.pct) });
  }
  return groups;
}

export function summarizeHospitality(rows: { guests: unknown; clients: unknown; executives: unknown; deals_started: unknown; deals_closed: unknown; satisfaction: unknown }[]) {
  let guests = 0, clients = 0, executives = 0, started = 0, closed = 0, satSum = 0, satN = 0;
  for (const r of rows) {
    guests += num(r.guests);
    clients += num(r.clients);
    executives += num(r.executives);
    started += num(r.deals_started);
    closed += num(r.deals_closed);
    if (r.satisfaction != null) { satSum += num(r.satisfaction); satN += 1; }
  }
  return { guests, clients, executives, started, closed, satisfaction: satN ? satSum / satN : 0, count: rows.length };
}

export function summarizeLicensing(rows: { product: string; units_sold: unknown; revenue_cents: unknown; royalties_cents: unknown }[]) {
  let units = 0, revenue = 0, royalties = 0;
  const byProduct: Record<string, number> = {};
  for (const r of rows) {
    units += num(r.units_sold);
    revenue += num(r.revenue_cents);
    royalties += num(r.royalties_cents);
    byProduct[r.product] = (byProduct[r.product] ?? 0) + num(r.revenue_cents);
  }
  return { units, revenue, royalties, byProduct };
}

export function summarizeMerch(rows: { region: string | null; material_type: string; points: unknown }[]) {
  const byRegion: Record<string, number> = {};
  const byType: Record<string, number> = {};
  let points = 0;
  for (const r of rows) {
    points += num(r.points);
    const region = r.region || '—';
    byRegion[region] = (byRegion[region] ?? 0) + 1;
    byType[r.material_type] = (byType[r.material_type] ?? 0) + 1;
  }
  return { count: rows.length, points, byRegion, byType };
}
