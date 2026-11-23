import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { NAV, LangSwitch, Signature } from '../components/chrome'
import { Lightbox, QRCard, VideoPlayer } from '../components/media'
import { Icon, IridescentLink, MagneticLink, PressButton, Reveal, ScrambleText, SectionHead } from '../components/ui'
import { CATEGORIES, SITE_URL_FALLBACK, type Category, type Stat } from '../content/defaults'
import type { SiteData } from '../content/useSiteData'
import { useI18n } from '../i18n/I18n'
import type { Key } from '../i18n/dict'
import { supabase } from '../lib/supabase'
import { dur, ease } from '../lib/motion'
import { validateContact, type ContactErrors } from './validate'

const wrap = 'mx-auto max-w-7xl px-5 md:px-8'

export function Hero({ data }: { data: SiteData }) {
  const { ml, t } = useI18n()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120])
  const glowY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80])
  const h = data.sections.hero
  return (
    <section ref={ref} id="top" aria-labelledby="hero-title" className="grain relative isolate overflow-hidden pt-24 md:pt-28">
      <motion.div aria-hidden style={{ y: glowY }} className="aurora absolute -inset-20 -z-10 opacity-60" />
      <div className={`${wrap} grid items-center gap-6 pb-16 md:grid-cols-[1.25fr_.75fr] md:gap-10 md:pb-24`}>
        <div>
          <Signature className="-ms-2 mb-2 w-[min(100%,420px)]" />
          <p className="mb-5 text-[11px] font-semibold uppercase leading-relaxed tracking-[.18em] text-lime md:text-xs md:tracking-[.2em]">{ml(h.kicker)}</p>
          <h1 id="hero-title" className="font-display text-balance text-[clamp(2.2rem,6.4vw,5.4rem)] leading-[1.02]">
            {ml(h.headline)}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/75 md:text-lg">{ml(h.intro)}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <IridescentLink href="#journey"><ScrambleText text={t('hero.ctaJourney')} /><Icon name="arrow" className="size-4 rtl:rotate-180" /></IridescentLink>
            <MagneticLink href="#contact" className="border border-cream/25 hover:bg-cream/10">{t('hero.ctaContact')}</MagneticLink>
          </div>
        </div>
        <motion.div style={{ y }} className="relative order-first mx-auto w-full max-w-[22rem] md:order-none">
          <div className="absolute -inset-3 -z-10 rounded-[2.5rem] bg-gradient-to-br from-magenta/50 via-lilac/30 to-lime/30 blur-2xl" aria-hidden />
          <div className="overflow-hidden rounded-[2rem] border border-cream/10 bg-ink-2">
            <video className="aspect-[4/5] max-h-[46svh] w-full object-cover object-[50%_35%] md:aspect-[9/16] md:max-h-none" src="/media/video/hero-loop.mp4" poster="/media/video/sarah-2-poster.webp"
              autoPlay={!reduce} muted loop playsInline preload="metadata" aria-label={t('hero.videoLabel')} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Counter({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const [v, setV] = useState(reduce ? stat.value : 0)
  useEffect(() => {
    if (!inView || reduce) return
    const c = animate(0, stat.value, { duration: 1.4, ease: ease.out, onUpdate: (x) => setV(Math.round(x)) })
    return () => c.stop()
  }, [inView, reduce, stat.value])
  return <span ref={ref} className="tabular-nums">{v}{stat.suffix}</span>
}

export function About({ data }: { data: SiteData }) {
  const { ml, t } = useI18n()
  const a = data.sections.about
  return (
    <section id="about" aria-labelledby="about-title" className={`${wrap} py-20 md:py-32`}>
      <SectionHead id="about-title" eyebrow={t('about.eyebrow')} title={ml(a.title)} />
      <div className="grid gap-10 md:grid-cols-2">
        <Reveal><p className="text-lg leading-relaxed text-cream/80 md:text-xl">{ml(a.body)}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-mute">{t('about.based')}</dt><dd className="mt-1 font-semibold">{ml(a.location)}</dd></div>
            <div><dt className="text-mute">{t('about.nationality')}</dt><dd className="mt-1 font-semibold">{ml(a.nationality)}</dd></div>
            <div className="col-span-2"><dd className="inline-flex items-center gap-2 rounded-full bg-lime/10 px-3 py-1.5 font-semibold text-lime"><Icon name="globe" className="size-4" />{ml(a.relocation)}</dd></div>
          </dl>
        </Reveal>
        <ul className="grid grid-cols-3 gap-3 self-start md:gap-5">
          {a.stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <li className="rounded-3xl border border-cream/10 bg-ink-2 p-4 md:p-6">
                <p className="font-display text-4xl text-magenta md:text-6xl"><Counter stat={s} /></p>
                <p className="mt-2 text-xs leading-snug text-cream/70 md:text-sm">{ml(s.label)}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Journey({ data }: { data: SiteData }) {
  const { ml, t, lang } = useI18n()
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const [open, setOpen] = useState<string | null>(data.experiences[0]?.id ?? null)
  return (
    <section id="journey" aria-labelledby="journey-title" className="relative bg-ink-2 py-20 md:py-32">
      <div className={wrap}>
        <SectionHead id="journey-title" eyebrow={t('journey.eyebrow')} title={t('journey.title')} />
        <ol ref={ref} className="relative space-y-6 ps-8 md:ps-12">
          <div aria-hidden className="absolute inset-y-0 start-[11px] w-px bg-cream/10 md:start-[19px]" />
          <motion.div aria-hidden style={{ scaleY: scrollYProgress }} className="absolute inset-y-0 start-[11px] w-px origin-top bg-gradient-to-b from-magenta via-lilac to-lime md:start-[19px]" />
          {data.experiences.map((e, i) => {
            const isOpen = open === e.id
            return (
              <Reveal key={e.id} delay={i * 0.05}>
                <li className="relative">
                  <span aria-hidden className={`absolute -start-8 top-6 grid size-6 place-items-center rounded-full border-2 md:-start-12 md:size-10
                    ${isOpen ? 'border-magenta bg-magenta/20' : 'border-cream/30 bg-ink'}`}><span className="size-2 rounded-full bg-cream" /></span>
                  <div className={`rounded-3xl border p-5 transition-colors duration-[var(--dur-base)] md:p-8 ${isOpen ? 'border-magenta/40 bg-ink' : 'border-cream/10'}`}>
                    <button type="button" onClick={() => setOpen(isOpen ? null : e.id)} aria-expanded={isOpen} aria-controls={`exp-${e.id}`}
                      className="flex w-full flex-col items-start gap-1 text-start">
                      <span className="text-sm font-semibold tabular-nums text-lime" dir="ltr">{e.period}</span>
                      <span className="font-display text-2xl md:text-3xl">{ml(e.role)}</span>
                      <span className="text-cream/70">{ml(e.company)} · {ml(e.location)}</span>
                    </button>
                    <motion.div id={`exp-${e.id}`} initial={false} animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                      transition={{ duration: dur.base, ease: ease.out }} className="overflow-hidden">
                      <ul className="mt-5 grid gap-2 text-cream/80 md:grid-cols-2">
                        {(e.bullets[lang]?.length ? e.bullets[lang] : e.bullets.en).map((b, j) => (
                          <li key={j} className="flex gap-3"><span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-magenta" />{b}</li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                </li>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

export function Dance({ data }: { data: SiteData }) {
  const { ml, t } = useI18n()
  const videos = data.portfolio.filter((p) => p.kind === 'video' && p.featured)
  return (
    <section id="dance" aria-labelledby="dance-title" className="grain relative overflow-hidden py-20 md:py-32">
      <div aria-hidden className="aurora absolute -inset-10 -z-10 opacity-30" />
      <div className={wrap}>
        <SectionHead id="dance-title" eyebrow={t('dance.eyebrow')} title={t('dance.title')} />
        <Reveal><p className="-mt-6 mb-10 max-w-2xl text-cream/75 md:text-lg">{ml(data.sections.dance.intro)}</p></Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v, i) => (
            <Reveal key={v.id} delay={i * 0.08}>
              <VideoPlayer src={v.src} poster={v.poster} title={ml(v.title)} className="mx-auto aspect-[9/16] max-h-[80dvh] w-full max-w-sm" />
              {ml(v.description) && <p className="mt-3 text-sm text-cream/65">{ml(v.description)}</p>}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Gallery({ data }: { data: SiteData }) {
  const { ml, t } = useI18n()
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [index, setIndex] = useState<number | null>(null)
  const items = useMemo(() => data.portfolio.filter((p) => filter === 'all' || p.category === filter), [data.portfolio, filter])
  return (
    <section id="gallery" aria-labelledby="gallery-title" className={`${wrap} py-20 md:py-32`}>
      <SectionHead id="gallery-title" eyebrow={t('gallery.eyebrow')} title={t('gallery.title')} />
      <div role="group" aria-label={t('gallery.filters')} className="-mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:px-0">
        {(['all', ...CATEGORIES] as const).map((c) => (
          <button key={c} type="button" onClick={() => setFilter(c)} aria-pressed={filter === c}
            className={`min-h-11 shrink-0 rounded-full border px-5 text-sm font-semibold transition-colors duration-[var(--dur-fast)]
              ${filter === c ? 'border-lime bg-lime text-ink' : 'border-cream/20 text-cream/80 hover:border-cream/50'}`}>
            {t(`gallery.${c}` as Key)}
          </button>
        ))}
      </div>
      {items.length === 0 ? <p className="rounded-3xl border border-dashed border-cream/20 p-10 text-center text-cream/60">{t('gallery.empty')}</p> : (
        <motion.ul layout className="masonry">
          {items.map((p, i) => (
            <motion.li layout key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: dur.base }} className="mb-3 break-inside-avoid md:mb-4">
              <button type="button" onClick={() => setIndex(i)} className="group relative block w-full overflow-hidden rounded-2xl bg-ink-2 text-start"
                aria-label={`${t('gallery.open')}: ${ml(p.title)}`}>
                <img src={p.thumb || p.poster || p.src} alt={ml(p.caption) || ml(p.title)} loading="lazy" decoding="async"
                  className="w-full transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] group-hover:scale-105" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-ink/85 to-transparent p-3 pt-10 text-xs font-semibold">
                  <span className="truncate">{ml(p.title)}</span>
                  {p.kind === 'video' && <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cream text-ink"><Icon name="play" className="size-3.5" /></span>}
                </span>
                {p.is_illustration && <span className="absolute start-2 top-2 rounded-full bg-ink/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-lilac backdrop-blur">{t('gallery.illustration')}</span>}
              </button>
            </motion.li>
          ))}
        </motion.ul>
      )}
      <Lightbox items={items} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </section>
  )
}

export function Skills({ data }: { data: SiteData }) {
  const { ml, t } = useI18n()
  const groups = ['care', 'operations', 'office'] as const
  return (
    <section id="skills" aria-labelledby="skills-title" className="bg-ink-2 py-20 md:py-32">
      <div className={wrap}>
        <SectionHead id="skills-title" eyebrow={t('skills.eyebrow')} title={t('skills.title')} />
        <div className="grid gap-5 lg:grid-cols-4">
          {groups.map((g, i) => (
            <Reveal key={g} delay={i * 0.06}>
              <div className="h-full rounded-3xl border border-cream/10 bg-ink p-6">
                <h3 className="mb-4 font-display text-xl">{t(`skills.${g}` as Key)}</h3>
                <ul className="flex flex-wrap gap-2">
                  {data.skills.filter((s) => s.category === g).map((s) => (
                    <li key={s.id} className="rounded-full border border-cream/15 px-3 py-1.5 text-sm text-cream/85">{ml(s.name)}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.2}>
            <div className="h-full rounded-3xl bg-wine p-6">
              <h3 className="mb-4 font-display text-xl">{t('skills.languages')}</h3>
              <ul className="space-y-3">
                {data.languages.map((l) => (
                  <li key={l.id} className="flex items-baseline justify-between gap-3 border-b border-cream/15 pb-3 last:border-0">
                    <span className="font-semibold">{ml(l.name)}</span><span className="text-sm text-cream/75">{ml(l.level)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function EducationSection({ data }: { data: SiteData }) {
  const { ml, t } = useI18n()
  return (
    <section id="education" aria-labelledby="education-title" className={`${wrap} py-20 md:py-32`}>
      <SectionHead id="education-title" eyebrow={t('education.eyebrow')} title={t('education.title')} />
      <ul className="grid gap-5 md:grid-cols-3">
        {data.education.map((e, i) => (
          <Reveal key={e.id} delay={i * 0.06}>
            <li className={e.kind === 'certification' ? 'iridescent h-full rounded-3xl p-[2px]' : 'h-full'}>
              <div className={`h-full rounded-3xl p-6 ${e.kind === 'certification' ? 'bg-ink' : 'border border-cream/10'}`}>
                <p className="text-sm font-semibold text-lime" dir="ltr">{e.period || t('education.certification')}</p>
                <h3 className="mt-2 font-display text-2xl leading-tight">{ml(e.title)}</h3>
                <p className="mt-2 text-cream/70">{ml(e.institution)}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  )
}

export function resolveSiteUrl(s: SiteData['settings']) {
  const u = s.qrUrl || s.siteUrl || SITE_URL_FALLBACK
  // never a dev machine, never the pre-rename Netlify domain
  return /localhost|127\.0\.0\.1|portefilosarhaproject\.netlify\.app/.test(u) ? SITE_URL_FALLBACK : u
}

export function Contact({ data }: { data: SiteData }) {
  const { ml, t, lang } = useI18n()
  const s = data.settings
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [errors, setErrors] = useState<ContactErrors>({})
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    if (fd.get('bot-field')) return // honeypot
    const v = { name: String(fd.get('name') ?? '').trim(), email: String(fd.get('email') ?? '').trim(), message: String(fd.get('message') ?? '').trim() }
    const errs = validateContact(v)
    setErrors(errs)
    if (Object.keys(errs).length) { form.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus(); return }
    setState('sending')
    const { error } = await supabase.from('contact_messages').insert({ ...v, lang })
    if (error) { setState('error'); return }
    // Netlify Forms copy → email notification to the owner (best effort; the message is already stored)
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ 'form-name': 'contact', ...v }).toString() }).catch(() => {})
    form.reset(); setState('ok')
  }
  const links = [
    { icon: 'mail', label: t('contact.email'), value: s.email, href: `mailto:${s.email}` },
    { icon: 'phone', label: t('contact.phone'), value: s.phone, href: `tel:${s.phone.replace(/\s/g, '')}` },
    { icon: 'whatsapp', label: t('contact.whatsapp'), value: s.phone, href: s.whatsapp },
    { icon: 'instagram', label: t('contact.instagram'), value: '@' + s.instagram.replace(/\/$/, '').split('/').pop(), href: s.instagram },
  ]
  const field = 'mt-2 block w-full rounded-2xl border bg-ink px-4 py-3 text-base text-cream placeholder:text-cream/30 focus:border-lime focus:outline-none'
  return (
    <section id="contact" aria-labelledby="contact-title" className="grain relative overflow-hidden bg-wine-2 py-20 md:py-32">
      <div aria-hidden className="aurora absolute -inset-10 -z-10 opacity-40" />
      <div className={wrap}>
        <SectionHead id="contact-title" eyebrow={t('contact.eyebrow')} title={t('contact.title')} />
        <Reveal><p className="-mt-6 mb-10 max-w-2xl text-cream/80 md:text-lg">{ml(data.sections.contact.intro)}</p></Reveal>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr_.9fr]">
          <ul className="space-y-3">
            {links.map((l) => (
              <li key={l.icon}>
                <a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                  className="flex min-h-16 items-center gap-4 rounded-2xl border border-cream/10 bg-ink/40 px-4 transition-colors hover:border-cream/40">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream/10"><Icon name={l.icon} /></span>
                  <span className="min-w-0"><span className="block text-xs text-cream/60">{l.label}</span><span className="block truncate font-semibold" dir="ltr">{l.value}</span></span>
                </a>
              </li>
            ))}
          </ul>
          <form name="contact" noValidate onSubmit={submit} className="rounded-3xl border border-cream/10 bg-ink/60 p-5 backdrop-blur md:p-7">
            <p hidden><label>Bot <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
            {(['name', 'email', 'message'] as const).map((f) => (
              <div key={f} className="mb-4">
                <label htmlFor={`c-${f}`} className="text-sm font-semibold">{t(`contact.${f}` as Key)}</label>
                {f === 'message'
                  ? <textarea id={`c-${f}`} name={f} rows={5} maxLength={4000} aria-invalid={!!errors[f]} aria-describedby={errors[f] ? `e-${f}` : undefined} className={`${field} ${errors[f] ? 'border-magenta' : 'border-cream/15'}`} />
                  : <input id={`c-${f}`} name={f} type={f === 'email' ? 'email' : 'text'} autoComplete={f} maxLength={f === 'name' ? 120 : 200} dir={f === 'email' ? 'ltr' : undefined}
                      aria-invalid={!!errors[f]} aria-describedby={errors[f] ? `e-${f}` : undefined} className={`${field} ${errors[f] ? 'border-magenta' : 'border-cream/15'}`} />}
                {errors[f] && <p id={`e-${f}`} className="mt-1.5 text-sm text-magenta">{t(errors[f])}</p>}
              </div>
            ))}
            <PressButton type="submit" disabled={state === 'sending'} className="w-full">{state === 'sending' ? t('contact.sending') : t('contact.send')}</PressButton>
            <p role="status" aria-live="polite" className={`mt-4 text-sm ${state === 'error' ? 'text-magenta' : 'text-lime'}`}>
              {state === 'ok' ? t('contact.success') : state === 'error' ? t('contact.error') : ''}
            </p>
          </form>
          <QRCard url={resolveSiteUrl(s)} label={ml(s.qrLabel) || t('qr.copy')} />
        </div>
      </div>
    </section>
  )
}

export function Footer({ data }: { data: SiteData }) {
  const { t, ml } = useI18n()
  return (
    <footer className="border-t border-cream/10 py-12">
      <div className={`${wrap} grid gap-8 md:grid-cols-[1fr_auto]`}>
        <div>
          <p className="font-script text-4xl" dir="ltr">Sarah Jaballah</p>
          <nav aria-label={t('footer.nav')} className="mt-4">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-cream/70">
              {NAV.map((n) => <li key={n.id}><a className="inline-flex min-h-11 min-w-11 items-center hover:text-cream" href={`#${n.id}`}>{t(n.key)}</a></li>)}
            </ul>
          </nav>
          <ul className="mt-5 flex gap-2">
            {data.socials.map((s) => (
              <li key={s.id}><a href={s.url} target={s.url.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" aria-label={ml(s.label)}
                className="grid size-12 place-items-center rounded-full border border-cream/15 hover:border-cream/50"><Icon name={s.platform === 'email' ? 'mail' : s.platform} /></a></li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-start gap-4 md:items-end">
          <LangSwitch compact />
          <a href="#top" className="inline-flex min-h-11 items-center gap-2 text-sm text-cream/80 hover:text-cream"><Icon name="up" className="size-4" />{t('footer.top')}</a>
          <p className="text-xs text-cream/50">© {new Date().getFullYear()} Sarah Jaballah. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  )
}
