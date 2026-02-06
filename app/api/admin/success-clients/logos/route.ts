import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

import { requireAdmin } from '@/lib/server/auth'
import { createSuccessClientsLogo, listSuccessClientsLogos } from '@/lib/server/clients'
import { successClientsLogoSchema } from '@/lib/validation/clients'

export const runtime = 'nodejs'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const logos = await listSuccessClientsLogos()
    return NextResponse.json({ logos })
  } catch (error) {
    console.error('GET /api/admin/success-clients/logos failed:', error)
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

  const parsed = successClientsLogoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })
  }

  try {
    const logo = await createSuccessClientsLogo({
      sortOrder: parsed.data.sortOrder,
      uploadId: parsed.data.uploadId,
      alt: parsed.data.alt,
    })
    revalidatePath('/clients')
    revalidateTag('success-clients', 'max')
    return NextResponse.json({ logo }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/success-clients/logos failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
