-- =========================================================================
-- SEED — dados de demonstração (fictícios)
-- =========================================================================
-- Executado por `supabase db reset`. Cria usuários de teste (senha: demo1234),
-- atletas, empresas, gestores, projetos, oportunidades, negociações e mais.
-- NÃO use em produção. Nomes, marcas e imagens são fictícios.
-- =========================================================================

-- Função utilitária local para criar um usuário de auth + metadados.
create or replace function public._seed_user(p_email text, p_name text, p_role text)
returns uuid language plpgsql as $$
declare v_id uuid := gen_random_uuid();
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
    p_email, crypt('demo1234', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', p_name, 'role', p_role),
    now(), now(), '', '', '', ''
  );
  return v_id;
end;
$$;

-- ============================ ATLETAS (12) ================================
do $$
declare
  rec record;
  v_id uuid;
  v_sport uuid;
begin
  for rec in select * from (values
    ('Marina Costa','marina','surfe','profissional','Florianópolis','SC',4500000,125000,true,true,false,'{jovem,lifestyle}'),
    ('Rafael Nunes','rafael','paratletismo','paralimpico','Curitiba','PR',3200000,48000,true,true,true,'{inclusao,superacao}'),
    ('Bianca Alves','bianca','ginastica','profissional','São Paulo','SP',2800000,210000,true,false,false,'{jovem,feminino}'),
    ('Diego Martins','diego','ciclismo','profissional','Belo Horizonte','MG',5200000,63000,true,true,false,'{resistencia,saude}'),
    ('Camila Rocha','camila','natacao','olimpico','Rio de Janeiro','RJ',6000000,180000,true,false,false,'{alto-rendimento}'),
    ('Lucas Ferreira','lucas','judo','profissional','Salvador','BA',2500000,42000,true,true,false,'{disciplina}'),
    ('Ana Beatriz','anabeatriz','atletismo','olimpico','São Paulo','SP',5800000,95000,true,false,false,'{velocidade}'),
    ('Pedro Henrique','pedroh','skate','amador','São Paulo','SP',1800000,320000,true,false,false,'{jovem,lifestyle,urbano}'),
    ('Juliana Souza','juliana','volei','profissional','Recife','PE',3000000,88000,true,true,false,'{feminino,equipe}'),
    ('Gabriel Lima','gabriel','triatlo','profissional','Porto Alegre','RS',4200000,37000,true,true,false,'{resistencia}'),
    ('Larissa Dias','larissa','paranatacao','paralimpico','Brasília','DF',3500000,54000,true,true,true,'{inclusao,superacao}'),
    ('Thiago Barros','thiago','basquete-cadeira','paralimpico','Campinas','SP',3300000,29000,true,true,true,'{inclusao,equipe}')
  ) as t(name,handle,sport,category,city,state,need,followers,direct,incentive,para,tags)
  loop
    v_id := public._seed_user(rec.handle || '@demo.arenamatch.com', rec.name, 'athlete');
    select id into v_sport from public.sports where slug = rec.sport;
    update public.athlete_profiles set
      sport_id = v_sport,
      slug = rec.handle,
      category = rec.category,
      city = rec.city,
      state = rec.state,
      bio = rec.name || ' — atleta de ' || rec.sport || ' (perfil demonstrativo).',
      story = 'Trajetória fictícia para demonstração da plataforma.',
      investment_need_cents = rec.need,
      fundraising_goal = 'Temporada 2026',
      followers_total = rec.followers,
      engagement_rate = 3.5,
      estimated_reach = rec.followers * 3,
      accepts_direct = rec.direct,
      accepts_incentive = rec.incentive,
      is_paralympic = rec.para,
      available_for_campaigns = true,
      audience_tags = rec.tags::text[]
    where profile_id = v_id;

    update public.profiles set
      verification_status = case when rec.followers > 100000 then 'verified' else 'not_started' end,
      plan_tier = case when rec.followers > 100000 then 'athlete_premium' else 'athlete_free' end,
      onboarding_completed = true,
      headline = 'Atleta de ' || rec.sport
    where id = v_id;
  end loop;
end;
$$;

-- ============================ EMPRESAS (6) ================================
do $$
declare
  rec record;
  v_id uuid;
begin
  for rec in select * from (values
    ('NutriForce Suplementos','contato@nutriforce','Suplementos e nutrição','large','São Paulo','SP','both',1000000,10000000,'{saude,alto-rendimento}','{SP,RJ,MG}','{surfe,natacao,triatlo}'),
    ('VoltEnergia Bebidas','contato@voltenergia','Alimentos e bebidas','enterprise','Rio de Janeiro','RJ','direct',2000000,20000000,'{jovem,lifestyle}','{RJ,SP}','{skate,surfe}'),
    ('MoveWear Esportes','contato@movewear','Moda e vestuário esportivo','medium','Curitiba','PR','both',500000,5000000,'{feminino,lifestyle}','{PR,SC,RS}','{ginastica,volei}'),
    ('TechFit Apps','contato@techfit','Tecnologia','medium','São Paulo','SP','both',300000,3000000,'{tecnologia,saude}','{SP}','{ciclismo,triatlo,atletismo}'),
    ('BancoAtleta','contato@bancoatleta','Serviços financeiros','enterprise','São Paulo','SP','incentive',5000000,50000000,'{inclusao,impacto}','{SP,MG,BA,PE}','{paratletismo,paranatacao}'),
    ('VidaSaudável Seguros','contato@vidasaudavel','Saúde e bem-estar','large','Belo Horizonte','MG','both',800000,8000000,'{saude,familia}','{MG,SP}','{natacao,judo}')
  ) as t(name,email,segment,size,city,state,model,minc,maxc,obj,states,sports)
  loop
    v_id := public._seed_user(rec.email || '.demo.arenamatch.com', rec.name, 'company');
    update public.company_profiles set
      slug = regexp_replace(lower(rec.name), '[^a-z0-9]+', '-', 'g'),
      legal_name = rec.name || ' Ltda.',
      public_name = rec.name,
      segment = rec.segment,
      size = rec.size,
      city = rec.city,
      state = rec.state,
      description = rec.name || ' — empresa fictícia para demonstração.',
      website = 'https://exemplo.com',
      investment_model = rec.model::investment_model,
      min_investment_cents = rec.minc,
      max_investment_cents = rec.maxc,
      objectives = rec.obj::text[],
      priority_states = rec.states::text[],
      sports_interest = rec.sports::text[],
      audience_tags = rec.obj::text[]
    where profile_id = v_id;

    update public.profiles set
      verification_status = 'verified',
      plan_tier = 'company_pro',
      onboarding_completed = true,
      headline = rec.segment
    where id = v_id;
  end loop;
end;
$$;

-- ============================ GESTORES (3) ================================
do $$
declare rec record; v_id uuid;
begin
  for rec in select * from (values
    ('Instituto Esporte para Todos','gestor1','ONG esportiva'),
    ('Associação Base Olímpica','gestor2','Formação de base'),
    ('Movimento Paradesporto','gestor3','Paradesporto')
  ) as t(name,handle,area)
  loop
    v_id := public._seed_user(rec.handle || '@demo.arenamatch.com', rec.name, 'manager');
    update public.manager_profiles set
      slug = rec.handle,
      is_organization = true,
      org_name = rec.name,
      experience = 'Organização fictícia para demonstração.',
      areas = array[rec.area]
    where profile_id = v_id;
    update public.profiles set onboarding_completed = true, headline = rec.area where id = v_id;
  end loop;
end;
$$;

-- ============================ ADMIN (1) ==================================
select public._seed_user('admin@demo.arenamatch.com', 'Administração ArenaMatch', 'admin');

-- ============================ PROJETOS (8) ===============================
do $$
declare
  rec record; v_sport uuid; m_ids uuid[]; i int := 0;
begin
  select array_agg(id order by created_at) into m_ids from public.manager_profiles;
  for rec in select * from (values
    ('Núcleo de Natação Inclusiva','paranatacao','RJ','Rio de Janeiro','incentive',12000000,7200000,'fundraising',true),
    ('Escolinha de Atletismo Comunitária','atletismo','SP','São Paulo','mixed',8000000,3600000,'fundraising',true),
    ('Time de Vôlei de Base','volei','PE','Recife','direct',15000000,12750000,'partially_funded',true),
    ('Ciclismo para Jovens','ciclismo','MG','Belo Horizonte','incentive',6000000,1800000,'fundraising',true),
    ('Judô nas Escolas','judo','BA','Salvador','incentive',4000000,4000000,'fully_funded',true),
    ('Basquete em Cadeira de Rodas','basquete-cadeira','SP','Campinas','incentive',9000000,2700000,'approved',true),
    ('Formação de Ginastas','ginastica','SP','São Paulo','mixed',7000000,0,'draft',false),
    ('Triatlo Solidário','triatlo','RS','Porto Alegre','direct',5000000,1250000,'fundraising',true)
  ) as t(title,sport,state,city,model,total,raised,status,impact)
  loop
    select id into v_sport from public.sports where slug = rec.sport;
    insert into public.projects (
      slug, title, description, proponent_name, manager_profile_id, sport_id,
      state, city, scope, beneficiaries, objectives, timeline,
      total_cents, raised_cents, funding_model, status, has_social_impact,
      verification_status
    ) values (
      regexp_replace(lower(rec.title), '[^a-z0-9]+', '-', 'g'),
      rec.title,
      rec.title || ' — projeto fictício para demonstração.',
      'Proponente Fictício',
      m_ids[1 + (i % array_length(m_ids, 1))],
      v_sport,
      rec.state, rec.city,
      'Municipal', 'Crianças e jovens', 'Democratizar o acesso ao esporte', '12 meses',
      rec.total, rec.raised, rec.model::funding_model, rec.status::project_status, rec.impact,
      case when rec.status in ('draft') then 'not_started' else 'verified' end
    );
    i := i + 1;
  end loop;
end;
$$;

-- ============================ OPORTUNIDADES (6) ==========================
do $$
declare
  rec record; c_ids uuid[]; i int := 0;
begin
  select array_agg(id order by created_at) into c_ids from public.company_profiles;
  for rec in select * from (values
    ('Embaixadores de Verão','Campanha de verão com atletas de esportes radicais','both',1000000,5000000,'open','{SP,RJ}','{social-post,events}'),
    ('Patrocínio de Alto Rendimento','Apoio a atletas olímpicos','direct',5000000,20000000,'open','{SP,RJ,MG}','{image-rights,campaign}'),
    ('Projetos de Impacto Social','Apoio a projetos incentivados','incentive',3000000,15000000,'open','{SP,BA,PE}','{internal-actions}'),
    ('Coleção Feminina 2026','Atletas para linha feminina','both',500000,3000000,'open','{PR,SC,RS}','{social-post,uniform-brand}'),
    ('App de Treino: Criadores','Atletas criadores de conteúdo','direct',300000,2000000,'in_negotiation','{SP}','{exclusive-content,social-post}'),
    ('Saúde em Movimento','Ações de bem-estar','both',800000,6000000,'draft','{MG,SP}','{clinics,talks}')
  ) as t(title,goal,model,minc,maxc,status,states,benefits)
  loop
    insert into public.opportunities (
      slug, company_profile_id, title, description, campaign_goal,
      desired_athlete_profile, region_states, investment_model,
      min_investment_cents, max_investment_cents, resource_type, duration,
      desired_benefits, deadline, estimated_slots, requirements, criteria, status
    ) values (
      regexp_replace(lower(rec.title), '[^a-z0-9]+', '-', 'g') || '-' || i,
      c_ids[1 + (i % array_length(c_ids, 1))],
      rec.title, rec.title || ' (demonstração).', rec.goal,
      'Atletas alinhados à marca', rec.states::text[], rec.model::investment_model,
      rec.minc, rec.maxc, 'Financeiro + produto', '6 a 12 meses',
      rec.benefits::text[], (now() + interval '30 days')::date, 3,
      'Perfil ativo e verificado', 'Aderência à marca e engajamento',
      rec.status::opportunity_status
    );
    i := i + 1;
  end loop;
end;
$$;

-- ==================== ENGAJAMENTO + NEGOCIAÇÕES ==========================
do $$
declare
  a_ids uuid[];       -- profile_ids de atletas
  ath_ids uuid[];     -- athlete_profile ids
  c_ids uuid[];       -- company_profile ids
  cp_owner uuid[];    -- profile_ids donos de empresa
  v_conv uuid;
  statuses deal_status[] := array['new_contact','contacted','evaluating','meeting_scheduled','proposal_sent','negotiating','approved','closed_won','closed_lost','paused']::deal_status[];
  i int;
begin
  select array_agg(p.id order by p.created_at) into a_ids
    from public.profiles p where p.role = 'athlete';
  select array_agg(ap.id order by ap.created_at) into ath_ids from public.athlete_profiles ap;
  select array_agg(cp.id order by cp.created_at) into c_ids from public.company_profiles cp;
  select array_agg(cp.profile_id order by cp.created_at) into cp_owner from public.company_profiles cp;

  -- Favoritos: cada empresa favorita 2 atletas
  for i in 1..array_length(cp_owner,1) loop
    insert into public.favorites (profile_id, target_type, target_id)
    values
      (cp_owner[i], 'athlete', ath_ids[1 + ((i) % array_length(ath_ids,1))]),
      (cp_owner[i], 'athlete', ath_ids[1 + ((i+3) % array_length(ath_ids,1))])
    on conflict do nothing;
  end loop;

  -- Uma conexão + conversa + mensagens (empresa 1 <-> atleta 1)
  insert into public.connection_requests (requester_profile_id, target_profile_id, context_type, message, status)
  values (cp_owner[1], a_ids[1], 'athlete', 'Olá! Temos interesse no seu perfil.', 'accepted');

  insert into public.connections (profile_a, profile_b)
  values (least(cp_owner[1], a_ids[1]), greatest(cp_owner[1], a_ids[1]))
  on conflict do nothing;

  insert into public.conversations default values returning id into v_conv;
  insert into public.conversation_members (conversation_id, profile_id) values (v_conv, cp_owner[1]), (v_conv, a_ids[1]);
  insert into public.messages (conversation_id, sender_profile_id, body) values
    (v_conv, cp_owner[1], 'Olá! Gostamos muito do seu trabalho.'),
    (v_conv, a_ids[1], 'Oi! Obrigado pelo contato, vamos conversar.');

  -- 10 negociações distribuídas
  for i in 1..10 loop
    insert into public.deals (
      company_profile_id, counterpart_profile_id, athlete_profile_id, title,
      status, estimated_value_cents, next_step, owner_profile_id
    ) values (
      c_ids[1 + ((i-1) % array_length(c_ids,1))],
      a_ids[1 + ((i-1) % array_length(a_ids,1))],
      ath_ids[1 + ((i-1) % array_length(ath_ids,1))],
      'Negociação #' || i,
      statuses[1 + ((i-1) % array_length(statuses,1))],
      (1000000 + i * 500000),
      'Agendar reunião de alinhamento',
      cp_owner[1 + ((i-1) % array_length(cp_owner,1))]
    );
  end loop;

  -- Contrapartidas de exemplo na primeira negociação
  insert into public.deliverables (deal_id, title, description, due_date, status)
  select id, 'Post de anúncio', 'Publicação no Instagram divulgando a parceria.',
         (now() + interval '15 days')::date, 'planned'
  from public.deals order by created_at limit 1;

  -- Notificações de exemplo
  insert into public.notifications (profile_id, type, title, body) values
    (a_ids[1], 'new_interest', 'Novo interesse', 'Uma empresa demonstrou interesse no seu perfil.'),
    (a_ids[1], 'new_message', 'Nova mensagem', 'Você recebeu uma nova mensagem.'),
    (cp_owner[1], 'compatible_opportunity', 'Match encontrado', 'Encontramos atletas compatíveis com sua marca.');
end;
$$;

-- Remove a função utilitária de seed.
drop function if exists public._seed_user(text, text, text);
