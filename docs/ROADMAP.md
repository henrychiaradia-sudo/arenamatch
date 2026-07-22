# Roadmap — ArenaMatch

## Limitações conhecidas do MVP

- Sem movimentação financeira, escrow, emissão fiscal ou prestação de contas.
- Sem assinatura eletrônica de contratos.
- Sem app móvel nativo (a web é responsiva).
- Sem integrações com bases governamentais / leis de incentivo.
- Match por **regras** (sem IA).
- Mensageria sob demanda (sem tempo real ainda).
- Cálculos fiscais e conformidade jurídica **não** são automáticos.

## Entregue (Fases 1–5)

- **Fase 1** — Configuração, design system, banco completo com RLS, autenticação
  e papéis, permissões/entitlements, layout, navegação, páginas públicas e
  descoberta; motor de match documentado.
- **Fase 2** — Edição de perfil por papel, uploads (Storage), onboarding em
  etapas e páginas públicas de perfil (atleta/empresa).
- **Fase 3** — CRUD de projetos e oportunidades, candidaturas, favoritos e
  ordenação/paginação nas buscas.
- **Fase 4** — Match aplicado, conexões (interesse/aceite), mensagens/chat,
  pipeline de negociações (CRM) e central de notificações.
- **Fase 5** — Contrapartidas (entregáveis com evidências e aprovação), painel
  administrativo (usuários, verificações, denúncias, planos, auditoria),
  solicitação de verificação, denúncias e preparo de e-mail.

Falta a **Fase 6** (endurecimento): testes E2E ampliados, revisão de segurança,
performance, acessibilidade e publicação.

## Próximas fases (resumo)

- **Fase 2** — Perfis completos, onboarding em etapas, uploads (Storage),
  páginas públicas de perfil (atleta/empresa/projeto).
- **Fase 3** — Projetos, oportunidades, busca e filtros avançados, favoritos.
- **Fase 4** — Match aplicado, conexões, mensagens, negociações (pipeline).
- **Fase 5** — Contrapartidas, notificações, painel administrativo, planos.
- **Fase 6** — Testes, segurança, performance, acessibilidade, deploy.

## Backlog futuro (documentado, não implementado)

Pagamentos e comissão · escrow · contratos eletrônicos · assinaturas pagas ·
integração com gateways · app móvel · integração com redes sociais · métricas
automáticas de audiência · **IA para match** · geração automática de mídia kit ·
geração de propostas · calculadora de incentivo fiscal · integração com bases
governamentais · prestação de contas · marketplace de fornecedores · relatórios
de ROI · multiempresa · white label · internacionalização · API pública ·
webhooks · notificações por e-mail · mensageria em tempo real.

## Preparação arquitetural já existente

- Schema e enums cobrindo entidades das fases futuras.
- `MatchResult` desenhado para receber um modelo de ML.
- Marca configurável (white-label) via env.
- i18n preparado (PT-BR como idioma inicial).
- Camada de entitlements pronta para planos pagos.
