import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

import { requireAdmin } from '@/lib/server/auth'
import { createMediaItem, listMediaItems, upsertMediaSettings } from '@/lib/server/media'
import { mediaTemplateItems, mediaTemplateSettings } from '@/lib/content/media-template'

export const runtime = 'nodejs'

export async function POST() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const existing = await listMediaItems({ publishedOnly: false, limit: 1 })

    await upsertMediaSettings(mediaTemplateSettings)

    if (existing.length) {
      revalidatePath('/media')
      revalidateTag('media', 'max')
      return NextResponse.json({ ok: true, seededCount: 0 })
    }

    let seededCount = 0
    for (const item of mediaTemplateItems) {
      await createMediaItem(item)
      seededCount++
    }

    revalidatePath('/media')
    revalidateTag('media', 'max')
    return NextResponse.json({ ok: true, seededCount })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 503 })
  }
}
