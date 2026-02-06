import { NextResponse } from 'next/server'
import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'

import { requireAdmin } from '@/lib/server/auth'
import { deleteCareerJob, getCareerJobById, updateCareerJob } from '@/lib/server/careers'
import { careerJobSchema } from '@/lib/validation/careers'

export const runtime = 'nodejs'

async function unwrapParams<T>(params: T | Promise<T>): Promise<T> {
  return await params
}

const paramsSchema = z.object({
  id: z.preprocess((value) => {
    if (typeof value !== 'string') return value
    const digits = value.replace(/[^\d]/g, '')
    return digits.length ? digits : value
  }, z.coerce.number().int().positive()),
})

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rawParams = await unwrapParams(ctx.params)
  const parsedParams = paramsSchema.safeParse(rawParams)
  if (!parsedParams.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const job = await getCareerJobById(parsedParams.data.id)
    if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ job })
  } catch (error) {
    console.error('GET /api/admin/careers/jobs/[id] failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rawParams = await unwrapParams(ctx.params)
  const parsedParams = paramsSchema.safeParse(rawParams)
  if (!parsedParams.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsedBody = careerJobSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsedBody.error.issues }, { status: 400 })
  }

  try {
    const job = await updateCareerJob(parsedParams.data.id, parsedBody.data)
    if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    revalidatePath('/careers')
    revalidateTag('careers', 'max')
    return NextResponse.json({ job })
  } catch (error) {
    console.error('PUT /api/admin/careers/jobs/[id] failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rawParams = await unwrapParams(ctx.params)
  const parsedParams = paramsSchema.safeParse(rawParams)
  if (!parsedParams.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const ok = await deleteCareerJob(parsedParams.data.id)
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    revalidatePath('/careers')
    revalidateTag('careers', 'max')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/admin/careers/jobs/[id] failed:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      process.env.NODE_ENV === 'production' ? { error: 'Server error' } : { error: 'Server error', details: message },
      { status: 503 }
    )
  }
}
