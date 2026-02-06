'use client'

import React, { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import ui from '../admin-ui.module.css'
import { clientsTemplate } from '@/lib/content/clients-template'
import { successClientsTemplate } from '@/lib/content/success-clients-template'
import type { Language } from '@/lib/i18n/base-translations'
import { clientsSettingsSchema, successClientsLogoSchema, successClientsSettingsSchema } from '@/lib/validation/clients'

type LocalizedText = { en: string; ar: string }

type ClientsStat = { value: string; label: LocalizedText }
type ClientsSegment = { title: LocalizedText; description: LocalizedText }
type ClientsTestimonial = { quote: LocalizedText; name: LocalizedText; role: LocalizedText }
type ClientsSettings = {
  eyebrow: LocalizedText
  title: LocalizedText
  subtitle: LocalizedText
  primaryAction: LocalizedText
  secondaryAction: LocalizedText
  introTitle: LocalizedText
  intro: LocalizedText
  segmentsTitle: LocalizedText
  testimonialsTitle: LocalizedText
  logosTitle: LocalizedText
  logosIntro: LocalizedText
  ctaTitle: LocalizedText
  ctaDesc: LocalizedText
  ctaButton: LocalizedText
  stats: ClientsStat[]
  segments: ClientsSegment[]
  testimonials: ClientsTestimonial[]
  logosText: Array<LocalizedText>
}

type SuccessSettings = { title: LocalizedText; subtitle: LocalizedText }
type SuccessLogo = {
  id: number
  sortOrder: number
  uploadId: number
  imageUrl: string
  alt: LocalizedText
}

function emptyLocalized(): LocalizedText {
  return { en: '', ar: '' }
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

function issuesToFieldErrors(issues: Array<{ path: Array<string | number>; message: string }>) {
  const next: Record<string, string> = {}
  for (const issue of issues) {
    const key = issue.path.join('.')
    if (!next[key]) next[key] = issue.message
  }
  return next
}

function formatIssues(issues: unknown) {
  if (!Array.isArray(issues)) return null
  const lines = issues
    .map((issue) => {
      if (!issue || typeof issue !== 'object') return null
      const path = Array.isArray((issue as any).path) ? (issue as any).path.join('.') : ''
      const message = typeof (issue as any).message === 'string' ? (issue as any).message : 'Invalid value'
      return path ? `${path}: ${message}` : message
    })
    .filter(Boolean)
  return lines.length ? lines.join('\n') : null
}

export default function AdminClientsPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successSaving, setSuccessSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [logoSavingId, setLogoSavingId] = useState<number | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [settingsErrors, setSettingsErrors] = useState<Record<string, string>>({})
  const [successErrors, setSuccessErrors] = useState<Record<string, string>>({})
  const [logoErrors, setLogoErrors] = useState<Record<string, string>>({})
  const [logoFiles, setLogoFiles] = useState<Record<number, File | null>>({})

  const [settings, setSettings] = useState<ClientsSettings>(clientsTemplate as unknown as ClientsSettings)
  const [successSettings, setSuccessSettings] = useState<SuccessSettings>({
    title: successClientsTemplate.title as any,
    subtitle: successClientsTemplate.subtitle as any,
  })
  const [logos, setLogos] = useState<SuccessLogo[]>([])

  const [newLogoFile, setNewLogoFile] = useState<File | null>(null)
  const [newLogoAlt, setNewLogoAlt] = useState<LocalizedText>(emptyLocalized())
  const [newLogoSort, setNewLogoSort] = useState<number>(0)
  const newLogoPreview = useMemo(() => (newLogoFile ? URL.createObjectURL(newLogoFile) : null), [newLogoFile])
  useEffect(() => {
    if (!newLogoPreview) return
    return () => URL.revokeObjectURL(newLogoPreview)
  }, [newLogoPreview])

  const resetNewLogo = () => {
    setNewLogoFile(null)
    setNewLogoAlt(emptyLocalized())
    setNewLogoSort(0)
    setLogoErrors({})
  }

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setSettingsErrors({})
    setSuccessErrors({})
    setLogoErrors({})

    try {
      const [settingsRes, successRes, logosRes] = await Promise.all([
        fetch('/api/admin/clients/settings', { cache: 'no-store' }),
        fetch('/api/admin/success-clients/settings', { cache: 'no-store' }),
        fetch('/api/admin/success-clients/logos', { cache: 'no-store' }),
      ])

      if ([settingsRes.status, successRes.status, logosRes.status].includes(401)) {
        router.replace('/admin/login')
        return
      }

      const [sJson, scJson, lJson] = await Promise.all([settingsRes.json(), successRes.json(), logosRes.json()])
      setSettings((sJson.settings as ClientsSettings) ?? (clientsTemplate as any))
      setSuccessSettings(
        (scJson.settings as SuccessSettings) ?? {
          title: successClientsTemplate.title as any,
          subtitle: successClientsTemplate.subtitle as any,
        }
      )
      setLogos(((lJson.logos as SuccessLogo[]) ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder || b.id - a.id))
      setLoading(false)
    } catch {
      setError('Failed to load data. Check the local JSON store under `data/` and restart the dev server.')
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const uploadFile = async (file: File) => {
    const form = new FormData()
    form.set('file', file)
    const res = await fetch('/api/admin/uploads', { method: 'POST', body: form })
    if (res.status === 401) {
      router.replace('/admin/login')
      return null
    }
    if (!res.ok) {
      const json = await res.json().catch(() => null)
      throw new Error((json as any)?.error ?? 'upload')
    }
    return (await res.json()) as { id: number; url: string }
  }

  const seedFromTemplate = async () => {
    if (seeding) return
    setSeeding(true)
    setError(null)
    setSuccess(null)
    setSettingsErrors({})
    setSuccessErrors({})
    setLogoErrors({})

    try {
      const [a, b] = await Promise.all([
        fetch('/api/admin/clients/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientsTemplate),
        }),
        fetch('/api/admin/success-clients/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: successClientsTemplate.title, subtitle: successClientsTemplate.subtitle }),
        }),
      ])

      if (a.status === 401 || b.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!a.ok || !b.ok) {
        const json = await (a.ok ? b.json() : a.json()).catch(() => null)
        const formatted = formatIssues((json as any)?.issues)
        setError(formatted ? `${(json as any)?.error ?? 'Invalid payload'}\n${formatted}` : (json as any)?.error ?? 'Invalid payload')
        return
      }

      const existingRes = await fetch('/api/admin/success-clients/logos', { cache: 'no-store' })
      if (existingRes.status === 401) {
        router.replace('/admin/login')
        return
      }
      const existingJson = await existingRes.json().catch(() => null)
      const existing = Array.isArray((existingJson as any)?.logos) ? ((existingJson as any).logos as SuccessLogo[]) : []
      for (const logo of existing) {
        await fetch(`/api/admin/success-clients/logos/${logo.id}`, { method: 'DELETE' })
      }

      let placeholderUpload: { id: number; url: string } | null = null
      try {
        const assetRes = await fetch('/placeholder-logo.png', { cache: 'no-store' })
        if (assetRes.ok) {
          const blob = await assetRes.blob()
          const file = new File([blob], 'placeholder-logo.png', { type: blob.type || 'image/png' })
          placeholderUpload = await uploadFile(file)
        }
      } catch {
        // Optional; the public page will still fall back to template logos if DB is empty.
      }

      if (placeholderUpload) {
        for (const logo of successClientsTemplate.logos) {
          await fetch('/api/admin/success-clients/logos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sortOrder: logo.sortOrder, uploadId: placeholderUpload.id, alt: logo.alt }),
          })
        }
      }

      setSuccess('Seeded from template.')
      await loadAll()
    } catch {
      setError('Seeding failed. Please try again.')
    } finally {
      setSeeding(false)
    }
  }

  const saveAll = async () => {
    if (saving) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    setSettingsErrors({})
    setSuccessErrors({})

    const validatedSettings = clientsSettingsSchema.safeParse(settings)
    const validatedSuccess = successClientsSettingsSchema.safeParse(successSettings)
    if (!validatedSettings.success || !validatedSuccess.success) {
      if (!validatedSettings.success) setSettingsErrors(issuesToFieldErrors(validatedSettings.error.issues))
      if (!validatedSuccess.success) setSuccessErrors(issuesToFieldErrors(validatedSuccess.error.issues))
      setError('Please fix the highlighted fields.')
      setSaving(false)
      return
    }

    try {
      const [a, b] = await Promise.all([
        fetch('/api/admin/clients/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validatedSettings.data),
        }),
        fetch('/api/admin/success-clients/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validatedSuccess.data),
        }),
      ])

      if (a.status === 401 || b.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!a.ok || !b.ok) {
        const json = await (a.ok ? b.json() : a.json()).catch(() => null)
        const formatted = formatIssues((json as any)?.issues)
        setError(formatted ? `${(json as any)?.error ?? 'Invalid payload'}\n${formatted}` : (json as any)?.error ?? 'Invalid payload')
        return
      }

      setSuccess('Saved.')
      await loadAll()
    } catch (e) {
      console.error('saveAll failed:', e)
      setError(e instanceof Error && e.message ? e.message : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const saveSuccessOnly = async () => {
    if (successSaving) return
    setSuccessSaving(true)
    setError(null)
    setSuccess(null)
    setSuccessErrors({})

    const validated = successClientsSettingsSchema.safeParse(successSettings)
    if (!validated.success) {
      setSuccessErrors(issuesToFieldErrors(validated.error.issues))
      setError('Please fix the highlighted fields.')
      setSuccessSaving(false)
      return
    }

    try {
      const res = await fetch('/api/admin/success-clients/settings', {
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
      console.error('saveSuccessOnly failed:', e)
      setError(e instanceof Error && e.message ? e.message : 'Failed to save.')
    } finally {
      setSuccessSaving(false)
    }
  }

  const addLogo = async () => {
    setError(null)
    setSuccess(null)
    setLogoErrors({})

    if (!newLogoFile) {
      setLogoErrors({ file: 'Logo image is required.' })
      setError('Please choose a logo image.')
      return
    }

    try {
      const uploaded = await uploadFile(newLogoFile)
      if (!uploaded) return

      const payload = { sortOrder: newLogoSort, uploadId: uploaded.id, alt: newLogoAlt }
      const parsed = successClientsLogoSchema.safeParse(payload)
      if (!parsed.success) {
        setLogoErrors(issuesToFieldErrors(parsed.error.issues))
        setError('Please fix the logo fields.')
        return
      }

      const res = await fetch('/api/admin/success-clients/logos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
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

      resetNewLogo()
      setSuccess('Logo added.')
      await loadAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add logo.')
    }
  }

  const updateLogoField = (id: number, patch: Partial<SuccessLogo>) => {
    setLogos((prev) => prev.map((logo) => (logo.id === id ? { ...logo, ...patch } : logo)))
  }

  const updateLogoAlt = (id: number, next: LocalizedText) => {
    setLogos((prev) => prev.map((logo) => (logo.id === id ? { ...logo, alt: next } : logo)))
  }

  const setReplaceFile = (id: number, file: File | null) => {
    setLogoFiles((prev) => ({ ...prev, [id]: file }))
  }

  const saveLogo = async (id: number) => {
    if (logoSavingId) return
    setLogoSavingId(id)
    setError(null)
    setSuccess(null)

    const logo = logos.find((l) => l.id === id)
    if (!logo) {
      setLogoSavingId(null)
      return
    }

    try {
      let uploadId = logo.uploadId
      const replaceFile = logoFiles[id] ?? null
      if (replaceFile) {
        const uploaded = await uploadFile(replaceFile)
        if (!uploaded) return
        uploadId = uploaded.id
      }

      const payload = { sortOrder: logo.sortOrder, uploadId, alt: logo.alt }
      const parsed = successClientsLogoSchema.safeParse(payload)
      if (!parsed.success) {
        const formatted = formatIssues(parsed.error.issues)
        setError(formatted ? `Please fix this logo.\n${formatted}` : 'Please fix this logo.')
        return
      }

      const res = await fetch(`/api/admin/success-clients/logos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        const formatted = formatIssues((json as any)?.issues)
        setError(
          formatted
            ? `${(json as any)?.error ?? 'Invalid payload'}\n${formatted}`
            : (json as any)?.error ?? 'Invalid payload'
        )
        return
      }

      setReplaceFile(id, null)
      setSuccess('Logo saved.')
      await loadAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save logo.')
    } finally {
      setLogoSavingId(null)
    }
  }

  const deleteLogo = async (id: number) => {
    setError(null)
    setSuccess(null)
    const res = await fetch(`/api/admin/success-clients/logos/${id}`, { method: 'DELETE' })
    if (res.status === 401) {
      router.replace('/admin/login')
      return
    }
    if (res.status === 404) {
      setSuccess('Logo already deleted.')
      await loadAll()
      return
    }
    if (!res.ok) {
      const json = await res.json().catch(() => null)
      setError((json as any)?.error ?? 'Failed to delete.')
      return
    }
    setSuccess('Logo deleted.')
    await loadAll()
  }

  const arrayMove = <T,>(arr: T[], from: number, to: number) => {
    const next = arr.slice()
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    return next
  }

  const setList = <T,>(key: keyof ClientsSettings, next: T[]) => {
    setSettings((prev) => ({ ...prev, [key]: next } as any))
  }

  const addListItem = (key: keyof ClientsSettings) => {
    if (key === 'stats') {
      setList(key, [...(settings.stats ?? []), { value: '', label: emptyLocalized() }] as any)
    } else if (key === 'segments') {
      setList(key, [...(settings.segments ?? []), { title: emptyLocalized(), description: emptyLocalized() }] as any)
    } else if (key === 'testimonials') {
      setList(key, [...(settings.testimonials ?? []), { quote: emptyLocalized(), name: emptyLocalized(), role: emptyLocalized() }] as any)
    } else if (key === 'logosText') {
      setList(key, [...(settings.logosText ?? []), emptyLocalized()] as any)
    }
  }

  return (
    <div>
      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>Clients page</h2>
            <p className={ui.sectionHint}>Bilingual content for /clients. Lists can be added/edited/deleted.</p>
          </div>
          <div className={ui.toolbar}>
            <button type="button" className={`${ui.button} ${ui.buttonMuted}`} onClick={loadAll} aria-disabled={loading ? 'true' : 'false'}>
              Refresh
            </button>
            <button type="button" className={`${ui.button} ${ui.buttonMuted}`} onClick={seedFromTemplate} aria-disabled={seeding ? 'true' : 'false'}>
              {seeding ? 'Seeding…' : 'Seed from template'}
            </button>
            <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={saveAll} aria-disabled={saving ? 'true' : 'false'}>
              {saving ? 'Saving…' : 'Save all'}
            </button>
          </div>
        </div>

        {error && (
          <div className={ui.alert} role="alert" style={{ whiteSpace: 'pre-wrap' }}>
            {error}
          </div>
        )}
        {success && (
          <div className={ui.success} role="status">
            {success}
          </div>
        )}

        <div className={ui.card}>
          <LocalizedField label="Eyebrow" value={settings.eyebrow} onChange={(v) => setSettings((p) => ({ ...p, eyebrow: v }))} required maxLength={120} errors={{ en: settingsErrors['eyebrow.en'], ar: settingsErrors['eyebrow.ar'] }} />
          <LocalizedField label="Title" value={settings.title} onChange={(v) => setSettings((p) => ({ ...p, title: v }))} required maxLength={120} errors={{ en: settingsErrors['title.en'], ar: settingsErrors['title.ar'] }} />
          <LocalizedField label="Subtitle" value={settings.subtitle} onChange={(v) => setSettings((p) => ({ ...p, subtitle: v }))} required maxLength={600} errors={{ en: settingsErrors['subtitle.en'], ar: settingsErrors['subtitle.ar'] }} />
          <LocalizedField label="Primary action label" value={settings.primaryAction} onChange={(v) => setSettings((p) => ({ ...p, primaryAction: v }))} required maxLength={120} errors={{ en: settingsErrors['primaryAction.en'], ar: settingsErrors['primaryAction.ar'] }} />
          <LocalizedField label="Secondary action label" value={settings.secondaryAction} onChange={(v) => setSettings((p) => ({ ...p, secondaryAction: v }))} required maxLength={120} errors={{ en: settingsErrors['secondaryAction.en'], ar: settingsErrors['secondaryAction.ar'] }} />
          <LocalizedField label="Intro title" value={settings.introTitle} onChange={(v) => setSettings((p) => ({ ...p, introTitle: v }))} required maxLength={160} errors={{ en: settingsErrors['introTitle.en'], ar: settingsErrors['introTitle.ar'] }} />
          <LocalizedField label="Intro text" value={settings.intro} onChange={(v) => setSettings((p) => ({ ...p, intro: v }))} required textarea maxLength={4000} errors={{ en: settingsErrors['intro.en'], ar: settingsErrors['intro.ar'] }} />
        </div>

        <div style={{ height: 18 }} />

        <div className={ui.card}>
          <div className={ui.sectionTitleRow}>
            <div>
              <h3 className={ui.sectionTitle} style={{ fontSize: '1.2rem' }}>
                Stats
              </h3>
              <p className={ui.sectionHint} style={{ margin: 0 }}>
                Add / edit / delete stats cards.
              </p>
            </div>
            <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={() => addListItem('stats')}>
              Add stat
            </button>
          </div>
          <div className={ui.items}>
            {(settings.stats ?? []).map((stat, idx) => (
              <div key={idx} className={ui.card}>
                <div className={ui.gridTwoWide}>
                  <div className={ui.field}>
                    <label className={ui.label}>Value</label>
                    <input
                      className={ui.input}
                      value={stat.value}
                      required
                      maxLength={40}
                      aria-invalid={settingsErrors[`stats.${idx}.value`] ? 'true' : undefined}
                      style={settingsErrors[`stats.${idx}.value`] ? ({ borderColor: 'rgba(248,113,113,0.9)' } as const) : undefined}
                      onChange={(e) =>
                        setList('stats', settings.stats.map((s, i) => (i === idx ? { ...s, value: e.target.value } : s)) as any)
                      }
                    />
                    {settingsErrors[`stats.${idx}.value`] && (
                      <p className={ui.hint} style={{ marginTop: 6, color: 'rgba(248,113,113,0.95)' }}>
                        {settingsErrors[`stats.${idx}.value`]}
                      </p>
                    )}
                  </div>
                  <div className={ui.toolbar} style={{ justifyContent: 'flex-end' }}>
                    <button type="button" className={`${ui.button} ${ui.buttonMuted}`} onClick={() => idx > 0 && setList('stats', arrayMove(settings.stats, idx, idx - 1) as any)} aria-disabled={idx === 0 ? 'true' : 'false'}>
                      ↑
                    </button>
                    <button type="button" className={`${ui.button} ${ui.buttonMuted}`} onClick={() => idx < settings.stats.length - 1 && setList('stats', arrayMove(settings.stats, idx, idx + 1) as any)} aria-disabled={idx === settings.stats.length - 1 ? 'true' : 'false'}>
                      ↓
                    </button>
                    <button type="button" className={`${ui.button} ${ui.buttonDanger}`} onClick={() => setList('stats', settings.stats.filter((_, i) => i !== idx) as any)}>
                      Delete
                    </button>
                  </div>
                </div>
                <LocalizedField
                  label="Label"
                  value={stat.label}
                  onChange={(v) => setList('stats', settings.stats.map((s, i) => (i === idx ? { ...s, label: v } : s)) as any)}
                  required
                  maxLength={120}
                  errors={{ en: settingsErrors[`stats.${idx}.label.en`], ar: settingsErrors[`stats.${idx}.label.ar`] }}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 18 }} />

        <div className={ui.card}>
          <div className={ui.sectionTitleRow}>
            <div>
              <h3 className={ui.sectionTitle} style={{ fontSize: '1.2rem' }}>
                Segments
              </h3>
              <p className={ui.sectionHint} style={{ margin: 0 }}>
                Add / edit / delete segments shown on the Clients page.
              </p>
            </div>
            <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={() => addListItem('segments')}>
              Add segment
            </button>
          </div>

          <LocalizedField
            label="Segments section title"
            value={settings.segmentsTitle}
            onChange={(v) => setSettings((p) => ({ ...p, segmentsTitle: v }))}
            required
            maxLength={160}
            errors={{ en: settingsErrors['segmentsTitle.en'], ar: settingsErrors['segmentsTitle.ar'] }}
          />

          <div className={ui.items}>
            {(settings.segments ?? []).map((segment, idx) => (
              <div key={idx} className={ui.card}>
                <div className={ui.toolbar} style={{ justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className={`${ui.button} ${ui.buttonMuted}`}
                    onClick={() => idx > 0 && setList('segments', arrayMove(settings.segments, idx, idx - 1) as any)}
                    aria-disabled={idx === 0 ? 'true' : 'false'}
                  >
                    â†‘
                  </button>
                  <button
                    type="button"
                    className={`${ui.button} ${ui.buttonMuted}`}
                    onClick={() => idx < settings.segments.length - 1 && setList('segments', arrayMove(settings.segments, idx, idx + 1) as any)}
                    aria-disabled={idx === settings.segments.length - 1 ? 'true' : 'false'}
                  >
                    â†“
                  </button>
                  <button type="button" className={`${ui.button} ${ui.buttonDanger}`} onClick={() => setList('segments', settings.segments.filter((_, i) => i !== idx) as any)}>
                    Delete
                  </button>
                </div>

                <LocalizedField
                  label="Segment title"
                  value={segment.title}
                  onChange={(v) => setList('segments', settings.segments.map((s, i) => (i === idx ? { ...s, title: v } : s)) as any)}
                  required
                  maxLength={180}
                  errors={{ en: settingsErrors[`segments.${idx}.title.en`], ar: settingsErrors[`segments.${idx}.title.ar`] }}
                />
                <LocalizedField
                  label="Segment description"
                  value={segment.description}
                  onChange={(v) => setList('segments', settings.segments.map((s, i) => (i === idx ? { ...s, description: v } : s)) as any)}
                  required
                  textarea
                  maxLength={800}
                  errors={{ en: settingsErrors[`segments.${idx}.description.en`], ar: settingsErrors[`segments.${idx}.description.ar`] }}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 18 }} />

        <div className={ui.card}>
          <div className={ui.sectionTitleRow}>
            <div>
              <h3 className={ui.sectionTitle} style={{ fontSize: '1.2rem' }}>
                Testimonials
              </h3>
              <p className={ui.sectionHint} style={{ margin: 0 }}>
                Add / edit / delete testimonials shown on the Clients page.
              </p>
            </div>
            <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={() => addListItem('testimonials')}>
              Add testimonial
            </button>
          </div>

          <LocalizedField
            label="Testimonials section title"
            value={settings.testimonialsTitle}
            onChange={(v) => setSettings((p) => ({ ...p, testimonialsTitle: v }))}
            required
            maxLength={160}
            errors={{ en: settingsErrors['testimonialsTitle.en'], ar: settingsErrors['testimonialsTitle.ar'] }}
          />

          <div className={ui.items}>
            {(settings.testimonials ?? []).map((testimonial, idx) => (
              <div key={idx} className={ui.card}>
                <div className={ui.toolbar} style={{ justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className={`${ui.button} ${ui.buttonMuted}`}
                    onClick={() => idx > 0 && setList('testimonials', arrayMove(settings.testimonials, idx, idx - 1) as any)}
                    aria-disabled={idx === 0 ? 'true' : 'false'}
                  >
                    â†‘
                  </button>
                  <button
                    type="button"
                    className={`${ui.button} ${ui.buttonMuted}`}
                    onClick={() => idx < settings.testimonials.length - 1 && setList('testimonials', arrayMove(settings.testimonials, idx, idx + 1) as any)}
                    aria-disabled={idx === settings.testimonials.length - 1 ? 'true' : 'false'}
                  >
                    â†“
                  </button>
                  <button type="button" className={`${ui.button} ${ui.buttonDanger}`} onClick={() => setList('testimonials', settings.testimonials.filter((_, i) => i !== idx) as any)}>
                    Delete
                  </button>
                </div>

                <LocalizedField
                  label="Quote"
                  value={testimonial.quote}
                  onChange={(v) => setList('testimonials', settings.testimonials.map((t, i) => (i === idx ? { ...t, quote: v } : t)) as any)}
                  required
                  textarea
                  maxLength={1200}
                  errors={{ en: settingsErrors[`testimonials.${idx}.quote.en`], ar: settingsErrors[`testimonials.${idx}.quote.ar`] }}
                />
                <LocalizedField
                  label="Name"
                  value={testimonial.name}
                  onChange={(v) => setList('testimonials', settings.testimonials.map((t, i) => (i === idx ? { ...t, name: v } : t)) as any)}
                  required
                  maxLength={120}
                  errors={{ en: settingsErrors[`testimonials.${idx}.name.en`], ar: settingsErrors[`testimonials.${idx}.name.ar`] }}
                />
                <LocalizedField
                  label="Role"
                  value={testimonial.role}
                  onChange={(v) => setList('testimonials', settings.testimonials.map((t, i) => (i === idx ? { ...t, role: v } : t)) as any)}
                  required
                  maxLength={160}
                  errors={{ en: settingsErrors[`testimonials.${idx}.role.en`], ar: settingsErrors[`testimonials.${idx}.role.ar`] }}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 18 }} />

        <div className={ui.card}>
          <div className={ui.sectionTitleRow}>
            <div>
              <h3 className={ui.sectionTitle} style={{ fontSize: '1.2rem' }}>
                Logos (cards)
              </h3>
              <p className={ui.sectionHint} style={{ margin: 0 }}>
                Cards shown under “Trusted by leading organizations”.
              </p>
            </div>
            <div className={ui.toolbar}>
              <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={saveAll} aria-disabled={saving ? 'true' : 'false'}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" className={ui.button} onClick={() => addListItem('logosText')}>
                Add organization
              </button>
            </div>
          </div>

          <LocalizedField
            label="Section title"
            value={settings.logosTitle}
            onChange={(v) => setSettings((p) => ({ ...p, logosTitle: v }))}
            required
            maxLength={180}
            errors={{ en: settingsErrors['logosTitle.en'], ar: settingsErrors['logosTitle.ar'] }}
          />
          <LocalizedField
            label="Section intro"
            value={settings.logosIntro}
            onChange={(v) => setSettings((p) => ({ ...p, logosIntro: v }))}
            required
            textarea
            maxLength={600}
            errors={{ en: settingsErrors['logosIntro.en'], ar: settingsErrors['logosIntro.ar'] }}
          />

          <div className={ui.items}>
            {(settings.logosText ?? []).map((org, idx) => (
              <div key={idx} className={ui.card}>
                <div className={ui.toolbar} style={{ justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className={`${ui.button} ${ui.buttonMuted}`}
                    onClick={() => idx > 0 && setList('logosText', arrayMove(settings.logosText, idx, idx - 1) as any)}
                    aria-disabled={idx === 0 ? 'true' : 'false'}
                  >
                    â†‘
                  </button>
                  <button
                    type="button"
                    className={`${ui.button} ${ui.buttonMuted}`}
                    onClick={() => idx < settings.logosText.length - 1 && setList('logosText', arrayMove(settings.logosText, idx, idx + 1) as any)}
                    aria-disabled={idx === settings.logosText.length - 1 ? 'true' : 'false'}
                  >
                    â†“
                  </button>
                  <button type="button" className={`${ui.button} ${ui.buttonDanger}`} onClick={() => setList('logosText', settings.logosText.filter((_, i) => i !== idx) as any)}>
                    Delete
                  </button>
                </div>

                <LocalizedField
                  label="Organization name"
                  value={org}
                  onChange={(v) => setList('logosText', settings.logosText.map((x, i) => (i === idx ? v : x)) as any)}
                  required
                  maxLength={160}
                  errors={{ en: settingsErrors[`logosText.${idx}.en`], ar: settingsErrors[`logosText.${idx}.ar`] }}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 18 }} />

        <div className={ui.card}>
          <div className={ui.sectionTitleRow}>
            <div>
              <h3 className={ui.sectionTitle} style={{ fontSize: '1.2rem' }}>
                Call to action
              </h3>
              <p className={ui.sectionHint} style={{ margin: 0 }}>
                Final banner shown at the end of the Clients page.
              </p>
            </div>
          </div>

          <LocalizedField
            label="CTA title"
            value={settings.ctaTitle}
            onChange={(v) => setSettings((p) => ({ ...p, ctaTitle: v }))}
            required
            maxLength={180}
            errors={{ en: settingsErrors['ctaTitle.en'], ar: settingsErrors['ctaTitle.ar'] }}
          />
          <LocalizedField
            label="CTA description"
            value={settings.ctaDesc}
            onChange={(v) => setSettings((p) => ({ ...p, ctaDesc: v }))}
            required
            textarea
            maxLength={800}
            errors={{ en: settingsErrors['ctaDesc.en'], ar: settingsErrors['ctaDesc.ar'] }}
          />
          <LocalizedField
            label="CTA button label"
            value={settings.ctaButton}
            onChange={(v) => setSettings((p) => ({ ...p, ctaButton: v }))}
            required
            maxLength={120}
            errors={{ en: settingsErrors['ctaButton.en'], ar: settingsErrors['ctaButton.ar'] }}
          />
        </div>
      </section>

      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>Our Success Clients section</h2>
            <p className={ui.sectionHint}>File-uploaded logos + bilingual alt text.</p>
          </div>
          <div className={ui.toolbar}>
            <button
              type="button"
              className={`${ui.button} ${ui.buttonPrimary}`}
              onClick={saveSuccessOnly}
              aria-disabled={successSaving ? 'true' : 'false'}
            >
              {successSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className={ui.card}>
          <LocalizedField label="Section title" value={successSettings.title} onChange={(v) => setSuccessSettings((p) => ({ ...p, title: v }))} required maxLength={180} errors={{ en: successErrors['title.en'], ar: successErrors['title.ar'] }} />
          <LocalizedField label="Section subtitle" value={successSettings.subtitle} onChange={(v) => setSuccessSettings((p) => ({ ...p, subtitle: v }))} required maxLength={400} errors={{ en: successErrors['subtitle.en'], ar: successErrors['subtitle.ar'] }} />
        </div>

        <div style={{ height: 18 }} />

        <div className={ui.card}>
          <div className={ui.sectionTitleRow}>
            <div>
              <h3 className={ui.sectionTitle} style={{ fontSize: '1.2rem' }}>
                Logos
              </h3>
              <p className={ui.sectionHint} style={{ margin: 0 }}>
                Upload logo images and set bilingual alt text.
              </p>
            </div>
          </div>

          <div className={ui.gridTwoWide}>
            <div className={ui.field}>
              <label className={ui.label}>Logo file</label>
              <input className={ui.input} type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={(e) => setNewLogoFile(e.target.files?.[0] ?? null)} />
              {logoErrors.file && (
                <p className={ui.hint} style={{ marginTop: 6, color: 'rgba(248,113,113,0.95)' }}>
                  {logoErrors.file}
                </p>
              )}
              {newLogoPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={newLogoPreview} alt="" style={{ marginTop: 10, width: 220, height: 90, objectFit: 'contain', borderRadius: 12, background: 'rgba(2,6,23,0.35)', border: '1px solid rgba(148,163,184,0.2)' }} />
              )}
            </div>
            <div className={ui.field}>
              <label className={ui.label}>Sort order</label>
              <input className={ui.input} type="number" min={0} max={1_000_000} value={newLogoSort} onChange={(e) => setNewLogoSort(Number(e.target.value || 0))} />
            </div>
          </div>

          <LocalizedField
            label="Alt text"
            value={newLogoAlt}
            onChange={setNewLogoAlt}
            required
            maxLength={200}
            errors={{ en: logoErrors['alt.en'], ar: logoErrors['alt.ar'] }}
          />

          <div className={ui.toolbar} style={{ justifyContent: 'space-between' }}>
            <button type="button" className={`${ui.button} ${ui.buttonMuted}`} onClick={resetNewLogo}>
              New logo
            </button>
            <button
              type="button"
              className={`${ui.button} ${ui.buttonPrimary}`}
              onClick={addLogo}
              aria-disabled={!newLogoFile ? 'true' : 'false'}
            >
              Add logo
            </button>
          </div>

          <div style={{ height: 12 }} />

          <div className={ui.items}>
            {logos.length === 0 && (
              <div className={ui.card}>
                <p className={ui.sectionHint} style={{ margin: 0 }}>
                  No logos saved in the database yet. The public site will fall back to the built-in template.
                </p>
                <div style={{ height: 10 }} />
                <p className={ui.sectionHint} style={{ margin: 0 }}>
                  Template logos (preview):
                </p>
                <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
                  {successClientsTemplate.logos.map((logo, idx) => (
                    <li key={`${logo.sortOrder}-${idx}`} className={ui.sectionHint} style={{ margin: '6px 0' }}>
                      {logo.alt.en} <span style={{ opacity: 0.7 }}>({logo.sortOrder})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {logos.map((logo) => (
              <div key={logo.id} className={ui.card}>
                <div className={ui.gridTwoWide} style={{ alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo.imageUrl} alt="" style={{ width: 140, height: 58, objectFit: 'contain', borderRadius: 12, background: 'rgba(2,6,23,0.35)', border: '1px solid rgba(148,163,184,0.2)' }} />
                    <div>
                      <p className={ui.itemTitle} style={{ margin: 0 }}>
                        {logo.alt.en || logo.alt.ar || `Logo #${logo.id}`}
                      </p>
                      <p className={ui.itemMeta} style={{ margin: 0 }}>
                        Sort: {logo.sortOrder} · Upload #{logo.uploadId}
                      </p>
                    </div>
                  </div>
                  <div className={ui.toolbar} style={{ justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className={`${ui.button} ${ui.buttonPrimary}`}
                      onClick={() => saveLogo(logo.id)}
                      aria-disabled={logoSavingId === logo.id ? 'true' : 'false'}
                    >
                      {logoSavingId === logo.id ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" className={`${ui.button} ${ui.buttonDanger}`} onClick={() => deleteLogo(logo.id)}>
                      Delete
                    </button>
                  </div>
                </div>
                <div className={ui.gridTwoWide}>
                  <div className={ui.field}>
                    <label className={ui.label}>Replace image (optional)</label>
                    <input
                      className={ui.input}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      onChange={(e) => setReplaceFile(logo.id, e.target.files?.[0] ?? null)}
                    />
                    {logoFiles[logo.id] && (
                      <p className={ui.hint} style={{ marginTop: 6 }}>
                        Selected: {logoFiles[logo.id]!.name}
                      </p>
                    )}
                  </div>
                  <div className={ui.field}>
                    <label className={ui.label}>Sort order</label>
                    <input
                      className={ui.input}
                      type="number"
                      min={0}
                      max={1_000_000}
                      value={logo.sortOrder}
                      onChange={(e) => updateLogoField(logo.id, { sortOrder: Number(e.target.value || 0) })}
                    />
                  </div>
                </div>
                <LocalizedField label="Alt text" value={logo.alt} onChange={(v) => updateLogoAlt(logo.id, v)} required maxLength={200} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
