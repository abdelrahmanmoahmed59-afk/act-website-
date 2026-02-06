import { NextResponse } from 'next/server'
import { z } from 'zod'

import type { Language } from '@/lib/i18n/base-translations'
import { getBlogSettings, listBlogPosts, localizeBlogPost, localizeBlogSettings } from '@/lib/server/blog'

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
    const [settings, posts] = await Promise.all([getBlogSettings(), listBlogPosts({ publishedOnly: true })])
    const localized = posts.map((p) => localizeBlogPost(p, lang))
    const featured = localized.filter((p) => p.isFeatured).sort((a, b) => a.sortOrder - b.sortOrder || b.id - a.id)[0] ?? null
    const rest = localized.filter((p) => !featured || p.id !== featured.id)
    return NextResponse.json({
      settings: settings ? localizeBlogSettings(settings, lang) : null,
      featured,
      posts: rest,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
