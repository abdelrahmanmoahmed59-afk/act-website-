import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

import { requireAdmin } from '@/lib/server/auth'
import { getClientsSettings, upsertClientsSettings } from '@/lib/server/clients'
import { clientsSettingsSchema } from '@/lib/validation/clients'
import { clientsTemplate } from '@/lib/content/clients-template'

export const runtime = 'nodejs'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const settings = await getClientsSettings()
    return NextResponse.json({ settings: settings ?? clientsTemplate })
  } catch (error) {
    console.error('GET /api/admin/clients/settings failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}

export async function PUT(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = clientsSettingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })
  }

  try {
    const settings = await upsertClientsSettings(parsed.data)
    revalidatePath('/clients')
    revalidateTag('clients', 'max')
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('PUT /api/admin/clients/settings failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
