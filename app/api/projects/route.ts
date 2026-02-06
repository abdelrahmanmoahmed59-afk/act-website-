import { NextResponse } from 'next/server'
import { z } from 'zod'

import type { Language } from '@/lib/i18n/base-translations'
import { getProjectsSettings, listProjects, localizeProject, localizeSettings } from '@/lib/server/projects'

export const runtime = 'nodejs'

const querySchema = z.object({
  lang: z.enum(['en', 'ar']).default('en'),
  limit: z.coerce.number().int().min(1).max(200).optional(),
})

export async function GET(req: Request) {
  const url = new URL(req.url)
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams.entries()))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid query', issues: parsed.error.issues }, { status: 400 })

  const lang = parsed.data.lang as Language
  const limit = parsed.data.limit

  try {
    const [settings, projects] = await Promise.all([
      getProjectsSettings(),
      listProjects({ publishedOnly: true, limit: typeof limit === 'number' ? limit : undefined }),
    ])

    return NextResponse.json({
      settings: settings ? localizeSettings(settings, lang) : null,
      projects: projects.map((p) => localizeProject(p, lang)),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
