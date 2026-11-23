import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Briefcase, Dumbbell, Globe, Heart, Mail, MapPin, Mouse, Phone, Send, Sparkles, Star } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Crown, LangMenu, NAV, Signature } from '../components/chrome'
import { Lightbox, QRCard, VideoPlayer } from '../components/media'
import { Icon, PressButton, Reveal, ScrambleText } from '../components/ui'
import { CATEGORIES, SITE_URL_FALLBACK, type Category, type Stat } from '../content/defaults'
import type { SiteData } from '../content/useSiteData'
import { useI18n } from '../i18n/I18n'
import type { Key } from '../i18n/dict'
import { dur, ease } from '../lib/motion'
import { supabase } from '../lib/supabase'
import { validateContact, type ContactErrors } from './validate'

const wrap = 'mx-auto max-w-[90rem] px-5 md:px-10'
const edgeStart = 'lg:ps-[max(2.5rem,calc((100vw-90rem)/2+2.5rem))]'
const edgeEnd = 'lg:pe-[max(2.5rem,calc((100vw-90rem)/2+2.5rem))]'

function IllusTag() {
  const { t } = useI18n()
  return <span className="pointer-events-none absolute bottom-2 end-2 z-10 rounded-full bg-ink/60 px-2 py-0.5 text-[10px] font-semibold text-cream/70 backdrop-blur">{t('illus.label')}</span>
}

/** Serif heading with an optional magenta script word, as in the mockups. */
function Title({ serif, script, id }: { serif: string; script?: string; id?: string }) {
  return (
    <h2 id={id} className="text-balance font-display text-4xl font-bold leading-[1.05] md:text-5xl">
      {serif}{script && <> <span className="font-script text-[1.35em] font-normal text-magenta">{script}</span></>}
    </h2>
  )
}

const btnMagenta = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-magenta px-7 text-sm font-bold text-white shadow-[0_10px_30px_-8px_var(--color-magenta)] transition-[transform,filter] duration-[var(--dur-fast)] hover:brightness-110 active:scale-[.97]'
const btnOutline = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-cream/80 px-7 text-sm font-bold text-cream transition-colors duration-[var(--dur-fast)] hover:bg-cream hover:text-ink active:scale-[.97]'

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

const STAT_ICONS = [Star, Globe, MapPin]

function Socials({ s, className = '' }: { s: SiteData['settings']; className?: string }) {
  const items: [string, string, string, string][] = [
    ['instagram', s.instagram, 'Instagram', 'text-[#ff4fa3]'], ['whatsapp', s.whatsapp, 'WhatsApp', 'text-[#3ee27a]'], ['mail', `mailto:${s.email}`, s.email, 'text-lilac'],
  ]
  return (
    <ul className={`flex gap-2 ${className}`}>
      {items.map(([icon, href, label, color]) => (
        <li key={icon}><a href={href} aria-label={label} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
          className={`grid size-11 place-items-center rounded-full bg-ink/60 ring-1 ring-cream/15 transition-transform hover:scale-110 ${color}`}><Icon name={icon} /></a></li>
      ))}
    </ul>
  )
}

export function resolveSiteUrl(s: SiteData['settings']) {
  const u = s.qrUrl || s.siteUrl || SITE_URL_FALLBACK
  // never a dev machine, never the pre-rename Netlify domain
  return /localhost|127\.0\.0\.1|portefilosarhaproject\.netlify\.app/.test(u) ? SITE_URL_FALLBACK : u
}

/** Static mini QR for the hero card (same URL as the contact QR). */
function MiniQR({ url }: { url: string }) {
  const svg = useMemo(() => {
    const q = QRCode.create(url, { errorCorrectionLevel: 'M' })
    const n = q.modules.size
    let d = ''
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.modules.get(y, x)) d += `M${x} ${y}h1v1h-1z`
    return { n, d }
  }, [url])
  return (
    <svg viewBox={`0 0 ${svg.n} ${svg.n}`} className="block w-full" shapeRendering="crispEdges" role="img" aria-label={`QR: ${url}`}>
      <path d={svg.d} fill="#0f0a16" />
    </svg>
  )
}

export function Hero({ data }: { data: SiteData }) {
  const { ml, t } = useI18n()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90])
  const h = data.sections.hero
  const s = data.settings
  const accent = /(Passion|Energy|passion|énergie|Pasión|pasión|energía|الشغف|والطاقة)/
  return (
    <section ref={ref} id="top" aria-labelledby="hero-title" className="hero-bg relative isolate overflow-hidden lg:min-h-[47rem]">
      <div aria-hidden className="stars absolute inset-0 -z-10 opacity-70" />
      <span aria-hidden className="brush bottom-24 -start-10 w-72 bg-gradient-to-r from-magenta to-magenta/0" />
      <span aria-hidden className="brush bottom-10 -end-16 w-96 bg-gradient-to-l from-lime/80 to-magenta/0" />

      {/* Illustration: full-bleed on mobile, centre column on desktop */}
      <motion.figure style={{ y: imgY }} className="relative h-[56svh] max-h-[34rem] lg:absolute lg:inset-y-0 lg:start-[35%] lg:h-auto lg:max-h-none lg:w-[33%]">
        <img src="/media/illus/hero-dancer.webp" alt={t('illus.alt')} fetchPriority="high"
          className="fade-mask-b h-full w-full object-cover object-[50%_12%] lg:fade-mask" />
        <IllusTag />
      </motion.figure>

      <div className={`${wrap} relative -mt-28 grid gap-8 pb-14 lg:mt-0 lg:min-h-[47rem] lg:grid-cols-[minmax(0,36%)_1fr_auto] lg:items-center lg:pb-12 lg:pt-24`}>
        <div className="relative z-10">
          <Crown className="mb-1 ms-[12%] hidden w-14 lg:block" />
          <h1 id="hero-title">
            <Signature stacked className="text-[4.4rem] max-[359px]:text-[3.7rem] sm:text-[6rem] lg:hidden" />
            <Signature className="hidden whitespace-nowrap text-[clamp(4.4rem,6.6vw,7.4rem)] lg:flex lg:flex-nowrap" />
            <span className="mt-4 block text-balance text-[1.3rem] font-semibold leading-snug text-cream lg:mt-2 lg:text-center lg:text-[1.55rem]">
              {ml(h.headline).split(accent).map((p, i) => (i % 2 ? <span key={i} className="text-lime">{p}</span> : p))}
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream/70 lg:mx-auto lg:text-center">{ml(h.kicker)}</p>
          <div className="mt-7 flex flex-wrap gap-3 lg:justify-center">
            <a href="#journey" className={btnMagenta}><ScrambleText text={t('hero.ctaJourney')} /><ArrowRight className="size-4 rtl:rotate-180" aria-hidden /></a>
            <a href="#contact" className={btnOutline}>{t('hero.ctaContact')}<Mail className="size-4" aria-hidden /></a>
          </div>
        </div>

        <div aria-hidden className="hidden lg:block" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10">
          <ul className="flex items-start justify-between gap-2 lg:flex-col lg:gap-7">
            {data.sections.about.stats.map((st, i) => {
              const I = STAT_ICONS[i] ?? Star
              return (
                <li key={i} className="flex flex-1 flex-col items-center gap-2 text-center lg:flex-row lg:gap-4 lg:text-start">
                  <span className="grid size-11 place-items-center rounded-full text-gold ring-2 ring-gold/90 shadow-[0_0_20px_rgb(255_217_61/.35)] lg:size-16"><I className="size-5 lg:size-7" aria-hidden /></span>
                  <span><span className="block font-display text-2xl font-bold text-gold lg:text-4xl"><Counter stat={st} /></span>
                    <span className="block text-xs text-cream/80 lg:text-sm">{i === 0 ? t('hero.years') : ml(st.label)}</span></span>
                </li>
              )
            })}
          </ul>
          <div className="hidden w-48 rounded-3xl border-2 border-magenta/70 bg-ink/60 p-4 text-center shadow-[0_0_30px_rgb(255_46_147/.35)] backdrop-blur xl:block">
            <p className="text-sm font-bold leading-tight">{t('qr.title')}</p>
            <a href="#contact" className="glow-lime mt-3 block rounded-2xl bg-cream p-2.5"><MiniQR url={resolveSiteUrl(s)} /></a>
            <p className="mt-3 font-script text-3xl text-cream">{t('hero.followMe')} <Heart className="inline size-5 fill-gold text-gold" aria-hidden /></p>
            <Socials s={s} className="mt-2 justify-center" />
          </div>
        </div>
      </div>
      <a href="#about" className="absolute bottom-5 start-1/2 hidden min-h-11 -translate-x-1/2 items-center gap-3 text-sm text-cream/80 lg:inline-flex rtl:translate-x-1/2">
        <Mouse className="size-6 animate-bounce motion-reduce:animate-none" aria-hidden />{t('hero.scrollDown')}
      </a>
    </section>
  )
}

export function AboutJourney({ data }: { data: SiteData }) {
  const { ml, t, lang } = useI18n()
  const a = data.sections.about
  const [open, setOpen] = useState<string | null>(null)
  const icons = [Sparkles, Briefcase, Dumbbell]
  return (
    <div className="relative grid grid-cols-[minmax(0,1fr)] lg:grid-cols-2">
      <section id="about" aria-labelledby="about-title" className="relative overflow-hidden bg-ink-2 lg:z-10 lg:overflow-visible lg:bg-blush lg:text-ink">
        <div className={`relative px-5 py-16 md:px-10 lg:py-24 ${edgeStart}`}>
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.05fr]">
            <Reveal className="relative z-10">
              <h2 id="about-title" className="font-display text-4xl font-bold lg:text-[2.75rem]">
                <span className="font-script text-6xl font-normal lg:hidden">{t('about.heading')} <span className="text-magenta">Sarah</span></span>
                <span className="hidden lg:inline">{t('about.heading')} {t('about.script')}</span>
              </h2>
              <span aria-hidden className="mt-2 hidden h-1 w-16 rounded-full bg-magenta lg:block" />
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-cream/80 lg:text-ink/80">{ml(a.body)}</p>
              <ul className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                <li className="rounded-full bg-magenta/15 px-3 py-1.5 text-magenta">{t('about.based')} {ml(a.location)}</li>
                <li className="rounded-full bg-magenta/15 px-3 py-1.5 text-magenta">{t('about.nationality')} : {ml(a.nationality)}</li>
                <li className="rounded-full bg-lime/25 px-3 py-1.5 text-cream lg:text-ink">{ml(a.relocation)}</li>
              </ul>
              <a href="#journey" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-cream px-5 text-sm font-bold text-cream lg:border-magenta lg:text-magenta">
                {t('about.more')}<ArrowRight className="size-4 rtl:rotate-180" aria-hidden /></a>
            </Reveal>
            <Reveal delay={0.1} className="relative">
              <figure className="relative lg:hidden">
                <img src="/media/illus/cabin-crew.webp" alt={t('illus.alt')} loading="lazy" className="w-full rounded-3xl object-cover" /><IllusTag />
              </figure>
              <figure className="relative hidden lg:-me-40 lg:block lg:rotate-[-2deg]">
                <img src="/media/illus/about-collage.webp" alt={t('illus.alt')} loading="lazy" className="w-full drop-shadow-2xl" /><IllusTag />
              </figure>
              <Heart aria-hidden className="absolute -bottom-8 start-0 hidden size-10 text-magenta lg:block" />
            </Reveal>
          </div>
        </div>
      </section>

      <section id="journey" aria-labelledby="journey-title" className="relative overflow-hidden bg-[radial-gradient(60%_80%_at_90%_60%,rgb(255_46_147/.35),transparent),linear-gradient(#1d0f2b,#120824)] ">
        <img src="/media/illus/journey-dancer.webp" alt="" aria-hidden loading="lazy"
          className="pointer-events-none absolute inset-y-0 end-0 h-full w-[60%] object-cover opacity-40 [mask-image:linear-gradient(to_left,#000_40%,transparent)] lg:opacity-80 rtl:[mask-image:linear-gradient(to_right,#000_40%,transparent)]" />
        <div className={`relative px-5 py-16 md:px-10 lg:py-24 lg:ps-48 ${edgeEnd}`}>
          <Reveal><Title id="journey-title" serif={t('journey.heading')} script={t('journey.script')} /></Reveal>
          <ol className="relative mt-10 max-w-lg space-y-3 ps-8">
            <span aria-hidden className="absolute inset-y-4 start-[7px] w-px bg-magenta/60" />
            {data.experiences.map((e, i) => {
              const I = icons[i % icons.length]
              const isOpen = open === e.id
              return (
                <Reveal key={e.id} delay={i * 0.06}>
                  <li className="relative">
                    <span aria-hidden className="absolute -start-8 top-4 size-[15px] rounded-full border-2 border-magenta bg-ink shadow-[0_0_10px_var(--color-magenta)]" />
                    <button type="button" onClick={() => setOpen(isOpen ? null : e.id)} aria-expanded={isOpen} aria-controls={`exp-${e.id}`}
                      className="grid w-full grid-cols-[2.5rem_1fr] items-start gap-3 rounded-2xl p-2 text-start transition-colors hover:bg-cream/5">
                      <I className="mt-5 size-7 text-magenta" aria-hidden />
                      <span>
                        <span className="block text-sm font-semibold text-cream/85" dir="ltr">{e.period}</span>
                        <span className="block text-lg font-bold leading-snug">{ml(e.role)}</span>
                        <span className="block text-sm text-cream/70">{ml(e.company)} · {ml(e.location)}</span>
                      </span>
                    </button>
                    <motion.div id={`exp-${e.id}`} initial={false} animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }} transition={{ duration: dur.base, ease: ease.out }} className="overflow-hidden">
                      <ul className="space-y-1.5 pb-3 ps-14 text-sm text-cream/80">
                        {(e.bullets[lang]?.length ? e.bullets[lang] : e.bullets.en).map((b, j) => <li key={j} className="flex gap-2"><span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-lime" />{b}</li>)}
                      </ul>
                    </motion.div>
                  </li>
                </Reveal>
              )
            })}
          </ol>
        </div>
      </section>
    </div>
  )
}

function GalleryBlock({ data }: { data: SiteData }) {
  const { ml, t } = useI18n()
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [all, setAll] = useState(false)
  const [index, setIndex] = useState<number | null>(null)
  const items = useMemo(() => data.portfolio.filter((p) => filter === 'all' || p.category === filter), [data.portfolio, filter])
  const shown = all ? items : items.slice(0, 4)
  const toggle = (
    <button type="button" onClick={() => setAll(!all)} aria-expanded={all} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cream/40 px-5 text-sm font-semibold hover:border-cream">
      {all ? t('gallery.viewLess') : t('gallery.viewAll')}<ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
    </button>
  )
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><Title id="gallery-title" serif={t('gallery.eyebrow')} />{items.length > 4 && toggle}</div>
      <div role="group" aria-label={t('gallery.filters')} className="-mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {(['all', ...CATEGORIES] as const).map((c) => (
          <button key={c} type="button" onClick={() => { setFilter(c); setAll(false) }} aria-pressed={filter === c}
            className={`min-h-11 shrink-0 rounded-full px-5 text-sm font-semibold transition-colors duration-[var(--dur-fast)]
              ${filter === c ? 'bg-magenta text-white shadow-[0_0_18px_rgb(255_46_147/.5)]' : 'bg-cream/5 text-cream/85 ring-1 ring-cream/15 hover:ring-cream/40'}`}>
            {t(`gallery.${c}` as Key)}
          </button>
        ))}
      </div>
      {items.length === 0 ? <p className="rounded-3xl border border-dashed border-cream/20 p-10 text-center text-cream/60">{t('gallery.empty')}</p> : (
        <motion.ul layout className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
          {shown.map((p, i) => (
            <motion.li layout key={p.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: dur.base }}>
              <button type="button" onClick={() => setIndex(i)} aria-label={`${t('gallery.open')}: ${ml(p.title)}`}
                className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl ring-1 ring-magenta/30 transition-shadow hover:shadow-[0_0_24px_rgb(255_46_147/.45)] xl:aspect-[6/5]">
                <img src={p.thumb || p.poster || p.src} alt={p.is_illustration ? t('illus.alt') : ml(p.caption) || ml(p.title)} loading="lazy" decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] group-hover:scale-105" />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-ink/85 to-transparent p-3 pt-10 text-xs font-semibold">
                  <span className="truncate">{ml(p.title)}</span>
                  {p.kind === 'video' && <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cream text-ink"><Icon name="play" className="size-3.5" /></span>}
                </span>
                {p.is_illustration && <span className="absolute start-2 top-2 rounded-full bg-ink/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-lilac backdrop-blur">{t('illus.label')}</span>}
              </button>
            </motion.li>
          ))}
        </motion.ul>
      )}
      <Lightbox items={shown} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </>
  )
}

export function DanceGallery({ data }: { data: SiteData }) {
  const { t } = useI18n()
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] border-y border-magenta/20 lg:grid-cols-2">
      <section id="dance" aria-labelledby="dance-title" className="relative isolate min-h-[26rem] overflow-hidden">
        <img src="/media/illus/dance-group.webp" alt={t('illus.alt')} loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover object-[70%_30%]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/75 to-ink/10 rtl:bg-gradient-to-l" />
        <IllusTag />
        <div className={`px-5 py-16 md:px-10 lg:py-20 ${edgeStart}`}>
          <Reveal>
            <h2 id="dance-title" className="font-display text-4xl font-bold md:text-5xl">{t('dance.heading')} <span className="text-magenta">&amp;</span> {t('dance.script')}</h2>
            <p className="mt-2 font-semibold text-cream/90">{t('dance.tags')}</p>
            <p className="mt-6 max-w-sm text-cream/85">{t('dance.pitch')}</p>
            <a href="#videos" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-magenta px-6 text-sm font-bold text-cream shadow-[0_0_18px_rgb(255_46_147/.35)] transition-colors hover:bg-magenta">
              {t('dance.cta')}<ArrowRight className="size-4 rtl:rotate-180" aria-hidden /></a>
          </Reveal>
        </div>
      </section>
      <section id="gallery" aria-labelledby="gallery-title" className={`bg-[radial-gradient(70%_80%_at_80%_20%,rgb(120_60_255/.3),transparent),#130a1e] px-5 py-16 md:px-10 lg:py-20 ${edgeEnd}`}>
        <GalleryBlock data={data} />
      </section>
    </div>
  )
}

export function Videos({ data }: { data: SiteData }) {
  const { ml, t } = useI18n()
  const videos = data.portfolio.filter((p) => p.kind === 'video' && p.featured)
  return (
    <section id="videos" aria-labelledby="videos-title" className="hero-bg relative overflow-hidden py-16 md:py-24">
      <div aria-hidden className="stars absolute inset-0 opacity-50" />
      <div className={`${wrap} relative`}>
        <p className="mb-2 text-xs font-bold uppercase tracking-[.25em] text-lime">{t('videos.eyebrow')}</p>
        <Title id="videos-title" serif={t('videos.title')} />
        <p className="mt-3 max-w-2xl text-cream/75">{ml(data.sections.dance.intro)}</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v, i) => (
            <Reveal key={v.id} delay={i * 0.08}>
              <VideoPlayer src={v.src} poster={v.poster} title={ml(v.title)} className="mx-auto aspect-[9/16] max-h-[78dvh] w-full max-w-sm shadow-[0_0_40px_-10px_var(--color-magenta)] ring-1 ring-magenta/40" />
              {ml(v.description) && <p className="mt-3 text-sm text-cream/65">{ml(v.description)}</p>}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Skills({ data }: { data: SiteData }) {
  const { ml, t } = useI18n()
  const groups = ['care', 'operations', 'office'] as const
  return (
    <section id="skills" aria-labelledby="skills-title" className="bg-ink-2 py-16 md:py-24">
      <div className={wrap}>
        <Title id="skills-title" serif={t('skills.title')} />
        <div className="mt-10 grid gap-5 lg:grid-cols-4">
          {groups.map((g, i) => (
            <Reveal key={g} delay={i * 0.06}>
              <div className="h-full rounded-3xl border border-magenta/25 bg-ink p-6">
                <h3 className="mb-4 font-display text-xl font-bold">{t(`skills.${g}` as Key)}</h3>
                <ul className="flex flex-wrap gap-2">{data.skills.filter((s) => s.category === g).map((s) => <li key={s.id} className="rounded-full bg-cream/5 px-3 py-1.5 text-sm text-cream/90 ring-1 ring-cream/10">{ml(s.name)}</li>)}</ul>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.2}>
            <div className="h-full rounded-3xl bg-gradient-to-br from-magenta/90 to-wine p-6">
              <h3 className="mb-4 font-display text-xl font-bold">{t('skills.languages')}</h3>
              <ul className="space-y-3">{data.languages.map((l) => (
                <li key={l.id} className="flex items-baseline justify-between gap-3 border-b border-cream/20 pb-3 last:border-0"><span className="font-semibold">{ml(l.name)}</span><span className="text-sm text-cream/85">{ml(l.level)}</span></li>
              ))}</ul>
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
    <section id="education" aria-labelledby="education-title" className={`${wrap} py-16 md:py-24`}>
      <Title id="education-title" serif={t('education.title')} />
      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {data.education.map((e, i) => (
          <Reveal key={e.id} delay={i * 0.06}>
            <li className={e.kind === 'certification' ? 'iridescent h-full rounded-3xl p-[2px]' : 'h-full'}>
              <div className={`h-full rounded-3xl p-6 ${e.kind === 'certification' ? 'bg-ink' : 'border border-cream/10 bg-ink-2'}`}>
                {e.kind === 'certification' && <Crown className="mb-3 w-9" />}
                <p className="text-sm font-semibold text-gold" dir="ltr">{e.period || t('education.certification')}</p>
                <h3 className="mt-2 font-display text-2xl font-bold leading-tight">{ml(e.title)}</h3>
                <p className="mt-2 text-cream/70">{ml(e.institution)}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  )
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
    // Netlify Forms copy → email notification (best effort; the message is already stored)
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ 'form-name': 'contact', ...v }).toString() }).catch(() => {})
    form.reset(); setState('ok')
  }
  const links: [ReactNode, string, string, string][] = [
    [<Mail key="m" className="size-5" />, t('contact.email'), s.email, `mailto:${s.email}`],
    [<Phone key="p" className="size-5" />, t('contact.phone'), s.phone, `tel:${s.phone.replace(/\s/g, '')}`],
    [<Icon key="w" name="whatsapp" />, t('contact.whatsapp'), s.phone, s.whatsapp],
    [<Icon key="i" name="instagram" />, t('contact.instagram'), '@' + s.instagram.replace(/\/$/, '').split('/').pop(), s.instagram],
  ]
  const field = 'mt-2 block w-full rounded-2xl border bg-ink px-4 py-3 text-base text-cream placeholder:text-cream/30 focus:border-magenta focus:outline-none'
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden bg-[radial-gradient(50%_60%_at_10%_10%,rgb(255_46_147/.25),transparent),radial-gradient(50%_60%_at_90%_90%,rgb(120_60_255/.3),transparent),#120824] py-16 md:py-24">
      <div className={wrap}>
        <Title id="contact-title" serif={t('contact.title')} />
        <p className="mt-3 max-w-2xl text-cream/80">{ml(data.sections.contact.intro)}</p>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr_1fr]">
          <ul className="space-y-3">
            {links.map(([icon, label, value, href]) => (
              <li key={label}><a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                className="flex min-h-16 items-center gap-4 rounded-2xl border border-magenta/25 bg-ink/50 px-4 transition-colors hover:border-magenta">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-magenta/20 text-magenta">{icon}</span>
                <span className="min-w-0"><span className="block text-xs text-cream/60">{label}</span><span className="block truncate font-semibold" dir="ltr">{value}</span></span>
              </a></li>
            ))}
          </ul>
          <form name="contact" noValidate onSubmit={submit} className="rounded-3xl border border-magenta/25 bg-ink/70 p-5 backdrop-blur md:p-7">
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
            <PressButton type="submit" disabled={state === 'sending'} className="w-full !bg-magenta !text-white">
              {state === 'sending' ? t('contact.sending') : t('contact.send')}<Send className="size-4 rtl:-scale-x-100" aria-hidden /></PressButton>
            <p role="status" aria-live="polite" className={`mt-4 text-sm ${state === 'error' ? 'text-magenta' : 'text-lime'}`}>
              {state === 'ok' ? t('contact.success') : state === 'error' ? t('contact.error') : ''}
            </p>
          </form>
          <div className="rounded-3xl border border-magenta/30 bg-ink/60 p-6">
            <p className="font-display text-2xl font-bold leading-tight">{ml(s.qrLabel) || t('qr.title')}</p>
            <p className="mb-5 mt-2 text-sm text-cream/70">{t('qr.sub')}</p>
            <QRCard url={resolveSiteUrl(s)} label="" />
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer({ data }: { data: SiteData }) {
  const { t } = useI18n()
  const s = data.settings
  const links = NAV.filter((n) => ['top', 'about', 'gallery', 'contact'].includes(n.id))
  return (
    <footer className="relative overflow-hidden border-t border-magenta/20 bg-ink pb-8 pt-12">
      <span aria-hidden className="brush bottom-16 end-[-4rem] w-[28rem] bg-gradient-to-l from-magenta to-magenta/0" />
      <span aria-hidden className="brush bottom-8 end-[-2rem] w-[22rem] bg-gradient-to-l from-lime/80 to-lime/0" />
      <div className={`${wrap} relative grid items-center gap-8 xl:grid-cols-[auto_1px_auto_1px_auto_auto] xl:gap-10`}>
        <div>
          <p dir="ltr" className="relative font-script text-5xl leading-none"><Crown className="absolute -top-4 left-2 w-7" /><span>Sarah</span> <span className="text-magenta">Jaballah</span></p>
          <p className="mt-2 text-xs tracking-[.3em] text-cream/70">{t('footer.tagline')}</p>
        </div>
        <span aria-hidden className="hidden h-12 bg-magenta/40 xl:block" />
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
          <a href={`tel:${s.phone.replace(/\s/g, '')}`} className="inline-flex min-h-11 items-center gap-2 text-sm" dir="ltr"><Phone className="size-4 text-magenta" aria-hidden />{s.phone}</a>
          <a href={`mailto:${s.email}`} className="inline-flex min-h-11 items-center gap-2 text-sm"><Mail className="size-4 text-magenta" aria-hidden />{s.email}</a>
          <Socials s={s} />
        </div>
        <span aria-hidden className="hidden h-12 bg-magenta/40 xl:block" />
        <nav aria-label={t('footer.nav')}><ul className="flex flex-wrap gap-x-5">
          {links.map((n) => <li key={n.id}><a href={`#${n.id}`} className="inline-flex min-h-11 min-w-11 items-center text-sm text-cream/80 hover:text-cream">{t(n.key)}</a></li>)}
        </ul></nav>
        <div className="flex items-center gap-3">
          <LangMenu up />
          <a href="#top" aria-label={t('footer.top')} className="grid size-12 place-items-center rounded-full border-2 border-cream/60 hover:border-cream"><Icon name="up" /></a>
        </div>
      </div>
      <div className={`${wrap} relative mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-cream/10 pt-6`}>
        <p className="text-xs text-cream/60">© {new Date().getFullYear()} Sarah Jaballah. {t('footer.rights')}</p>
        <p className="font-script text-4xl text-gold">{t('footer.happy')} <Heart className="inline size-6 text-gold" aria-hidden /></p>
      </div>
    </footer>
  )
}
