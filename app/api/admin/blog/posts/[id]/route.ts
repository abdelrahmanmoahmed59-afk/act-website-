import { NextResponse } from 'next/server'
import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'

import { requireAdmin } from '@/lib/server/auth'
import { deleteBlogPost, getBlogPostById, updateBlogPost } from '@/lib/server/blog'
import { blogPostSchema } from '@/lib/validation/blog'

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

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rawParams = await unwrapParams(ctx.params)
  const parsedParams = paramsSchema.safeParse(rawParams)
  if (!parsedParams.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const post = await getBlogPostById(parsedParams.data.id)
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ post })
  } catch (error) {
    console.error('GET /api/admin/blog/posts/[id] failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rawParams = await unwrapParams(ctx.params)
  const parsedParams = paramsSchema.safeParse(rawParams)
  if (!parsedParams.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = blogPostSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })

  try {
    const post = await updateBlogPost(parsedParams.data.id, parsed.data)
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    revalidatePath('/blog')
    revalidateTag('blog', 'max')
    return NextResponse.json({ post })
  } catch (error) {
    console.error('PUT /api/admin/blog/posts/[id] failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    if (message.toLowerCase().includes('slug already exists') || message.toLowerCase().includes('duplicate key')) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
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
  if (!parsedParams.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const ok = await deleteBlogPost(parsedParams.data.id)
    revalidatePath('/blog')
    revalidateTag('blog', 'max')
    return NextResponse.json(ok ? { ok: true } : { ok: true, alreadyDeleted: true })
  } catch (error) {
    console.error('DELETE /api/admin/blog/posts/[id] failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
