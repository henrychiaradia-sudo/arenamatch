import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Utilidades de formatação para o padrão brasileiro.
 * Valores monetários são armazenados em centavos (inteiros) e formatados aqui.
 */

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const BRL_COMPACT = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Formata centavos como moeda brasileira. Ex.: 1500000 -> "R$ 15.000,00". */
export function formatCurrency(cents: number | null | undefined): string {
  if (cents == null) return '—';
  return BRL.format(cents / 100);
}

/** Versão compacta para KPIs. Ex.: 1500000 -> "R$ 15 mil". */
export function formatCurrencyCompact(cents: number | null | undefined): string {
  if (cents == null) return '—';
  return BRL_COMPACT.format(cents / 100);
}

/** Formata uma faixa de investimento em centavos. */
export function formatCurrencyRange(
  minCents: number | null | undefined,
  maxCents: number | null | undefined,
): string {
  if (minCents == null && maxCents == null) return 'A combinar';
  if (minCents != null && maxCents != null) {
    return `${formatCurrency(minCents)} – ${formatCurrency(maxCents)}`;
  }
  if (minCents != null) return `A partir de ${formatCurrency(minCents)}`;
  return `Até ${formatCurrency(maxCents)}`;
}

/** Formata uma data no padrão brasileiro (dd/MM/yyyy). Aceita Date ou ISO string. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
}

/** Formata data e hora (dd/MM/yyyy HH:mm). */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

/** Tempo relativo. Ex.: "há 3 horas". */
export function formatRelativeTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  return formatDistanceToNow(date, { locale: ptBR, addSuffix: true });
}

/** Formata número inteiro com separador de milhar. Ex.: 15000 -> "15.000". */
export function formatNumber(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-BR').format(value);
}

/** Número compacto para audiência. Ex.: 15000 -> "15 mil". */
export function formatCompactNumber(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  );
}

/** Formata percentual. Ex.: 0.87 -> "87%" (fraction) ou 87 -> "87%" (already percent). */
export function formatPercent(value: number | null | undefined, isFraction = false): string {
  if (value == null) return '—';
  const pct = isFraction ? value * 100 : value;
  return `${Math.round(pct)}%`;
}
