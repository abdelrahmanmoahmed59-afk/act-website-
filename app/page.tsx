import Header from '@/components/header'
import Hero from '@/components/hero'
import AboutStory from '@/components/about-story-section'
import OurSuccess from '@/components/our-success-section'
import type { SuccessClientsContentByLanguage } from '@/components/clients-section'
import Clients from '@/components/clients-section'
import Projects from '@/components/projects-section'
import Founder from '@/components/founder-section'
import ContactSection from '@/components/contact-section'
import Footer from '@/components/footer'
import { unstable_cache } from 'next/cache'
import type { Language } from '@/lib/i18n/base-translations'
import { successClientsTemplate } from '@/lib/content/success-clients-template'
import { getSuccessClientsSettings, listSuccessClientsLogos } from '@/lib/server/clients'

const getCachedSuccessClients = unstable_cache(
  async () => {
    try {
      const [settings, logos] = await Promise.all([getSuccessClientsSettings(), listSuccessClientsLogos()])
      return { settings, logos }
    } catch {
      return { settings: null as Awaited<ReturnType<typeof getSuccessClientsSettings>>, logos: [] as Awaited<ReturnType<typeof listSuccessClientsLogos>> }
    }
  },
  ['home-success-clients'],
  { revalidate: 60, tags: ['success-clients'] }
)

function buildSuccessClientsContent(
  settings: Awaited<ReturnType<typeof getSuccessClientsSettings>>,
  logos: Awaited<ReturnType<typeof listSuccessClientsLogos>>
): SuccessClientsContentByLanguage {
  const s = settings ?? (successClientsTemplate as any)
  const list = logos?.length ? logos : (successClientsTemplate.logos as any[]).map((l) => ({
    imageUrl: l.imageUrl,
    alt: l.alt,
    sortOrder: l.sortOrder,
  }))

  const languages: Language[] = ['en', 'ar']
  const content = {} as SuccessClientsContentByLanguage

  for (const lang of languages) {
    content[lang] = {
      title: s.title?.[lang] || successClientsTemplate.title[lang],
      subtitle: s.subtitle?.[lang] || successClientsTemplate.subtitle[lang],
      logos: list.map((logo: any) => ({ src: logo.imageUrl || logo.src, alt: logo.alt?.[lang] || '' })),
    }
  }

  return content
}

export default async function Home() {
  const { settings, logos } = await getCachedSuccessClients()
  const successClientsContent = buildSuccessClientsContent(settings, logos)

  return (
    <main>
      <Header />
      <Hero />
      <AboutStory />
      <OurSuccess />
      <Clients content={successClientsContent} />
      <Projects />
      <Founder />
      <ContactSection />
      <Footer />
    </main>
  )
}
