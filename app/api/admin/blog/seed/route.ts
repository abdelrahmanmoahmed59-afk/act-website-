import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

import { requireAdmin } from '@/lib/server/auth'
import { createBlogPost, listBlogPosts, upsertBlogSettings } from '@/lib/server/blog'
import { blogTemplatePosts, blogTemplateSettings } from '@/lib/content/blog-template'

export const runtime = 'nodejs'

export async function POST() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const existing = await listBlogPosts({ publishedOnly: false })
    const existingSlugs = new Set(existing.map((p) => p.slug))

    await upsertBlogSettings(blogTemplateSettings)

    let seededCount = 0
    for (const post of blogTemplatePosts) {
      if (existingSlugs.has(post.slug)) continue
      try {
        await createBlogPost(post)
        seededCount++
        existingSlugs.add(post.slug)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (message.toLowerCase().includes('slug already exists')) continue
        throw error
      }
    }

    revalidatePath('/blog')
    revalidateTag('blog', 'max')
    return NextResponse.json({ ok: true, seededCount })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 503 })
  }
}
