import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

import { requireAdmin } from '@/lib/server/auth'
import { getBlogSettings, upsertBlogSettings } from '@/lib/server/blog'
import { blogSettingsSchema } from '@/lib/validation/blog'

export const runtime = 'nodejs'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const settings = await getBlogSettings()
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('GET /api/admin/blog/settings failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}

export async function PUT(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = blogSettingsSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })

  try {
    const settings = await upsertBlogSettings(parsed.data)
    revalidatePath('/blog')
    revalidateTag('blog', 'max')
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('PUT /api/admin/blog/settings failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
