import { MotionConfig } from 'framer-motion'
import { Header, Loader } from './components/chrome'
import { MobileDock } from './components/MobileDock'
import { useSiteData } from './content/useSiteData'
import { I18nProvider } from './i18n/I18n'
import { AboutJourney, Contact, DanceGallery, EducationSection, Footer, Hero, Skills, Videos } from './site/Sections'

export default function App() {
  const data = useSiteData()
  const s = data.settings
  return (
    <I18nProvider overrides={data.translations}>
      <MotionConfig reducedMotion="user">
        <Loader />
        <Header email={s.email} instagram={s.instagram} whatsapp={s.whatsapp} />
        <main id="main">
          <Hero data={data} />
          <AboutJourney data={data} />
          <DanceGallery data={data} />
          <Videos data={data} />
          <Skills data={data} />
          <EducationSection data={data} />
          <Contact data={data} />
        </main>
        <Footer data={data} />
        <MobileDock />
      </MotionConfig>
    </I18nProvider>
  )
}
