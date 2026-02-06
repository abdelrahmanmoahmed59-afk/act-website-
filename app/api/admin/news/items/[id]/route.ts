import { NextResponse } from 'next/server'
import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'

import { requireAdmin } from '@/lib/server/auth'
import { deleteNewsItem, updateNewsItem } from '@/lib/server/news'
import { newsItemSchema } from '@/lib/validation/news'

export const runtime = 'nodejs'

async function unwrapParams<T>(params: T | Promise<T>): Promise<T> {
  return await params
}

const paramsSchema = z.object({
  id: z.preprocess((value) => {
    if (typeof value !== 'string') return value
    const digits = value.replace(/[^\d]/g, '')
    return digits.length ? digits : value
  }, z.coerce.number().int().positive()),
})

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rawParams = await unwrapParams(ctx.params)
  const parsedParams = paramsSchema.safeParse(rawParams)
  if (!parsedParams.success) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsedBody = newsItemSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsedBody.error.issues }, { status: 400 })
  }

  try {
    const item = await updateNewsItem(parsedParams.data.id, parsedBody.data)
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    revalidatePath('/news')
    revalidateTag('news', 'max')
    return NextResponse.json({ item })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rawParams = await unwrapParams(ctx.params)
  const parsedParams = paramsSchema.safeParse(rawParams)
  if (!parsedParams.success) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  try {
    const ok = await deleteNewsItem(parsedParams.data.id)
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    revalidatePath('/news')
    revalidateTag('news', 'max')
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
