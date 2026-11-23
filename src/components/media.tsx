import { AnimatePresence, motion } from 'framer-motion'
import QRCode from 'qrcode'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PortfolioItem } from '../content/defaults'
import { useI18n } from '../i18n/I18n'
import { dur, ease } from '../lib/motion'
import { Icon, PressButton } from './ui'

/** Lazy video with custom poster, play/pause, mute and fullscreen. Never autoplays with sound. */
export function VideoPlayer({ src, poster, title, className = '' }: { src: string; poster?: string | null; title: string; className?: string }) {
  const { t } = useI18n()
  const ref = useRef<HTMLVideoElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)

  useEffect(() => { // pause when scrolled away
    const el = box.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) ref.current?.pause() }, { threshold: 0.1 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.paused) void v.play(); else v.pause()
  }
  const full = () => {
    const v = ref.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
    if (!v) return
    if (v.requestFullscreen) void v.requestFullscreen(); else v.webkitEnterFullscreen?.() // iOS Safari
  }

  return (
    <div ref={box} className={`group relative overflow-hidden rounded-3xl bg-ink-2 ${className}`}>
      <video ref={ref} className="h-full w-full object-cover" poster={poster ?? undefined} preload="none" playsInline
        muted={muted} src={src} aria-label={title}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onClick={toggle} />
      {!playing && <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent" />}
      <button type="button" onClick={toggle} aria-label={playing ? t('video.pause') : t('video.play')}
        className={`absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cream text-ink
          shadow-[0_0_0_8px_rgb(255_46_147/.25)] transition-[opacity,transform] duration-[var(--dur-base)] active:scale-90
          ${playing ? 'opacity-0 focus-visible:opacity-100 group-hover:opacity-100' : ''}`}>
        <Icon name={playing ? 'pause' : 'play'} className="size-6" />
      </button>
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold drop-shadow">{title}</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? t('video.unmute') : t('video.mute')}
            className="grid size-11 place-items-center rounded-full bg-ink/60 backdrop-blur"><Icon name={muted ? 'mute' : 'volume'} /></button>
          <button type="button" onClick={full} aria-label={t('video.fullscreen')}
            className="grid size-11 place-items-center rounded-full bg-ink/60 backdrop-blur"><Icon name="expand" /></button>
        </div>
      </div>
    </div>
  )
}

/** Fullscreen viewer for gallery images and videos. */
export function Lightbox({ items, index, onClose, onIndex }: { items: PortfolioItem[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const { t, ml, dir } = useI18n()
  const closeRef = useRef<HTMLButtonElement>(null)
  const item = index === null ? null : items[index]
  useEffect(() => {
    if (index === null) return
    const opener = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const step = (n: number) => onIndex((index + n + items.length) % items.length)
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') step(dir === 'rtl' ? -1 : 1)
      if (e.key === 'ArrowLeft') step(dir === 'rtl' ? 1 : -1)
      if (e.key === 'Tab') { e.preventDefault(); closeRef.current?.focus() }
    }
    addEventListener('keydown', key)
    return () => { removeEventListener('keydown', key); document.body.style.overflow = ''; opener?.focus() }
  }, [index, items.length, onClose, onIndex, dir])

  return (
    <AnimatePresence>
      {item && index !== null && (
        <motion.div role="dialog" aria-modal="true" aria-label={ml(item.title)} className="fixed inset-0 z-[70] flex flex-col bg-ink/95 backdrop-blur-md"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: dur.base }}>
          <div className="flex items-center justify-between gap-4 p-4">
            <p className="truncate text-sm text-cream/80">{index + 1} / {items.length} · {ml(item.title)}</p>
            <button ref={closeRef} type="button" onClick={onClose} aria-label={t('gallery.close')} className="grid size-12 shrink-0 place-items-center rounded-full border border-cream/20"><Icon name="close" /></button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-3" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <motion.div key={item.id} className="flex h-full max-w-full items-center justify-center"
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: dur.base, ease: ease.out }}>
              {item.kind === 'video'
                ? <VideoPlayer src={item.src} poster={item.poster} title={ml(item.title)} className="aspect-[9/16] h-full max-h-[80dvh]" />
                : <img src={item.src} alt={ml(item.caption) || ml(item.title)} className="max-h-[80dvh] max-w-full rounded-2xl object-contain" />}
            </motion.div>
          </div>
          {items.length > 1 && (
            <div className="flex justify-center gap-3 pb-6">
              <button type="button" onClick={() => onIndex((index - 1 + items.length) % items.length)} aria-label={t('gallery.prev')} className="grid size-12 place-items-center rounded-full border border-cream/20"><Icon name="left" className="size-5 rtl:rotate-180" /></button>
              <button type="button" onClick={() => onIndex((index + 1) % items.length)} aria-label={t('gallery.next')} className="grid size-12 place-items-center rounded-full border border-cream/20"><Icon name="right" className="size-5 rtl:rotate-180" /></button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const download = (href: string, name: string) => Object.assign(document.createElement('a'), { href, download: name }).click()

/** Scannable QR (static modules) inside an animated frame with a scan light. */
export function QRCard({ url, label }: { url: string; label: string }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const qr = useMemo(() => QRCode.create(url, { errorCorrectionLevel: 'M' }), [url])
  const n = qr.modules.size
  const cells = useMemo(() => {
    let d = ''
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.modules.get(y, x)) d += `M${x + 2} ${y + 2}h1v1h-1z`
    return d
  }, [qr, n])
  const svgString = () => QRCode.toString(url, { type: 'svg', margin: 2, color: { dark: '#121014', light: '#f7f1ea' } })
  return (
    <div className="relative mx-auto w-full max-w-xs">
      <div className="iridescent rounded-[2rem] p-[2px]">
        <div className="relative overflow-hidden rounded-[calc(2rem-2px)] bg-cream p-4">
          <svg viewBox={`0 0 ${n + 4} ${n + 4}`} className="block w-full" shapeRendering="crispEdges" role="img" aria-label={`QR: ${url}`}>
            <rect width={n + 4} height={n + 4} fill="#f7f1ea" /><path d={cells} fill="#121014" />
          </svg>
          <div aria-hidden className="scanline pointer-events-none absolute inset-x-4 top-4 h-1.5 rounded-full bg-magenta/70 shadow-[0_0_24px_6px_rgb(255_46_147/.45)]" />
        </div>
      </div>
      <p className="mt-4 text-center font-display text-xl">{label}</p>
      <p className="mt-1 truncate text-center text-xs text-mute" dir="ltr">{url}</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <PressButton variant="ghost" className="!px-2 text-xs" aria-label={t('qr.download.png')} onClick={async () => download(await QRCode.toDataURL(url, { width: 1024, margin: 2 }), 'sarah-jaballah-qr.png')}>
          <Icon name="download" className="size-4" />PNG
        </PressButton>
        <PressButton variant="ghost" className="!px-2 text-xs" aria-label={t('qr.download.svg')} onClick={async () => download(URL.createObjectURL(new Blob([await svgString()], { type: 'image/svg+xml' })), 'sarah-jaballah-qr.svg')}>
          <Icon name="download" className="size-4" />SVG
        </PressButton>
        <PressButton variant="ghost" className="!px-2 text-xs" onClick={async () => { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800) }}>
          <Icon name="copy" className="size-4" />{copied ? '✓' : t('qr.copy')}
        </PressButton>
      </div>
      <p aria-live="polite" className="sr-only">{copied ? t('qr.copied') : ''}</p>
    </div>
  )
}
