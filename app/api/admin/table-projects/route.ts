import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'

import { requireAdmin } from '@/lib/server/auth'
import { slugify, withSlugSuffix } from '@/lib/server/slug'
import { createProject, deleteProject, getProjectById, listProjects, updateProject } from '@/lib/server/projects'

export const runtime = 'nodejs'

const localizedShort = z.object({
  en: z.string().trim().min(1).max(200),
  ar: z.string().trim().min(1).max(200),
})

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only.')

const deleteRowSchema = z.object({
  id: z.coerce.number().int().positive(),
  delete: z.literal(true),
})

const upsertRowSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  delete: z.union([z.literal(false), z.undefined()]).optional(),
  slug: slugSchema.optional(),
  sortOrder: z.coerce.number().int().min(0).max(1_000_000).optional(),
  published: z.coerce.boolean().optional(),
  showInMenu: z.coerce.boolean().optional(),
  year: z.string().trim().min(1).max(10).optional(),
  title: localizedShort,
  client: localizedShort,
  location: localizedShort,
  projectType: localizedShort,
  cost: localizedShort,
  status: localizedShort,
})

const payloadSchema = z.object({
  rows: z.array(z.union([deleteRowSchema, upsertRowSchema])).max(500),
})

type TableRow = z.infer<typeof deleteRowSchema> | z.infer<typeof upsertRowSchema>

function createDefaultProjectInput(row: z.infer<typeof upsertRowSchema>, slug: string, year: string) {
  return {
    slug,
    sortOrder: row.sortOrder ?? 0,
    published: row.published ?? true,
    showInMenu: row.showInMenu ?? true,
    title: row.title,
    sector: { en: 'General', ar: 'عام' },
    projectType: row.projectType,
    year,
    status: row.status,
    client: row.client,
    location: row.location,
    cost: row.cost,
    summary: row.title,
    details: row.title,
    methodology: { en: [], ar: [] },
    galleryUploadIds: [],
  }
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const projects = await listProjects({ publishedOnly: false })
    const rows = projects
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder || b.id - a.id)
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        sortOrder: p.sortOrder,
        published: p.published,
        showInMenu: p.showInMenu,
        year: p.year,
        title: p.title,
        client: p.client,
        location: p.location,
        projectType: p.projectType,
        cost: p.cost,
        status: p.status,
      }))

    return NextResponse.json({ rows })
  } catch (error) {
    console.error('GET /api/admin/table-projects failed:', error)
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

  const normalized = Array.isArray(body) ? { rows: body } : body
  const parsed = payloadSchema.safeParse(normalized)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })

  const rows = parsed.data.rows as TableRow[]
  const results = { created: 0, updated: 0, deleted: 0, skipped: 0, errors: [] as string[] }

  try {
    const existingProjects = await listProjects({ publishedOnly: false })
    const usedSlugs = new Set(existingProjects.map((p) => p.slug))
    const currentYear = String(new Date().getFullYear())

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i]

      try {
        if ('delete' in row && row.delete) {
          const ok = await deleteProject(row.id)
          if (ok) results.deleted += 1
          else results.skipped += 1
          continue
        }

        const upsert = row as z.infer<typeof upsertRowSchema>

        if (upsert.id) {
          const existing = await getProjectById(upsert.id)
          if (!existing) {
            results.skipped += 1
            continue
          }

          const input = {
            slug: upsert.slug ?? existing.slug,
            sortOrder: upsert.sortOrder ?? existing.sortOrder,
            published: upsert.published ?? existing.published,
            showInMenu: upsert.showInMenu ?? existing.showInMenu,
            title: upsert.title,
            sector: existing.sector,
            projectType: upsert.projectType,
            year: upsert.year ?? existing.year,
            status: upsert.status,
            client: upsert.client,
            location: upsert.location,
            cost: upsert.cost,
            summary: existing.summary,
            details: existing.details,
            methodology: existing.methodology,
            galleryUploadIds: existing.galleryUploadIds,
          }

          await updateProject(upsert.id, input)
          results.updated += 1
          continue
        }

        const baseSlug = upsert.slug?.trim() ? upsert.slug.trim() : slugify(upsert.title.en || 'project')
        const seed = baseSlug || 'project'
        let finalSlug = seed

        if (usedSlugs.has(finalSlug)) {
          for (let suffix = 2; suffix < 10_000; suffix += 1) {
            const candidate = withSlugSuffix(seed, suffix, 120)
            if (!usedSlugs.has(candidate)) {
              finalSlug = candidate
              break
            }
          }
        }

        if (usedSlugs.has(finalSlug)) throw new Error('Slug already exists')
        usedSlugs.add(finalSlug)

        const year = upsert.year?.trim() ? upsert.year.trim() : currentYear
        const created = await createProject(createDefaultProjectInput(upsert, finalSlug, year))
        usedSlugs.add(created.slug)
        results.created += 1
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        results.errors.push(`Row ${i + 1}: ${message}`)
      }
    }
  } catch (error) {
    console.error('PUT /api/admin/table-projects failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }

  revalidatePath('/')
  revalidatePath('/projects')
  revalidateTag('projects', 'max')

  return NextResponse.json(results)
}

