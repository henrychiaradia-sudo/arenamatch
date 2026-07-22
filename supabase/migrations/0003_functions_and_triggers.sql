-- =========================================================================
-- 0003 — Funções e triggers
-- =========================================================================

-- updated_at automático -----------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
  tables text[] := array[
    'profiles', 'athlete_profiles', 'company_profiles', 'manager_profiles',
    'projects', 'opportunities', 'applications', 'connection_requests',
    'deals', 'deliverables', 'verification_requests'
  ];
begin
  foreach t in array tables loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at();', t
    );
  end loop;
end;
$$;

-- Criação do perfil no signup ----------------------------------------------
-- Lê role/full_name de raw_user_meta_data (enviados no signUp).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role user_role;
  v_name text;
  v_plan plan_tier;
begin
  v_role := coalesce(nullif(new.raw_user_meta_data ->> 'role', '')::user_role, 'athlete');
  v_name := coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1));
  v_plan := case v_role
    when 'company' then 'company_free'::plan_tier
    when 'admin' then 'company_corporate'::plan_tier
    else 'athlete_free'::plan_tier
  end;

  insert into public.profiles (id, role, full_name, plan_tier)
  values (new.id, v_role, v_name, v_plan);

  insert into public.subscriptions (profile_id, plan_tier)
  values (new.id, v_plan);

  if v_role = 'athlete' then
    insert into public.athlete_profiles (profile_id) values (new.id);
  elsif v_role = 'company' then
    insert into public.company_profiles (profile_id) values (new.id);
  elsif v_role = 'manager' then
    insert into public.manager_profiles (profile_id) values (new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpers usados nas políticas RLS -----------------------------------------
-- SECURITY DEFINER para não disparar RLS recursiva ao consultar profiles.

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.auth_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.are_connected(p1 uuid, p2 uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.connections
    where profile_a = least(p1, p2) and profile_b = greatest(p1, p2)
  );
$$;

create or replace function public.owns_company(company uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.company_profiles cp
    where cp.id = company and cp.profile_id = auth.uid()
  ) or exists (
    select 1 from public.company_members m
    where m.company_profile_id = company and m.profile_id = auth.uid()
  );
$$;

create or replace function public.is_conversation_member(conv uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = conv and profile_id = auth.uid()
  );
$$;
