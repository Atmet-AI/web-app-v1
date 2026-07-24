create table if not exists public.ai_providers (
  key text primary key,
  name text not null,
  kind text not null default 'cloud' check (kind in ('cloud', 'local', 'custom')),
  base_url text,
  env_key_name text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_models (
  key text primary key,
  provider_key text not null references public.ai_providers(key) on delete cascade,
  display_name text not null,
  model_id text not null,
  logo text,
  is_atmet_default boolean not null default false,
  is_platform_model boolean not null default true,
  context_window integer,
  supports_tools boolean not null default false,
  enabled boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_model_settings (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  default_model_key text references public.ai_models(key) on delete set null,
  allowed_model_keys text[] not null default '{}',
  system_overrides text,
  tools_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_model_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  provider_key text not null references public.ai_providers(key) on delete cascade,
  display_name text not null,
  model_id text not null,
  base_url text,
  api_key_secret text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_model_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete set null,
  chat_id uuid references public.chats(id) on delete set null,
  message_id uuid references public.chat_messages(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  model_key text,
  provider_key text,
  model_id text,
  input_tokens integer,
  output_tokens integer,
  status text not null default 'completed' check (status in ('completed', 'failed', 'not_configured')),
  error text,
  latency_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists ai_models_provider_idx on public.ai_models(provider_key);
create index if not exists user_model_connections_user_idx on public.user_model_connections(user_id);
create index if not exists ai_model_runs_workspace_created_idx on public.ai_model_runs(workspace_id, created_at desc);

create or replace trigger ai_providers_updated_at
before update on public.ai_providers
for each row execute function public.set_updated_at();

create or replace trigger ai_models_updated_at
before update on public.ai_models
for each row execute function public.set_updated_at();

create or replace trigger workspace_model_settings_updated_at
before update on public.workspace_model_settings
for each row execute function public.set_updated_at();

create or replace trigger user_model_connections_updated_at
before update on public.user_model_connections
for each row execute function public.set_updated_at();

insert into public.ai_providers (key, name, kind, base_url, env_key_name)
values
  ('atmet', 'Atmet managed model', 'cloud', null, 'ATMET_MODEL_API_KEY'),
  ('openai', 'OpenAI', 'cloud', 'https://api.openai.com/v1', 'OPENAI_API_KEY'),
  ('anthropic', 'Anthropic', 'cloud', 'https://api.anthropic.com/v1', 'ANTHROPIC_API_KEY'),
  ('google', 'Google AI', 'cloud', 'https://generativelanguage.googleapis.com/v1beta', 'GOOGLE_GENERATIVE_AI_API_KEY'),
  ('local', 'Local model', 'local', 'http://localhost:11434/v1', 'LOCAL_MODEL_API_KEY'),
  ('custom', 'Custom API', 'custom', null, 'CUSTOM_MODEL_API_KEY')
on conflict (key) do update
set name = excluded.name,
    kind = excluded.kind,
    base_url = excluded.base_url,
    env_key_name = excluded.env_key_name;

insert into public.ai_models (key, provider_key, display_name, model_id, logo, is_atmet_default, is_platform_model, context_window, supports_tools, settings)
values
  ('atmet-sol', 'atmet', 'Atmet High', 'gpt-5.6-sol', 'AT', false, true, 256000, true, '{"envModelKey":"ATMET_SOL_MODEL_ID","providerEnvKey":"ATMET_MODEL_PROVIDER"}'::jsonb),
  ('atmet', 'atmet', 'Atmet Default', 'gpt-5.6-terra', 'AT', true, true, 128000, true, '{"envModelKey":"ATMET_MODEL_ID","providerEnvKey":"ATMET_MODEL_PROVIDER"}'::jsonb),
  ('atmet-luna', 'atmet', 'Atmet Lite', 'gpt-5.6-luna', 'AT', false, true, 64000, true, '{"envModelKey":"ATMET_LUNA_MODEL_ID","providerEnvKey":"ATMET_MODEL_PROVIDER"}'::jsonb),
  ('chatgpt', 'openai', 'ChatGPT', 'gpt-4o-mini', 'CG', false, true, 128000, true, '{}'::jsonb),
  ('claude-sonnet', 'anthropic', 'Claude', 'claude-3-5-sonnet-latest', 'CL', false, true, 200000, true, '{}'::jsonb),
  ('gemini-flash', 'google', 'Gemini Flash', 'gemini-1.5-flash', 'GF', false, true, 1000000, true, '{}'::jsonb),
  ('local-model', 'local', 'Local model', 'llama3.1', 'LM', false, false, null, false, '{}'::jsonb),
  ('custom-api', 'custom', 'Custom API', 'custom-model', 'API', false, false, null, false, '{}'::jsonb)
on conflict (key) do update
set provider_key = excluded.provider_key,
    display_name = excluded.display_name,
    model_id = excluded.model_id,
    logo = excluded.logo,
    is_atmet_default = excluded.is_atmet_default,
    is_platform_model = excluded.is_platform_model,
    context_window = excluded.context_window,
    supports_tools = excluded.supports_tools,
    settings = excluded.settings;

alter table public.ai_providers enable row level security;
alter table public.ai_models enable row level security;
alter table public.workspace_model_settings enable row level security;
alter table public.user_model_connections enable row level security;
alter table public.ai_model_runs enable row level security;

drop policy if exists "ai providers read" on public.ai_providers;
create policy "ai providers read" on public.ai_providers
for select using (enabled = true or public.is_super_admin());

drop policy if exists "ai models read" on public.ai_models;
create policy "ai models read" on public.ai_models
for select using (enabled = true or public.is_super_admin());

drop policy if exists "workspace model settings read" on public.workspace_model_settings;
create policy "workspace model settings read" on public.workspace_model_settings
for select using (public.is_workspace_member(workspace_id) or public.is_super_admin());

drop policy if exists "workspace model settings manage" on public.workspace_model_settings;
create policy "workspace model settings manage" on public.workspace_model_settings
for all using (public.has_workspace_permission(workspace_id, 'workspace.update'))
with check (public.has_workspace_permission(workspace_id, 'workspace.update'));

drop policy if exists "user model connections own read" on public.user_model_connections;
create policy "user model connections own read" on public.user_model_connections
for select using (user_id = auth.uid() or public.is_super_admin());

drop policy if exists "user model connections own manage" on public.user_model_connections;
create policy "user model connections own manage" on public.user_model_connections
for all using (user_id = auth.uid() or public.is_super_admin())
with check (user_id = auth.uid() or public.is_super_admin());

drop policy if exists "ai model runs workspace read" on public.ai_model_runs;
create policy "ai model runs workspace read" on public.ai_model_runs
for select using (
  public.is_super_admin()
  or (workspace_id is not null and public.is_workspace_member(workspace_id))
);
