'use client'

import React, { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import ui from '../admin-ui.module.css'
import { careerJobSchema } from '@/lib/validation/careers'

type LocalizedText = { en: string; ar: string }

type Job = {
  id: number
  sortOrder: number
  published: boolean
  title: LocalizedText
  location: LocalizedText
  type: LocalizedText
  summary: LocalizedText
}

type Application = {
  id: number
  jobId: number | null
  jobTitle: string
  fullName: string
  email: string
  phone: string
  createdAt: string
}

function issuesToFieldErrors(issues: Array<{ path: Array<string | number>; message: string }>) {
  const out: Record<string, string> = {}
  for (const issue of issues) {
    const path = issue.path.join('.')
    out[path] = issue.message
  }
  return out
}

function formatIssues(issues: unknown) {
  if (!Array.isArray(issues)) return null
  const lines = issues
    .map((i: any) => {
      const path = Array.isArray(i?.path) ? i.path.join('.') : ''
      const msg = typeof i?.message === 'string' ? i.message : ''
      return path && msg ? `${path}: ${msg}` : msg || path
    })
    .filter(Boolean)
  return lines.length ? lines.join('\n') : null
}

function LocalizedField({
  label,
  value,
  onChange,
  textarea,
  required,
  maxLength,
  errors,
}: {
  label: string
  value: LocalizedText
  onChange: (next: LocalizedText) => void
  textarea?: boolean
  required?: boolean
  maxLength?: number
  errors?: { en?: string; ar?: string }
}) {
  const baseId = useId().replace(/:/g, '')
  const Input = textarea ? 'textarea' : 'input'
  const errorStyle = (message?: string) => (message ? ({ borderColor: 'rgba(248,113,113,0.9)' } as const) : undefined)
  return (
    <div className={ui.field}>
      <p className={ui.label}>{label}</p>
      <div className={ui.gridTwo}>
        <div className={ui.field}>
          <label className={ui.label} htmlFor={`${baseId}-en`}>
            English
          </label>
          <Input
            id={`${baseId}-en`}
            className={textarea ? ui.textarea : ui.input}
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
            required={required}
            maxLength={maxLength}
            aria-invalid={errors?.en ? 'true' : undefined}
            style={errorStyle(errors?.en)}
          />
          {errors?.en && (
            <p className={ui.hint} style={{ marginTop: 6, color: 'rgba(248,113,113,0.95)' }}>
              {errors.en}
            </p>
          )}
        </div>
        <div className={ui.field}>
          <label className={ui.label} htmlFor={`${baseId}-ar`}>
            العربية
          </label>
          <Input
            id={`${baseId}-ar`}
            dir="rtl"
            className={textarea ? ui.textarea : ui.input}
            value={value.ar}
            onChange={(e) => onChange({ ...value, ar: e.target.value })}
            required={required}
            maxLength={maxLength}
            aria-invalid={errors?.ar ? 'true' : undefined}
            style={errorStyle(errors?.ar)}
          />
          {errors?.ar && (
            <p className={ui.hint} style={{ marginTop: 6, color: 'rgba(248,113,113,0.95)' }}>
              {errors.ar}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function emptyJob(): Omit<Job, 'id'> {
  return {
    sortOrder: 0,
    published: true,
    title: { en: '', ar: '' },
    location: { en: '', ar: '' },
    type: { en: '', ar: '' },
    summary: { en: '', ar: '' },
  }
}

export default function AdminCareersPage() {
  const router = useRouter()

  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [draft, setDraft] = useState<Omit<Job, 'id'>>(emptyJob())

  const [loading, setLoading] = useState(true)
  const [savingNew, setSavingNew] = useState(false)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [draftErrors, setDraftErrors] = useState<Record<string, string>>({})

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [a, b] = await Promise.all([
        fetch('/api/admin/careers/jobs', { cache: 'no-store' }),
        fetch('/api/admin/careers/applications?limit=200', { cache: 'no-store' }),
      ])
      if (a.status === 401 || b.status === 401) {
        router.replace('/admin/login')
        return
      }
      const jobsJson = await a.json().catch(() => null)
      const appsJson = await b.json().catch(() => null)
      setJobs(Array.isArray((jobsJson as any)?.jobs) ? ((jobsJson as any).jobs as Job[]) : [])
      setApplications(Array.isArray((appsJson as any)?.applications) ? ((appsJson as any).applications as Application[]) : [])
    } catch {
      setError('Failed to load.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const createJob = async () => {
    if (savingNew) return
    setSavingNew(true)
    setError(null)
    setSuccess(null)
    setDraftErrors({})

    const validated = careerJobSchema.safeParse(draft)
    if (!validated.success) {
      setDraftErrors(issuesToFieldErrors(validated.error.issues))
      setError('Please fix the highlighted fields.')
      setSavingNew(false)
      return
    }

    try {
      const res = await fetch('/api/admin/careers/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated.data),
      })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        const formatted = formatIssues((json as any)?.issues)
        setError(formatted ? `${(json as any)?.error ?? 'Invalid payload'}\n${formatted}` : (json as any)?.error ?? 'Invalid payload')
        return
      }
      setDraft(emptyJob())
      setSuccess('Job created.')
      await loadAll()
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'Failed to create job.')
    } finally {
      setSavingNew(false)
    }
  }

  const updateJob = (id: number, patch: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? ({ ...j, ...patch } as Job) : j)))
  }

  const saveJob = async (id: number) => {
    if (savingId) return
    setSavingId(id)
    setError(null)
    setSuccess(null)

    const job = jobs.find((j) => j.id === id)
    if (!job) {
      setSavingId(null)
      return
    }

    const payload = {
      sortOrder: job.sortOrder,
      published: job.published,
      title: job.title,
      location: job.location,
      type: job.type,
      summary: job.summary,
    }

    const validated = careerJobSchema.safeParse(payload)
    if (!validated.success) {
      setError('Please fix the highlighted fields.')
      setSavingId(null)
      return
    }

    try {
      const res = await fetch(`/api/admin/careers/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated.data),
      })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        const formatted = formatIssues((json as any)?.issues)
        setError(formatted ? `${(json as any)?.error ?? 'Invalid payload'}\n${formatted}` : (json as any)?.error ?? 'Invalid payload')
        return
      }
      setSuccess('Saved.')
      await loadAll()
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'Failed to save.')
    } finally {
      setSavingId(null)
    }
  }

  const deleteJob = async (id: number) => {
    setError(null)
    setSuccess(null)
    if (!confirm('Delete this job?')) return
    try {
      const res = await fetch(`/api/admin/careers/jobs/${id}`, { method: 'DELETE' })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        setError((json as any)?.error ?? 'Failed to delete.')
        return
      }
      setSuccess('Deleted.')
      await loadAll()
    } catch {
      setError('Failed to delete.')
    }
  }

  const meta = useMemo(() => ({ jobs: jobs.length, applications: applications.length }), [jobs.length, applications.length])

  return (
    <div>
      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>Careers</h2>
            <p className={ui.sectionHint}>Manage open roles and review applications.</p>
          </div>
          <div className={ui.toolbar}>
            <button type="button" className={ui.button} onClick={loadAll} aria-disabled={loading ? 'true' : 'false'}>
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className={ui.card} style={{ borderColor: 'rgba(248,113,113,0.35)' }}>
            <p className={ui.sectionHint} style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'rgba(248,113,113,0.95)' }}>
              {error}
            </p>
          </div>
        )}
        {success && (
          <div className={ui.card} style={{ borderColor: 'rgba(34,197,94,0.35)' }}>
            <p className={ui.sectionHint} style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'rgba(34,197,94,0.95)' }}>
              {success}
            </p>
          </div>
        )}

        <div className={ui.card}>
          <div className={ui.sectionTitleRow}>
            <div>
              <h3 className={ui.sectionTitle} style={{ fontSize: '1.2rem' }}>
                New job
              </h3>
              <p className={ui.sectionHint} style={{ margin: 0 }}>
                Create a role shown on the public Careers page.
              </p>
            </div>
            <div className={ui.toolbar}>
              <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={createJob} aria-disabled={savingNew ? 'true' : 'false'}>
                {savingNew ? 'Creating...' : 'Add job'}
              </button>
            </div>
          </div>

          <div className={ui.gridTwoWide}>
            <div className={ui.field}>
              <label className={ui.label}>Sort order</label>
              <input className={ui.input} type="number" min={0} max={1_000_000} value={draft.sortOrder} onChange={(e) => setDraft((p) => ({ ...p, sortOrder: Number(e.target.value || 0) }))} />
            </div>
            <div className={ui.field} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <label className={ui.label} style={{ margin: 0 }}>
                Published
              </label>
              <input type="checkbox" checked={draft.published} onChange={(e) => setDraft((p) => ({ ...p, published: e.target.checked }))} />
            </div>
          </div>

          <LocalizedField label="Title" value={draft.title} onChange={(v) => setDraft((p) => ({ ...p, title: v }))} required maxLength={200} errors={{ en: draftErrors['title.en'], ar: draftErrors['title.ar'] }} />
          <LocalizedField label="Location" value={draft.location} onChange={(v) => setDraft((p) => ({ ...p, location: v }))} required maxLength={200} errors={{ en: draftErrors['location.en'], ar: draftErrors['location.ar'] }} />
          <LocalizedField label="Type" value={draft.type} onChange={(v) => setDraft((p) => ({ ...p, type: v }))} required maxLength={200} errors={{ en: draftErrors['type.en'], ar: draftErrors['type.ar'] }} />
          <LocalizedField label="Summary" value={draft.summary} onChange={(v) => setDraft((p) => ({ ...p, summary: v }))} required textarea maxLength={1200} errors={{ en: draftErrors['summary.en'], ar: draftErrors['summary.ar'] }} />
        </div>
      </section>

      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>Jobs</h2>
            <p className={ui.sectionHint}>{meta.jobs} roles.</p>
          </div>
        </div>

        <div className={ui.items}>
          {jobs.length === 0 && <div className={ui.card}>No jobs yet.</div>}
          {jobs.map((job) => (
            <div key={job.id} className={ui.card}>
              <div className={ui.sectionTitleRow}>
                <div>
                  <p className={ui.itemTitle} style={{ margin: 0 }}>
                    {job.title.en || job.title.ar || `Job #${job.id}`}
                  </p>
                  <p className={ui.itemMeta} style={{ marginTop: 6 }}>
                    #{job.id} · Sort: {job.sortOrder} · {job.published ? 'Published' : 'Hidden'}
                  </p>
                </div>
                <div className={ui.toolbar}>
                  <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={() => saveJob(job.id)} aria-disabled={savingId === job.id ? 'true' : 'false'}>
                    {savingId === job.id ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" className={`${ui.button} ${ui.buttonDanger}`} onClick={() => deleteJob(job.id)}>
                    Delete
                  </button>
                </div>
              </div>

              <div className={ui.gridTwoWide}>
                <div className={ui.field}>
                  <label className={ui.label}>Sort order</label>
                  <input className={ui.input} type="number" min={0} max={1_000_000} value={job.sortOrder} onChange={(e) => updateJob(job.id, { sortOrder: Number(e.target.value || 0) })} />
                </div>
                <div className={ui.field} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <label className={ui.label} style={{ margin: 0 }}>
                    Published
                  </label>
                  <input type="checkbox" checked={job.published} onChange={(e) => updateJob(job.id, { published: e.target.checked })} />
                </div>
              </div>

              <LocalizedField label="Title" value={job.title} onChange={(v) => updateJob(job.id, { title: v })} required maxLength={200} />
              <LocalizedField label="Location" value={job.location} onChange={(v) => updateJob(job.id, { location: v })} required maxLength={200} />
              <LocalizedField label="Type" value={job.type} onChange={(v) => updateJob(job.id, { type: v })} required maxLength={200} />
              <LocalizedField label="Summary" value={job.summary} onChange={(v) => updateJob(job.id, { summary: v })} required textarea maxLength={1200} />
            </div>
          ))}
        </div>
      </section>

      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>Applications</h2>
            <p className={ui.sectionHint}>{meta.applications} submissions (latest first).</p>
          </div>
        </div>

        <div className={ui.items}>
          {applications.length === 0 && <div className={ui.card}>No applications yet.</div>}
          {applications.map((a) => (
            <div key={a.id} className={ui.card}>
              <p className={ui.itemTitle} style={{ margin: 0 }}>
                {a.fullName} · {a.email}
              </p>
              <p className={ui.itemMeta} style={{ marginTop: 6 }}>
                #{a.id} · {new Date(a.createdAt).toLocaleString()} · {a.jobTitle} {a.jobId ? `(Job #${a.jobId})` : ''}
              </p>
              <p className={ui.sectionHint} style={{ marginTop: 10 }}>
                Phone: {a.phone}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

