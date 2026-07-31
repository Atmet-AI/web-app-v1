alter table public.workflow_runs
  drop constraint if exists workflow_runs_status_check;

alter table public.workflow_runs
  add constraint workflow_runs_status_check
  check (status in ('queued', 'running', 'waiting_approval', 'completed', 'failed', 'canceled'));

create table if not exists public.workflow_approvals (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.workflow_runs(id) on delete cascade,
  agent_id uuid not null references public.workflow_agents(id) on delete cascade,
  node_id uuid references public.workflow_nodes(id) on delete set null,
  chat_id uuid references public.chats(id) on delete set null,
  message_id uuid references public.chat_messages(id) on delete set null,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  requested_by uuid references public.profiles(id) on delete set null,
  decided_by uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'auto_approved')),
  action_type text not null default 'write_action',
  app_keys text[] not null default '{}',
  summary text,
  payload jsonb not null default '{}'::jsonb,
  auto_approved boolean not null default false,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create index if not exists workflow_approvals_run_idx on public.workflow_approvals(run_id);
create index if not exists workflow_approvals_workspace_created_idx on public.workflow_approvals(workspace_id, created_at desc);
create index if not exists workflow_approvals_message_idx on public.workflow_approvals(message_id);

create table if not exists public.workflow_agent_versions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.workflow_agents(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  version_number integer not null,
  change_type text not null default 'snapshot',
  summary text,
  snapshot jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (agent_id, version_number)
);

create index if not exists workflow_agent_versions_agent_created_idx on public.workflow_agent_versions(agent_id, created_at desc);
create index if not exists workflow_agent_versions_workspace_created_idx on public.workflow_agent_versions(workspace_id, created_at desc);

alter table public.workflow_approvals enable row level security;
alter table public.workflow_agent_versions enable row level security;

drop policy if exists "workflow approvals read" on public.workflow_approvals;
create policy "workflow approvals read" on public.workflow_approvals
for select using (public.has_workspace_permission(workspace_id, 'workspace.read'));

drop policy if exists "workflow approvals manage" on public.workflow_approvals;
create policy "workflow approvals manage" on public.workflow_approvals
for all using (public.has_workspace_permission(workspace_id, 'agents.manage'))
with check (public.has_workspace_permission(workspace_id, 'agents.manage'));

drop policy if exists "workflow versions read" on public.workflow_agent_versions;
create policy "workflow versions read" on public.workflow_agent_versions
for select using (public.has_workspace_permission(workspace_id, 'workspace.read'));

drop policy if exists "workflow versions manage" on public.workflow_agent_versions;
create policy "workflow versions manage" on public.workflow_agent_versions
for all using (public.has_workspace_permission(workspace_id, 'agents.manage'))
with check (public.has_workspace_permission(workspace_id, 'agents.manage'));
