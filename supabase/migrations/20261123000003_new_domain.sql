-- Production domain moved to https://sarah-jabalha.netlify.app (Netlify site renamed).
-- Updates only the stored site URL; a custom QR URL set by the admin is kept unless it pointed to the old domain.
update public.site_settings
set value = jsonb_set(
      jsonb_set(value, '{siteUrl}', '"https://sarah-jabalha.netlify.app"'),
      '{qrUrl}',
      case when value->>'qrUrl' like '%portefilosarhaproject%' then '""'::jsonb else coalesce(value->'qrUrl', '""'::jsonb) end)
where key = 'general';
select value->>'siteUrl' as site_url, value->>'qrUrl' as qr_url from public.site_settings where key = 'general';
