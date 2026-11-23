import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useBlocker } from 'react-router-dom'
import { LANGS, type Lang } from '../content/defaults'
import { useI18n } from '../i18n/I18n'
import type { Key } from '../i18n/dict'
import { LANG_NAMES } from '../i18n/dict'

export type Field =
  | { name: string; label: Key | string; type: 'ml' | 'mltext' | 'mllist' | 'text' | 'url' | 'number' | 'bool' }
  | { name: string; label: Key | string; type: 'select'; options: string[] }

type Row = Record<string, unknown>
const input = 'mt-1 block w-full rounded-xl border border-cream/15 bg-ink px-3 py-2.5 text-base text-cream focus:border-lime focus:outline-none'

export function FieldEditor({ field, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) {
  const { t } = useI18n()
  const label = field.label.includes('.') ? t(field.label as Key) : field.label
  if (field.type === 'bool')
    return (
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input type="checkbox" className="size-5 accent-[var(--color-lime)]" checked={!!value} onChange={(e) => onChange(e.target.checked)} />{label}
      </label>
    )
  if (field.type === 'ml' || field.type === 'mltext' || field.type === 'mllist') {
    const v = (value ?? {}) as Partial<Record<Lang, string | string[]>>
    return (
      <fieldset className="rounded-2xl border border-cream/10 p-3">
        <legend className="px-1 text-sm font-semibold">{label}</legend>
        <div className="grid gap-2 md:grid-cols-2">
          {LANGS.map((l) => {
            const cur = field.type === 'mllist' ? ((v[l] as string[] | undefined) ?? []).join('\n') : ((v[l] as string | undefined) ?? '')
            const set = (s: string) => onChange({ ...v, [l]: field.type === 'mllist' ? s.split('\n') : s })
            return (
              <label key={l} className="text-xs text-cream/60">{LANG_NAMES[l]}
                {field.type === 'ml'
                  ? <input dir={l === 'ar' ? 'rtl' : 'ltr'} lang={l} className={input} value={cur} onChange={(e) => set(e.target.value)} />
                  : <textarea dir={l === 'ar' ? 'rtl' : 'ltr'} lang={l} rows={field.type === 'mllist' ? 5 : 3} className={input} value={cur} onChange={(e) => set(e.target.value)} />}
              </label>
            )
          })}
        </div>
      </fieldset>
    )
  }
  return (
    <label className="block text-sm font-semibold">{label}
      {field.type === 'select'
        ? <select className={input} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>{field.options.map((o) => <option key={o}>{o}</option>)}</select>
        : <input className={input} dir="ltr" type={field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'}
            value={String(value ?? '')} onChange={(e) => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)} />}
    </label>
  )
}

export function RowForm({ fields, row, onChange }: { fields: Field[]; row: Row; onChange: (r: Row) => void }) {
  return <div className="grid gap-3">{fields.map((f) => <FieldEditor key={f.name} field={f} value={row[f.name]} onChange={(v) => onChange({ ...row, [f.name]: v })} />)}</div>
}

/** Unsaved-changes guard: blocks in-app navigation and tab close while any editor is dirty. */
const DirtyCtx = createContext<(id: string, dirty: boolean) => void>(() => {})
const dirtySet = new Set<string>()
export function DirtyProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirtySet.size > 0 && currentLocation.pathname !== nextLocation.pathname)
  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (confirm(t('admin.leave'))) { dirtySet.clear(); blocker.proceed() } else blocker.reset()
  }, [blocker, t])
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirtySet.size) e.preventDefault() }
    addEventListener('beforeunload', h)
    return () => removeEventListener('beforeunload', h)
  }, [])
  const set = (id: string, d: boolean) => { if (d) dirtySet.add(id); else dirtySet.delete(id) }
  return <DirtyCtx.Provider value={set}>{children}</DirtyCtx.Provider>
}
export function useDirty(id: string, dirty: boolean) {
  const set = useContext(DirtyCtx)
  useEffect(() => { set(id, dirty); return () => set(id, false) }, [id, dirty, set])
}

export function Status({ loading, error, empty, retry, children }: { loading: boolean; error: string | null; empty?: boolean; retry?: () => void; children: ReactNode }) {
  const { t } = useI18n()
  if (loading) return <p className="animate-pulse py-10 text-center text-cream/60">{t('admin.loading')}</p>
  if (error) return (
    <div role="alert" className="rounded-2xl border border-magenta/40 bg-magenta/10 p-4 text-sm">
      {t('admin.error')} {error} {retry && <button className="ms-2 underline" onClick={retry}>{t('admin.retry')}</button>}
    </div>
  )
  if (empty) return <p className="rounded-2xl border border-dashed border-cream/20 p-10 text-center text-cream/60">{t('admin.empty')}</p>
  return <>{children}</>
}

export const btn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition active:translate-y-px disabled:opacity-50'
export const btnPrimary = `${btn} bg-lime text-ink`
export const btnGhost = `${btn} border border-cream/20 hover:bg-cream/10`
export const btnDanger = `${btn} border border-magenta/50 text-magenta hover:bg-magenta/10`
