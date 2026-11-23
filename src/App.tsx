import { MotionConfig } from 'framer-motion'
import { Header, Loader } from './components/chrome'
import { useSiteData } from './content/useSiteData'
import { I18nProvider } from './i18n/I18n'
import { About, Contact, Dance, EducationSection, Footer, Gallery, Hero, Journey, Skills } from './site/Sections'

export default function App() {
  const data = useSiteData()
  return (
    <I18nProvider overrides={data.translations}>
      <MotionConfig reducedMotion="user">
        <Loader />
        <Header email={data.settings.email} />
        <main id="main">
          <Hero data={data} />
          <About data={data} />
          <Journey data={data} />
          <Dance data={data} />
          <Gallery data={data} />
          <Skills data={data} />
          <EducationSection data={data} />
          <Contact data={data} />
        </main>
        <Footer data={data} />
      </MotionConfig>
    </I18nProvider>
  )
}
