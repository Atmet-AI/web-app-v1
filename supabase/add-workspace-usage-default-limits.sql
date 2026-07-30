alter table public.workspace_usage_controls
  add column if not exists monthly_token_limit integer not null default 50000,
  add column if not exists storage_limit_gb numeric not null default 25,
  add column if not exists agent_limit integer not null default 25;
