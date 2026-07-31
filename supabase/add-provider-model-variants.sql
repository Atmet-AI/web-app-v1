insert into public.ai_models (
  key,
  provider_key,
  display_name,
  model_id,
  logo,
  is_atmet_default,
  is_platform_model,
  context_window,
  supports_tools,
  settings
)
values
  ('chatgpt', 'openai', 'ChatGPT Auto', 'gpt-5-mini', 'CG', false, true, 128000, true, '{}'::jsonb),
  ('gpt-5', 'openai', 'GPT-5', 'gpt-5', 'CG', false, true, 256000, true, '{}'::jsonb),
  ('gpt-5-mini', 'openai', 'GPT-5 mini', 'gpt-5-mini', 'CG', false, true, 128000, true, '{}'::jsonb),
  ('gpt-4o-mini', 'openai', 'GPT-4o mini', 'gpt-4o-mini', 'CG', false, true, 128000, true, '{}'::jsonb),
  ('claude-sonnet', 'anthropic', 'Claude Sonnet', 'claude-3-5-sonnet-latest', 'CL', false, true, 200000, true, '{}'::jsonb),
  ('claude-opus', 'anthropic', 'Claude Opus', 'claude-3-opus-latest', 'CL', false, true, 200000, true, '{}'::jsonb),
  ('claude-haiku', 'anthropic', 'Claude Haiku', 'claude-3-haiku-20240307', 'CL', false, true, 200000, true, '{}'::jsonb)
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
