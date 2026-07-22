-- =========================================================================
-- 0006 — Dados de referência (determinísticos)
-- =========================================================================
-- Modalidades, contrapartidas, planos, entitlements e termos.
-- Reexecutável (idempotente) via ON CONFLICT.
-- =========================================================================

-- Modalidades -------------------------------------------------------------
insert into sports (slug, name, is_paralympic) values
  ('atletismo', 'Atletismo', false),
  ('natacao', 'Natação', false),
  ('judo', 'Judô', false),
  ('ciclismo', 'Ciclismo', false),
  ('ginastica', 'Ginástica', false),
  ('volei', 'Vôlei', false),
  ('surfe', 'Surfe', false),
  ('skate', 'Skate', false),
  ('triatlo', 'Triatlo', false),
  ('basquete', 'Basquete', false),
  ('futebol', 'Futebol', false),
  ('tenis', 'Tênis', false),
  ('paratletismo', 'Paratletismo', true),
  ('paranatacao', 'Paranatação', true),
  ('basquete-cadeira', 'Basquete em cadeira de rodas', true)
on conflict (slug) do nothing;

-- Contrapartidas ----------------------------------------------------------
insert into benefits (slug, name) values
  ('social-post', 'Publicações em redes sociais'),
  ('campaign', 'Participação em campanhas'),
  ('image-rights', 'Uso de imagem'),
  ('events', 'Presença em eventos'),
  ('talks', 'Palestras'),
  ('behind-scenes', 'Conteúdo de bastidores'),
  ('uniform-brand', 'Aplicação de marca em uniforme'),
  ('internal-actions', 'Ações internas com colaboradores'),
  ('clinics', 'Clínicas esportivas'),
  ('exclusive-content', 'Produção de conteúdo exclusivo')
on conflict (slug) do nothing;

-- Planos ------------------------------------------------------------------
insert into plans (tier, name, audience, price_cents, features) values
  ('athlete_free', 'Atleta Gratuito', 'athlete', 0,
   '["Perfil básico","Até 5 candidaturas","Até 10 favoritos"]'),
  ('athlete_premium', 'Atleta Premium', 'athlete', 2990,
   '["Perfil destacado","Candidaturas ilimitadas","Estatísticas do perfil","Selo Premium"]'),
  ('company_free', 'Empresa Gratuita', 'company', 0,
   '["Perfil institucional","Busca limitada","1 oportunidade ativa"]'),
  ('company_pro', 'Empresa Profissional', 'company', 49900,
   '["Busca avançada","Oportunidades ilimitadas","Pipeline","Match avançado","Relatórios"]'),
  ('company_corporate', 'Empresa Corporativa', 'company', 149900,
   '["Múltiplos usuários","Dashboard avançado","Relatórios personalizados","Gestão de portfólio"]')
on conflict (tier) do nothing;

-- Entitlements (limites por plano) ----------------------------------------
-- Espelham src/config/plans.ts. null = ilimitado.
insert into permissions (plan_tier, key, value) values
  ('athlete_free', 'maxApplications', '5'),
  ('athlete_free', 'maxFavorites', '10'),
  ('athlete_free', 'advancedSearch', 'false'),
  ('athlete_premium', 'maxApplications', 'null'),
  ('athlete_premium', 'maxFavorites', 'null'),
  ('athlete_premium', 'advancedSearch', 'true'),
  ('athlete_premium', 'profileAnalytics', 'true'),
  ('company_free', 'maxActiveOpportunities', '1'),
  ('company_free', 'maxContactsPerMonth', '10'),
  ('company_free', 'advancedSearch', 'false'),
  ('company_pro', 'maxActiveOpportunities', 'null'),
  ('company_pro', 'pipeline', 'true'),
  ('company_pro', 'advancedSearch', 'true'),
  ('company_pro', 'reports', 'true'),
  ('company_corporate', 'maxTeamMembers', '25'),
  ('company_corporate', 'pipeline', 'true'),
  ('company_corporate', 'reports', 'true')
on conflict (plan_tier, key) do nothing;

-- Termos e privacidade (versão inicial) -----------------------------------
insert into terms_versions (version, kind, content) values
  ('1.0', 'terms', 'Termos de uso — versão demonstrativa do MVP.'),
  ('1.0', 'privacy', 'Política de privacidade — versão demonstrativa do MVP.')
on conflict (version, kind) do nothing;
