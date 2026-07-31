create index if not exists workspace_members_user_status_created_idx
on public.workspace_members(user_id, status, created_at);

create index if not exists chats_user_workspace_deleted_updated_idx
on public.chats(user_id, workspace_id, deleted_at, pinned, updated_at desc);

create index if not exists skills_source_created_name_idx
on public.skills(source, created_by, name);

create index if not exists workflow_agents_workspace_deleted_created_idx
on public.workflow_agents(workspace_id, deleted_at, created_at desc);

create index if not exists workspace_connectors_workspace_id_idx
on public.workspace_connectors(workspace_id);

create index if not exists workspace_usage_controls_workspace_id_idx
on public.workspace_usage_controls(workspace_id);

create index if not exists notifications_user_status_created_idx
on public.notifications(user_id, status, created_at desc);
