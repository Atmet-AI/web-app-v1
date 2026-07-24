-- Atmet notifications migration
-- Paste this in Supabase SQL Editor once.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  invite_id uuid references public.workspace_invites(id) on delete set null,
  type text not null check (
    type in (
      'workspace_invite',
      'workspace_invite_sent',
      'workspace_invite_accepted',
      'workspace_invite_rejected'
    )
  ),
  title text not null,
  body text,
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  action_status text not null default 'none' check (action_status in ('none', 'pending', 'accepted', 'rejected')),
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
on public.notifications (user_id, created_at desc);

create index if not exists notifications_invite_idx
on public.notifications (invite_id);

alter table public.notifications enable row level security;

drop trigger if exists set_notifications_updated_at on public.notifications;
create trigger set_notifications_updated_at
before update on public.notifications
for each row execute function public.set_updated_at();

drop policy if exists "notifications read own" on public.notifications;
create policy "notifications read own" on public.notifications
for select using (user_id = auth.uid() or public.is_super_admin());

drop policy if exists "notifications update own" on public.notifications;
create policy "notifications update own" on public.notifications
for update using (user_id = auth.uid() or public.is_super_admin())
with check (user_id = auth.uid() or public.is_super_admin());

drop policy if exists "notifications insert service" on public.notifications;
create policy "notifications insert service" on public.notifications
for insert with check (user_id = auth.uid() or public.is_super_admin());
