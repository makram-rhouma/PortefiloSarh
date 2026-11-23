import { motion } from 'framer-motion'
import { Clapperboard, House, Images, Mail, Route, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18n'
import type { Key } from '../i18n/dict'

const ITEMS: { id: string; key: Key; Icon: typeof House }[] = [
  { id: 'top', key: 'nav.home', Icon: House }, { id: 'about', key: 'nav.about', Icon: UserRound },
  { id: 'journey', key: 'nav.journey', Icon: Route }, { id: 'dance', key: 'nav.danceShort', Icon: Clapperboard },
  { id: 'gallery', key: 'nav.gallery', Icon: Images }, { id: 'contact', key: 'nav.contact', Icon: Mail },
]

/** Primary mobile navigation: fixed app-style dock that follows the visible section. */
export function MobileDock() {
  const { t } = useI18n()
  const [active, setActive] = useState('top')
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    // the section crossing the middle band of the viewport is the active one
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActive(({ videos: 'dance', skills: 'gallery', education: 'gallery' } as Record<string, string>)[e.target.id] ?? e.target.id)
    }, { rootMargin: '-45% 0px -50% 0px' })
    for (const id of [...ITEMS.map((i) => i.id), 'videos', 'skills', 'education']) { const el = document.getElementById(id); if (el) io.observe(el) }
    // hide while the on-screen keyboard is up so it never covers the focused field
    const on = (e: FocusEvent) => setTyping((e.target as HTMLElement).matches?.('input,textarea,select') ?? false)
    addEventListener('focusin', on); addEventListener('focusout', () => setTyping(false))
    return () => { io.disconnect(); removeEventListener('focusin', on) }
  }, [])

  return (
    <nav aria-label={t('nav.dock')}
      className={`fixed inset-x-2 bottom-[max(.5rem,env(safe-area-inset-bottom))] z-40 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] lg:hidden
        ${typing ? 'translate-y-[150%]' : ''}`}>
      <ul className="grid grid-cols-6 rounded-[1.6rem] border border-magenta/35 bg-ink/80 p-1 shadow-[0_10px_40px_-10px_rgb(255_46_147/.45)] backdrop-blur-xl">
        {ITEMS.map(({ id, key, Icon }) => {
          const on = active === id
          return (
            <li key={id} className="relative">
              <a href={`#${id}`} aria-current={on ? 'true' : undefined} onClick={() => setActive(id)}
                className={`relative z-10 flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.3rem] transition-[color,transform] duration-[var(--dur-fast)] active:scale-90
                  ${on ? 'text-lime' : 'text-cream/65'}`}>
                <Icon aria-hidden className={`size-5 ${on ? 'drop-shadow-[0_0_8px_rgb(216_255_62/.8)]' : ''}`} strokeWidth={on ? 2.2 : 1.7} />
                <span className="max-w-full truncate px-0.5 text-[10px] font-semibold leading-none max-[359px]:text-[9px]">{t(key)}</span>
              </a>
              {on && <motion.span layoutId="dock-pill" aria-hidden transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-[1.3rem] bg-gradient-to-b from-magenta/30 to-lilac/15 ring-1 ring-magenta/40" />}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
