-- APEX Strategic Platform - Initial Schema
-- Execute this in Supabase SQL Editor after creating the project

-- ==================== COMPANIES ====================
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  size text,
  country text,
  website text,
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==================== PROFILES ====================
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  company_id uuid references companies on delete set null,
  role text check (role in ('admin', 'client')) not null default 'client',
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==================== DIAGNOSTICS ====================
create table if not exists diagnostics (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies on delete cascade not null,
  status text check (status in ('in_progress', 'completed')) default 'in_progress',
  form_data jsonb default '{}',
  ai_analysis jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==================== STRATEGIC PLANS ====================
create table if not exists strategic_plans (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies on delete cascade not null,
  diagnostic_id uuid references diagnostics on delete set null,
  content jsonb default '{}',
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==================== OPERATION PLANS ====================
create table if not exists operation_plans (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies on delete cascade not null,
  strategic_plan_id uuid references strategic_plans on delete set null,
  type text check (type in ('internal', 'client')) not null,
  content jsonb default '{}',
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==================== SMART OBJECTIVES ====================
create table if not exists smart_objectives (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies on delete cascade not null,
  plan_id uuid,
  title text not null,
  specific text,
  measurable text,
  achievable text,
  relevant text,
  time_bound date,
  kpi text,
  target_value text,
  current_value text,
  status text check (status in ('pending', 'in_progress', 'completed', 'at_risk')) default 'pending',
  owner text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==================== ACTIONS ====================
create table if not exists actions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies on delete cascade not null,
  objective_id uuid references smart_objectives on delete set null,
  title text not null,
  description text,
  owner text,
  due_date date,
  status text check (status in ('todo', 'in_progress', 'review', 'done', 'blocked')) default 'todo',
  priority text check (priority in ('low', 'medium', 'high', 'critical')) default 'medium',
  category text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==================== METRICS ====================
create table if not exists metrics (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies on delete cascade not null,
  metric_name text not null,
  metric_value numeric,
  metric_unit text,
  period text,
  recorded_at timestamptz default now()
);

-- ==================== CHAT ====================
create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies on delete cascade not null,
  user_id uuid references profiles on delete cascade not null,
  title text,
  created_at timestamptz default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamptz default now()
);

-- ==================== AUTOMATIONS ====================
create table if not exists automations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies on delete cascade not null,
  name text not null,
  trigger_type text,
  trigger_config jsonb default '{}',
  action_type text,
  action_config jsonb default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ==================== ROW LEVEL SECURITY ====================

alter table companies enable row level security;
alter table profiles enable row level security;
alter table diagnostics enable row level security;
alter table strategic_plans enable row level security;
alter table operation_plans enable row level security;
alter table smart_objectives enable row level security;
alter table actions enable row level security;
alter table metrics enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table automations enable row level security;

-- Helper function to check if user is admin
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Helper function to get user's company
create or replace function user_company_id()
returns uuid as $$
  select company_id from profiles where id = auth.uid();
$$ language sql security definer;

-- Policies: admin sees everything, clients see only their company

-- profiles: users can see their own profile, admins see all
create policy "profiles_select_own" on profiles for select using (id = auth.uid() or is_admin());
create policy "profiles_update_own" on profiles for update using (id = auth.uid() or is_admin());
create policy "profiles_insert_admin" on profiles for insert with check (is_admin() or id = auth.uid());

-- companies: admins see all, clients see their own
create policy "companies_select" on companies for select using (is_admin() or id = user_company_id());
create policy "companies_all_admin" on companies for all using (is_admin());

-- diagnostics
create policy "diagnostics_select" on diagnostics for select using (is_admin() or company_id = user_company_id());
create policy "diagnostics_all_admin" on diagnostics for all using (is_admin());

-- strategic_plans
create policy "plans_select" on strategic_plans for select using (is_admin() or company_id = user_company_id());
create policy "plans_all_admin" on strategic_plans for all using (is_admin());

-- operation_plans
create policy "ops_select" on operation_plans for select using (is_admin() or company_id = user_company_id());
create policy "ops_all_admin" on operation_plans for all using (is_admin());

-- smart_objectives
create policy "obj_select" on smart_objectives for select using (is_admin() or company_id = user_company_id());
create policy "obj_all_admin" on smart_objectives for all using (is_admin());

-- actions
create policy "actions_select" on actions for select using (is_admin() or company_id = user_company_id());
create policy "actions_update_client" on actions for update using (company_id = user_company_id() or is_admin());
create policy "actions_all_admin" on actions for all using (is_admin());

-- metrics
create policy "metrics_select" on metrics for select using (is_admin() or company_id = user_company_id());
create policy "metrics_all_admin" on metrics for all using (is_admin());

-- chat
create policy "chat_sessions_select" on chat_sessions for select using (is_admin() or company_id = user_company_id());
create policy "chat_sessions_all" on chat_sessions for all using (user_id = auth.uid() or is_admin());
create policy "chat_messages_select" on chat_messages for select using (
  exists (select 1 from chat_sessions where id = session_id and (is_admin() or company_id = user_company_id()))
);
create policy "chat_messages_insert" on chat_messages for insert with check (
  exists (select 1 from chat_sessions where id = session_id and (user_id = auth.uid() or is_admin()))
);

-- automations
create policy "automations_select" on automations for select using (is_admin() or company_id = user_company_id());
create policy "automations_all_admin" on automations for all using (is_admin());
