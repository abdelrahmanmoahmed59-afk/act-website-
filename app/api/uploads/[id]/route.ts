import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getUploadById } from '@/lib/server/uploads'

export const runtime = 'nodejs'

async function unwrapParams<T>(params: T | Promise<T>): Promise<T> {
  return await params
}

const paramsSchema = z.object({
  id: z.preprocess((value) => {
    if (typeof value !== 'string') return value
    // Be forgiving if a client accidentally includes quotes or other non-digits.
    const digits = value.replace(/[^\d]/g, '')
    return digits.length ? digits : value
  }, z.coerce.number().int().positive()),
})

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const rawParams = await unwrapParams(ctx.params)
  const parsed = paramsSchema.safeParse(rawParams)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const upload = await getUploadById(parsed.data.id)
  if (!upload) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const res = new NextResponse(new Uint8Array(upload.bytes), {
    status: 200,
    headers: {
      'Content-Type': upload.contentType,
      'Content-Length': String(upload.byteSize),
      'Cache-Control': 'public, max-age=31536000, immutable',
      ETag: `"${upload.sha256}"`,
    },
  })
  return res
}
