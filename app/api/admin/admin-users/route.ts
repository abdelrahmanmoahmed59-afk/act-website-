import { NextResponse } from 'next/server'

import { hashPassword, requireAdmin } from '@/lib/server/auth'
import { createAdminUser, listAdminUsers } from '@/lib/server/admin-users'
import { adminUserCreateSchema } from '@/lib/validation/admin-users'

export const runtime = 'nodejs'

function toPublicUser(user: { id: number; email: string; role: 'admin'; createdAt: string; updatedAt: string }) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const users = await listAdminUsers()
    return NextResponse.json({ users: users.map(toPublicUser) })
  } catch (error) {
    console.error('GET /api/admin/admin-users failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}

export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = adminUserCreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })

  try {
    const passwordHash = await hashPassword(parsed.data.password)
    const user = await createAdminUser({ email: parsed.data.email, passwordHash, role: 'admin' })
    return NextResponse.json({ user: toPublicUser(user) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/admin-users failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    if (message.toLowerCase().includes('email already exists')) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}

