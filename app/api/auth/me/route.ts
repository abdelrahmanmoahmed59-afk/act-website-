import { NextResponse } from 'next/server'

import { getCurrentAdmin } from '@/lib/server/auth'

export const runtime = 'nodejs'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ user: null }, { status: 401 })
  return NextResponse.json({ user: admin })
}

