import { NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/server/auth'
import { listContactSubmissions } from '@/lib/server/contact'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const limitParam = url.searchParams.get('limit')
  const limit = limitParam ? Number(limitParam) : undefined

  try {
    const submissions = await listContactSubmissions({ limit })
    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('GET /api/admin/contact/submissions failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
