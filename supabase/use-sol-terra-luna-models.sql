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
  settings,
  enabled
)
values
  (
    'atmet-sol',
    'atmet',
    'Atmet High',
    'gpt-5.6-sol',
    'AS',
    false,
    true,
    256000,
    true,
    '{"envModelKey":"ATMET_SOL_MODEL_ID","providerEnvKey":"ATMET_MODEL_PROVIDER"}'::jsonb,
    true
  ),
  (
    'atmet',
    'atmet',
    'Atmet Default',
    'gpt-5.6-terra',
    'AT',
    true,
    true,
    128000,
    true,
    '{"envModelKey":"ATMET_MODEL_ID","providerEnvKey":"ATMET_MODEL_PROVIDER"}'::jsonb,
    true
  ),
  (
    'atmet-luna',
    'atmet',
    'Atmet Lite',
    'gpt-5.6-luna',
    'AL',
    false,
    true,
    64000,
    true,
    '{"envModelKey":"ATMET_LUNA_MODEL_ID","providerEnvKey":"ATMET_MODEL_PROVIDER"}'::jsonb,
    true
  )
on conflict (key) do update
set provider_key = excluded.provider_key,
    display_name = excluded.display_name,
    model_id = excluded.model_id,
    logo = excluded.logo,
    is_atmet_default = excluded.is_atmet_default,
    is_platform_model = excluded.is_platform_model,
    context_window = excluded.context_window,
    supports_tools = excluded.supports_tools,
    settings = excluded.settings,
    enabled = excluded.enabled;

update public.ai_models
set enabled = false,
    is_atmet_default = false
where key in ('atmet-high', 'atmet-lite');
