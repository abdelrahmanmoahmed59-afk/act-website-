import { NextResponse } from 'next/server'
import { z } from 'zod'

import type { Language } from '@/lib/i18n/base-translations'
import { listProjects, localizeProject } from '@/lib/server/projects'

export const runtime = 'nodejs'

const querySchema = z.object({
  lang: z.enum(['en', 'ar']).default('en'),
  limit: z.coerce.number().int().min(1).max(50).optional(),
})

export async function GET(req: Request) {
  const url = new URL(req.url)
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams.entries()))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid query', issues: parsed.error.issues }, { status: 400 })

  const lang = parsed.data.lang as Language
  const limit = parsed.data.limit ?? 20

  try {
    const projects = await listProjects({ publishedOnly: true, menuOnly: true, limit })
    return NextResponse.json({
      items: projects.map((p) => {
        const localized = localizeProject(p, lang)
        return { slug: localized.slug, label: localized.title }
      }),
    })
  } catch (error) {
    console.error('GET /api/projects/menu failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
