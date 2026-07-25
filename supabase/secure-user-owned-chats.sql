-- Lock chats to the user who owns them. Run this in Supabase SQL editor.
-- Existing rows with null user_id will not be visible until assigned to an owner.

create index if not exists chats_user_id_idx on public.chats(user_id);

drop policy if exists "chats read" on public.chats;
drop policy if exists "chats manage" on public.chats;
drop policy if exists "messages read" on public.chat_messages;
drop policy if exists "messages create" on public.chat_messages;
drop policy if exists "mentions read" on public.chat_mentions;
drop policy if exists "mentions create" on public.chat_mentions;

create policy "chats read" on public.chats
for select using (user_id = auth.uid());

create policy "chats manage" on public.chats
for all using (
  user_id = auth.uid()
  and public.has_workspace_permission(workspace_id, 'chats.manage')
)
with check (
  user_id = auth.uid()
  and public.has_workspace_permission(workspace_id, 'chats.manage')
);

create policy "messages read" on public.chat_messages
for select using (
  exists (
    select 1 from public.chats c
    where c.id = chat_messages.chat_id
      and c.user_id = auth.uid()
      and c.deleted_at is null
  )
);

create policy "messages create" on public.chat_messages
for insert with check (
  exists (
    select 1 from public.chats c
    where c.id = chat_messages.chat_id
      and c.user_id = auth.uid()
      and c.deleted_at is null
      and public.has_workspace_permission(c.workspace_id, 'chats.manage')
  )
);

create policy "mentions read" on public.chat_mentions
for select using (
  exists (
    select 1 from public.chats c
    where c.id = chat_mentions.chat_id
      and c.user_id = auth.uid()
      and c.deleted_at is null
  )
);

create policy "mentions create" on public.chat_mentions
for insert with check (
  exists (
    select 1 from public.chats c
    where c.id = chat_mentions.chat_id
      and c.user_id = auth.uid()
      and c.deleted_at is null
      and public.has_workspace_permission(c.workspace_id, 'chats.manage')
  )
);
