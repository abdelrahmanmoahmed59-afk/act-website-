import { NextResponse } from 'next/server'
import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'

import { pagesTemplates } from '@/lib/content/pages/templates'
import { requireAdmin } from '@/lib/server/auth'
import { getPageContent, pageContentSchema, patchPageContent, upsertPageContent } from '@/lib/server/pages'

export const runtime = 'nodejs'

async function unwrapParams<T>(params: T | Promise<T>): Promise<T> {
  return await params
}

const paramsSchema = z.object({ key: z.string().min(1).max(80) })

function revalidateForKey(key: string) {
  if (key === 'overview') revalidatePath('/overview')
  if (key === 'about') revalidatePath('/about')
  if (key === 'services') revalidatePath('/services')
  if (key === 'home') revalidatePath('/')
  if (key === 'get-quotation') revalidatePath('/get-quotation')
  revalidateTag(`page:${key}`, 'max')
}

export async function GET(_req: Request, ctx: { params: Promise<{ key: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rawParams = await unwrapParams(ctx.params)
  const parsed = paramsSchema.safeParse(rawParams)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid key' }, { status: 400 })

  const key = parsed.data.key as keyof typeof pagesTemplates

  try {
    const content = await getPageContent(parsed.data.key)
    const template = (pagesTemplates as any)[key] ?? { en: {}, ar: {} }
    return NextResponse.json({ content: content ?? template })
  } catch (error) {
    console.error('GET /api/admin/pages/[key] failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ key: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rawParams = await unwrapParams(ctx.params)
  const parsedParams = paramsSchema.safeParse(rawParams)
  if (!parsedParams.success) return NextResponse.json({ error: 'Invalid key' }, { status: 400 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsedBody = pageContentSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsedBody.error.issues }, { status: 400 })
  }

  try {
    const content = await upsertPageContent(parsedParams.data.key, parsedBody.data)
    revalidateForKey(parsedParams.data.key)
    return NextResponse.json({ content })
  } catch (error) {
    console.error('PUT /api/admin/pages/[key] failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ key: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rawParams = await unwrapParams(ctx.params)
  const parsedParams = paramsSchema.safeParse(rawParams)
  if (!parsedParams.success) return NextResponse.json({ error: 'Invalid key' }, { status: 400 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const partialSchema = pageContentSchema.partial()
  const parsedBody = partialSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsedBody.error.issues }, { status: 400 })
  }

  try {
    const content = await patchPageContent(parsedParams.data.key, parsedBody.data)
    revalidateForKey(parsedParams.data.key)
    return NextResponse.json({ content })
  } catch (error) {
    console.error('PATCH /api/admin/pages/[key] failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
