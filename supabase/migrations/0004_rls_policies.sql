-- =========================================================================
-- 0004 — Row Level Security (RLS)
-- =========================================================================
-- Princípio de menor privilégio. Tabelas de descoberta têm leitura pública;
-- dados sensíveis (documentos, mensagens, favoritos, negociações) são
-- restritos ao dono, às partes envolvidas e aos administradores.
-- =========================================================================

-- Habilita RLS em todas as tabelas do schema public.
do $$
declare t text;
begin
  for t in
    select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end;
$$;

-- ============================ IDENTIDADE ==================================
create policy "profiles_select_public" on profiles for select using (true);
create policy "profiles_insert_self" on profiles for insert with check (id = auth.uid());
create policy "profiles_update_self_or_admin" on profiles for update
  using (id = auth.uid() or is_admin()) with check (id = auth.uid() or is_admin());

-- Perfis por papel: leitura pública, escrita pelo dono/admin.
create policy "athlete_profiles_select" on athlete_profiles for select using (true);
create policy "athlete_profiles_write" on athlete_profiles for all
  using (profile_id = auth.uid() or is_admin())
  with check (profile_id = auth.uid() or is_admin());

create policy "company_profiles_select" on company_profiles for select using (true);
create policy "company_profiles_write" on company_profiles for all
  using (profile_id = auth.uid() or is_admin())
  with check (profile_id = auth.uid() or is_admin());

create policy "manager_profiles_select" on manager_profiles for select using (true);
create policy "manager_profiles_write" on manager_profiles for all
  using (profile_id = auth.uid() or is_admin())
  with check (profile_id = auth.uid() or is_admin());

create policy "company_members_select" on company_members for select
  using (owns_company(company_profile_id) or profile_id = auth.uid() or is_admin());
create policy "company_members_write" on company_members for all
  using (owns_company(company_profile_id) or is_admin())
  with check (owns_company(company_profile_id) or is_admin());

-- ============================ CATÁLOGO ===================================
create policy "sports_select" on sports for select using (true);
create policy "sports_admin" on sports for all using (is_admin()) with check (is_admin());
create policy "sport_categories_select" on sport_categories for select using (true);
create policy "sport_categories_admin" on sport_categories for all using (is_admin()) with check (is_admin());
create policy "benefits_select" on benefits for select using (true);
create policy "benefits_admin" on benefits for all using (is_admin()) with check (is_admin());
create policy "plans_select" on plans for select using (true);
create policy "plans_admin" on plans for all using (is_admin()) with check (is_admin());
create policy "permissions_select" on permissions for select using (true);
create policy "permissions_admin" on permissions for all using (is_admin()) with check (is_admin());

-- ======================= DOMÍNIO DO ATLETA ===============================
-- Helper inline: dono de um athlete_profile.
create policy "achievements_select" on achievements for select using (true);
create policy "achievements_write" on achievements for all
  using (exists (select 1 from athlete_profiles a where a.id = athlete_profile_id and a.profile_id = auth.uid()) or is_admin())
  with check (exists (select 1 from athlete_profiles a where a.id = athlete_profile_id and a.profile_id = auth.uid()) or is_admin());

create policy "competitions_select" on competitions for select using (true);
create policy "competitions_write" on competitions for all
  using (exists (select 1 from athlete_profiles a where a.id = athlete_profile_id and a.profile_id = auth.uid()) or is_admin())
  with check (exists (select 1 from athlete_profiles a where a.id = athlete_profile_id and a.profile_id = auth.uid()) or is_admin());

create policy "sponsorship_needs_select" on sponsorship_needs for select using (true);
create policy "sponsorship_needs_write" on sponsorship_needs for all
  using (exists (select 1 from athlete_profiles a where a.id = athlete_profile_id and a.profile_id = auth.uid()) or is_admin())
  with check (exists (select 1 from athlete_profiles a where a.id = athlete_profile_id and a.profile_id = auth.uid()) or is_admin());

create policy "athlete_benefits_select" on athlete_benefits for select using (true);
create policy "athlete_benefits_write" on athlete_benefits for all
  using (exists (select 1 from athlete_profiles a where a.id = athlete_profile_id and a.profile_id = auth.uid()) or is_admin())
  with check (exists (select 1 from athlete_profiles a where a.id = athlete_profile_id and a.profile_id = auth.uid()) or is_admin());

create policy "social_accounts_select" on social_accounts for select using (true);
create policy "social_accounts_write" on social_accounts for all
  using (profile_id = auth.uid() or is_admin())
  with check (profile_id = auth.uid() or is_admin());

-- ============================ PROJETOS ===================================
create policy "projects_select" on projects for select using (true);
create policy "projects_write" on projects for all
  using (exists (select 1 from manager_profiles m where m.id = manager_profile_id and m.profile_id = auth.uid()) or is_admin())
  with check (exists (select 1 from manager_profiles m where m.id = manager_profile_id and m.profile_id = auth.uid()) or is_admin());

create policy "project_athletes_select" on project_athletes for select using (true);
create policy "project_athletes_write" on project_athletes for all
  using (exists (select 1 from projects p join manager_profiles m on m.id = p.manager_profile_id
                 where p.id = project_id and m.profile_id = auth.uid()) or is_admin())
  with check (exists (select 1 from projects p join manager_profiles m on m.id = p.manager_profile_id
                 where p.id = project_id and m.profile_id = auth.uid()) or is_admin());

-- Documentos de projeto são PRIVADOS (dono + admin).
create policy "project_documents_access" on project_documents for all
  using (exists (select 1 from projects p join manager_profiles m on m.id = p.manager_profile_id
                 where p.id = project_id and m.profile_id = auth.uid()) or is_admin())
  with check (exists (select 1 from projects p join manager_profiles m on m.id = p.manager_profile_id
                 where p.id = project_id and m.profile_id = auth.uid()) or is_admin());

create policy "project_funding_select" on project_funding for select using (true);
create policy "project_funding_write" on project_funding for all
  using (exists (select 1 from projects p join manager_profiles m on m.id = p.manager_profile_id
                 where p.id = project_id and m.profile_id = auth.uid()) or is_admin())
  with check (exists (select 1 from projects p join manager_profiles m on m.id = p.manager_profile_id
                 where p.id = project_id and m.profile_id = auth.uid()) or is_admin());

-- ========================= OPORTUNIDADES =================================
create policy "opportunities_select" on opportunities for select
  using (status <> 'draft' or owns_company(company_profile_id) or is_admin());
create policy "opportunities_write" on opportunities for all
  using (owns_company(company_profile_id) or is_admin())
  with check (owns_company(company_profile_id) or is_admin());

create policy "opportunity_sports_select" on opportunity_sports for select using (true);
create policy "opportunity_sports_write" on opportunity_sports for all
  using (exists (select 1 from opportunities o where o.id = opportunity_id and owns_company(o.company_profile_id)) or is_admin())
  with check (exists (select 1 from opportunities o where o.id = opportunity_id and owns_company(o.company_profile_id)) or is_admin());

create policy "applications_select" on applications for select
  using (applicant_profile_id = auth.uid()
         or exists (select 1 from opportunities o where o.id = opportunity_id and owns_company(o.company_profile_id))
         or is_admin());
create policy "applications_insert" on applications for insert
  with check (applicant_profile_id = auth.uid());
create policy "applications_update" on applications for update
  using (applicant_profile_id = auth.uid()
         or exists (select 1 from opportunities o where o.id = opportunity_id and owns_company(o.company_profile_id))
         or is_admin());

-- ========================= ENGAJAMENTO ===================================
create policy "favorites_all_owner" on favorites for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "connection_requests_select" on connection_requests for select
  using (requester_profile_id = auth.uid() or target_profile_id = auth.uid() or is_admin());
create policy "connection_requests_insert" on connection_requests for insert
  with check (requester_profile_id = auth.uid());
create policy "connection_requests_update" on connection_requests for update
  using (requester_profile_id = auth.uid() or target_profile_id = auth.uid() or is_admin());

create policy "connections_select" on connections for select
  using (profile_a = auth.uid() or profile_b = auth.uid() or is_admin());
create policy "connections_insert" on connections for insert
  with check (profile_a = auth.uid() or profile_b = auth.uid() or is_admin());

create policy "conversations_select" on conversations for select
  using (is_conversation_member(id) or is_admin());
create policy "conversations_insert" on conversations for insert with check (auth.uid() is not null);

create policy "conversation_members_select" on conversation_members for select
  using (is_conversation_member(conversation_id) or is_admin());
create policy "conversation_members_insert" on conversation_members for insert
  with check (profile_id = auth.uid() or is_conversation_member(conversation_id) or is_admin());

create policy "messages_select" on messages for select
  using (is_conversation_member(conversation_id) or is_admin());
create policy "messages_insert" on messages for insert
  with check (sender_profile_id = auth.uid() and is_conversation_member(conversation_id));
create policy "messages_update_read" on messages for update
  using (is_conversation_member(conversation_id));

-- ======================= NEGOCIAÇÕES (CRM) ===============================
create policy "deals_select" on deals for select
  using (owns_company(company_profile_id) or counterpart_profile_id = auth.uid() or is_admin());
create policy "deals_write" on deals for all
  using (owns_company(company_profile_id) or is_admin())
  with check (owns_company(company_profile_id) or is_admin());

create policy "deal_notes_access" on deal_notes for all
  using (exists (select 1 from deals d where d.id = deal_id and (owns_company(d.company_profile_id) or is_admin())))
  with check (exists (select 1 from deals d where d.id = deal_id and (owns_company(d.company_profile_id) or is_admin())));

create policy "deal_documents_access" on deal_documents for all
  using (exists (select 1 from deals d where d.id = deal_id and (owns_company(d.company_profile_id) or is_admin())))
  with check (exists (select 1 from deals d where d.id = deal_id and (owns_company(d.company_profile_id) or is_admin())));

create policy "deliverables_select" on deliverables for select
  using (exists (select 1 from deals d where d.id = deal_id
                 and (owns_company(d.company_profile_id) or d.counterpart_profile_id = auth.uid() or is_admin())));
create policy "deliverables_write" on deliverables for all
  using (exists (select 1 from deals d where d.id = deal_id and (owns_company(d.company_profile_id) or is_admin()))
         or responsible_profile_id = auth.uid())
  with check (exists (select 1 from deals d where d.id = deal_id and (owns_company(d.company_profile_id) or is_admin()))
         or responsible_profile_id = auth.uid());

create policy "deliverable_evidence_access" on deliverable_evidence for all
  using (exists (select 1 from deliverables dl join deals d on d.id = dl.deal_id
                 where dl.id = deliverable_id
                 and (owns_company(d.company_profile_id) or d.counterpart_profile_id = auth.uid() or is_admin())))
  with check (exists (select 1 from deliverables dl join deals d on d.id = dl.deal_id
                 where dl.id = deliverable_id
                 and (owns_company(d.company_profile_id) or d.counterpart_profile_id = auth.uid() or is_admin())));

-- ============================ PLATAFORMA =================================
create policy "subscriptions_select" on subscriptions for select
  using (profile_id = auth.uid() or is_admin());
create policy "subscriptions_admin_write" on subscriptions for all
  using (is_admin()) with check (is_admin());

create policy "notifications_select" on notifications for select using (profile_id = auth.uid() or is_admin());
create policy "notifications_update" on notifications for update using (profile_id = auth.uid());
-- Qualquer usuário autenticado pode gerar notificações (criadas apenas por
-- fluxos controlados do servidor: interesse, aceite, mensagem, etc.).
-- Endurecer no futuro via função SECURITY DEFINER dedicada.
create policy "notifications_insert" on notifications for insert
  with check (auth.uid() is not null);

create policy "verification_requests_select" on verification_requests for select
  using (profile_id = auth.uid() or is_admin());
create policy "verification_requests_insert" on verification_requests for insert
  with check (profile_id = auth.uid());
create policy "verification_requests_update" on verification_requests for update
  using (is_admin()) with check (is_admin());

create policy "verification_documents_access" on verification_documents for all
  using (exists (select 1 from verification_requests r where r.id = verification_request_id
                 and (r.profile_id = auth.uid() or is_admin())))
  with check (exists (select 1 from verification_requests r where r.id = verification_request_id
                 and (r.profile_id = auth.uid() or is_admin())));

create policy "reports_select" on reports for select using (reporter_profile_id = auth.uid() or is_admin());
create policy "reports_insert" on reports for insert with check (reporter_profile_id = auth.uid());
create policy "reports_update" on reports for update using (is_admin()) with check (is_admin());

create policy "audit_logs_admin" on audit_logs for select using (is_admin());
create policy "audit_logs_insert" on audit_logs for insert with check (is_admin() or actor_profile_id = auth.uid());

create policy "terms_versions_select" on terms_versions for select using (true);
create policy "terms_versions_admin" on terms_versions for all using (is_admin()) with check (is_admin());

create policy "terms_acceptances_select" on terms_acceptances for select using (profile_id = auth.uid() or is_admin());
create policy "terms_acceptances_insert" on terms_acceptances for insert with check (profile_id = auth.uid());
