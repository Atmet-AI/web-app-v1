insert into public.app_catalog (key, name, description, logo, gradient)
values
  ('chatgpt', 'ChatGPT', 'Use OpenAI chat models inside Atmet workflows.', 'AI', 'from-emerald-400/20 via-stone-100/10 to-stone-500/10'),
  ('gmail', 'Gmail', 'Read, draft, and send Gmail messages with workspace context.', 'GM', 'from-red-300/20 via-stone-100/10 to-blue-300/10'),
  ('google-sheets', 'Google Sheets', 'Read spreadsheet data and create structured updates.', 'GS', 'from-green-300/20 via-stone-100/10 to-emerald-300/10'),
  ('instagram', 'Instagram', 'Track Instagram content, comments, and social workflow context.', 'IG', 'from-pink-400/20 via-stone-100/10 to-orange-300/10'),
  ('calendar', 'Calendar', 'Read calendar events and schedule workflow follow-ups.', 'CA', 'from-blue-300/20 via-stone-100/10 to-amber-300/10'),
  ('telegram', 'Telegram', 'Route Telegram messages and workflow updates through Atmet.', 'TG', 'from-sky-400/20 via-stone-100/10 to-cyan-300/10')
on conflict (key) do update
set name = excluded.name,
    description = excluded.description,
    logo = excluded.logo,
    gradient = excluded.gradient,
    enabled = true;
