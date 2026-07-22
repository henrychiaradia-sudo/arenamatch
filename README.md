# ArenaMatch

**Conectando marcas, atletas e projetos que transformam o esporte.**

Plataforma web de descoberta, conexão, negociação e gestão de oportunidades de
patrocínio esportivo — combinando **marketplace**, **rede profissional**, **CRM
de patrocínio**, **sistema de recomendação (match)** e **gestão de
contrapartidas**. Suporta patrocínio **direto** (recursos de marketing) e
**incentivado** (projetos aprovados em leis de incentivo).

> ⚠️ **MVP / ambiente demonstrativo.** Não há movimentação financeira, escrow,
> emissão fiscal, assinatura eletrônica de contratos nem conformidade jurídica
> automática. Consulte [`docs/ROADMAP.md`](docs/ROADMAP.md).

---

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 14 (App Router) · React 18 · TypeScript estrito |
| UI | Tailwind CSS 3 · shadcn/ui (Radix) · lucide-react |
| Formulários | React Hook Form · Zod |
| Dados (cliente) | TanStack Query |
| Backend / DB | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Testes | Vitest (unitário) · Playwright (E2E) |
| Deploy | Vercel |

Arquitetura organizada por domínio. Veja [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Pré-requisitos

- **Node.js** 18.18+ (recomendado 20+)
- **Supabase CLI** — instalação separada (não é dependência npm):
  ```bash
  # macOS
  brew install supabase/tap/supabase
  # ou via npx (sem instalar): npx supabase <comando>
  ```
- Uma conta no [Supabase](https://supabase.com) (ou Docker para o stack local).

---

## Configuração

1. **Instale as dependências**
   ```bash
   npm install
   ```

2. **Variáveis de ambiente** — copie o exemplo e preencha:
   ```bash
   cp .env.example .env.local
   ```
   | Variável | Onde encontrar |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | (opcional) só para scripts admin/seed |
   | `NEXT_PUBLIC_APP_URL` | URL pública (ex.: `http://localhost:3000`) |
   | `NEXT_PUBLIC_APP_NAME` | Nome da marca (padrão `ArenaMatch`) |

3. **Banco de dados** — escolha um caminho:

   **A) Supabase local (recomendado para desenvolvimento)**
   ```bash
   supabase start          # sobe Postgres + Auth + Storage locais
   supabase db reset       # aplica migrações + seed de demonstração
   ```
   O `supabase start` imprime a URL e a anon key locais — use-as no `.env.local`.

   **B) Projeto Supabase na nuvem**
   ```bash
   supabase link --project-ref SEU_REF
   supabase db push        # aplica as migrações
   # Seed opcional (cuidado em produção):
   psql "$SUPABASE_DB_URL" -f supabase/seed.sql
   ```

4. **Rode o app**
   ```bash
   npm run dev
   # http://localhost:3000
   ```

### Contas de demonstração

Após o seed, todas as contas fictícias usam a senha **`demo1234`**. Exemplos:

| Papel | E-mail |
| --- | --- |
| Atleta | `marina@demo.arenamatch.com` |
| Empresa | `contato@nutriforce.demo.arenamatch.com` |
| Gestor | `gestor1@demo.arenamatch.com` |
| Admin | `admin@demo.arenamatch.com` |

> As contas são criadas com e-mail confirmado. Para criar um admin manualmente,
> veja [`docs/SECURITY.md`](docs/SECURITY.md).

---

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Checagem de tipos (tsc) |
| `npm run format` | Prettier (escrita) |
| `npm run test` | Testes unitários (Vitest) |
| `npm run test:e2e` | Testes end-to-end (Playwright) |
| `npm run db:types` | Gera tipos TypeScript do banco |

---

## Migrações e seed

As migrações ficam em `supabase/migrations/` (ordem numérica) e o seed em
`supabase/seed.sql`. Para recriar o banco do zero localmente:

```bash
supabase db reset
```

Detalhes do schema, diagrama e políticas em [`docs/DATABASE.md`](docs/DATABASE.md).

---

## Deploy na Vercel

1. Importe o repositório na Vercel.
2. Configure as variáveis de ambiente (as mesmas do `.env.local`, com a
   `NEXT_PUBLIC_APP_URL` apontando para o domínio de produção).
3. No Supabase → Authentication → URL Configuration, adicione o domínio da
   Vercel em **Site URL** e **Redirect URLs** (`.../auth/callback`).
4. Deploy. O build roda `next build` automaticamente.

---

## Documentação

- [`docs/PRODUCT.md`](docs/PRODUCT.md) — produto, premissas, páginas e fluxos
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — arquitetura, estrutura, fases
- [`docs/DATABASE.md`](docs/DATABASE.md) — modelo de dados, diagrama, RLS
- [`docs/SECURITY.md`](docs/SECURITY.md) — segurança, RLS, LGPD
- [`docs/MONETIZATION.md`](docs/MONETIZATION.md) — planos e entitlements
- [`docs/DEPLOY.md`](docs/DEPLOY.md) — publicar (Supabase dedicado + Vercel)
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — próximos passos e limitações do MVP

---

## Status do MVP

**MVP completo (Fases 1–6).** Fundação, perfis e onboarding, projetos e
oportunidades, match/conexões/mensagens/pipeline, contrapartidas e painel
administrativo — além do endurecimento de segurança, acessibilidade e o guia de
deploy. Histórico e limitações em [`docs/ROADMAP.md`](docs/ROADMAP.md); publicação
em [`docs/DEPLOY.md`](docs/DEPLOY.md).
