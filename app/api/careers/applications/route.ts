import { NextResponse } from 'next/server'

import { createCareerApplication } from '@/lib/server/careers'
import { getClientIp, rateLimit } from '@/lib/server/rate-limit'
import { careerApplicationSchema } from '@/lib/validation/careers'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit({ key: `careers:apply:${ip}`, limit: 20, windowMs: 60_000 })
  if (!rl.ok) {
    const retryAfter = Math.max(1, Math.ceil((rl.resetAtMs - Date.now()) / 1000))
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = careerApplicationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })
  }

  try {
    const application = await createCareerApplication(parsed.data)
    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
