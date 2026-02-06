import { NextResponse } from 'next/server'

import { contactTemplate } from '@/lib/content/contact-template'
import { getContactSettings } from '@/lib/server/contact'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const settings = await getContactSettings()
    return NextResponse.json({ settings: settings ?? contactTemplate })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
