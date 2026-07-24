update public.ai_models
set display_name = case key
  when 'atmet-sol' then 'Atmet High'
  when 'atmet' then 'Atmet Default'
  when 'atmet-luna' then 'Atmet Lite'
  when 'claude-sonnet' then 'Claude'
  else display_name
end
where key in ('atmet-sol', 'atmet', 'atmet-luna', 'claude-sonnet');
