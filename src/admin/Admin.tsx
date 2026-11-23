import type { Session } from '@supabase/supabase-js'
import { useEffect, useState, type FormEvent } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { LayoutDashboard, Image, Briefcase, GraduationCap, Sparkles, Languages, Share2, Mail, Type, Settings, QrCode, FileText, LogOut } from 'lucide-react'
import { LangMenu, Logo } from '../components/chrome'
import { I18nProvider, useI18n } from '../i18n/I18n'
import type { Key } from '../i18n/dict'
import { supabase } from '../lib/supabase'
import { btnGhost, btnPrimary, DirtyProvider } from './fields'
import { CollectionPage, ContentPage, MediaPage, MessagesPage, Overview, QrPage, SettingsPage, TranslationsPage } from './pages'

const NAV: [string, Key, typeof Image][] = [
  ['', 'admin.overview', LayoutDashboard], ['content', 'admin.content', FileText], ['media', 'admin.media', Image], ['experiences', 'admin.experiences', Briefcase],
  ['education', 'admin.education', GraduationCap], ['skills', 'admin.skills', Sparkles], ['languages', 'admin.languages', Languages], ['socials', 'admin.socials', Share2],
  ['contact', 'admin.contact', Mail], ['translations', 'admin.translations', Type], ['settings', 'admin.settings', Settings], ['qr', 'admin.qr', QrCode],
]

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
  const input = 'mt-1 block w-full rounded-xl border border-cream/15 bg-ink px-3 py-3 text-base focus:border-lime focus:outline-none'
  return (
    <main className="grid min-h-dvh place-items-center p-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl border border-cream/10 bg-ink-2 p-6">
        <Logo />
        <h1 className="font-display text-2xl">{t('admin.title')}</h1>
        <label className="block text-sm font-semibold">{t('admin.email')}<input name="email" type="email" autoComplete="username" required dir="ltr" className={input} /></label>
        <label className="block text-sm font-semibold">{t('admin.password')}<input name="password" type="password" autoComplete="current-password" required dir="ltr" className={input} /></label>
        <button className={`${btnPrimary} w-full`} disabled={busy}>{busy ? t('admin.signingIn') : t('admin.login')}</button>
        <p role="alert" className="text-sm text-magenta">{error}</p>
        <LangMenu />
      </form>
    </main>
  )
}

function Shell() {
  const { t } = useI18n()
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [admin, setAdmin] = useState<boolean | null>(null)
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!session) { setAdmin(null); return }
    void supabase.rpc('is_admin').then(({ data }) => setAdmin(!!data)) // the real check is RLS on every write
  }, [session])

  if (session === undefined || (session && admin === null)) return <p className="grid min-h-dvh place-items-center text-cream/60">{t('admin.loading')}</p>
  if (!session) return <Login />
  if (!admin) return (
    <main className="grid min-h-dvh place-items-center p-5 text-center">
      <div><p role="alert" className="mb-4">{t('admin.notAdmin')}</p><button className={btnGhost} onClick={() => supabase.auth.signOut()}>{t('admin.signOut')}</button></div>
    </main>
  )
  const link = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-sm ${isActive ? 'bg-magenta/20 text-cream font-semibold ring-1 ring-magenta/40' : 'text-cream/75 hover:bg-cream/10'}`
  return (
    <DirtyProvider>
      <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
        <aside className="sticky top-0 z-10 border-b border-cream/10 bg-[linear-gradient(#1d0f2b,#0f0a16)] lg:h-dvh lg:overflow-y-auto lg:border-b-0 lg:border-e">
          <div className="flex items-center justify-between gap-2 p-4">
            <Logo />
            <a href="/" className="text-xs text-cream/60 underline">{t('admin.viewSite')}</a>
          </div>
          <nav aria-label={t('admin.title')} className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
            {NAV.map(([to, k, I]) => <NavLink key={to} to={`/admin/${to}`} end={to === ''} className={link}><I className="size-4 shrink-0 text-magenta" aria-hidden />{t(k)}</NavLink>)}
          </nav>
          <div className="hidden space-y-3 p-4 lg:block">
            <LangMenu />
            <button className={btnGhost} onClick={() => supabase.auth.signOut()}><LogOut className="size-4" aria-hidden />{t('admin.signOut')}</button>
          </div>
        </aside>
        <main className="admin-light min-w-0 bg-ink p-4 text-cream md:p-8">
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
          <div className="mt-10 flex gap-3 lg:hidden"><LangMenu /><button className={btnGhost} onClick={() => supabase.auth.signOut()}>{t('admin.signOut')}</button></div>
        </main>
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
