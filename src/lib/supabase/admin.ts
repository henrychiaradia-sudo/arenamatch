import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase com a chave de SERVICE ROLE.
 * ATENÇÃO: use SOMENTE em código de servidor (scripts, tarefas administrativas,
 * seed). Ignora RLS. NUNCA importe isto em código de cliente.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY não configurada. Necessária para operações administrativas.',
    );
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
