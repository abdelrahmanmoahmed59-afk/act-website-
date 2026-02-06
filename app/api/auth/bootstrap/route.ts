import { NextResponse } from 'next/server'
import { z } from 'zod'

import { hashPassword } from '@/lib/server/auth'
import { countAdminUsers, createAdminUser } from '@/lib/server/admin-users'
import { getClientIp, rateLimit } from '@/lib/server/rate-limit'

export const runtime = 'nodejs'

const bootstrapSchema = z.object({
  email: z.string().min(3).max(320).email(),
  password: z.string().min(8).max(200),
})

export async function POST(req: Request) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit({ key: `auth:bootstrap:${ip}`, limit: 5, windowMs: 60_000 })
  if (!rl.ok) {
    const retryAfter = Math.max(1, Math.ceil((rl.resetAtMs - Date.now()) / 1000))
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } })
  }

  const secret = process.env.ADMIN_BOOTSTRAP_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Bootstrap disabled' }, { status: 404 })
  }

  const provided = req.headers.get('x-bootstrap-secret')
  if (!provided || provided !== secret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bootstrapSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const email = parsed.data.email.toLowerCase()
  const passwordHash = await hashPassword(parsed.data.password)

  try {
    const existingCount = await countAdminUsers()
    if (existingCount > 0) {
      return NextResponse.json({ error: 'Admin already exists' }, { status: 409 })
    }

    const user = await createAdminUser({ email, passwordHash, role: 'admin' })
    return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 503 })
  }
}
