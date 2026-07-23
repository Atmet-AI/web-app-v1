-- Atmet Supabase schema
-- Run this in the Supabase SQL editor after creating your projjject.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role_title text,
  phone_number text,
  timezone text not null default 'Asia/Amman',
  bio text,
  is_super_admin boolean not null default false,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  sound_enabled boolean not null default true,
  startup_page text not null default 'new-chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.waitlist_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  company_name text,
  company_size text,
  work_type text,
  role_title text,
  country text,
  source text,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_plans (
  key text primary key,
  name text not null,
  description text,
  price_monthly numeric(10, 2) not null default 0,
  limits jsonb not null default '{}'::jsonb,
  features jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  avatar_url text,
  category text,
  status text not null default 'active' check (status in ('active', 'paused', 'review', 'deleted')),
  owner_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.workspace_subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  plan_key text not null references public.billing_plans(key),
  status text not null default 'active' check (status in ('trialing', 'active', 'past_due', 'canceled')),
  billing_email text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id)
);

create table if not exists public.permissions (
  key text primary key,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role text not null check (role in ('owner', 'admin', 'member', 'viewer')),
  permission_key text not null references public.permissions(key) on delete cascade,
  primary key (role, permission_key)
);

create table if not exists public.workspace_custom_roles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create table if not exists public.workspace_custom_role_permissions (
  custom_role_id uuid not null references public.workspace_custom_roles(id) on delete cascade,
  permission_key text not null references public.permissions(key) on delete cascade,
  primary key (custom_role_id, permission_key)
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  custom_role_id uuid references public.workspace_custom_roles(id) on delete set null,
  status text not null default 'active' check (status in ('invited', 'active', 'suspended')),
  invited_by uuid references public.profiles(id) on delete set null,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member', 'viewer')),
  token_hash text not null unique,
  invited_by uuid references public.profiles(id) on delete set null,
  accepted_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_settings (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  sound_enabled boolean not null default true,
  default_timezone text not null default 'Asia/Amman',
  date_format text not null default 'DD MMM YYYY',
  run_log_retention_days integer not null default 90,
  workspace_memory_enabled boolean not null default true,
  chat_history_context_enabled boolean not null default true,
  pii_redaction_enabled boolean not null default false,
  confirm_app_actions boolean not null default true,
  auto_retry_failed_nodes boolean not null default false,
  run_window text not null default 'Weekdays, 9-5',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_usage_controls (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  enforce_workspace_limits boolean not null default true,
  monthly_run_limit integer not null default 12000,
  connector_limit integer not null default 10,
  require_write_approvals boolean not null default true,
  usage_alert_threshold integer not null default 80,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id)
);

create table if not exists public.workspace_brain (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  personalization text,
  business_details text,
  output_style text,
  knowledge_graph_status text not null default 'empty' check (knowledge_graph_status in ('empty', 'building', 'ready', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_graph_nodes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  label text not null,
  node_type text not null default 'concept',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_graph_edges (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source_node_id uuid not null references public.knowledge_graph_nodes(id) on delete cascade,
  target_node_id uuid not null references public.knowledge_graph_nodes(id) on delete cascade,
  relationship text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.app_catalog (
  key text primary key,
  name text not null,
  description text not null,
  logo text,
  gradient text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_connectors (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  app_key text not null references public.app_catalog(key),
  status text not null default 'connected' check (status in ('connected', 'disconnected', 'pending', 'error')),
  connected_by uuid references public.profiles(id) on delete set null,
  profile_name text,
  description text,
  settings jsonb not null default '{}'::jsonb,
  connected_at timestamptz,
  disconnected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, app_key)
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  content text not null default '',
  icon text,
  gradient text,
  source text not null default 'custom' check (source in ('default', 'custom')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.skill_versions (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  content text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  title text not null default 'New chat',
  pinned boolean not null default false,
  archived boolean not null default false,
  source text not null default 'chat' check (source in ('chat', 'workflow_node', 'skill')),
  origin_agent_node_id uuid,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_mentions (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  message_id uuid references public.chat_messages(id) on delete cascade,
  mention_type text not null check (mention_type in ('skill', 'connector')),
  target_id uuid,
  target_key text,
  label text not null,
  logo text,
  created_at timestamptz not null default now()
);

create table if not exists public.workflow_agents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active', 'draft', 'paused', 'archived')),
  runtime_state text not null default 'paused' check (runtime_state in ('running', 'paused')),
  gradient text,
  tone text,
  schedule text,
  share_slug text unique,
  settings jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.workflow_nodes (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.workflow_agents(id) on delete cascade,
  title text not null default 'Empty chat',
  runtime_state text not null default 'paused' check (runtime_state in ('running', 'paused')),
  status text not null default 'ready' check (status in ('ready', 'running', 'paused', 'failed')),
  source_chat_id uuid references public.chats(id) on delete set null,
  app_keys text[] not null default '{}',
  position_x numeric not null default 120,
  position_y numeric not null default 120,
  width numeric not null default 220,
  height numeric not null default 140,
  config jsonb not null default '{}'::jsonb,
  highlighted_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflow_edges (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.workflow_agents(id) on delete cascade,
  source_node_id uuid not null references public.workflow_nodes(id) on delete cascade,
  target_node_id uuid not null references public.workflow_nodes(id) on delete cascade,
  label text,
  created_at timestamptz not null default now(),
  unique (agent_id, source_node_id, target_node_id)
);

create table if not exists public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.workflow_agents(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed', 'canceled')),
  started_by uuid references public.profiles(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.workflow_run_events (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.workflow_runs(id) on delete cascade,
  node_id uuid references public.workflow_nodes(id) on delete set null,
  event_type text not null,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  resource text not null check (resource in ('tokens', 'files', 'storage_gb', 'automations', 'chats', 'workflow_runs', 'connectors')),
  quantity numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_usage_limits (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  monthly_token_cap integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.changelogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  workspace_id uuid references public.workspaces(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.session_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  workspace_id uuid references public.workspaces(id) on delete set null,
  event text not null,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists workspace_members_user_id_idx on public.workspace_members(user_id);
create index if not exists chats_workspace_id_idx on public.chats(workspace_id);
create index if not exists skills_workspace_id_idx on public.skills(workspace_id);
create index if not exists skills_created_by_idx on public.skills(created_by);
create index if not exists workflow_agents_workspace_id_idx on public.workflow_agents(workspace_id);
create index if not exists workflow_nodes_agent_id_idx on public.workflow_nodes(agent_id);
create index if not exists usage_events_workspace_created_idx on public.usage_events(workspace_id, created_at desc);
create index if not exists session_logs_created_idx on public.session_logs(created_at desc);

create or replace trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace trigger user_preferences_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

create or replace trigger waitlist_requests_updated_at
before update on public.waitlist_requests
for each row execute function public.set_updated_at();

create or replace trigger workspaces_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

create or replace trigger workspace_subscriptions_updated_at
before update on public.workspace_subscriptions
for each row execute function public.set_updated_at();

create or replace trigger workspace_custom_roles_updated_at
before update on public.workspace_custom_roles
for each row execute function public.set_updated_at();

create or replace trigger workspace_members_updated_at
before update on public.workspace_members
for each row execute function public.set_updated_at();

create or replace trigger workspace_settings_updated_at
before update on public.workspace_settings
for each row execute function public.set_updated_at();

create or replace trigger workspace_usage_controls_updated_at
before update on public.workspace_usage_controls
for each row execute function public.set_updated_at();

create or replace trigger workspace_brain_updated_at
before update on public.workspace_brain
for each row execute function public.set_updated_at();

create or replace trigger app_catalog_updated_at
before update on public.app_catalog
for each row execute function public.set_updated_at();

create or replace trigger workspace_connectors_updated_at
before update on public.workspace_connectors
for each row execute function public.set_updated_at();

create or replace trigger skills_updated_at
before update on public.skills
for each row execute function public.set_updated_at();

create or replace trigger chats_updated_at
before update on public.chats
for each row execute function public.set_updated_at();

create or replace trigger workflow_agents_updated_at
before update on public.workflow_agents
for each row execute function public.set_updated_at();

create or replace trigger workflow_nodes_updated_at
before update on public.workflow_nodes
for each row execute function public.set_updated_at();

create or replace trigger user_usage_limits_updated_at
before update on public.user_usage_limits
for each row execute function public.set_updated_at();

create or replace trigger changelogs_updated_at
before update on public.changelogs
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_super_admin(target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = target_user_id
      and is_super_admin = true
  );
$$;

create or replace function public.is_workspace_member(
  target_workspace_id uuid,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = target_user_id
      and status = 'active'
  );
$$;

create or replace function public.has_workspace_permission(
  target_workspace_id uuid,
  permission_key text,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin(target_user_id)
    or exists (
      select 1
      from public.workspace_members wm
      join public.role_permissions rp on rp.role = wm.role
      where wm.workspace_id = target_workspace_id
        and wm.user_id = target_user_id
        and wm.status = 'active'
        and rp.permission_key = has_workspace_permission.permission_key
    )
    or exists (
      select 1
      from public.workspace_members wm
      join public.workspace_custom_role_permissions crp on crp.custom_role_id = wm.custom_role_id
      where wm.workspace_id = target_workspace_id
        and wm.user_id = target_user_id
        and wm.status = 'active'
        and crp.permission_key = has_workspace_permission.permission_key
    );
$$;

create or replace function public.workspace_id_for_agent(target_agent_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select workspace_id from public.workflow_agents where id = target_agent_id;
$$;

create or replace function public.workspace_id_for_chat(target_chat_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select workspace_id from public.chats where id = target_chat_id;
$$;

create or replace function public.accept_workspace_invite(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.workspace_invites%rowtype;
begin
  select *
  into invite_row
  from public.workspace_invites
  where token_hash = encode(digest(invite_token, 'sha256'), 'hex')
    and accepted_at is null
    and expires_at > now()
  limit 1;

  if invite_row.id is null then
    raise exception 'Invite is invalid or expired';
  end if;

  insert into public.workspace_members (
    workspace_id,
    user_id,
    role,
    status,
    invited_by,
    joined_at
  )
  values (
    invite_row.workspace_id,
    auth.uid(),
    invite_row.role,
    'active',
    invite_row.invited_by,
    now()
  )
  on conflict (workspace_id, user_id) do update
    set role = excluded.role,
        status = 'active',
        joined_at = coalesce(public.workspace_members.joined_at, now()),
        updated_at = now();

  update public.workspace_invites
  set accepted_by = auth.uid(),
      accepted_at = now()
  where id = invite_row.id;

  return invite_row.workspace_id;
end;
$$;

insert into public.permissions (key, description)
values
  ('workspace.read', 'View workspace data'),
  ('workspace.update', 'Update workspace profile and settings'),
  ('workspace.delete', 'Delete workspace'),
  ('members.manage', 'Invite, remove, and update members'),
  ('roles.manage', 'Create and edit roles'),
  ('chats.manage', 'Create, update, archive, and delete chats'),
  ('skills.manage', 'Create and edit workspace skills'),
  ('connectors.manage', 'Connect and disconnect apps'),
  ('agents.manage', 'Create and edit workflow agents'),
  ('usage.manage', 'Update usage limits'),
  ('billing.manage', 'Manage billing and plans'),
  ('admin.console', 'Access admin console')
on conflict (key) do update set description = excluded.description;

insert into public.role_permissions (role, permission_key)
select 'owner', key from public.permissions
on conflict do nothing;

insert into public.role_permissions (role, permission_key)
values
  ('admin', 'workspace.read'),
  ('admin', 'workspace.update'),
  ('admin', 'members.manage'),
  ('admin', 'roles.manage'),
  ('admin', 'chats.manage'),
  ('admin', 'skills.manage'),
  ('admin', 'connectors.manage'),
  ('admin', 'agents.manage'),
  ('admin', 'usage.manage'),
  ('member', 'workspace.read'),
  ('member', 'chats.manage'),
  ('member', 'skills.manage'),
  ('member', 'agents.manage'),
  ('viewer', 'workspace.read')
on conflict do nothing;

insert into public.billing_plans (key, name, description, price_monthly, limits, features, sort_order)
values
  ('starter', 'Starter', 'For personal work and simple AI chat workflows.', 19, '{"tokens":50000,"connectors":3,"workspaces":1}'::jsonb, '["1 workspace","Basic chat history","3 connectors"]'::jsonb, 10),
  ('pro', 'Pro', 'For teams building reusable skills and workflow agents.', 49, '{"tokens":250000,"connectors":10,"workspaces":5}'::jsonb, '["Unlimited chats","Workflow agents","Priority connectors"]'::jsonb, 20),
  ('business', 'Business', 'For larger teams with governance and advanced controls.', 149, '{"tokens":1000000,"connectors":50,"workspaces":25}'::jsonb, '["SAML SSO","Admin controls","Custom limits"]'::jsonb, 30)
on conflict (key) do update
set name = excluded.name,
    description = excluded.description,
    price_monthly = excluded.price_monthly,
    limits = excluded.limits,
    features = excluded.features,
    sort_order = excluded.sort_order;

insert into public.app_catalog (key, name, description, logo, gradient)
values
  ('google-drive', 'Google Drive', 'Search, read, and organize shared workspace files.', 'GD', 'from-sky-400/20 via-lime-200/10 to-stone-950'),
  ('slack', 'Slack', 'Summarize channels and turn decisions into tasks.', 'SL', 'from-violet-400/20 via-amber-300/10 to-stone-950'),
  ('github', 'GitHub', 'Track pull requests, issues, reviews, and releases.', 'GH', 'from-stone-500/20 via-blue-400/10 to-stone-950'),
  ('notion', 'Notion', 'Keep docs, projects, and knowledge bases connected.', 'NO', 'from-fuchsia-400/20 via-lime-300/10 to-stone-950'),
  ('figma', 'Figma', 'Reference design files and product specs in context.', 'FI', 'from-red-400/20 via-blue-400/10 to-stone-950'),
  ('calendar', 'Calendar', 'Use meetings, availability, and follow-ups in Atmet.', 'CA', 'from-orange-400/20 via-teal-300/10 to-stone-950')
on conflict (key) do update
set name = excluded.name,
    description = excluded.description,
    logo = excluded.logo,
    gradient = excluded.gradient;

insert into public.skills (workspace_id, name, description, content, icon, gradient, source)
values
  (null, 'Browser research', 'Research public web pages and summarize findings.', '# Browser research'||chr(10)||chr(10)||'Find relevant sources, extract the important points, and return a concise summary with links.', 'search', 'from-sky-400/20 via-stone-100/10 to-teal-300/20', 'default'),
  (null, 'Document drafting', 'Draft clear documents from rough requirements.', '# Document drafting'||chr(10)||chr(10)||'Turn notes into polished documents with structure, tone, and next actions.', 'book', 'from-amber-300/20 via-stone-100/10 to-pink-300/20', 'default'),
  (null, 'Workspace analysis', 'Turn workspace context into clear operating signals.', '# Workspace analysis'||chr(10)||chr(10)||'Use this skill to inspect workspace context and turn scattered information into operational clarity.', 'document', 'from-emerald-300/20 via-stone-100/10 to-cyan-300/20', 'default'),
  (null, 'Data controls', 'Review sensitive data and retention decisions.', '# Data controls'||chr(10)||chr(10)||'Identify what should be stored, redacted, exported, or deleted.', 'database', 'from-lime-300/20 via-stone-100/10 to-orange-200/20', 'default'),
  (null, 'Workflow builder', 'Plan and describe a workflow agent.', '# Workflow builder'||chr(10)||chr(10)||'Describe nodes, connector needs, handoffs, run schedule, and expected outputs.', 'workflow', 'from-violet-300/20 via-stone-100/10 to-blue-300/20', 'default'),
  (null, 'Team support', 'Help users resolve workspace questions.', '# Team support'||chr(10)||chr(10)||'Collect context, answer clearly, and escalate when needed.', 'support', 'from-rose-300/20 via-stone-100/10 to-emerald-300/20', 'default')
on conflict do nothing;

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.waitlist_requests enable row level security;
alter table public.billing_plans enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_subscriptions enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.workspace_custom_roles enable row level security;
alter table public.workspace_custom_role_permissions enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invites enable row level security;
alter table public.workspace_settings enable row level security;
alter table public.workspace_usage_controls enable row level security;
alter table public.workspace_brain enable row level security;
alter table public.knowledge_graph_nodes enable row level security;
alter table public.knowledge_graph_edges enable row level security;
alter table public.app_catalog enable row level security;
alter table public.workspace_connectors enable row level security;
alter table public.skills enable row level security;
alter table public.skill_versions enable row level security;
alter table public.chats enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_mentions enable row level security;
alter table public.workflow_agents enable row level security;
alter table public.workflow_nodes enable row level security;
alter table public.workflow_edges enable row level security;
alter table public.workflow_runs enable row level security;
alter table public.workflow_run_events enable row level security;
alter table public.usage_events enable row level security;
alter table public.user_usage_limits enable row level security;
alter table public.changelogs enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.session_logs enable row level security;

create policy "profiles own select" on public.profiles
for select using (id = auth.uid() or public.is_super_admin());

create policy "profiles own insert" on public.profiles
for insert with check (id = auth.uid() or public.is_super_admin());

create policy "profiles own update" on public.profiles
for update using (id = auth.uid() or public.is_super_admin())
with check (id = auth.uid() or public.is_super_admin());

create policy "user preferences own select" on public.user_preferences
for select using (user_id = auth.uid() or public.is_super_admin());

create policy "user preferences own update" on public.user_preferences
for all using (user_id = auth.uid() or public.is_super_admin())
with check (user_id = auth.uid() or public.is_super_admin());

create policy "waitlist public insert" on public.waitlist_requests
for insert with check (true);

create policy "waitlist admin select" on public.waitlist_requests
for select using (public.is_super_admin());

create policy "waitlist admin update" on public.waitlist_requests
for update using (public.is_super_admin())
with check (public.is_super_admin());

create policy "catalog public read" on public.billing_plans
for select using (active = true or public.is_super_admin());

create policy "app catalog public read" on public.app_catalog
for select using (enabled = true or public.is_super_admin());

create policy "permissions member read" on public.permissions
for select using (auth.uid() is not null);

create policy "role permissions member read" on public.role_permissions
for select using (auth.uid() is not null);

create policy "workspaces member read" on public.workspaces
for select using (public.is_workspace_member(id) or public.is_super_admin());

create policy "workspaces auth create" on public.workspaces
for insert with check (created_by = auth.uid() or public.is_super_admin());

create policy "workspaces update by permission" on public.workspaces
for update using (public.has_workspace_permission(id, 'workspace.update'))
with check (public.has_workspace_permission(id, 'workspace.update'));

create policy "workspaces delete by permission" on public.workspaces
for delete using (public.has_workspace_permission(id, 'workspace.delete'));

create policy "workspace members read" on public.workspace_members
for select using (public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "workspace members manage" on public.workspace_members
for all using (public.has_workspace_permission(workspace_id, 'members.manage'))
with check (public.has_workspace_permission(workspace_id, 'members.manage'));

create policy "workspace invites manage" on public.workspace_invites
for all using (public.has_workspace_permission(workspace_id, 'members.manage'))
with check (public.has_workspace_permission(workspace_id, 'members.manage'));

create policy "workspace subscriptions read" on public.workspace_subscriptions
for select using (public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "workspace subscriptions billing manage" on public.workspace_subscriptions
for all using (public.has_workspace_permission(workspace_id, 'billing.manage'))
with check (public.has_workspace_permission(workspace_id, 'billing.manage'));

create policy "workspace settings read" on public.workspace_settings
for select using (public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "workspace settings update" on public.workspace_settings
for all using (public.has_workspace_permission(workspace_id, 'workspace.update'))
with check (public.has_workspace_permission(workspace_id, 'workspace.update'));

create policy "workspace controls read" on public.workspace_usage_controls
for select using (workspace_id is null and public.is_super_admin() or public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "workspace controls manage" on public.workspace_usage_controls
for all using (public.is_super_admin() or public.has_workspace_permission(workspace_id, 'usage.manage'))
with check (public.is_super_admin() or public.has_workspace_permission(workspace_id, 'usage.manage'));

create policy "workspace brain read" on public.workspace_brain
for select using (public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "workspace brain update" on public.workspace_brain
for all using (public.has_workspace_permission(workspace_id, 'workspace.update'))
with check (public.has_workspace_permission(workspace_id, 'workspace.update'));

create policy "knowledge graph read" on public.knowledge_graph_nodes
for select using (public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "knowledge graph manage" on public.knowledge_graph_nodes
for all using (public.has_workspace_permission(workspace_id, 'workspace.update'))
with check (public.has_workspace_permission(workspace_id, 'workspace.update'));

create policy "knowledge graph edges read" on public.knowledge_graph_edges
for select using (public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "knowledge graph edges manage" on public.knowledge_graph_edges
for all using (public.has_workspace_permission(workspace_id, 'workspace.update'))
with check (public.has_workspace_permission(workspace_id, 'workspace.update'));

create policy "connectors read" on public.workspace_connectors
for select using (public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "connectors manage" on public.workspace_connectors
for all using (public.has_workspace_permission(workspace_id, 'connectors.manage'))
with check (public.has_workspace_permission(workspace_id, 'connectors.manage'));

create policy "skills read" on public.skills
for select using (source = 'default' or created_by = auth.uid() or public.is_super_admin());

create policy "skills manage" on public.skills
for all using (source = 'custom' and created_by = auth.uid())
with check (source = 'custom' and created_by = auth.uid());

create policy "skill versions read" on public.skill_versions
for select using (
  exists (
    select 1 from public.skills s
    where s.id = skill_versions.skill_id
      and (s.source = 'default' or s.created_by = auth.uid() or public.is_super_admin())
  )
);

create policy "skill versions create" on public.skill_versions
for insert with check (
  exists (
    select 1 from public.skills s
    where s.id = skill_versions.skill_id
      and s.source = 'custom'
      and s.created_by = auth.uid()
  )
);

create policy "chats read" on public.chats
for select using (public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "chats manage" on public.chats
for all using (public.has_workspace_permission(workspace_id, 'chats.manage'))
with check (public.has_workspace_permission(workspace_id, 'chats.manage'));

create policy "messages read" on public.chat_messages
for select using (public.is_workspace_member(public.workspace_id_for_chat(chat_id)) or public.is_super_admin());

create policy "messages create" on public.chat_messages
for insert with check (public.has_workspace_permission(public.workspace_id_for_chat(chat_id), 'chats.manage'));

create policy "mentions read" on public.chat_mentions
for select using (public.is_workspace_member(public.workspace_id_for_chat(chat_id)) or public.is_super_admin());

create policy "mentions create" on public.chat_mentions
for insert with check (public.has_workspace_permission(public.workspace_id_for_chat(chat_id), 'chats.manage'));

create policy "agents read" on public.workflow_agents
for select using (public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "agents manage" on public.workflow_agents
for all using (public.has_workspace_permission(workspace_id, 'agents.manage'))
with check (public.has_workspace_permission(workspace_id, 'agents.manage'));

create policy "nodes read" on public.workflow_nodes
for select using (public.is_workspace_member(public.workspace_id_for_agent(agent_id)) or public.is_super_admin());

create policy "nodes manage" on public.workflow_nodes
for all using (public.has_workspace_permission(public.workspace_id_for_agent(agent_id), 'agents.manage'))
with check (public.has_workspace_permission(public.workspace_id_for_agent(agent_id), 'agents.manage'));

create policy "edges read" on public.workflow_edges
for select using (public.is_workspace_member(public.workspace_id_for_agent(agent_id)) or public.is_super_admin());

create policy "edges manage" on public.workflow_edges
for all using (public.has_workspace_permission(public.workspace_id_for_agent(agent_id), 'agents.manage'))
with check (public.has_workspace_permission(public.workspace_id_for_agent(agent_id), 'agents.manage'));

create policy "runs read" on public.workflow_runs
for select using (public.is_workspace_member(public.workspace_id_for_agent(agent_id)) or public.is_super_admin());

create policy "runs manage" on public.workflow_runs
for all using (public.has_workspace_permission(public.workspace_id_for_agent(agent_id), 'agents.manage'))
with check (public.has_workspace_permission(public.workspace_id_for_agent(agent_id), 'agents.manage'));

create policy "run events read" on public.workflow_run_events
for select using (
  exists (
    select 1 from public.workflow_runs wr
    where wr.id = workflow_run_events.run_id
      and (public.is_workspace_member(public.workspace_id_for_agent(wr.agent_id)) or public.is_super_admin())
  )
);

create policy "usage read" on public.usage_events
for select using (public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "usage create" on public.usage_events
for insert with check (public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "user usage limits read" on public.user_usage_limits
for select using (public.is_workspace_member(workspace_id) or public.is_super_admin());

create policy "user usage limits manage" on public.user_usage_limits
for all using (public.has_workspace_permission(workspace_id, 'usage.manage'))
with check (public.has_workspace_permission(workspace_id, 'usage.manage'));

create policy "changelogs public read" on public.changelogs
for select using (published_at is not null or public.is_super_admin());

create policy "changelogs admin manage" on public.changelogs
for all using (public.is_super_admin())
with check (public.is_super_admin());

create policy "audit admin read" on public.admin_audit_logs
for select using (public.is_super_admin());

create policy "audit admin insert" on public.admin_audit_logs
for insert with check (public.is_super_admin());

create policy "session own or admin read" on public.session_logs
for select using (user_id = auth.uid() or public.is_super_admin());

create policy "session insert authenticated" on public.session_logs
for insert with check (user_id = auth.uid() or public.is_super_admin());
