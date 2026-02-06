import { NextResponse } from 'next/server'
import { z } from 'zod'

import { listCareerJobs, localizeCareerJob } from '@/lib/server/careers'
import type { Language } from '@/lib/i18n/base-translations'

export const runtime = 'nodejs'

const querySchema = z.object({
  lang: z.enum(['en', 'ar']).optional().default('en'),
})

export async function GET(req: Request) {
  const url = new URL(req.url)
  const parsed = querySchema.safeParse({ lang: url.searchParams.get('lang') ?? undefined })
  const lang = (parsed.success ? parsed.data.lang : 'en') as Language

  try {
    const jobs = await listCareerJobs({ publishedOnly: true })
    return NextResponse.json({ jobs: jobs.map((job) => localizeCareerJob(job, lang)) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
