# Arquitetura — ArenaMatch

## Visão geral

Aplicação **Next.js (App Router)** full-stack, com **Supabase** como backend
(PostgreSQL + Auth + Storage). A renderização usa **Server Components** por
padrão; **Client Components** apenas onde há interatividade (formulários, menus,
tema). A segurança é garantida no banco via **Row Level Security (RLS)** — o
cliente nunca é a fonte da verdade.

```
Navegador ──▶ Next.js (App Router)
                 │  Server Components / Server Actions ──▶ Supabase (RLS)
                 │  Client Components (RHF, TanStack Query)
                 └─ middleware.ts (renova sessão + protege rotas)
```

## Camadas

- **`src/app`** — rotas (grupos `(marketing)`, `(auth)`, `(app)`), layouts.
- **`src/components`** — UI (`ui/` = design system), layout, providers, marca.
- **`src/features`** — código por domínio (auth, dashboard, billing, explore…).
- **`src/lib`** — utilidades, acesso a dados (`supabase/`), sessão/permissões
  (`auth/`), motor de match (`matching/`), formatação (`format.ts`).
- **`src/config`** — configuração de marca, navegação e planos.
- **`src/schemas`** — validação com Zod (cliente + servidor).
- **`src/types`** — enums do domínio, tipos de view e tipos do banco.
- **`supabase/`** — migrações, seed, configuração do CLI.

## Estrutura de pastas

```
src/
├─ app/
│  ├─ (marketing)/         # home, institucionais, explorar
│  ├─ (auth)/              # entrar, cadastro, senhas
│  ├─ (app)/               # painel + admin (área autenticada)
│  ├─ auth/callback/       # route handler de sessão
│  ├─ layout.tsx · globals.css · not-found.tsx
├─ components/  (ui, layout, providers, brand, marketing, shared)
├─ features/    (auth, dashboard, billing, explore)
├─ lib/         (supabase, auth, matching, format, utils, constants)
├─ config/      (app, nav, plans)
├─ schemas/ · types/ · middleware.ts
supabase/
├─ migrations/  (0001…0006)  · seed.sql · config.toml
docs/
```

Organização por **domínio** (não por tipo de arquivo) nos diretórios `features/`
e `lib/`, facilitando a evolução fase a fase.

## Autenticação e sessão

- **Supabase Auth** (e-mail/senha). No signup, `role` e `full_name` vão em
  `raw_user_meta_data`; um **trigger** (`handle_new_user`) cria `profiles`,
  a assinatura padrão e o perfil específico do papel.
- **`middleware.ts`** renova a sessão a cada request e protege `/painel` e
  `/admin`; usuários logados são redirecionados para fora das rotas de auth.
- **`src/lib/auth/session.ts`** expõe `getSession`, `requireSession`,
  `requireRole`, `requireAdmin` (usadas nos Server Components/layouts).

## Motor de match (v1)

Baseado em **regras ponderadas** (sem IA). Para cada critério há um peso e um
booleano "atende"; o score é:

```
score = round( Σ(peso_i · atende_i) / Σ(peso_i) · 100 )
```

Cada critério vira um "motivo" exibível (ex.: "Modalidade compatível"). Os
pesos vivem em `src/lib/matching/engine.ts` e são facilmente ajustáveis. A
assinatura de retorno (`MatchResult`) foi desenhada para permitir trocar o
cálculo por um modelo de ML no futuro sem alterar a UI.

## Entitlements (planos)

Os limites por plano ficam em `src/config/plans.ts` (fonte para o front) e na
tabela `permissions` (fonte para o servidor). Funções como `canApply`,
`canCreateOpportunity` e `canFavorite` refletem esses limites na UI; a aplicação
efetiva ocorre no servidor.

## Plano de desenvolvimento por fases

| Fase | Escopo | Status |
| --- | --- | --- |
| **1** | Config, design system, banco, auth, permissões, layout, navegação | ✅ concluída |
| **2** | Perfis, onboarding em etapas, uploads, páginas públicas | ▶ próxima |
| **3** | Projetos, oportunidades, busca, filtros, favoritos | pendente |
| **4** | Match, conexões, mensagens, negociações | pendente |
| **5** | Contrapartidas, notificações, administração, planos | pendente |
| **6** | Testes, segurança, performance, acessibilidade, deploy | contínua |

Ao final de cada fase: `lint` + `typecheck` + `test` + `build`, doc atualizada e
resumo das mudanças. Não avançar deixando erros críticos.

## Qualidade

- **TypeScript estrito** (`noUncheckedIndexedAccess`, etc.), ESLint, Prettier.
- Componentes pequenos, separação de responsabilidades, camada de acesso a
  dados isolada em `src/lib/supabase`.
- Testes unitários (Vitest) e E2E (Playwright) dos fluxos principais.
