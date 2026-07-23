/** Constantes, rótulos e agregações da Fase 2 (mídia espontânea, pesquisa, leads). */

export const OUTLET_TYPES = [
  { value: 'tv', label: 'TV' },
  { value: 'jornal', label: 'Jornal' },
  { value: 'revista', label: 'Revista' },
  { value: 'portal', label: 'Portal' },
  { value: 'blog', label: 'Blog' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'radio', label: 'Rádio' },
  { value: 'influenciador', label: 'Influenciador' },
] as const;

export const LEAD_SOURCES = [
  { value: 'landing_page', label: 'Landing page' },
  { value: 'qr_code', label: 'QR Code' },
  { value: 'cupom', label: 'Cupom' },
  { value: 'cadastro', label: 'Cadastro' },
  { value: 'download', label: 'Download' },
] as const;

export const SURVEY_METRICS = [
  { value: 'recall_espontaneo', label: 'Recall espontâneo' },
  { value: 'recall_estimulado', label: 'Recall estimulado' },
  { value: 'top_of_mind', label: 'Top of Mind' },
  { value: 'intencao_compra', label: 'Intenção de compra' },
  { value: 'preferencia', label: 'Preferência' },
  { value: 'favorabilidade', label: 'Favorabilidade' },
  { value: 'nps', label: 'NPS' },
] as const;

export const SENTIMENTS = [
  { value: 'positive', label: 'Positivo' },
  { value: 'neutral', label: 'Neutro' },
  { value: 'negative', label: 'Negativo' },
] as const;

const labelOf = (list: readonly { value: string; label: string }[], v: string) =>
  list.find((o) => o.value === v)?.label ?? v;

export const outletLabel = (v: string) => labelOf(OUTLET_TYPES, v);
export const sourceLabel = (v: string) => labelOf(LEAD_SOURCES, v);
export const metricLabel = (v: string) => labelOf(SURVEY_METRICS, v);

export interface Clipping {
  id: string;
  outlet_type: string;
  outlet_name: string;
  title: string | null;
  url: string | null;
  reach: number;
  ave_cents: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  published_at: string | null;
}

export function summarizeClippings(rows: Clipping[]) {
  const sentiment: Record<'positive' | 'neutral' | 'negative', number> = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };
  const byType: Record<string, number> = {};
  let reach = 0;
  let ave = 0;
  for (const r of rows) {
    reach += Number(r.reach || 0);
    ave += Number(r.ave_cents || 0);
    sentiment[r.sentiment] += 1;
    byType[r.outlet_type] = (byType[r.outlet_type] ?? 0) + Number(r.ave_cents || 0);
  }
  return { total: rows.length, reach, ave, sentiment, byType };
}

export interface LeadRow {
  id: string;
  source: string;
  captured: number;
  converted: number;
}

export function summarizeLeads(rows: LeadRow[]) {
  let captured = 0;
  let converted = 0;
  const bySource: Record<string, number> = {};
  for (const r of rows) {
    captured += Number(r.captured || 0);
    converted += Number(r.converted || 0);
    bySource[r.source] = (bySource[r.source] ?? 0) + Number(r.captured || 0);
  }
  const rate = captured > 0 ? (converted / captured) * 100 : 0;
  return { captured, converted, rate, bySource };
}
