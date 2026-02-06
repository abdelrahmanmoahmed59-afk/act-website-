import { NextResponse } from 'next/server'

import { getSessionCookieName, getSessionCookieOptions } from '@/lib/server/auth'

export const runtime = 'nodejs'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(getSessionCookieName(), '', { ...getSessionCookieOptions(), maxAge: 0 })
  return res
}

