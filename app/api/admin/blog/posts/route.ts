import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

import { requireAdmin } from '@/lib/server/auth'
import { createBlogPost, listBlogPosts } from '@/lib/server/blog'
import { blogPostSchema } from '@/lib/validation/blog'

export const runtime = 'nodejs'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const posts = await listBlogPosts({ publishedOnly: false })
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('GET /api/admin/blog/posts failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}

export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = blogPostSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })

  try {
    const post = await createBlogPost(parsed.data)
    revalidatePath('/blog')
    revalidateTag('blog', 'max')
    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/blog/posts failed:', error)
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
