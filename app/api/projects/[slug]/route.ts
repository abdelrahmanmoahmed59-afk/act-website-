import { NextResponse } from 'next/server'
import { z } from 'zod'

import type { Language } from '@/lib/i18n/base-translations'
import { getProjectsSettings, getProjectBySlug, localizeProject, localizeSettings } from '@/lib/server/projects'

export const runtime = 'nodejs'

const paramsSchema = z.object({
  slug: z.string().trim().min(1).max(200),
})

const querySchema = z.object({
  lang: z.enum(['en', 'ar']).default('en'),
})

async function unwrapParams<T>(params: T | Promise<T>): Promise<T> {
  return await params
}

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const rawParams = await unwrapParams(ctx.params)
  const parsedParams = paramsSchema.safeParse(rawParams)
  if (!parsedParams.success) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })

  const url = new URL(req.url)
  const parsedQuery = querySchema.safeParse(Object.fromEntries(url.searchParams.entries()))
  if (!parsedQuery.success) return NextResponse.json({ error: 'Invalid query' }, { status: 400 })

  const lang = parsedQuery.data.lang as Language

  try {
    const [settings, project] = await Promise.all([getProjectsSettings(), getProjectBySlug(parsedParams.data.slug, { publishedOnly: true })])
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({
      settings: settings ? localizeSettings(settings, lang) : null,
      project: localizeProject(project, lang),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
