import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

import { requireAdmin } from '@/lib/server/auth'
import { createProject, listProjects } from '@/lib/server/projects'
import { projectsTemplateInputs } from '@/lib/content/projects-template'

export const runtime = 'nodejs'

export async function POST() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const existing = await listProjects({ publishedOnly: false })
    const existingSlugs = new Set(existing.map((p) => p.slug))

    let seededCount = 0
    for (const input of projectsTemplateInputs) {
      if (existingSlugs.has(input.slug)) continue
      try {
        await createProject(input)
        seededCount++
        existingSlugs.add(input.slug)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (message.toLowerCase().includes('slug already exists')) continue
        throw error
      }
    }

    revalidatePath('/')
    revalidatePath('/projects')
    revalidateTag('projects', 'max')
    return NextResponse.json({ ok: true, seededCount })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 503 })
  }
}
