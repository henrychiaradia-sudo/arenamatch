# Monetização — ArenaMatch

> Neste MVP **não há cobrança real**. Os planos existem como dados e a camada de
> *entitlements* aplica limites. O gateway de pagamento entra no roadmap.

## Planos

### Atleta

| Plano | Preço (ilustrativo) | Destaques |
| --- | --- | --- |
| **Gratuito** | R$ 0 | Perfil básico, até 5 candidaturas, até 10 favoritos |
| **Premium** | R$ 29,90/mês | Perfil destacado, candidaturas ilimitadas, estatísticas, selo Premium |

### Empresa

| Plano | Preço (ilustrativo) | Destaques |
| --- | --- | --- |
| **Gratuita** | R$ 0 | Perfil, busca limitada, 1 oportunidade ativa |
| **Profissional** | R$ 499/mês | Busca avançada, oportunidades ilimitadas, pipeline, match avançado, relatórios, contrapartidas |
| **Corporativa** | R$ 1.499/mês | Múltiplos usuários, permissões, dashboard avançado, relatórios personalizados, gestão de portfólio |

## Entitlements (limites)

Definidos em `src/config/plans.ts` (front) e na tabela `permissions` (servidor).
`null` = ilimitado.

| Chave | Significado |
| --- | --- |
| `maxApplications` | candidaturas ativas (atleta) |
| `maxFavorites` | favoritos |
| `maxActiveOpportunities` | oportunidades ativas (empresa) |
| `maxContactsPerMonth` | novos contatos/mês |
| `maxTeamMembers` | membros na conta (corporativa) |
| `advancedSearch` · `pipeline` · `advancedMatch` · `profileAnalytics` · `reports` · `deliverablesManagement` | flags de acesso |

Helpers: `canApply`, `canCreateOpportunity`, `canFavorite`, `canUsePipeline`,
`canUseAdvancedSearch` (`src/lib/auth/permissions.ts`).

## Como funciona no MVP

- A página `/planos` (pública) e `/painel/planos` (logado) exibem os planos.
- O botão "Fazer upgrade" mostra um aviso de que o pagamento ainda não está
  ativo (demonstrativo).
- A tabela `subscriptions` guarda a assinatura simulada (padrão por papel).

## Próximos passos (roadmap)

Integração de gateway (Stripe/pagar.me), cobrança recorrente, comissão sobre
patrocínios, faturas e gestão de assinatura no painel. Ver
[`ROADMAP.md`](ROADMAP.md).
