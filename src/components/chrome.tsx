import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, Globe, Home, Lock, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { LANGS } from '../content/defaults'
import { useI18n } from '../i18n/I18n'
import { LANG_NAMES, type Key } from '../i18n/dict'
import { dur, ease } from '../lib/motion'
import { Icon } from './ui'

export function Crown({ className = 'w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className} fill="none" stroke="var(--color-gold)" strokeWidth="2.6" strokeLinejoin="round" aria-hidden>
      <path d="M4 28 L2 6 L14 16 L24 2 L34 16 L46 6 L44 28 Z" />
    </svg>
  )
}

/** Brush signature "Sarah Jaballah": revealed like a pen stroke from left to right. */
export function Signature({ className = '', stacked = false }: { className?: string; stacked?: boolean }) {
  const reduce = useReducedMotion()
  const reveal = (delay: number) => (reduce ? {} : {
    initial: { clipPath: 'inset(-40% 100% -40% -10%)' }, animate: { clipPath: 'inset(-40% -10% -40% -10%)' },
    transition: { duration: 1.1, ease: ease.inOut, delay },
  })
  return (
    <p dir="ltr" aria-label="Sarah Jaballah" className={`font-script leading-[.9] ${stacked ? 'flex flex-col' : 'flex flex-wrap items-baseline gap-x-[.25em]'} ${className}`}>
      <motion.span aria-hidden className="text-cream drop-shadow-[0_4px_18px_rgb(0_0_0/.5)]" {...reveal(0.2)}>Sarah</motion.span>
      <motion.span aria-hidden className={`text-magenta drop-shadow-[0_0_18px_rgb(255_46_147/.45)] ${stacked ? 'ps-[.6em]' : ''}`} {...reveal(0.9)}>Jaballah</motion.span>
    </p>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <a href="#top" aria-label="Sarah Jaballah — home" className={`relative inline-flex min-h-11 items-end ${className}`} dir="ltr">
      <Crown className="absolute -top-2 left-1 w-6" />
      <span className="font-script text-[2rem] leading-none text-cream">Sarah</span>
      <span className="ms-1.5 font-script text-[2rem] leading-none text-magenta">Jaballah</span>
    </a>
  )
}

/** Loader: the crown is traced, then the page reveals. Once per visit. */
export function Loader() {
  const reduce = useReducedMotion()
  const { t } = useI18n()
  const [show, setShow] = useState(() => !reduce && !sessionStorage.getItem('sj-loaded'))
  useEffect(() => {
    if (!show) return
    sessionStorage.setItem('sj-loaded', '1')
    const id = setTimeout(() => setShow(false), 1600)
    return () => clearTimeout(id)
  }, [show])
  return (
    <AnimatePresence>
      {show && (
        <motion.div role="status" aria-label={t('loader.label')} className="hero-bg fixed inset-0 z-[100] grid place-items-center"
          exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: dur.slow, ease: ease.inOut }}>
          <div className="grid place-items-center gap-2">
            <svg viewBox="0 0 48 32" className="w-20" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinejoin="round">
              <motion.path d="M4 28 L2 6 L14 16 L24 2 L34 16 L46 6 L44 28 Z" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: ease.inOut }} />
            </svg>
            <Signature className="text-5xl" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const NAV: { id: string; key: Key }[] = [
  { id: 'top', key: 'nav.home' }, { id: 'about', key: 'nav.about' }, { id: 'journey', key: 'nav.experience' },
  { id: 'dance', key: 'nav.dance' }, { id: 'gallery', key: 'nav.gallery' }, { id: 'skills', key: 'nav.skills' }, { id: 'contact', key: 'nav.contact' },
]

/** Tracks which section crosses the middle of the viewport. */
export function useActiveSection(ids: string[], map: (id: string) => string = (x) => x) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) setActive(map(e.target.id)) }, { rootMargin: '-45% 0px -50% 0px' })
    for (const id of ids) { const el = document.getElementById(id); if (el) io.observe(el) }
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join()])
  return [active, setActive] as const
}

/** Language dropdown (globe · EN ▾). */
export function LangMenu({ up = false }: { up?: boolean }) {
  const { lang, setLang, t } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: Event) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('pointerdown', close); addEventListener('keydown', esc)
    return () => { removeEventListener('pointerdown', close); removeEventListener('keydown', esc) }
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="true" aria-label={t('nav.language')}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cream/20 bg-ink/40 px-4 text-sm font-semibold backdrop-blur hover:border-cream/50">
        <Globe className="size-4" aria-hidden />{lang.toUpperCase()}<ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul initial={{ opacity: 0, y: up ? 8 : -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: dur.fast }}
            className={`absolute end-0 z-50 min-w-40 overflow-hidden rounded-2xl border border-magenta/30 bg-ink/95 p-1 shadow-xl backdrop-blur-xl ${up ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
            {LANGS.map((l) => (
              <li key={l}><button type="button" data-lang={l} lang={l} aria-pressed={lang === l} onClick={() => { setLang(l); setOpen(false) }}
                className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 text-start text-sm ${lang === l ? 'bg-magenta/20 text-cream' : 'text-cream/75 hover:bg-cream/10'}`}>
                {LANG_NAMES[l]}<span className="text-xs uppercase opacity-60">{l}</span></button></li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export function LangSwitch() {
  const { lang, setLang, t } = useI18n()
  return (
    <div role="group" aria-label={t('nav.language')} className="grid grid-cols-4 gap-1 rounded-full border border-cream/15 p-1">
      {LANGS.map((l) => (
        <button key={l} type="button" data-lang={l} onClick={() => setLang(l)} aria-pressed={lang === l} lang={l}
          className={`min-h-11 rounded-full px-2 text-xs font-bold transition-colors ${lang === l ? 'bg-magenta text-white' : 'text-cream/70'}`}>
          {LANG_NAMES[l]}
        </button>
      ))}
    </div>
  )
}

export function Header({ email, instagram, whatsapp }: { email: string; instagram: string; whatsapp: string }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active] = useActiveSection(NAV.map((n) => n.id))
  const menuRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const on = () => setScrolled(scrollY > 24)
    on(); addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])

  useEffect(() => { // Escape closes, Tab stays inside, page does not scroll behind
    if (!open) return
    const btn = btnRef.current
    document.body.style.overflow = 'hidden'
    menuRef.current?.querySelector<HTMLElement>('a,button')?.focus()
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key !== 'Tab' || !menuRef.current) return
      const f = [...menuRef.current.querySelectorAll<HTMLElement>('a,button')]
      const [a, z] = [f[0], f[f.length - 1]]
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() }
    }
    addEventListener('keydown', key)
    return () => { removeEventListener('keydown', key); document.body.style.overflow = ''; btn?.focus() }
  }, [open])

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-cream focus:px-4 focus:py-2 focus:text-ink">{t('nav.skip')}</a>
      <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color] duration-[var(--dur-base)] ${scrolled ? 'bg-ink/80 backdrop-blur-xl' : ''}`}>
        <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 px-5 md:h-20 md:px-10">
          <Logo />
          <nav aria-label="Primary" className="hidden xl:block">
            <ul className="flex items-center gap-7 text-sm font-semibold">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} aria-current={active === n.id ? 'true' : undefined}
                    className={`relative inline-flex min-h-11 items-center gap-1.5 transition-colors ${active === n.id ? 'text-magenta' : 'text-cream/85 hover:text-cream'}`}>
                    {n.id === 'top' && <Home className="size-4" aria-hidden />}{t(n.key)}
                    {active === n.id && <motion.span layoutId="nav-underline" className="absolute inset-x-0 bottom-1.5 h-0.5 rounded-full bg-magenta shadow-[0_0_10px_var(--color-magenta)]" />}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden md:block"><LangMenu /></div>
            <a href="/admin" className="hidden min-h-11 items-center gap-2 rounded-full bg-magenta px-5 text-sm font-bold text-white shadow-[0_6px_24px_-6px_var(--color-magenta)] transition-transform active:scale-95 md:inline-flex">
              <Lock className="size-4" aria-hidden />{t('nav.admin')}
            </a>
            <button ref={btnRef} type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mobile-menu" aria-label={t('nav.menu')}
              className="grid size-12 place-items-center rounded-full text-cream xl:hidden"><Menu className="size-7" aria-hidden /></button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" ref={menuRef} role="dialog" aria-modal="true" aria-label={t('nav.menu')}
            className="hero-bg fixed inset-0 z-[60] flex flex-col overflow-y-auto"
            initial={{ clipPath: 'circle(0% at 92% 4%)' }} animate={{ clipPath: 'circle(150% at 92% 4%)' }}
            exit={{ clipPath: 'circle(0% at 92% 4%)' }} transition={{ duration: dur.slow, ease: ease.inOut }}>
            <div aria-hidden className="stars pointer-events-none absolute inset-0 opacity-60" />
            <div className="relative flex h-16 items-center justify-between px-5">
              <Logo />
              <button type="button" onClick={() => setOpen(false)} className="grid size-12 place-items-center rounded-full border border-cream/20" aria-label={t('nav.close')}><X aria-hidden /></button>
            </div>
            <nav aria-label="Mobile" className="relative flex-1 px-6 pt-4">
              <ol className="space-y-1">
                {[...NAV, { id: 'education', key: 'nav.education' as Key }].map((n, i) => (
                  <motion.li key={n.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.04, duration: dur.base, ease: ease.out }}>
                    <a href={`#${n.id}`} onClick={() => setOpen(false)} className="flex min-h-13 items-baseline gap-4 py-1 font-display text-3xl">
                      <span className="w-6 text-xs tabular-nums text-gold">0{i + 1}</span>{t(n.key)}
                    </a>
                  </motion.li>
                ))}
              </ol>
            </nav>
            <div className="relative space-y-3 px-6 pb-10 pt-4">
              <LangSwitch />
              <div className="flex gap-2">
                {[['mail', `mailto:${email}`, t('contact.email')], ['instagram', instagram, 'Instagram'], ['whatsapp', whatsapp, 'WhatsApp']].map(([icon, href, label]) => (
                  <a key={icon} href={href} aria-label={label} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                    className="grid size-12 place-items-center rounded-full border border-cream/20 bg-ink/40"><Icon name={icon} /></a>
                ))}
                <a href="/admin" className="ms-auto inline-flex min-h-12 items-center gap-2 rounded-full bg-magenta px-5 text-sm font-bold text-white"><Lock className="size-4" aria-hidden />{t('nav.admin')}</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
