import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cliente Supabase para uso no servidor (Server Components, Route Handlers,
 * Server Actions). Lê e grava a sessão via cookies.
 *
 * Em Server Components a escrita de cookies não é permitida — o try/catch
 * evita erros; a renovação da sessão acontece no middleware.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set({ name, value, ...options }),
            );
          } catch {
            // Chamado a partir de um Server Component — ignorável.
          }
        },
      },
    },
  );
}
