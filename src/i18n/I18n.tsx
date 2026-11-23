import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { LANGS, type Lang, type ML } from '../content/defaults'
import { dicts, type Key } from './dict'

const STORAGE = 'sj-lang'
type Overrides = Partial<Record<Lang, Record<string, string>>>
interface Ctx { lang: Lang; dir: 'ltr' | 'rtl'; setLang: (l: Lang) => void; t: (k: Key) => string; ml: (v?: Partial<ML> | null) => string }
const I18nCtx = createContext<Ctx | null>(null)

export function initialLang(): Lang {
  const saved = localStorage.getItem(STORAGE) as Lang | null
  if (saved && LANGS.includes(saved)) return saved
  return 'en' // EN is the default; the visitor's choice is remembered
}

export function I18nProvider({ children, overrides = {} }: { children: ReactNode; overrides?: Overrides }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [lang, dir])
  const setLang = useCallback((l: Lang) => {
    // keep the reader on the same spot: switching dir/fonts can reflow the page
    const anchor = [...document.querySelectorAll('section[id]')].find((s) => s.getBoundingClientRect().bottom > 80)
    const offset = anchor?.getBoundingClientRect().top ?? 0
    localStorage.setItem(STORAGE, l)
    setLangState(l)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (anchor) window.scrollBy({ top: anchor.getBoundingClientRect().top - offset, behavior: 'instant' as ScrollBehavior })
    }))
  }, [])
  const value = useMemo<Ctx>(() => ({
    lang, dir, setLang,
    t: (k) => overrides[lang]?.[k] || dicts[lang][k] || dicts.en[k],
    ml: (v) => (v ? v[lang] || v.en || '' : ''),
  }), [lang, dir, setLang, overrides])
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const c = useContext(I18nCtx)
  if (!c) throw new Error('useI18n outside I18nProvider')
  return c
}
