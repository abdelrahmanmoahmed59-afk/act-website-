import { NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/server/auth'
import { createUpload, getUploadUrl } from '@/lib/server/uploads'
import { getClientIp, rateLimit } from '@/lib/server/rate-limit'

export const runtime = 'nodejs'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/webp', 'image/png', 'image/jpeg', 'image/avif'])
export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ip = getClientIp(req.headers)
  const rl = rateLimit({ key: `admin:upload:${ip}`, limit: 30, windowMs: 60_000 })
  if (!rl.ok) {
    const retryAfter = Math.max(1, Math.ceil((rl.resetAtMs - Date.now()) / 1000))
    return NextResponse.json({ error: 'Too many uploads. Try again later.' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }

  if (!file.type || !ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'Invalid image type. Allowed: WebP, PNG, JPEG, AVIF.' },
      { status: 400 }
    )
  }

  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: `File must be <= ${MAX_BYTES} bytes` }, { status: 400 })
  }

  const bytes = new Uint8Array(await file.arrayBuffer())

  const created = await createUpload({
    bytes,
    contentType: file.type,
    originalName: file.name || '',
  })

  return NextResponse.json({ id: created.id, url: getUploadUrl(created.id) }, { status: 201 })
}
