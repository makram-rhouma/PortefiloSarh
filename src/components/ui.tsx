import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { useI18n } from '../i18n/I18n'
import { dur, ease } from '../lib/motion'

/** Tactile press button: sinks on press, springs back. Works for touch & keyboard. */
export function PressButton({ className = '', variant = 'solid', ...p }: ComponentProps<'button'> & { variant?: 'solid' | 'ghost' }) {
  return (
    <button
      {...p}
      className={`group relative inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold tracking-wide
        transition-[transform,box-shadow,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out-expo)]
        active:translate-y-[2px] disabled:opacity-50 disabled:pointer-events-none
        ${variant === 'solid'
          ? 'bg-cream text-ink shadow-[0_4px_0_0_var(--color-wine),0_10px_30px_-10px_rgb(255_46_147/.5)] active:shadow-[0_1px_0_0_var(--color-wine)]'
          : 'border border-cream/25 text-cream hover:bg-cream/10'} ${className}`}
    />
  )
}

/** Magnetic link: follows the pointer slightly on fine-pointer devices only. */
export function MagneticLink({ children, className = '', ...p }: ComponentProps<'a'>) {
  const ref = useRef<HTMLAnchorElement>(null)
  const reduce = useReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 })
  const fine = typeof matchMedia !== 'undefined' && matchMedia('(hover: hover) and (pointer: fine)').matches
  const move = (e: React.PointerEvent) => {
    if (!fine || reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * 0.3)
    y.set((e.clientY - r.top - r.height / 2) * 0.4)
  }
  return (
    <motion.a ref={ref} style={{ x, y }} onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0) }}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold ${className}`}
      {...(p as object)}>
      {children}
    </motion.a>
  )
}

/** Featured CTA with an animated iridescent border. */
export function IridescentLink({ children, className = '', ...p }: ComponentProps<'a'>) {
  return (
    <a {...p} className={`iridescent group relative inline-flex rounded-full p-[2px] transition-transform duration-[var(--dur-fast)] active:scale-[.97] ${className}`}>
      <span className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-cream transition-colors group-hover:bg-ink/70">
        {children}
      </span>
    </a>
  )
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ*#/+'
/** Scrambles its text on hover/focus, then resolves. Skipped for Arabic and reduced motion. */
export function ScrambleText({ text }: { text: string }) {
  const { lang } = useI18n()
  const reduce = useReducedMotion()
  const [out, setOut] = useState(text)
  const timer = useRef<number>(0)
  useEffect(() => { setOut(text); return () => cancelAnimationFrame(timer.current) }, [text])
  const run = () => {
    if (reduce || lang === 'ar') return
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 450)
      setOut(text.split('').map((c, i) => (c === ' ' || i < p * text.length ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join(''))
      if (p < 1) timer.current = requestAnimationFrame(tick)
    }
    timer.current = requestAnimationFrame(tick)
  }
  return <span onPointerEnter={run} onFocus={run} aria-label={text}><span aria-hidden>{out}</span></span>
}

/** Fade-up on first view. */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: dur.slow, ease: ease.out, delay }}>
      {children}
    </motion.div>
  )
}

export function SectionHead({ eyebrow, title, id }: { eyebrow: string; title: string; id?: string }) {
  return (
    <Reveal className="mb-10 md:mb-14">
      <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[.25em] text-lime">
        <span className="h-px w-8 bg-lime" aria-hidden />{eyebrow}
      </p>
      <h2 id={id} className="font-display text-balance text-4xl leading-[1.05] md:text-6xl">{title}</h2>
    </Reveal>
  )
}

const paths: Record<string, string> = {
  mail: 'M3 6h18v12H3z M3 6l9 7 9-7',
  phone: 'M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z',
  whatsapp: 'M4 20l1.3-4A8 8 0 1 1 8 18.7z M9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z',
  instagram: 'M4 4h16v16H4z M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M17 6.5h.01',
  play: 'M7 4l13 8-13 8z', pause: 'M6 4h4v16H6z M14 4h4v16h-4z', expand: 'M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5',
  close: 'M5 5l14 14 M19 5L5 19', left: 'M15 5l-7 7 7 7', right: 'M9 5l7 7-7 7', up: 'M5 15l7-7 7 7',
  arrow: 'M5 12h14 M13 6l6 6-6 6', globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18',
  download: 'M12 4v11 M7 10l5 5 5-5 M5 20h14', copy: 'M8 8h12v12H8z M4 4h12v4 M4 4v12h4', volume: 'M4 9h4l5-4v14l-5-4H4z M16 9a4 4 0 0 1 0 6',
  mute: 'M4 9h4l5-4v14l-5-4H4z M16 9l5 6 M21 9l-5 6', menu: 'M4 7h16 M4 12h16 M4 17h10',
}
export function Icon({ name, className = 'size-5' }: { name: keyof typeof paths | string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={paths[name]} />
    </svg>
  )
}
