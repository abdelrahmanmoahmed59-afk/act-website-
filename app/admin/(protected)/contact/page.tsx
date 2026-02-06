'use client'

import React, { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import ui from '../admin-ui.module.css'
import { contactSettingsSchema } from '@/lib/validation/contact'
import { contactTemplate } from '@/lib/content/contact-template'

type LocalizedText = { en: string; ar: string }

type ContactSettings = {
  title: LocalizedText
  intro: LocalizedText
  emailText: string
  phoneNum: string
  address: LocalizedText
  mapSrc: string
}

type Submission = {
  id: number
  fullName: string
  email: string
  details: string
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

export default function AdminContactPage() {
  const router = useRouter()

  const [settings, setSettings] = useState<ContactSettings>(contactTemplate)
  const [submissions, setSubmissions] = useState<Submission[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [a, b] = await Promise.all([
        fetch('/api/admin/contact/settings', { cache: 'no-store' }),
        fetch('/api/admin/contact/submissions?limit=200', { cache: 'no-store' }),
      ])
      if (a.status === 401 || b.status === 401) {
        router.replace('/admin/login')
        return
      }
      const settingsJson = await a.json().catch(() => null)
      const submissionsJson = await b.json().catch(() => null)
      setSettings(((settingsJson as any)?.settings ?? contactTemplate) as ContactSettings)
      setSubmissions(Array.isArray((submissionsJson as any)?.submissions) ? ((submissionsJson as any).submissions as Submission[]) : [])
    } catch {
      setError('Failed to load.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const saveSettings = async () => {
    if (saving) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    setFieldErrors({})

    const validated = contactSettingsSchema.safeParse(settings)
    if (!validated.success) {
      setFieldErrors(issuesToFieldErrors(validated.error.issues))
      setError('Please fix the highlighted fields.')
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/admin/contact/settings', {
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
      setSaving(false)
    }
  }

  const meta = useMemo(() => {
    const count = submissions.length
    return { count }
  }, [submissions.length])

  return (
    <div>
      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>Contact</h2>
            <p className={ui.sectionHint}>Edit public contact details and review form submissions.</p>
          </div>
          <div className={ui.toolbar}>
            <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={saveSettings} aria-disabled={saving ? 'true' : 'false'}>
              {saving ? 'Saving...' : 'Save'}
            </button>
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
          <LocalizedField
            label="Title"
            value={settings.title}
            onChange={(v) => setSettings((p) => ({ ...p, title: v }))}
            required
            maxLength={180}
            errors={{ en: fieldErrors['title.en'], ar: fieldErrors['title.ar'] }}
          />
          <LocalizedField
            label="Intro"
            value={settings.intro}
            onChange={(v) => setSettings((p) => ({ ...p, intro: v }))}
            required
            textarea
            maxLength={4000}
            errors={{ en: fieldErrors['intro.en'], ar: fieldErrors['intro.ar'] }}
          />

          <div className={ui.gridTwo}>
            <div className={ui.field}>
              <label className={ui.label}>Email</label>
              <input className={ui.input} value={settings.emailText} onChange={(e) => setSettings((p) => ({ ...p, emailText: e.target.value }))} />
            </div>
            <div className={ui.field}>
              <label className={ui.label}>Phone</label>
              <input className={ui.input} value={settings.phoneNum} onChange={(e) => setSettings((p) => ({ ...p, phoneNum: e.target.value }))} />
            </div>
          </div>

          <LocalizedField
            label="Address"
            value={settings.address}
            onChange={(v) => setSettings((p) => ({ ...p, address: v }))}
            required
            maxLength={400}
            errors={{ en: fieldErrors['address.en'], ar: fieldErrors['address.ar'] }}
          />

          <div className={ui.field}>
            <label className={ui.label}>Map iframe URL</label>
            <input className={ui.input} value={settings.mapSrc} onChange={(e) => setSettings((p) => ({ ...p, mapSrc: e.target.value }))} />
            <p className={ui.hint}>Use a Google Maps embed URL.</p>
          </div>
        </div>
      </section>

      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>Submissions</h2>
            <p className={ui.sectionHint}>{meta.count} total (latest first).</p>
          </div>
        </div>

        <div className={ui.items}>
          {submissions.length === 0 && <div className={ui.card}>No submissions yet.</div>}
          {submissions.map((s) => (
            <div key={s.id} className={ui.card}>
              <p className={ui.itemTitle} style={{ margin: 0 }}>
                {s.fullName} · {s.email}
              </p>
              <p className={ui.itemMeta} style={{ marginTop: 6 }}>
                #{s.id} · {new Date(s.createdAt).toLocaleString()}
              </p>
              <p className={ui.sectionHint} style={{ whiteSpace: 'pre-wrap', marginTop: 10 }}>
                {s.details}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

