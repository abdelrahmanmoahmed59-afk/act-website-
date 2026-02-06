import { NextResponse } from 'next/server'
import { z } from 'zod'

import {
  getSessionCookieName,
  getSessionCookieOptions,
  signAdminSession,
  verifyPassword,
} from '@/lib/server/auth'
import { getAdminUserByEmail } from '@/lib/server/admin-users'
import { getClientIp, rateLimit } from '@/lib/server/rate-limit'

export const runtime = 'nodejs'

const loginSchema = z.object({
  email: z.string().min(3).max(320).email(),
  password: z.string().min(1).max(200),
})

export async function POST(req: Request) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit({ key: `auth:login:${ip}`, limit: 12, windowMs: 60_000 })
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

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const email = parsed.data.email.toLowerCase()
  const password = parsed.data.password

  try {
    const user = await getAdminUserByEmail(email)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const ok = await verifyPassword(password, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = await signAdminSession({ userId: user.id, email: user.email, role: 'admin' })

    const res = NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } })
    res.cookies.set(getSessionCookieName(), token, getSessionCookieOptions())
    return res
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    if (message.includes('JWT_SECRET is not set')) {
      return NextResponse.json({ error: 'Auth not configured' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 503 })
  }
}
