import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getNewsSettings, listNewsItems } from '@/lib/server/news'

export const runtime = 'nodejs'

const langSchema = z.enum(['en', 'ar']).catch('en')

export async function GET(req: Request) {
  const url = new URL(req.url)
  const lang = langSchema.parse(url.searchParams.get('lang'))

  try {
    const [settings, items] = await Promise.all([getNewsSettings(), listNewsItems()])

    if (!settings) {
      const res = NextResponse.json({ settings: null, items: [] })
      res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600')
      return res
    }

    const localizedSettings = {
      title: settings.title[lang],
      intro: settings.intro[lang],
      filterLabel: settings.filterLabel[lang],
      allLabel: settings.allLabel[lang],
      readMore: settings.readMore[lang],
      close: settings.close[lang],
      contactTitle: settings.contactTitle[lang],
      contactDesc: settings.contactDesc[lang],
      contactEmail: settings.contactEmail,
      contactButton: settings.contactButton[lang],
    }

    const localizedItems = items.map((item) => ({
      id: item.id,
      slug: item.slug ?? null,
      sortOrder: item.sortOrder,
      title: item.title[lang],
      date: item.dateLabel[lang],
      category: item.category[lang],
      excerpt: item.excerpt[lang],
      image: item.imageUrl,
    }))

    const res = NextResponse.json({ settings: localizedSettings, items: localizedItems })
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
