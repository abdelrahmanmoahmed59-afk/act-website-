import { NextResponse } from 'next/server'
import { z } from 'zod'

import type { Language } from '@/lib/i18n/base-translations'
import { getMediaSettings, listMediaItems, localizeMediaItem, localizeMediaSettings } from '@/lib/server/media'

export const runtime = 'nodejs'

const querySchema = z.object({
  lang: z.enum(['en', 'ar']).default('en'),
})

export async function GET(req: Request) {
  const url = new URL(req.url)
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams.entries()))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid query', issues: parsed.error.issues }, { status: 400 })

  const lang = parsed.data.lang as Language

  try {
    const [settings, items] = await Promise.all([getMediaSettings(), listMediaItems({ publishedOnly: true })])
    return NextResponse.json({
      settings: settings ? localizeMediaSettings(settings, lang) : null,
      items: items.map((item) => localizeMediaItem(item, lang)),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
