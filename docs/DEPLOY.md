# Deploy — ArenaMatch

Guia para publicar o ArenaMatch em produção com um **projeto Supabase novo e
dedicado** + **Vercel**.

## 1. Criar um projeto Supabase dedicado

> Recomendado: um projeto **exclusivo** para o ArenaMatch (não reaproveite outro).
> Em organizações que já usaram a cota gratuita, um novo projeto custa
> ~US$ 10/mês (compute Micro). Confirme no seu painel Supabase.

1. Acesse <https://supabase.com/dashboard> → **New project**.
2. Nome: `arenamatch` · Região: **South America (São Paulo)** `sa-east-1`
   (menor latência no Brasil) · defina uma senha forte de banco.
3. Aguarde a inicialização (1–2 min).

## 2. Aplicar o schema

**Opção A — Supabase CLI (recomendado)**
```bash
supabase link --project-ref SEU_PROJECT_REF
supabase db push          # aplica supabase/migrations/*.sql em ordem
# (opcional) popular com dados de demonstração:
supabase db reset         # ATENÇÃO: recria o banco e roda o seed
```

**Opção B — SQL Editor do dashboard**
Cole e execute, **na ordem**, o conteúdo de:
`supabase/migrations/0001_...` → `0007_hardening.sql`. Depois, opcionalmente,
`supabase/seed.sql` para dados de demonstração.

## 3. Configurar autenticação

No dashboard → **Authentication → URL Configuration**:
- **Site URL**: a URL de produção (ex.: `https://arenamatch.vercel.app`).
- **Redirect URLs**: adicione `https://SEU_DOMINIO/auth/callback`.

Em **Authentication → Providers → Email**: mantenha "Confirm email" conforme sua
preferência (no local o seed usa e-mails já confirmados).

## 4. Pegar as chaves

Dashboard → **Project Settings → API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` (ou `Publishable key`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → **apenas** se for usar scripts admin (nunca no frontend).

## 5. Deploy na Vercel

1. Importe o repositório em <https://vercel.com/new>.
2. **Environment Variables** (Production):
   | Variável | Valor |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon/publishable key |
   | `NEXT_PUBLIC_APP_URL` | URL de produção da Vercel |
   | `NEXT_PUBLIC_APP_NAME` | `ArenaMatch` (ou o nome final) |
3. **Deploy**. A Vercel roda `next build` automaticamente.
4. Após o primeiro deploy, volte ao passo 3 e ajuste a **Site URL/Redirect URLs**
   do Supabase com o domínio final.

## 6. Criar um administrador

Após alguém se cadastrar, promova no SQL Editor:
```sql
update public.profiles set role = 'admin' where id = '<user_uuid>';
```

## 7. Pós-deploy

- Rode os **advisors** do Supabase (Security e Performance) e trate os avisos.
- Confira o fluxo: cadastro → onboarding → descoberta → interesse → mensagem →
  negociação → contrapartida.
- Storage: os buckets `avatars`, `covers`, `documents`, `evidence` são criados
  pela migração `0005`. Confirme em **Storage**.

## Notas de segurança para produção

- A criação de notificações usa a função `create_notification` (SECURITY
  DEFINER); a RLS de `notifications` está no modo estrito.
- Documentos privados só via URL assinada. Revise `docs/SECURITY.md`.
- Textos de Termos/Privacidade são demonstrativos — revise com jurídico.
