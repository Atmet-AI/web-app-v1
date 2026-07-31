create table if not exists public.workflow_agent_members (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.workflow_agents(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'viewer' check (role in ('owner', 'editor', 'runner', 'viewer')),
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, user_id)
);

create index if not exists workflow_agents_created_by_idx on public.workflow_agents(created_by);
create index if not exists workflow_agent_members_agent_id_idx on public.workflow_agent_members(agent_id);
create index if not exists workflow_agent_members_user_id_idx on public.workflow_agent_members(user_id);

alter table public.workflow_agent_members enable row level security;

create or replace function public.has_agent_access(
  target_agent_id uuid,
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
      from public.workflow_agents wa
      where wa.id = target_agent_id
        and wa.deleted_at is null
        and wa.created_by = target_user_id
    )
    or exists (
      select 1
      from public.workflow_agent_members wam
      join public.workflow_agents wa on wa.id = wam.agent_id
      where wam.agent_id = target_agent_id
        and wam.user_id = target_user_id
        and wa.deleted_at is null
    );
$$;

create or replace function public.has_agent_manage_access(
  target_agent_id uuid,
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
      from public.workflow_agents wa
      where wa.id = target_agent_id
        and wa.deleted_at is null
        and wa.created_by = target_user_id
        and public.has_workspace_permission(wa.workspace_id, 'agents.manage', target_user_id)
    );
$$;

insert into public.workflow_agent_members (agent_id, user_id, role, assigned_by)
select id, created_by, 'owner', created_by
from public.workflow_agents
where created_by is not null
on conflict (agent_id, user_id) do update
set role = 'owner',
    assigned_by = excluded.assigned_by;

drop policy if exists "agents read" on public.workflow_agents;
drop policy if exists "agents manage" on public.workflow_agents;
drop policy if exists "agent members read" on public.workflow_agent_members;
drop policy if exists "agent members manage" on public.workflow_agent_members;
drop policy if exists "nodes read" on public.workflow_nodes;
drop policy if exists "nodes manage" on public.workflow_nodes;
drop policy if exists "edges read" on public.workflow_edges;
drop policy if exists "edges manage" on public.workflow_edges;
drop policy if exists "runs read" on public.workflow_runs;
drop policy if exists "runs manage" on public.workflow_runs;
drop policy if exists "run events read" on public.workflow_run_events;
drop policy if exists "workflow approvals read" on public.workflow_approvals;
drop policy if exists "workflow approvals manage" on public.workflow_approvals;
drop policy if exists "workflow versions read" on public.workflow_agent_versions;
drop policy if exists "workflow versions manage" on public.workflow_agent_versions;

create policy "agents read" on public.workflow_agents
for select using (public.has_agent_access(id));

create policy "agents manage" on public.workflow_agents
for all using (public.has_agent_manage_access(id))
with check (
  created_by = auth.uid()
  and public.has_workspace_permission(workspace_id, 'agents.manage')
);

create policy "agent members read" on public.workflow_agent_members
for select using (public.has_agent_access(agent_id));

create policy "agent members manage" on public.workflow_agent_members
for all using (public.has_agent_manage_access(agent_id))
with check (public.has_agent_manage_access(agent_id));

create policy "nodes read" on public.workflow_nodes
for select using (public.has_agent_access(agent_id));

create policy "nodes manage" on public.workflow_nodes
for all using (public.has_agent_manage_access(agent_id))
with check (public.has_agent_manage_access(agent_id));

create policy "edges read" on public.workflow_edges
for select using (public.has_agent_access(agent_id));

create policy "edges manage" on public.workflow_edges
for all using (public.has_agent_manage_access(agent_id))
with check (public.has_agent_manage_access(agent_id));

create policy "runs read" on public.workflow_runs
for select using (public.has_agent_access(agent_id));

create policy "runs manage" on public.workflow_runs
for all using (public.has_agent_manage_access(agent_id))
with check (public.has_agent_manage_access(agent_id));

create policy "run events read" on public.workflow_run_events
for select using (
  exists (
    select 1 from public.workflow_runs wr
    where wr.id = workflow_run_events.run_id
      and public.has_agent_access(wr.agent_id)
  )
);

create policy "workflow approvals read" on public.workflow_approvals
for select using (public.has_agent_access(agent_id));

create policy "workflow approvals manage" on public.workflow_approvals
for all using (public.has_agent_manage_access(agent_id))
with check (public.has_agent_manage_access(agent_id));

create policy "workflow versions read" on public.workflow_agent_versions
for select using (public.has_agent_access(agent_id));

create policy "workflow versions manage" on public.workflow_agent_versions
for all using (public.has_agent_manage_access(agent_id))
with check (public.has_agent_manage_access(agent_id));
