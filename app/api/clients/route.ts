import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getClientsSettings } from '@/lib/server/clients'

export const runtime = 'nodejs'

const langSchema = z.enum(['en', 'ar']).catch('en')

export async function GET(req: Request) {
  const url = new URL(req.url)
  const lang = langSchema.parse(url.searchParams.get('lang'))

  try {
    const settings = await getClientsSettings()
    if (!settings) {
      const res = NextResponse.json({ settings: null, stats: [], segments: [], testimonials: [], logosText: [] })
      res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600')
      return res
    }

    const res = NextResponse.json({
      settings: {
        eyebrow: settings.eyebrow[lang],
        title: settings.title[lang],
        subtitle: settings.subtitle[lang],
        primaryAction: settings.primaryAction[lang],
        secondaryAction: settings.secondaryAction[lang],
        introTitle: settings.introTitle[lang],
        intro: settings.intro[lang],
        segmentsTitle: settings.segmentsTitle[lang],
        testimonialsTitle: settings.testimonialsTitle[lang],
        logosTitle: settings.logosTitle[lang],
        logosIntro: settings.logosIntro[lang],
        ctaTitle: settings.ctaTitle[lang],
        ctaDesc: settings.ctaDesc[lang],
        ctaButton: settings.ctaButton[lang],
      },
      stats: settings.stats.map((stat) => ({ value: stat.value, label: stat.label[lang] })),
      segments: settings.segments.map((seg) => ({ title: seg.title[lang], description: seg.description[lang] })),
      testimonials: settings.testimonials.map((t) => ({
        quote: t.quote[lang],
        name: t.name[lang],
        role: t.role[lang],
      })),
      logosText: settings.logosText.map((x) => x[lang]),
    })
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600')
    return res
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
