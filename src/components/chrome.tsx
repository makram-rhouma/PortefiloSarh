import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { LANGS } from '../content/defaults'
import { useI18n } from '../i18n/I18n'
import { LANG_NAMES, type Key } from '../i18n/dict'
import { dur, ease } from '../lib/motion'
import { Icon } from './ui'

/** Handwritten signature: strokes are traced, then the ink fills in. */
export function Signature({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion()
  return (
    <svg viewBox="0 0 560 140" className={className} role="img" aria-label="Sarah Jaballah">
      <defs>
        <linearGradient id="sig" x1="0" x2="1">
          <stop offset="0" stopColor="var(--color-cream)" /><stop offset=".7" stopColor="var(--color-cream)" /><stop offset="1" stopColor="var(--color-magenta)" />
        </linearGradient>
      </defs>
      <motion.text x="50%" y="62%" textAnchor="middle" direction="ltr" fontFamily="Allura, cursive" fontSize="104" textLength="520" lengthAdjust="spacingAndGlyphs"
        stroke="url(#sig)" strokeWidth="1.2" fill="url(#sig)" strokeDasharray="1400"
        initial={reduce ? false : { strokeDashoffset: 1400, fillOpacity: 0 }}
        animate={{ strokeDashoffset: 0, fillOpacity: 1 }}
        transition={{ strokeDashoffset: { duration: 2.4, ease: ease.inOut, delay: 0.3 }, fillOpacity: { duration: 0.9, delay: 2.1 } }}>
        Sarah Jaballah
      </motion.text>
    </svg>
  )
}

/** Logo-trace loader: monogram is drawn once per visit, then the page reveals. */
export function Loader() {
  const reduce = useReducedMotion()
  const { t } = useI18n()
  const [show, setShow] = useState(() => !reduce && !sessionStorage.getItem('sj-loaded'))
  useEffect(() => {
    if (!show) return
    sessionStorage.setItem('sj-loaded', '1')
    const id = setTimeout(() => setShow(false), 1700)
    return () => clearTimeout(id)
  }, [show])
  return (
    <AnimatePresence>
      {show && (
        <motion.div role="status" aria-label={t('loader.label')} className="fixed inset-0 z-[100] grid place-items-center bg-ink"
          exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: dur.slow, ease: ease.inOut }}>
          <svg viewBox="0 0 200 200" className="size-36">
            <motion.circle cx="100" cy="100" r="90" fill="none" stroke="var(--color-magenta)" strokeWidth="1.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.3, ease: ease.inOut }} />
            <motion.text x="100" y="128" textAnchor="middle" fontFamily="Allura, cursive" fontSize="96" fill="none"
              stroke="var(--color-cream)" strokeWidth="1.2" strokeDasharray="600"
              initial={{ strokeDashoffset: 600 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 1.4, ease: ease.inOut }}>
              SJ
            </motion.text>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const NAV: { id: string; key: Key }[] = [
  { id: 'about', key: 'nav.about' }, { id: 'journey', key: 'nav.journey' }, { id: 'dance', key: 'nav.dance' },
  { id: 'gallery', key: 'nav.gallery' }, { id: 'skills', key: 'nav.skills' }, { id: 'education', key: 'nav.education' },
  { id: 'contact', key: 'nav.contact' },
]

export function LangSwitch({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n()
  return (
    <div role="group" aria-label={t('nav.language')} className="flex items-center gap-1 rounded-full border border-cream/15 p-1">
      {LANGS.map((l) => (
        <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l} lang={l}
          title={LANG_NAMES[l]}
          className={`min-h-10 min-w-10 rounded-full px-2 text-xs font-bold uppercase transition-colors duration-[var(--dur-fast)]
            ${lang === l ? 'bg-cream text-ink' : 'text-cream/70 hover:text-cream'}`}>
          {compact ? l : LANG_NAMES[l]}
        </button>
      ))}
    </div>
  )
}

export function Header({ email }: { email: string }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const on = () => setScrolled(scrollY > 24)
    on(); addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])

  // Escape closes, Tab stays inside the menu, body does not scroll behind it
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const first = menuRef.current?.querySelector<HTMLElement>('a,button')
    first?.focus()
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key !== 'Tab' || !menuRef.current) return
      const f = [...menuRef.current.querySelectorAll<HTMLElement>('a,button')]
      const [a, z] = [f[0], f[f.length - 1]]
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() }
    }
    addEventListener('keydown', key)
    return () => { removeEventListener('keydown', key); document.body.style.overflow = prev; btnRef.current?.focus() }
  }, [open])

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-cream focus:px-4 focus:py-2 focus:text-ink">
        {t('nav.skip')}
      </a>
      <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter] duration-[var(--dur-base)]
        ${scrolled ? 'bg-ink/75 backdrop-blur-xl' : ''}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
          <a href="#top" className="font-script text-3xl leading-none" dir="ltr" aria-label="Sarah Jaballah — home">Sarah J.</a>
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex gap-6 text-sm text-cream/80">
              {NAV.map((n) => <li key={n.id}><a className="py-2 hover:text-cream" href={`#${n.id}`}>{t(n.key)}</a></li>)}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden md:block"><LangSwitch compact /></div>
            <button ref={btnRef} type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mobile-menu"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cream/20 px-4 text-sm lg:hidden">
              <Icon name="menu" /> {t('nav.menu')}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" ref={menuRef} role="dialog" aria-modal="true" aria-label={t('nav.menu')}
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-ink"
            initial={{ clipPath: 'circle(0% at 100% 0%)' }} animate={{ clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ clipPath: 'circle(0% at 100% 0%)' }} transition={{ duration: dur.slow, ease: ease.inOut }}>
            <div aria-hidden className="aurora pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative flex h-16 items-center justify-between px-5">
              <span className="font-script text-3xl" dir="ltr">Sarah J.</span>
              <button type="button" onClick={() => setOpen(false)} className="grid size-12 place-items-center rounded-full border border-cream/20" aria-label={t('nav.close')}>
                <Icon name="close" />
              </button>
            </div>
            <nav aria-label="Mobile" className="relative flex-1 px-6 pt-6">
              <ol className="space-y-1">
                {NAV.map((n, i) => (
                  <motion.li key={n.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05, duration: dur.base, ease: ease.out }}>
                    <a href={`#${n.id}`} onClick={() => setOpen(false)} className="flex min-h-14 items-baseline gap-4 font-display text-4xl">
                      <span className="text-xs text-lime tabular-nums">0{i + 1}</span>{t(n.key)}
                    </a>
                  </motion.li>
                ))}
              </ol>
            </nav>
            <div className="relative space-y-4 px-6 pb-10 pt-6">
              <LangSwitch />
              <a href={`mailto:${email}`} className="flex min-h-12 items-center gap-3 text-cream/80"><Icon name="mail" />{email}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
