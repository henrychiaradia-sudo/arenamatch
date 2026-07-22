# Modelo de dados — ArenaMatch

PostgreSQL (Supabase). IDs em **UUID**, timestamps `created_at`/`updated_at`
(trigger automático) e `deleted_at` (soft delete) onde aplicável. Valores
monetários em **centavos** (bigint). Enums espelhados em `src/types/enums.ts`.

Migrações em `supabase/migrations/`:

| Arquivo | Conteúdo |
| --- | --- |
| `0001_extensions_and_enums.sql` | extensões + tipos ENUM |
| `0002_tables.sql` | todas as tabelas, índices, FKs |
| `0003_functions_and_triggers.sql` | `updated_at`, `handle_new_user`, helpers |
| `0004_rls_policies.sql` | RLS + políticas |
| `0005_storage.sql` | buckets e políticas de Storage |
| `0006_reference_data.sql` | modalidades, contrapartidas, planos, termos |

## Diagrama (textual)

```
auth.users 1───1 profiles
                   │ 1
     ┌─────────────┼───────────────┬───────────────┐
     │1            │1              │1               │
athlete_profiles company_profiles manager_profiles │
     │             │                │               │
     │             │ 1              │ 1             (favorites, notifications,
     │             ▼                ▼                subscriptions, terms_acceptances,
     │        company_members   projects ──1:N── project_athletes ─N:1─ athlete_profiles
     │                              │             project_documents (privado)
     │ 1:N                          │             project_funding
     ├─ achievements                ▼
     ├─ competitions            opportunities ──1:N── opportunity_sports ─N:1─ sports
     ├─ sponsorship_needs           │
     ├─ athlete_benefits ─N:1─ benefits
     └─ social_accounts             ▼
                                applications (atleta/gestor → oportunidade)

connection_requests ──▶ connections ──▶ conversations ──1:N── conversation_members
                                                │
                                                ▼
                                             messages

deals ──1:N── deal_notes
   │   └─1:N── deal_documents (privado)
   └───1:N── deliverables ──1:N── deliverable_evidence

Plataforma: plans · permissions · subscriptions · notifications ·
verification_requests ─1:N─ verification_documents · reports · audit_logs ·
terms_versions ─1:N─ terms_acceptances

Catálogo: sports ─1:N─ sport_categories · benefits
```

## Tabelas (40)

**Identidade**: `profiles`, `athlete_profiles`, `company_profiles`,
`manager_profiles`, `company_members`.

**Catálogo**: `sports`, `sport_categories`, `benefits`.

**Domínio do atleta**: `achievements`, `competitions`, `social_accounts`,
`sponsorship_needs`, `athlete_benefits`.

**Projetos**: `projects`, `project_athletes`, `project_documents`,
`project_funding`.

**Oportunidades**: `opportunities`, `opportunity_sports`, `applications`.

**Engajamento**: `favorites`, `connection_requests`, `connections`,
`conversations`, `conversation_members`, `messages`.

**Negociações (CRM)**: `deals`, `deal_notes`, `deal_documents`, `deliverables`,
`deliverable_evidence`.

**Plataforma**: `plans`, `permissions`, `subscriptions`, `notifications`,
`verification_requests`, `verification_documents`, `reports`, `audit_logs`,
`terms_versions`, `terms_acceptances`.

## Enums principais

`user_role`, `account_status`, `verification_status`, `investment_model`,
`funding_model`, `project_status`, `opportunity_status`, `application_status`,
`connection_request_status`, `deal_status`, `deliverable_status`, `plan_tier`,
`notification_type`, `favoritable_type`, `report_status`, `company_member_role`.

## Row Level Security (resumo)

RLS **habilitada em todas as tabelas**. Padrões:

- **Descoberta pública** (leitura): `profiles`, `*_profiles`, `projects`,
  `opportunities` (exceto rascunhos), catálogo e `plans`.
- **Escrita pelo dono**: cada usuário só altera o próprio perfil e seus dados
  filhos (via subconsulta ao dono do `athlete_profile`/`manager_profile` ou
  `owns_company()`).
- **Privado às partes**: `favorites`, `connection_requests`, `connections`,
  `conversations`/`messages` (apenas membros), `deals` e filhos (empresa +
  contraparte), `notifications`, documentos de verificação/projeto.
- **Somente admin**: escrita de catálogo/planos, `audit_logs`, revisão de
  verificações e denúncias.

Funções auxiliares `SECURITY DEFINER` evitam recursão de RLS:
`is_admin()`, `auth_role()`, `are_connected()`, `owns_company()`,
`is_conversation_member()`.

## Storage

Buckets: `avatars`, `covers` (públicos); `documents`, `evidence` (**privados**,
acesso só via URL assinada). Convenção de caminho: `"<user_id>/arquivo"`. As
políticas restringem upload/edição à pasta do próprio usuário.

## Gerar tipos TypeScript

```bash
npm run db:types   # supabase gen types typescript --local > src/types/database.ts
```
