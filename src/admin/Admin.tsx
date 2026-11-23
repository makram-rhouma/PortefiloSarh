import type { Session } from '@supabase/supabase-js'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Briefcase, ExternalLink, FileText, GraduationCap, Image, Languages, LayoutDashboard, LogOut, Mail, Menu, MoreHorizontal, QrCode, Settings, Share2, Sparkles, Type, X,
} from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { LangMenu, Logo, Signature } from '../components/chrome'
import { I18nProvider, useI18n } from '../i18n/I18n'
import type { Key } from '../i18n/dict'
import { supabase } from '../lib/supabase'
import { btnGhost, btnPrimary, DirtyProvider } from './fields'
import { CollectionPage, ContentPage, MediaPage, MessagesPage, Overview, QrPage, SettingsPage, TranslationsPage } from './pages'

type Item = [string, Key, typeof Image]
const GROUPS: [Key, Item[]][] = [
  ['admin.groupMain', [['', 'admin.overview', LayoutDashboard], ['content', 'admin.content', FileText], ['media', 'admin.media', Image], ['contact', 'admin.messages', Mail]]],
  ['admin.groupProfile', [['experiences', 'admin.experiences', Briefcase], ['education', 'admin.education', GraduationCap], ['skills', 'admin.skills', Sparkles], ['languages', 'admin.languages', Languages], ['socials', 'admin.socials', Share2]]],
  ['admin.groupSite', [['translations', 'admin.translations', Type], ['settings', 'admin.settings', Settings], ['qr', 'admin.qr', QrCode]]],
]
const ALL = GROUPS.flatMap(([, items]) => items)
const TABS = ALL.filter(([to]) => ['', 'content', 'media', 'contact'].includes(to))

function Login() {
  const { t } = useI18n()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: String(f.get('email')), password: String(f.get('password')) })
    setBusy(false)
    if (error) setError(t('admin.loginError'))
  }
  const input = 'mt-1.5 block w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-[#1d1426] shadow-sm focus:border-magenta focus:outline-none focus:ring-4 focus:ring-magenta/15'
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="hero-bg relative isolate flex min-h-[38svh] items-end overflow-hidden p-6 lg:min-h-dvh lg:p-12">
        <img src="/media/illus/hero-dancer.webp" alt="" aria-hidden className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_15%] opacity-60" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div>
          <Signature className="text-6xl lg:text-8xl" />
          <p className="mt-2 max-w-sm text-sm text-cream/80">{t('admin.loginIntro')}</p>
        </div>
      </div>
      <div className="grid place-items-center bg-[#f6f2f8] p-5 lg:p-12">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-3xl bg-white p-7 text-[#1d1426] shadow-[0_20px_60px_-20px_rgb(29_15_43/.35)]">
          <div>
            <p className="text-sm font-semibold text-magenta">{t('admin.welcome')}</p>
            <h1 className="mt-1 text-2xl font-bold">{t('admin.title')}</h1>
          </div>
          <label className="block text-sm font-semibold">{t('admin.email')}<input name="email" type="email" autoComplete="username" required dir="ltr" className={input} /></label>
          <label className="block text-sm font-semibold">{t('admin.password')}<input name="password" type="password" autoComplete="current-password" required dir="ltr" className={input} /></label>
          <button className={`${btnPrimary} w-full`} disabled={busy}>{busy ? t('admin.signingIn') : t('admin.login')}</button>
          <p role="alert" className="min-h-5 text-sm text-magenta">{error}</p>
          <div className="flex items-center justify-between gap-3 border-t border-black/5 pt-4">
            <a href="/" className="inline-flex min-h-11 items-center gap-1.5 text-sm text-[#6b5f73] hover:text-magenta"><ExternalLink className="size-4" aria-hidden />{t('admin.viewSite')}</a>
            <div className="[&_button]:border-black/10 [&_button]:bg-white [&_button]:text-[#1d1426]"><LangMenu /></div>
          </div>
        </form>
      </div>
    </main>
  )
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n()
  const link = ({ isActive }: { isActive: boolean }) =>
    `group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm lg:min-h-10 transition-colors ${isActive ? 'bg-gradient-to-r from-magenta/30 to-lilac/10 font-semibold text-cream ring-1 ring-magenta/40' : 'text-cream/70 hover:bg-cream/5 hover:text-cream'}`
  return (
    <nav aria-label={t('admin.title')} className="space-y-6 lg:space-y-4">
      {GROUPS.map(([g, items]) => (
        <div key={g}>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[.18em] text-cream/40">{t(g)}</p>
          <ul className="space-y-1">
            {items.map(([to, k, I]) => (
              <li key={to}><NavLink to={`/admin/${to}`} end={to === ''} className={link} onClick={onNavigate}>
                <I className="size-[18px] shrink-0 text-magenta" aria-hidden />{t(k)}</NavLink></li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function UserCard({ email }: { email: string }) {
  const { t } = useI18n()
  return (
    <div className="space-y-3 rounded-2xl bg-cream/5 p-3 ring-1 ring-cream/10">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-magenta to-lilac font-bold uppercase text-white">{email[0]}</span>
        <span className="min-w-0"><span className="block text-[11px] text-cream/50">{t('admin.signedInAs')}</span><span className="block truncate text-sm font-semibold" dir="ltr">{email}</span></span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <LangMenu up />
        <button className={`${btnGhost} !px-3`} onClick={() => supabase.auth.signOut()} aria-label={t('admin.signOut')}><LogOut className="size-4" aria-hidden /></button>
      </div>
    </div>
  )
}

function Shell() {
  const { t, dir } = useI18n()
  const loc = useLocation()
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [admin, setAdmin] = useState<boolean | null>(null)
  const [drawer, setDrawer] = useState(false)
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!session) return
    void supabase.rpc('is_admin').then(({ data }) => setAdmin(!!data)) // the real check is RLS on every write
  }, [session])
  useEffect(() => {
    if (!drawer) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false)
    addEventListener('keydown', k); document.body.style.overflow = 'hidden'
    return () => { removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [drawer])

  if (session === undefined || (session && admin === null)) return <p className="grid min-h-dvh place-items-center text-cream/60">{t('admin.loading')}</p>
  if (!session) return <Login />
  if (!admin) return (
    <main className="grid min-h-dvh place-items-center bg-[#f6f2f8] p-5 text-center text-[#1d1426]">
      <div className="max-w-sm rounded-3xl bg-white p-7 shadow-xl"><p role="alert" className="mb-5">{t('admin.notAdmin')}</p>
        <button className={btnPrimary} onClick={() => supabase.auth.signOut()}><LogOut className="size-4" aria-hidden />{t('admin.signOut')}</button></div>
    </main>
  )
  const email = session.user.email ?? ''
  const current = ALL.find(([to]) => (to === '' ? /\/admin\/?$/.test(loc.pathname) : loc.pathname.startsWith(`/admin/${to}`)))
  const tab = ({ isActive }: { isActive: boolean }) =>
    `relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold transition-colors ${isActive ? 'text-magenta' : 'text-[#6b5f73]'}`

  return (
    <DirtyProvider>
      <div className="min-h-dvh bg-[#f6f2f8] lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-dvh flex-col gap-6 overflow-y-auto bg-[linear-gradient(180deg,#1d0f2b,#0f0a16)] p-4 lg:flex">
          <div className="px-2 pt-2"><Logo /></div>
          <div className="flex-1"><NavList /></div>
          <UserCard email={email} />
        </aside>

        <div className="min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-black/5 bg-white/80 px-4 backdrop-blur-xl md:px-8">
            <button type="button" onClick={() => setDrawer(true)} aria-label={t('nav.menu')} aria-expanded={drawer}
              className="grid size-11 place-items-center rounded-xl text-[#1d1426] hover:bg-black/5 lg:hidden"><Menu aria-hidden /></button>
            <h1 className="min-w-0 flex-1 truncate text-lg font-bold text-[#1d1426] md:text-xl">{current ? t(current[1]) : t('admin.title')}</h1>
            <a href="/" target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-[#1d1426] hover:bg-black/5">
              <ExternalLink className="size-4" aria-hidden /><span className="hidden sm:inline">{t('admin.viewSite')}</span></a>
            <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-magenta to-lilac text-sm font-bold uppercase text-white" title={email}>{email[0]}</span>
          </header>

          <main className="admin-light mx-auto w-full max-w-6xl p-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] text-cream md:p-8 lg:pb-10">
            <Routes>
              <Route index element={<Overview />} />
              <Route path="content" element={<ContentPage />} />
              <Route path="media" element={<MediaPage />} />
              <Route path="experiences" element={<CollectionPage kind="experiences" />} />
              <Route path="education" element={<CollectionPage kind="education" />} />
              <Route path="skills" element={<CollectionPage kind="skills" />} />
              <Route path="languages" element={<CollectionPage kind="languages" />} />
              <Route path="socials" element={<CollectionPage kind="socials" />} />
              <Route path="contact" element={<MessagesPage />} />
              <Route path="translations" element={<TranslationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="qr" element={<QrPage />} />
              <Route path="*" element={<Overview />} />
            </Routes>
          </main>
        </div>

        {/* Mobile bottom tab bar */}
        <nav aria-label={t('nav.dock')} className="fixed inset-x-2 bottom-[max(.5rem,env(safe-area-inset-bottom))] z-40 lg:hidden">
          <ul className="grid grid-cols-5 rounded-[1.4rem] border border-black/5 bg-white/90 p-1 shadow-[0_10px_40px_-12px_rgb(29_15_43/.45)] backdrop-blur-xl">
            {TABS.map(([to, k, I]) => (
              <li key={to}><NavLink to={`/admin/${to}`} end={to === ''} className={tab}>
                {({ isActive }) => <>{isActive && <motion.span layoutId="admin-tab" className="absolute inset-0 -z-10 rounded-2xl bg-magenta/10" />}<I className="size-5" aria-hidden /><span className="max-w-full truncate px-0.5">{t(k)}</span></>}
              </NavLink></li>
            ))}
            <li><button type="button" onClick={() => setDrawer(true)} className={tab({ isActive: false }) + ' w-full'}><MoreHorizontal className="size-5" aria-hidden />{t('admin.more')}</button></li>
          </ul>
        </nav>

        {/* Mobile drawer */}
        <AnimatePresence>
          {drawer && (
            <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t('nav.menu')}>
              <motion.button type="button" aria-label={t('nav.close')} className="absolute inset-0 bg-ink/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
              <motion.aside initial={{ x: dir === 'rtl' ? '100%' : '-100%' }} animate={{ x: 0 }} exit={{ x: dir === 'rtl' ? '100%' : '-100%' }} transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                className="absolute inset-y-0 start-0 flex w-[min(20rem,86vw)] flex-col gap-5 overflow-y-auto bg-[linear-gradient(180deg,#1d0f2b,#0f0a16)] p-4">
                <div className="flex items-center justify-between"><Logo /><button type="button" onClick={() => setDrawer(false)} aria-label={t('nav.close')} className="grid size-11 place-items-center rounded-xl text-cream hover:bg-cream/10"><X aria-hidden /></button></div>
                <div className="flex-1"><NavList onNavigate={() => setDrawer(false)} /></div>
                <UserCard email={email} />
              </motion.aside>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DirtyProvider>
  )
}

export default function Admin() {
  useEffect(() => {
    const m = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex' })
    document.head.append(m)
    return () => m.remove()
  }, [])
  return <I18nProvider><Shell /></I18nProvider>
}
