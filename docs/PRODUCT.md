# Produto — ArenaMatch

## 1. Resumo do produto

O ArenaMatch é uma plataforma web responsiva que conecta **atletas de alto
rendimento**, **projetos esportivos** e **empresas** interessadas em patrocínio.
Funciona como uma combinação de:

- **Marketplace** de patrocínios esportivos;
- **Rede profissional** de atletas e empresas;
- **CRM** de oportunidades de patrocínio (pipeline);
- **Sistema de recomendação (match)** por regras;
- **Gestão de contrapartidas**.

Atende dois modelos de investimento: **direto** (recursos próprios de marketing)
e **incentivado** (projetos aprovados em mecanismos de incentivo ao esporte).

## 2. Objetivo desta versão (MVP)

Entregar um MVP funcional, navegável e responsivo, preparado para evoluir. O MVP
cobre cadastro e perfis (atleta, empresa, gestor), descoberta com busca/filtros,
oportunidades, demonstração de interesse, conexões, mensagens, negociações em
pipeline, contrapartidas, favoritos, notificações, planos/permissões, painel
administrativo e um sistema inicial de compatibilidade.

**Fora do escopo do MVP** (mas previstos arquiteturalmente): transferência de
dinheiro, escrow, emissão fiscal, prestação de contas jurídica, assinatura
eletrônica, app nativo, integrações com órgãos públicos e conformidade jurídica
automática.

## 3. Premissas adotadas

1. **Identidade** — cada usuário tem 1 registro em `auth.users` + 1 `profiles`
   (1:1) com um `role`. Tabelas específicas por papel (`athlete_profiles`,
   `company_profiles`, `manager_profiles`). **Um papel ativo por conta** no MVP;
   o schema não impede multi-papel no futuro.
2. **Valores monetários** em **centavos** (bigint). Datas e fuso em
   `America/Sao_Paulo`. Idioma PT-BR, com i18n preparado.
3. **Match v1** por regras, com pesos configuráveis e fórmula documentada
   (ver [`ARCHITECTURE.md`](ARCHITECTURE.md) e `src/lib/matching/engine.ts`).
4. **Marca configurável** via `NEXT_PUBLIC_APP_NAME` e `src/config/app.ts`.
5. **Sem gateway de pagamento** — planos e permissões existem como dados +
   camada de *entitlements* aplicada no servidor e refletida no front.
6. **Documentos privados** apenas via Storage com URLs assinadas; RLS em tudo.
7. **Conta ativa por padrão** após cadastro (o admin pode suspender). A
   verificação de perfil é um fluxo à parte (selo de verificado).
8. **Dados demonstrativos** são sempre marcados como fictícios; nenhum número
   real de usuários/investimentos é inventado.

## 4. Tipos de usuário

- **Atleta** — perfil profissional, conquistas, calendário, contrapartidas,
  candidaturas, conexões, mensagens.
- **Empresa** — perfil institucional, busca, oportunidades, favoritos, pipeline,
  contrapartidas.
- **Gestor de projeto** — cadastro e gestão de projetos, metas de captação,
  vínculo de atletas, manifestações de interesse.
- **Administrador** — moderação, verificações, denúncias, planos, métricas,
  auditoria, configurações.

## 5. Mapa de páginas

### Públicas
`/` (home) · `/como-funciona` · `/para-atletas` · `/para-empresas` ·
`/para-gestores` · `/explorar/atletas` · `/explorar/projetos` ·
`/explorar/oportunidades` · `/explorar/empresas` · `/planos` · `/sobre` ·
`/contato` · `/termos` · `/privacidade`

### Autenticação
`/entrar` · `/cadastro` · `/recuperar-senha` · `/redefinir-senha` ·
`/auth/callback`

### Área autenticada (`/painel`)
`/painel` (dashboard por papel) · `/painel/perfil` · `/painel/oportunidades` ·
`/painel/pipeline` · `/painel/candidaturas` · `/painel/projetos` ·
`/painel/conexoes` · `/painel/mensagens` · `/painel/contrapartidas` ·
`/painel/favoritos` · `/painel/notificacoes` · `/painel/planos` ·
`/painel/configuracoes`

### Administração (`/admin`)
`/admin` (dashboard) · `/admin/usuarios` · `/admin/verificacoes` ·
`/admin/projetos` · `/admin/oportunidades` · `/admin/denuncias` ·
`/admin/planos` · `/admin/auditoria` · `/admin/configuracoes`

> Rotas de fases futuras usam páginas *placeholder* ("Em construção") via
> catch-all (`/painel/[...slug]`, `/admin/[...slug]`) para evitar links
> quebrados enquanto o MVP evolui.

## 6. Fluxos de usuário principais

1. **Atleta** se cadastra → completa o perfil → encontra oportunidade →
   candidata-se.
2. **Empresa** se cadastra → publica oportunidade → encontra atleta → demonstra
   interesse.
3. **Conexão** — interesse aceito cria conexão → conversa é iniciada.
4. **Negociação** — empresa cria negociação → move o card no pipeline.
5. **Verificação** — usuário envia documentos → administrador verifica.

## 7. Riscos técnicos

- **RLS complexa**: políticas com subconsultas precisam de teste cuidadoso para
  não vazar dados nem bloquear acessos legítimos. Mitigado por funções
  `SECURITY DEFINER` (`is_admin`, `owns_company`, etc.) e testes.
- **Match escalável**: o motor por regras é O(n) por par; para grandes volumes
  será necessário pré-cálculo/índices (fase futura).
- **Mensageria em tempo real**: o MVP usa leitura sob demanda; realtime
  (Supabase Realtime) entra em fase posterior.
- **Uploads/URLs assinadas**: garantir expiração e caminhos por usuário.
- **Consistência de valores captados**: `raised_cents` é denormalizado; manter
  sincronizado com `project_funding` (trigger/rotina — fase futura).

## 8. Decisões que precisam de validação do negócio

1. **Pesos do match** (modalidade 25, região 20, faixa 15, tipo 10, público 10,
   contrapartidas 10, categoria 5, disponibilidade 5). Ajustar conforme
   estratégia comercial.
2. **Preços dos planos** (valores atuais são ilustrativos).
3. **Limites por plano** (candidaturas, favoritos, oportunidades, contatos).
4. **Política de aprovação de cadastro** (ativo por padrão vs. moderação prévia).
5. **Campos obrigatórios no onboarding** de cada papel.
6. **Nome definitivo do produto** (ArenaMatch é provisório e configurável).
