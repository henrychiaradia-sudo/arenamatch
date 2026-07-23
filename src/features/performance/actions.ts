'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/session';
import { perfConfigSchema } from '@/schemas/performance';

type Result = { ok: true } | { ok: false; error: string };

/** Calibra os parâmetros de cálculo de performance de um patrocínio (deal). */
export async function savePerformanceConfig(dealId: string, input: unknown): Promise<Result> {
  const session = await getSession();
  if (!session) return { ok: false, error: 'Não autenticado.' };

  const parsed = perfConfigSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Dados inválidos.' };
  const { cpmReais, extraCostReais, otherValueReais, reachOverride } = parsed.data;

  const supabase = createClient();
  const { error } = await supabase.from('sponsorship_performance').upsert(
    {
      deal_id: dealId,
      cpm_cents: Math.round(cpmReais * 100),
      extra_cost_cents: Math.round(extraCostReais * 100),
      other_value_cents: Math.round(otherValueReais * 100),
      reach_override: reachOverride > 0 ? reachOverride : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'deal_id' },
  );
  if (error) return { ok: false, error: 'Não foi possível salvar. Verifique se este patrocínio é seu.' };

  revalidatePath(`/painel/performance/${dealId}`);
  revalidatePath('/painel/performance');
  return { ok: true };
}
