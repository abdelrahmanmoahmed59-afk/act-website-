import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

import { requireAdmin } from '@/lib/server/auth'
import { createProject, listProjects } from '@/lib/server/projects'
import { projectInputSchema } from '@/lib/validation/projects'

export const runtime = 'nodejs'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const projects = await listProjects({ publishedOnly: false })
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('GET /api/admin/projects failed:', error)
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

  const parsed = projectInputSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })

  try {
    const project = await createProject(parsed.data)
    revalidatePath('/')
    revalidatePath('/projects')
    revalidateTag('projects', 'max')
    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/projects failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    if (message.toLowerCase().includes('slug already exists') || message.toLowerCase().includes('duplicate key')) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
