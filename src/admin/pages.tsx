import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Camera, ChevronDown, Play, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { QRCard } from '../components/media'
import * as d from '../content/defaults'
import { useI18n } from '../i18n/I18n'
import { dicts, type Key } from '../i18n/dict'
import { BUCKET, publicUrl, supabase } from '../lib/supabase'
import { resolveSiteUrl } from '../site/Sections'
import { btnDanger, btnGhost, btnPrimary, RowForm, Status, useDirty, type Field } from './fields'

type Row = Record<string, unknown> & { id: string }
const ml = (name: string, label: Key | string, type: 'ml' | 'mltext' | 'mllist' = 'ml'): Field => ({ name, label, type })
const common: Field[] = [{ name: 'sort_order', label: 'admin.order', type: 'number' }, { name: 'visible', label: 'admin.visible', type: 'bool' }]
const emptyML = { en: '', fr: '', ar: '', es: '' }

export const collections: Record<string, { table: string; title: Key; fields: Field[]; blank: () => Record<string, unknown> }> = {
  experiences: {
    table: 'experiences', title: 'admin.experiences',
    fields: [ml('role', 'Role'), ml('company', 'Company'), ml('location', 'Location'), { name: 'period', label: 'Period', type: 'text' }, ml('bullets', 'Responsibilities (one per line)', 'mllist'), ...common],
    blank: () => ({ role: emptyML, company: emptyML, location: emptyML, period: '', bullets: { en: [], fr: [], ar: [], es: [] }, visible: false }),
  },
  education: {
    table: 'education', title: 'admin.education',
    fields: [ml('title', 'admin.titleField'), ml('institution', 'Institution'), { name: 'period', label: 'Period', type: 'text' }, { name: 'kind', label: 'Kind', type: 'select', options: ['degree', 'certification'] }, ...common],
    blank: () => ({ title: emptyML, institution: emptyML, period: '', kind: 'degree', visible: false }),
  },
  skills: {
    table: 'skills', title: 'admin.skills',
    fields: [ml('name', 'Name'), { name: 'category', label: 'admin.category', type: 'select', options: ['care', 'operations', 'office'] }, ...common],
    blank: () => ({ name: emptyML, category: 'care', visible: false }),
  },
  languages: {
    table: 'languages', title: 'admin.languages',
    fields: [ml('name', 'Name'), ml('level', 'Level'), ...common],
    blank: () => ({ name: emptyML, level: emptyML, visible: false }),
  },
  socials: {
    table: 'social_links', title: 'admin.socials',
    fields: [{ name: 'platform', label: 'Platform', type: 'select', options: ['instagram', 'whatsapp', 'email', 'phone'] }, { name: 'url', label: 'URL (https:// or mailto:)', type: 'url' }, ml('label', 'Label'), ...common],
    blank: () => ({ platform: 'instagram', url: 'https://', label: emptyML, visible: false }),
  },
}
const mediaFields: Field[] = [
  ml('title', 'admin.titleField'), ml('description', 'admin.description', 'mltext'), ml('caption', 'admin.caption'),
  { name: 'category', label: 'admin.category', type: 'select', options: d.CATEGORIES },
  { name: 'featured', label: 'admin.featured', type: 'bool' }, { name: 'is_illustration', label: 'admin.illustration', type: 'bool' }, ...common,
]

function useRows(table: string) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => {
    setLoading(true); setError(null)
    const { data, error } = await supabase.from(table).select('*').order('sort_order')
    if (error) setError(error.message); else setRows(data as Row[])
    setLoading(false)
  }, [table])
  useEffect(() => { void load() }, [load])
  return { rows, setRows, loading, error, load }
}

const card = 'rounded-2xl bg-ink ring-1 ring-black/5 shadow-[0_1px_2px_rgb(0_0_0/.04),0_10px_30px_-16px_rgb(29_15_43/.25)]'
const pill = (live: boolean) => `rounded-full px-2 py-0.5 text-[11px] font-semibold ${live ? 'bg-[#e7f8ee] text-[#15803d]' : 'bg-black/5 text-[#6b5f73]'}`

function RowCard({ row, fields, table, onSaved, onDelete, preview, extra, tile = false }: {
  row: Row; fields: Field[]; table: string; onSaved: (r: Row) => void; onDelete: () => Promise<void>; preview?: ReactNode; extra?: ReactNode; tile?: boolean
}) {
  const { t, ml: tml } = useI18n()
  const [edit, setEdit] = useState(row)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  useEffect(() => setEdit(row), [row])
  const dirty = JSON.stringify(edit) !== JSON.stringify(row)
  useDirty(`${table}:${row.id}`, dirty)
  const firstMl = fields.find((f) => f.type === 'ml')?.name
  const save = async () => {
    setBusy(true); setMsg('')
    const { id, created_at: _c, updated_at: _u, ...patch } = edit
    void _c; void _u
    const { data, error } = await supabase.from(table).update(patch).eq('id', id).select().single()
    setBusy(false)
    if (error) setMsg(`${t('admin.error')} ${error.message}`); else { onSaved(data as Row); setMsg(t('admin.saved')) }
  }
  return (
    <li className={`${card} overflow-hidden transition-shadow hover:shadow-[0_14px_40px_-16px_rgb(29_15_43/.35)] ${tile && open ? 'col-span-full' : ''}`}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
        className={`w-full text-start ${tile && !open ? 'block' : 'flex min-h-16 items-center gap-3 p-3 md:p-4'}`}>
        {tile && !open ? <span className="relative block aspect-square overflow-hidden bg-ink-2">{preview}</span> : tile ? null : preview}
        <span className={`min-w-0 flex-1 ${tile && !open ? 'block p-3' : ''}`}>
          <span className="block truncate font-semibold">{firstMl ? tml(edit[firstMl] as d.ML) || '—' : String(edit.id)}</span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-mute">
            <span className={pill(!!edit.visible)}>{edit.visible ? t('admin.live') : t('admin.draft')}</span>
            <span>#{String(edit.sort_order)}</span>
            {dirty && <span className="font-semibold text-magenta">• {t('admin.unsaved')}</span>}
          </span>
        </span>
        {!(tile && !open) && <span aria-hidden className={`grid size-9 place-items-center rounded-full bg-ink-2 transition-transform ${open ? 'rotate-180' : ''}`}><ChevronDown className="size-4" /></span>}
      </button>
      {open && (
        <div className="space-y-4 border-t border-black/5 p-3 md:p-5">
          {extra}
          <RowForm fields={fields} row={edit} onChange={(r) => setEdit(r as Row)} />
          <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] -mx-3 flex flex-wrap items-center gap-2 border-t border-black/5 bg-ink/95 p-3 backdrop-blur md:-mx-5 md:px-5 lg:bottom-0">
            <button className={btnPrimary} disabled={!dirty || busy} onClick={save}>{t('admin.save')}</button>
            <button className={btnDanger} disabled={busy} onClick={async () => { if (confirm(t('admin.confirmDelete'))) { setBusy(true); await onDelete(); setBusy(false) } }}>{t('admin.delete')}</button>
            <span role="status" className="text-sm text-cream/70">{msg}</span>
          </div>
        </div>
      )}
    </li>
  )
}

export function CollectionPage({ kind }: { kind: keyof typeof collections }) {
  const c = collections[kind]
  const { t } = useI18n()
  const { rows, setRows, loading, error, load } = useRows(c.table)
  const [err, setErr] = useState('')
  const add = async () => {
    const { data, error } = await supabase.from(c.table).insert({ ...c.blank(), sort_order: rows.length + 1 }).select().single()
    if (error) setErr(error.message); else setRows([...rows, data as Row])
  }
  return (
    <Page title={t(c.title)} action={<button className={btnPrimary} onClick={add}>+ {t('admin.add')}</button>}>
      {err && <p role="alert" className="mb-3 text-magenta">{t('admin.error')} {err}</p>}
      <Status loading={loading} error={error} empty={!rows.length} retry={load}>
        <ul className="space-y-3">
          {rows.map((r) => (
            <RowCard key={r.id} row={r} fields={c.fields} table={c.table}
              onSaved={(n) => setRows(rows.map((x) => (x.id === n.id ? n : x)))}
              onDelete={async () => {
                const { error } = await supabase.from(c.table).delete().eq('id', r.id)
                if (error) setErr(error.message); else setRows(rows.filter((x) => x.id !== r.id))
              }} />
          ))}
        </ul>
      </Status>
    </Page>
  )
}

export function Page({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <h2 className="sr-only">{title}</h2>
      {action && <div className="mb-5 flex flex-wrap items-center justify-end gap-3">{action}</div>}
      {children}
    </div>
  )
}

// ── Draft / preview / publish for sections & settings ─────────────
function useDraftable(entity: 'section' | 'settings', id: string, liveTable: 'portfolio_sections' | 'site_settings') {
  const col = liveTable === 'portfolio_sections' ? 'content' : 'value'
  const [live, setLive] = useState<Record<string, unknown> | null>(null)
  const [value, setValue] = useState<Record<string, unknown> | null>(null)
  const [saved, setSaved] = useState<string>('')
  const [hasDraft, setHasDraft] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => {
    setError(null); setValue(null)
    const [l, dr] = await Promise.all([
      supabase.from(liveTable).select(col).eq('key', id).maybeSingle(),
      supabase.from('content_drafts').select('data').eq('entity', entity).eq('entity_id', id).maybeSingle(),
    ])
    if (l.error || dr.error) { setError((l.error ?? dr.error)!.message); return }
    const liveVal = ((l.data as Record<string, unknown> | null)?.[col] ?? {}) as Record<string, unknown>
    const v = (dr.data?.data as Record<string, unknown>) ?? liveVal
    setLive(liveVal); setValue(v); setSaved(JSON.stringify(v)); setHasDraft(!!dr.data)
  }, [entity, id, liveTable, col])
  useEffect(() => { void load() }, [load])
  const saveDraft = async () => {
    const { error } = await supabase.from('content_drafts').upsert({ entity, entity_id: id, data: value })
    if (error) throw error
    setSaved(JSON.stringify(value)); setHasDraft(true)
  }
  const publish = async () => {
    const { error } = await supabase.from(liveTable).upsert({ key: id, [col]: value })
    if (error) throw error
    await supabase.from('content_drafts').delete().eq('entity', entity).eq('entity_id', id)
    setLive(value); setSaved(JSON.stringify(value)); setHasDraft(false)
  }
  return { value, setValue, live, dirty: value !== null && JSON.stringify(value) !== saved, hasDraft, error, load, saveDraft, publish }
}

function DraftEditor({ entity, id, table, fields, children }: { entity: 'section' | 'settings'; id: string; table: 'portfolio_sections' | 'site_settings'; fields: Field[]; children?: (v: Record<string, unknown>) => ReactNode }) {
  const { t } = useI18n()
  const s = useDraftable(entity, id, table)
  const [msg, setMsg] = useState('')
  useDirty(`${entity}:${id}`, s.dirty)
  const run = (fn: () => Promise<void>, ok: Key) => async () => {
    setMsg('')
    try { await fn(); setMsg(t(ok)) } catch (e) { setMsg(`${t('admin.error')} ${(e as Error).message}`) }
  }
  return (
    <Status loading={!s.value && !s.error} error={s.error} retry={s.load}>
      {s.value && (
        <div className="space-y-4">
          <p className="text-sm"><span className={`rounded-full px-2 py-1 text-xs font-bold ${s.hasDraft ? 'bg-lilac/20 text-lilac' : 'bg-lime/15 text-lime'}`}>{s.hasDraft ? t('admin.draft') : t('admin.live')}</span>
            {s.dirty && <span className="ms-2 text-magenta">{t('admin.unsaved')}</span>}</p>
          <RowForm fields={fields} row={s.value} onChange={(v) => s.setValue(v)} />
          {children?.(s.value)}
          <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] flex flex-wrap gap-2 rounded-2xl bg-ink/95 p-3 shadow-[0_10px_30px_-10px_rgb(29_15_43/.35)] ring-1 ring-black/5 backdrop-blur lg:bottom-4">
            <button className={btnGhost} disabled={!s.dirty} onClick={run(s.saveDraft, 'admin.saved')}>{t('admin.saveDraft')}</button>
            <button className={btnGhost} onClick={run(async () => { await s.saveDraft(); open('/?preview=1', '_blank') }, 'admin.saved')}>{t('admin.preview')}</button>
            <button className={btnPrimary} onClick={run(s.publish, 'admin.published')}>{t('admin.publish')}</button>
            <span role="status" className="self-center text-sm text-cream/70">{msg}</span>
          </div>
        </div>
      )}
    </Status>
  )
}

const sectionFields: Record<keyof d.Sections, Field[]> = {
  hero: [ml('kicker', 'Positioning'), ml('headline', 'Headline', 'mltext'), ml('intro', 'Intro', 'mltext')],
  about: [ml('title', 'admin.titleField'), ml('body', 'Profile', 'mltext'), ml('location', 'Location'), ml('nationality', 'Nationality'), ml('relocation', 'Relocation')],
  dance: [ml('intro', 'Intro', 'mltext')],
  contact: [ml('intro', 'Intro', 'mltext')],
}

export function ContentPage() {
  const { t } = useI18n()
  const [key, setKey] = useState<keyof d.Sections>('hero')
  return (
    <Page title={t('admin.content')}>
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {(Object.keys(sectionFields) as (keyof d.Sections)[]).map((k) => (
          <button key={k} aria-pressed={k === key} onClick={() => setKey(k)} className={`${k === key ? btnPrimary : btnGhost} shrink-0 capitalize`}>{k}</button>
        ))}
      </div>
      <DraftEditor key={key} entity="section" id={key} table="portfolio_sections" fields={sectionFields[key]}>
        {key === 'about' ? (v) => <p className="text-xs text-cream/50">Stats: {(v.stats as d.Stat[] | undefined)?.map((s) => `${s.value}${s.suffix}`).join(' · ')}</p> : undefined}
      </DraftEditor>
    </Page>
  )
}

export function SettingsPage() {
  const { t } = useI18n()
  return (
    <Page title={t('admin.settings')}>
      <DraftEditor entity="settings" id="general" table="site_settings" fields={[
        { name: 'name', label: 'Name', type: 'text' }, { name: 'email', label: 'admin.email', type: 'text' }, { name: 'phone', label: 'Phone', type: 'text' },
        { name: 'whatsapp', label: 'WhatsApp URL', type: 'url' }, { name: 'instagram', label: 'Instagram URL', type: 'url' },
        { name: 'siteUrl', label: 'Public site URL (production)', type: 'url' },
      ]} />
    </Page>
  )
}

export function QrPage() {
  const { t, ml: tml } = useI18n()
  return (
    <Page title={t('admin.qr')}>
      <DraftEditor entity="settings" id="general" table="site_settings" fields={[
        { name: 'qrUrl', label: 'QR target URL (empty = public site URL)', type: 'url' }, ml('qrLabel', 'Label'),
      ]}>
        {(v) => <div className="max-w-xs"><QRCard url={resolveSiteUrl({ ...d.settings, ...(v as object) } as d.Settings)} label={tml(v.qrLabel as d.ML)} /></div>}
      </DraftEditor>
    </Page>
  )
}

export function TranslationsPage() {
  const { t } = useI18n()
  const [lang, setLang] = useState<d.Lang>('fr')
  const [q, setQ] = useState('')
  const [val, setVal] = useState<Record<string, Record<string, string>> | null>(null)
  const [saved, setSaved] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('site_settings').select('value').eq('key', 'translations').maybeSingle()
    if (error) { setError(error.message); return }
    const v = (data?.value ?? {}) as Record<string, Record<string, string>>
    setVal(v); setSaved(JSON.stringify(v))
  }, [])
  useEffect(() => { void load() }, [load])
  const dirty = !!val && JSON.stringify(val) !== saved
  useDirty('translations', dirty)
  const keys = useMemo(() => (Object.keys(dicts.en) as Key[]).filter((k) => !q || k.includes(q) || dicts[lang][k].toLowerCase().includes(q.toLowerCase())), [q, lang])
  const save = async () => {
    const clean = Object.fromEntries(Object.entries(val ?? {}).map(([l, m]) => [l, Object.fromEntries(Object.entries(m).filter(([, s]) => s.trim()))]))
    const { error } = await supabase.from('site_settings').upsert({ key: 'translations', value: clean })
    if (error) setMsg(`${t('admin.error')} ${error.message}`); else { setVal(clean); setSaved(JSON.stringify(clean)); setMsg(t('admin.published')) }
  }
  return (
    <Page title={t('admin.translations')} action={<button className={btnPrimary} disabled={!dirty} onClick={save}>{t('admin.publish')}</button>}>
      <p role="status" className="mb-3 text-sm text-cream/70">{msg}</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {d.LANGS.map((l) => <button key={l} aria-pressed={l === lang} onClick={() => setLang(l)} className={l === lang ? btnPrimary : btnGhost}>{l.toUpperCase()}</button>)}
        <input placeholder={t('admin.search')} value={q} onChange={(e) => setQ(e.target.value)} className="min-h-11 flex-1 rounded-full border border-cream/15 bg-ink px-4" />
      </div>
      <Status loading={!val && !error} error={error} retry={load}>
        <ul className="space-y-2">
          {keys.map((k) => (
            <li key={k} className={`${card} grid gap-1 p-3 md:grid-cols-[14rem_1fr_1fr] md:items-center md:gap-3`}>
              <code className="text-xs text-cream/50">{k}</code>
              <span className="text-sm text-cream/70" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{dicts[lang][k]}</span>
              <input aria-label={`${t('admin.override')} ${k}`} dir={lang === 'ar' ? 'rtl' : 'ltr'} placeholder={t('admin.override')}
                value={val?.[lang]?.[k] ?? ''} onChange={(e) => setVal({ ...val, [lang]: { ...val?.[lang], [k]: e.target.value } })}
                className="min-h-11 rounded-xl border border-cream/15 bg-ink px-3" />
            </li>
          ))}
        </ul>
      </Status>
    </Page>
  )
}

// ── Media library ──────────────────────────────────────────────────
const MAX = 50 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
const pathFromUrl = (u?: unknown) => (typeof u === 'string' && u.includes(`/object/public/${BUCKET}/`) ? decodeURIComponent(u.split(`/object/public/${BUCKET}/`)[1]) : null)

/** Upload with progress (XHR, since fetch has no upload progress). */
async function uploadFile(file: Blob, path: string, type: string, onProgress: (p: number) => void) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Not signed in')
  await new Promise<void>((resolve, reject) => {
    const x = new XMLHttpRequest()
    x.open('POST', `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`)
    x.setRequestHeader('Authorization', `Bearer ${token}`)
    x.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
    x.setRequestHeader('Content-Type', type)
    x.setRequestHeader('cache-control', 'max-age=31536000')
    x.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total)
    x.onload = () => (x.status < 300 ? resolve() : reject(new Error(JSON.parse(x.responseText || '{}').message || `HTTP ${x.status}`)))
    x.onerror = () => reject(new Error('Network error'))
    x.send(file)
  })
  const { error } = await supabase.from('media_assets').insert({ storage_path: path, kind: type.startsWith('video') ? 'video' : 'image', mime: type, size_bytes: file.size })
  if (error) { await supabase.storage.from(BUCKET).remove([path]); throw error } // no orphan objects
  return publicUrl(path)
}

/** Grabs a frame from a local video file to use as its poster. */
function videoPoster(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const v = document.createElement('video')
    v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = URL.createObjectURL(file)
    v.onloadeddata = () => { v.currentTime = Math.min(1, (v.duration || 2) / 2) }
    v.onseeked = () => {
      const c = document.createElement('canvas')
      c.width = v.videoWidth; c.height = v.videoHeight
      c.getContext('2d')?.drawImage(v, 0, 0)
      c.toBlob((b) => { URL.revokeObjectURL(v.src); resolve(b) }, 'image/webp', 0.8)
    }
    v.onerror = () => resolve(null)
  })
}

async function storeMedia(file: File, onProgress: (p: number) => void) {
  if (!ALLOWED.includes(file.type)) throw new Error('admin.fileType')
  if (file.size > MAX) throw new Error('admin.fileTooLarge')
  const base = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}`
  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
  const isVideo = file.type.startsWith('video')
  const src = await uploadFile(file, `${base}.${ext}`, file.type, (p) => onProgress(isVideo ? p * 0.9 : p))
  let poster: string | null = null
  if (isVideo) {
    const blob = await videoPoster(file)
    if (blob) poster = await uploadFile(blob, `${base}.poster.webp`, 'image/webp', (p) => onProgress(0.9 + p * 0.1))
  }
  return { kind: isVideo ? 'video' : 'image', src, poster, thumb: poster ?? src }
}

async function removeStored(urls: unknown[]) {
  const paths = urls.map(pathFromUrl).filter((p): p is string => !!p)
  if (!paths.length) return
  const { error } = await supabase.storage.from(BUCKET).remove(paths)
  if (error) throw error
  await supabase.from('media_assets').delete().in('storage_path', paths)
}

export function MediaPage() {
  const { t, ml: tml } = useI18n()
  const { rows, setRows, loading, error, load } = useRows('portfolio_items')
  const [progress, setProgress] = useState<{ name: string; p: number } | null>(null)
  const [err, setErr] = useState('')
  const [orphans, setOrphans] = useState<string[]>([])
  const checkOrphans = useCallback(async () => {
    const { data } = await supabase.rpc('orphan_media')
    setOrphans(((data ?? []) as unknown[]).map((r) => (typeof r === 'string' ? r : Object.values(r as object)[0] as string)))
  }, [])
  useEffect(() => { void checkOrphans() }, [checkOrphans])

  const onFiles = async (files: FileList | null) => {
    setErr('')
    for (const file of Array.from(files ?? [])) {
      try {
        setProgress({ name: file.name, p: 0 })
        const m = await storeMedia(file, (p) => setProgress({ name: file.name, p }))
        const title = file.name.replace(/\.[^.]+$/, '')
        const { data, error } = await supabase.from('portfolio_items').insert({
          ...m, title: { ...emptyML, en: title }, caption: emptyML, description: emptyML, category: 'dance', sort_order: rows.length + 1, visible: false,
        }).select().single()
        if (error) { await removeStored([m.src, m.poster]); throw error }
        setRows((r) => [...r, data as Row])
      } catch (e) {
        const m = (e as Error).message
        setErr(m.startsWith('admin.') ? t(m as Key) : `${file.name}: ${m}`)
      }
    }
    setProgress(null)
    void checkOrphans()
  }

  const replace = async (row: Row, file: File) => {
    setErr('')
    try {
      setProgress({ name: file.name, p: 0 })
      const m = await storeMedia(file, (p) => setProgress({ name: file.name, p }))
      const { data, error } = await supabase.from('portfolio_items').update(m).eq('id', row.id).select().single()
      if (error) { await removeStored([m.src, m.poster]); throw error }
      await removeStored([row.src, row.poster]) // old files only after the new ones are live
      setRows((r) => r.map((x) => (x.id === row.id ? (data as Row) : x)))
    } catch (e) { setErr((e as Error).message) }
    setProgress(null)
  }

  const [drag, setDrag] = useState(false)
  const picker = (label: string, capture?: boolean) => (
    <label className={`${capture ? btnGhost : btnPrimary} cursor-pointer`}>
      {capture ? <Camera className="size-4" aria-hidden /> : <Upload className="size-4" aria-hidden />}{label}
      <input type="file" className="sr-only" multiple={!capture} accept="image/*,video/*" {...(capture ? { capture: 'environment' } : {})}
        onChange={(e) => { void onFiles(e.target.files); e.target.value = '' }} disabled={!!progress} />
    </label>
  )

  return (
    <Page title={t('admin.media')}>
      <div onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); void onFiles(e.dataTransfer.files) }}
        className={`mb-6 flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed p-6 text-center transition-colors md:p-8 ${drag ? 'border-magenta bg-magenta/5' : 'border-black/10 bg-ink'}`}>
        <span className="grid size-12 place-items-center rounded-2xl bg-magenta/10 text-magenta"><Upload aria-hidden /></span>
        <p className="font-semibold">{t('admin.dropHere')}</p>
        <p className="text-xs text-mute">{t('admin.dropHint')}</p>
        <div className="flex flex-wrap justify-center gap-2">{picker(t('admin.upload'))}{picker(t('admin.camera'), true)}</div>
      </div>
      {progress && (
        <div className="mb-4" role="status">
          <p className="mb-1 text-sm">{t('admin.uploading')} {progress.name} — {Math.round(progress.p * 100)}%</p>
          <div className="h-2 overflow-hidden rounded-full bg-black/5"><div className="h-full bg-gradient-to-r from-magenta to-lilac transition-[width]" style={{ width: `${progress.p * 100}%` }} /></div>
        </div>
      )}
      {err && <p role="alert" className="mb-4 text-magenta">{t('admin.error')} {err}</p>}
      {orphans.length > 0 && (
        <p className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-lilac/30 p-3 text-sm">
          {t('admin.orphans')}: {orphans.length}
          <button className={btnGhost} onClick={async () => { await supabase.storage.from(BUCKET).remove(orphans); void checkOrphans() }}>{t('admin.cleanup')}</button>
        </p>
      )}
      <Status loading={loading} error={error} empty={!rows.length} retry={load}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-4">
          {rows.map((r) => (
            <RowCard key={r.id} row={r} fields={mediaFields} table="portfolio_items" tile
              preview={<>
                <img src={String(r.thumb || r.poster || r.src)} alt="" className="h-full w-full object-cover" loading="lazy" />
                {r.kind === 'video' && <span className="absolute end-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 text-[#1d1426] shadow"><Play className="size-4" aria-hidden /></span>}
                {!!r.is_illustration && <span className="absolute start-2 top-2 rounded-full bg-[#1d0f2b]/75 px-2 py-0.5 text-[10px] font-bold uppercase text-white">{t('illus.label')}</span>}
              </>}
              extra={
                <div className="flex flex-wrap items-start gap-4">
                  {r.kind === 'video'
                    ? <video src={String(r.src)} poster={String(r.poster ?? '')} controls preload="none" className="max-h-72 rounded-xl" />
                    : <img src={String(r.src)} alt={tml(r.title as d.ML)} className="max-h-72 rounded-xl" />}
                  <label className={`${btnGhost} cursor-pointer`}>{t('admin.replace')}
                    <input type="file" accept="image/*,video/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) void replace(r, f); e.target.value = '' }} />
                  </label>
                </div>
              }
              onSaved={(n) => setRows(rows.map((x) => (x.id === n.id ? n : x)))}
              onDelete={async () => {
                const { error } = await supabase.from('portfolio_items').delete().eq('id', r.id)
                if (error) { setErr(error.message); return }
                try { await removeStored([r.src, r.poster]) } catch (e) { setErr((e as Error).message) }
                setRows(rows.filter((x) => x.id !== r.id))
              }} />
          ))}
        </ul>
      </Status>
    </Page>
  )
}

export function MessagesPage() {
  const { t } = useI18n()
  const [rows, setRows] = useState<{ id: string; name: string; email: string; message: string; created_at: string }[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message); else setRows(data)
  }, [])
  useEffect(() => { void load() }, [load])
  return (
    <Page title={t('admin.contact')} action={<Link className={btnGhost} to="/admin/settings">{t('admin.settings')}</Link>}>
      <Status loading={!rows && !error} error={error} retry={load}>
        {rows?.length === 0 ? <p className="text-cream/60">{t('admin.noMessages')}</p> : (
          <ul className="space-y-3">
            {rows?.map((m) => (
              <li key={m.id} className={`${card} p-4 md:p-5`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">{m.name} · <a className="text-lime underline" href={`mailto:${m.email}`}>{m.email}</a></p>
                  <time className="text-xs text-cream/50">{new Date(m.created_at).toLocaleString()}</time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-cream/80">{m.message}</p>
                <button className={`${btnDanger} mt-3`} onClick={async () => {
                  if (!confirm(t('admin.confirmDelete'))) return
                  const { error } = await supabase.from('contact_messages').delete().eq('id', m.id)
                  if (error) setError(error.message); else setRows(rows.filter((x) => x.id !== m.id))
                }}>{t('admin.delete')}</button>
              </li>
            ))}
          </ul>
        )}
      </Status>
    </Page>
  )
}

export function Overview() {
  const { t, ml: tml } = useI18n()
  const [counts, setCounts] = useState<Record<string, number | string>>({})
  const [recent, setRecent] = useState<{ label: string; when: string; to: string }[] | null>(null)
  useEffect(() => {
    const tables = ['portfolio_items', 'portfolio_sections', 'languages', 'contact_messages']
    void Promise.all(tables.map(async (tb) => {
      const { count, error } = await supabase.from(tb).select('*', { count: 'exact', head: true })
      return [tb, error ? '!' : count ?? 0] as const
    })).then((r) => setCounts(Object.fromEntries(r)))
    // Recent activity = latest edited rows across content tables
    void Promise.all([
      supabase.from('portfolio_items').select('title,updated_at').order('updated_at', { ascending: false }).limit(3),
      supabase.from('portfolio_sections').select('key,updated_at').order('updated_at', { ascending: false }).limit(2),
      supabase.from('contact_messages').select('name,created_at').order('created_at', { ascending: false }).limit(2),
    ]).then(([m, sec, msg]) => setRecent([
      ...(m.data ?? []).map((r) => ({ label: `${t('admin.media')} · ${tml(r.title as d.ML)}`, when: r.updated_at as string, to: '/admin/media' })),
      ...(sec.data ?? []).map((r) => ({ label: `${t('admin.content')} · ${r.key}`, when: r.updated_at as string, to: '/admin/content' })),
      ...(msg.data ?? []).map((r) => ({ label: `${t('admin.messages')} · ${r.name}`, when: r.created_at as string, to: '/admin/contact' })),
    ].sort((a, b) => b.when.localeCompare(a.when)).slice(0, 6)))
  }, [t, tml])
  const cards: [string, Key, string][] = [
    ['portfolio_items', 'admin.mediaItems', 'bg-[#e8f1ff] text-[#2563eb]'], ['portfolio_sections', 'admin.sections', 'bg-[#fff1e6] text-[#ea580c]'],
    ['languages', 'admin.languages', 'bg-[#fff9db] text-[#a16207]'], ['contact_messages', 'admin.messages', 'bg-[#e7f8ee] text-[#15803d]'],
  ]
  const ago = (iso: string) => {
    const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
    return new Intl.RelativeTimeFormat(document.documentElement.lang, { numeric: 'auto' }).format(-(m < 60 ? m : m < 1440 ? Math.round(m / 60) : Math.round(m / 1440)), m < 60 ? 'minute' : m < 1440 ? 'hour' : 'day')
  }
  const quick: [string, Key][] = [['/admin/media', 'admin.addPhoto'], ['/admin/media', 'admin.addVideo'], ['/admin/content', 'admin.editContent']]
  return (
    <Page title={t('admin.overview')}>
      <p className="-mt-4 mb-6 text-sm text-mute">{t('admin.manage')}</p>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map(([tb, k, tone]) => (
          <li key={tb} className="rounded-2xl border border-ink-3 bg-ink p-4 text-center shadow-sm">
            <span className={`mx-auto grid size-12 place-items-center rounded-full text-lg font-bold ${tone}`}>{counts[tb] ?? '…'}</span>
            <p className="mt-2 text-xs font-medium text-mute">{t(k)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-ink-3 bg-ink p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">{t('admin.recent')}</h2>
          <Status loading={!recent} error={null} empty={recent?.length === 0}>
            <ul className="divide-y divide-ink-3">
              {recent?.map((r, i) => (
                <li key={i}><Link to={r.to} className="flex min-h-12 items-center justify-between gap-3 text-sm hover:text-magenta">
                  <span className="truncate">{r.label}</span><time className="shrink-0 text-xs text-mute">{ago(r.when)}</time></Link></li>
              ))}
            </ul>
          </Status>
        </section>
        <section className="rounded-2xl border border-ink-3 bg-ink p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">{t('admin.quick')}</h2>
          <ul className="space-y-1">
            {quick.map(([to, k]) => <li key={k}><Link to={to} className="flex min-h-12 items-center gap-3 rounded-xl px-2 text-sm hover:bg-ink-2"><span className="grid size-8 place-items-center rounded-lg bg-magenta/10 text-magenta">+</span>{t(k)}</Link></li>)}
          </ul>
        </section>
      </div>
    </Page>
  )
}
