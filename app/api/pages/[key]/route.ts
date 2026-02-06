import { NextResponse } from 'next/server'
import { z } from 'zod'

import { pagesTemplates } from '@/lib/content/pages/templates'
import { getPageContent } from '@/lib/server/pages'

export const runtime = 'nodejs'

const paramsSchema = z.object({ key: z.string().min(1).max(80) })

async function unwrapParams<T>(params: T | Promise<T>): Promise<T> {
  return await params
}

export async function GET(_req: Request, ctx: { params: Promise<{ key: string }> }) {
  const rawParams = await unwrapParams(ctx.params)
  const parsed = paramsSchema.safeParse(rawParams)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid key' }, { status: 400 })

  const key = parsed.data.key as keyof typeof pagesTemplates

  try {
    const content = await getPageContent(parsed.data.key)
    const template = (pagesTemplates as any)[key] ?? { en: {}, ar: {} }
    return NextResponse.json({ content: content ?? template })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
