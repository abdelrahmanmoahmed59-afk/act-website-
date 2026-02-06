import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getSuccessClientsSettings, listSuccessClientsLogos } from '@/lib/server/clients'

export const runtime = 'nodejs'

const langSchema = z.enum(['en', 'ar']).catch('en')

export async function GET(req: Request) {
  const url = new URL(req.url)
  const lang = langSchema.parse(url.searchParams.get('lang'))

  try {
    const [settings, logos] = await Promise.all([getSuccessClientsSettings(), listSuccessClientsLogos()])
    if (!settings) {
      const res = NextResponse.json({ settings: null, logos: [] })
      res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600')
      return res
    }

    const res = NextResponse.json({
      settings: { title: settings.title[lang], subtitle: settings.subtitle[lang] },
      logos: logos.map((logo) => ({
        id: logo.id,
        sortOrder: logo.sortOrder,
        image: logo.imageUrl,
        alt: logo.alt[lang],
      })),
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
