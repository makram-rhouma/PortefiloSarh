// Writes the migration that adds the mockup illustrations and reorders the gallery (node scripts/gen-gallery-migration.ts)
import { writeFileSync } from 'node:fs'
import * as d from '../src/content/defaults.ts'
const q = (v: unknown) => `'${String(v).replace(/'/g, "''")}'`
const j = (v: unknown) => `${q(JSON.stringify(v))}::jsonb`
const rows = d.portfolio.filter((p) => p.src.startsWith('/media/illus/'))
const sql = `-- Adds the illustrative visuals (AI-generated, flagged is_illustration) and the mockup gallery order.
${rows.map((p) => `insert into public.portfolio_items (id, kind, src, poster, thumb, title, description, caption, category, sort_order, featured, visible, is_illustration)
values (${q(p.id)}, 'image', ${q(p.src)}, null, ${q(p.thumb)}, ${j(p.title)}, ${j(p.description)}, ${j(p.caption)}, ${q(p.category)}, ${p.sort_order}, false, true, true) on conflict (id) do nothing;`).join('\n')}
${d.portfolio.filter((p) => !p.src.startsWith('/media/illus/')).map((p) => `update public.portfolio_items set sort_order = ${p.sort_order} where id = ${q(p.id)};`).join('\n')}
`
writeFileSync(new URL('../supabase/migrations/20261123000004_gallery_illustrations.sql', import.meta.url), sql)
console.log('written', rows.length, 'illustrations')
