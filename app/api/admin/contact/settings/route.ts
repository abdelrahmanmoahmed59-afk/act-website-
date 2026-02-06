import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

import { contactTemplate } from '@/lib/content/contact-template'
import { requireAdmin } from '@/lib/server/auth'
import { getContactSettings, upsertContactSettings } from '@/lib/server/contact'
import { contactSettingsSchema } from '@/lib/validation/contact'

export const runtime = 'nodejs'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const settings = await getContactSettings()
    return NextResponse.json({ settings: settings ?? contactTemplate })
  } catch (error) {
    console.error('GET /api/admin/contact/settings failed:', error)
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

  const parsed = contactSettingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })
  }

  try {
    const settings = await upsertContactSettings(parsed.data)
    revalidatePath('/contact')
    revalidateTag('contact', 'max')
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('PUT /api/admin/contact/settings failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
