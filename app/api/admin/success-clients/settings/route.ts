import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

import { requireAdmin } from '@/lib/server/auth'
import { getSuccessClientsSettings, upsertSuccessClientsSettings } from '@/lib/server/clients'
import { successClientsSettingsSchema } from '@/lib/validation/clients'
import { successClientsTemplate } from '@/lib/content/success-clients-template'

export const runtime = 'nodejs'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const settings = await getSuccessClientsSettings()
    return NextResponse.json({ settings: settings ?? { title: successClientsTemplate.title, subtitle: successClientsTemplate.subtitle } })
  } catch (error) {
    console.error('GET /api/admin/success-clients/settings failed:', error)
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

  const parsed = successClientsSettingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })
  }

  try {
    const settings = await upsertSuccessClientsSettings(parsed.data)
    revalidatePath('/clients')
    revalidateTag('success-clients', 'max')
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('PUT /api/admin/success-clients/settings failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
