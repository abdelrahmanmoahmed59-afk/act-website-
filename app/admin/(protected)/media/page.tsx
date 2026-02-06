'use client'

import React, { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import ui from '../admin-ui.module.css'
import { mediaItemSchema, mediaSettingsSchema } from '@/lib/validation/media'
import { mediaTemplateItems } from '@/lib/content/media-template'

type LocalizedText = { en: string; ar: string }

type MediaSettings = {
  title: LocalizedText
  subtitle: LocalizedText
  intro: LocalizedText
}

type MediaItem = {
  id: number
  sortOrder: number
  published: boolean
  type: 'video' | 'photo' | 'press'
  title: LocalizedText
  dateLabel: LocalizedText
  description: LocalizedText
  linkUrl: string
  imageUploadId: number | null
  imageUrl?: string
}

function emptyLocalized(): LocalizedText {
  return { en: '', ar: '' }
}

function defaultSettings(): MediaSettings {
  return {
    title: { en: 'Media', ar: 'الإعلام' },
    subtitle: { en: 'Project visuals, milestones, and press highlights from ACT.', ar: 'مواد مرئية وبيانات صحفية عن مشاريع ACT.' },
    intro: { en: 'Browse recent footage, photo stories, and media releases.', ar: 'تصفح أحدث المقاطع والصور والبيانات الإعلامية.' },
  }
}

function newEmptyItem(): MediaItem {
  return {
    id: -1,
    sortOrder: 0,
    published: true,
    type: 'press',
    title: emptyLocalized(),
    dateLabel: emptyLocalized(),
    description: emptyLocalized(),
    linkUrl: '',
    imageUploadId: null,
  }
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
            <p className={ui.sectionHint} style={{ marginTop: 6, color: 'rgba(248,113,113,0.95)' }}>
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
            <p className={ui.sectionHint} style={{ marginTop: 6, color: 'rgba(248,113,113,0.95)' }}>
              {errors.ar}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminMediaPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)

  const [settings, setSettings] = useState<MediaSettings>(defaultSettings())
  const [settingsErrors, setSettingsErrors] = useState<Record<string, string>>({})
  const [savingSettings, setSavingSettings] = useState(false)

  const [items, setItems] = useState<MediaItem[]>([])
  const [savingId, setSavingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [itemErrors, setItemErrors] = useState<Record<number, Record<string, string>>>({})

  const [newItem, setNewItem] = useState<MediaItem>(() => newEmptyItem())
  const [newImage, setNewImage] = useState<File | null>(null)

  const newImagePreview = useMemo(() => (newImage ? URL.createObjectURL(newImage) : null), [newImage])
  useEffect(() => {
    if (!newImagePreview) return
    return () => URL.revokeObjectURL(newImagePreview)
  }, [newImagePreview])

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

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setSettingsErrors({})
    setItemErrors({})
    try {
      const [sRes, iRes] = await Promise.all([
        fetch('/api/admin/media/settings', { cache: 'no-store' }),
        fetch('/api/admin/media/items', { cache: 'no-store' }),
      ])
      if (sRes.status === 401 || iRes.status === 401) {
        router.replace('/admin/login')
        return
      }
      const [sJson, iJson] = await Promise.all([sRes.json(), iRes.json()])
      setSettings((sJson.settings as MediaSettings) ?? defaultSettings())
      setItems(((iJson.items as MediaItem[]) ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder || b.id - a.id))
      setLoading(false)
    } catch {
      setError('Failed to load data. Check the local JSON store under `data/` and restart the dev server.')
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const seedFromTemplate = async () => {
    if (seeding) return
    setSeeding(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/admin/media/seed', { method: 'POST' })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setError((json as any)?.error ?? 'Failed to seed.')
        return
      }
      setSuccess((json as any)?.seededCount ? `Seeded ${String((json as any).seededCount)} item(s).` : 'Seed complete.')
      await loadAll()
    } catch {
      setError('Failed to seed template data. Please try again.')
    } finally {
      setSeeding(false)
    }
  }

  const saveSettings = async () => {
    if (savingSettings) return
    setSavingSettings(true)
    setError(null)
    setSuccess(null)
    setSettingsErrors({})

    const validated = mediaSettingsSchema.safeParse(settings)
    if (!validated.success) {
      setSettingsErrors(issuesToFieldErrors(validated.error.issues))
      setError('Please fix the highlighted fields.')
      setSavingSettings(false)
      return
    }

    try {
      const res = await fetch('/api/admin/media/settings', {
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
      setSuccess('Settings saved.')
      await loadAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save settings.')
    } finally {
      setSavingSettings(false)
    }
  }

  const validateItem = (item: MediaItem) => {
    const parsed = mediaItemSchema.safeParse(item)
    if (!parsed.success) return { ok: false as const, issues: issuesToFieldErrors(parsed.error.issues) }
    return { ok: true as const, data: parsed.data }
  }

  const addItem = async () => {
    setError(null)
    setSuccess(null)
    try {
      let imageUploadId: number | null = newItem.imageUploadId ?? null
      if (newImage) {
        const uploaded = await uploadFile(newImage)
        if (uploaded) imageUploadId = uploaded.id
      }
      const payload: MediaItem = { ...newItem, imageUploadId }
      const validated = validateItem(payload)
      if (!validated.ok) {
        setError('Please fix the new item fields.')
        return
      }
      const res = await fetch('/api/admin/media/items', {
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
      setNewItem(newEmptyItem())
      setNewImage(null)
      setSuccess('Item added.')
      await loadAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add item.')
    }
  }

  const saveItem = async (id: number) => {
    if (savingId) return
    setSavingId(id)
    setError(null)
    setSuccess(null)
    try {
      const item = items.find((i) => i.id === id)
      if (!item) return
      const validated = validateItem(item)
      if (!validated.ok) {
        setItemErrors((prev) => ({ ...prev, [id]: validated.issues }))
        setError('Please fix the highlighted fields.')
        return
      }
      const res = await fetch(`/api/admin/media/items/${id}`, {
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
      setSuccess('Item saved.')
      await loadAll()
    } finally {
      setSavingId(null)
    }
  }

  const deleteItem = async (id: number) => {
    if (deletingId) return
    setDeletingId(id)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/admin/media/items/${id}`, { method: 'DELETE' })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        setError((json as any)?.error ?? 'Failed to delete.')
        return
      }
      setSuccess('Item deleted.')
      await loadAll()
    } finally {
      setDeletingId(null)
    }
  }

  const uploadReplaceImage = async (id: number, file: File | null) => {
    if (!file) return
    setError(null)
    setSuccess(null)
    try {
      const uploaded = await uploadFile(file)
      if (!uploaded) return
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, imageUploadId: uploaded.id, imageUrl: uploaded.url } : i)))
      setSuccess('Image uploaded (pending save).')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    }
  }

  const sortedItems = useMemo(() => items.slice().sort((a, b) => a.sortOrder - b.sortOrder || b.id - a.id), [items])

  return (
    <div>
      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>Media settings</h2>
            <p className={ui.sectionHint}>Update hero copy for /media.</p>
          </div>
          <div className={ui.toolbar}>
            <button type="button" className={`${ui.button} ${ui.buttonMuted}`} onClick={loadAll} aria-disabled={loading ? 'true' : 'false'}>
              Refresh
            </button>
            <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={saveSettings} aria-disabled={savingSettings ? 'true' : 'false'}>
              {savingSettings ? 'Saving…' : 'Save settings'}
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
          <LocalizedField label="Title" value={settings.title} onChange={(v) => setSettings((p) => ({ ...p, title: v }))} required maxLength={200} errors={{ en: settingsErrors['title.en'], ar: settingsErrors['title.ar'] }} />
          <LocalizedField label="Subtitle" value={settings.subtitle} onChange={(v) => setSettings((p) => ({ ...p, subtitle: v }))} required maxLength={200} errors={{ en: settingsErrors['subtitle.en'], ar: settingsErrors['subtitle.ar'] }} />
          <LocalizedField label="Intro" value={settings.intro} onChange={(v) => setSettings((p) => ({ ...p, intro: v }))} required textarea maxLength={2000} errors={{ en: settingsErrors['intro.en'], ar: settingsErrors['intro.ar'] }} />
        </div>
      </section>

      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>Media items</h2>
            <p className={ui.sectionHint}>Add, edit, delete items shown on /media.</p>
          </div>
          <div className={ui.toolbar}>
            <button type="button" className={`${ui.button} ${ui.buttonMuted}`} onClick={loadAll} aria-disabled={loading ? 'true' : 'false'}>
              Refresh
            </button>
            <button type="button" className={`${ui.button} ${ui.buttonMuted}`} onClick={seedFromTemplate} aria-disabled={seeding ? 'true' : 'false'}>
              {seeding ? 'Seeding…' : 'Seed from template'}
            </button>
          </div>
        </div>

        {!loading && items.length === 0 && (
          <div className={ui.card}>
            <p className={ui.sectionHint} style={{ margin: 0 }}>
              No media items saved in the database yet. The public site will fall back to the built-in template.
            </p>
            <div style={{ height: 10 }} />
            <p className={ui.sectionHint} style={{ margin: 0 }}>
              Template items (preview):
            </p>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
              {mediaTemplateItems.map((i, idx) => (
                <li key={`${i.type}-${idx}`} className={ui.sectionHint} style={{ margin: '6px 0' }}>
                  {i.title.en} <span style={{ opacity: 0.7 }}>({i.type})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={ui.card}>
          <h3 className={ui.sectionTitle} style={{ fontSize: '1.15rem' }}>
            Add new item
          </h3>
          <div className={ui.gridTwoWide}>
            <div className={ui.field}>
              <label className={ui.label}>Type</label>
              <select className={ui.input} value={newItem.type} onChange={(e) => setNewItem((p) => ({ ...p, type: e.target.value as any }))}>
                <option value="press">Press</option>
                <option value="photo">Photo</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div className={ui.field}>
              <label className={ui.label}>Sort order</label>
              <input className={ui.input} type="number" value={newItem.sortOrder} onChange={(e) => setNewItem((p) => ({ ...p, sortOrder: Number(e.target.value) }))} />
            </div>
          </div>
          <div className={ui.field}>
            <label className={ui.label}>Published</label>
            <label className={ui.label}>
              <input type="checkbox" checked={newItem.published} onChange={(e) => setNewItem((p) => ({ ...p, published: e.target.checked }))} /> Published
            </label>
          </div>

          <LocalizedField label="Title" value={newItem.title} onChange={(v) => setNewItem((p) => ({ ...p, title: v }))} required maxLength={200} />
          <LocalizedField label="Date label" value={newItem.dateLabel} onChange={(v) => setNewItem((p) => ({ ...p, dateLabel: v }))} required maxLength={200} />
          <LocalizedField label="Description" value={newItem.description} onChange={(v) => setNewItem((p) => ({ ...p, description: v }))} required textarea maxLength={2000} />
          <div className={ui.field}>
            <label className={ui.label}>Link URL (optional)</label>
            <input className={ui.input} value={newItem.linkUrl} onChange={(e) => setNewItem((p) => ({ ...p, linkUrl: e.target.value }))} placeholder="https://..." />
          </div>
          <div className={ui.field}>
            <label className={ui.label}>Image (optional)</label>
            <input className={ui.input} type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={(e) => setNewImage(e.target.files?.[0] ?? null)} />
            {newImagePreview && <p className={ui.sectionHint} style={{ margin: 0 }}>Selected: {newImage?.name}</p>}
          </div>

          <div className={ui.toolbar} style={{ justifyContent: 'flex-end' }}>
            <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={addItem}>
              Add item
            </button>
          </div>
        </div>

        <div style={{ height: 18 }} />

        {loading ? (
          <div className={ui.card}>
            <p className={ui.sectionHint} style={{ margin: 0 }}>
              Loading…
            </p>
          </div>
        ) : (
          <div className={ui.items}>
            {sortedItems.map((item) => {
              const errs = itemErrors[item.id] ?? {}
              return (
                <div key={item.id} className={ui.card}>
                  <div className={ui.itemHeader}>
                    <div>
                      <h3 className={ui.itemTitle}>
                        {item.title.en || 'Media item'} <span style={{ opacity: 0.6 }}>#{item.id}</span>
                      </h3>
                      <p className={ui.itemMeta}>
                        Type: {item.type} · Sort: {item.sortOrder} · {item.published ? 'Published' : 'Draft'} · UploadId: {item.imageUploadId ?? 'none'}
                      </p>
                    </div>
                    <div className={ui.itemActions}>
                      <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={() => saveItem(item.id)} aria-disabled={savingId === item.id ? 'true' : 'false'}>
                        {savingId === item.id ? 'Saving…' : 'Save'}
                      </button>
                      <button type="button" className={`${ui.button} ${ui.buttonDanger}`} onClick={() => deleteItem(item.id)} aria-disabled={deletingId === item.id ? 'true' : 'false'}>
                        {deletingId === item.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>

                  <div className={ui.gridTwoWide}>
                    <div className={ui.field}>
                      <label className={ui.label}>Type</label>
                      <select className={ui.input} value={item.type} onChange={(e) => setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, type: e.target.value as any } : x)))}>
                        <option value="press">Press</option>
                        <option value="photo">Photo</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                    <div className={ui.field}>
                      <label className={ui.label}>Sort order</label>
                      <input className={ui.input} type="number" value={item.sortOrder} onChange={(e) => setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, sortOrder: Number(e.target.value) } : x)))} />
                    </div>
                  </div>

                  <div className={ui.field}>
                    <label className={ui.label}>Published</label>
                    <label className={ui.label}>
                      <input type="checkbox" checked={item.published} onChange={(e) => setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, published: e.target.checked } : x)))} /> Published
                    </label>
                  </div>

                  <LocalizedField label="Title" value={item.title} onChange={(v) => setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, title: v } : x)))} required maxLength={200} errors={{ en: errs['title.en'], ar: errs['title.ar'] }} />
                  <LocalizedField label="Date label" value={item.dateLabel} onChange={(v) => setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, dateLabel: v } : x)))} required maxLength={200} errors={{ en: errs['dateLabel.en'], ar: errs['dateLabel.ar'] }} />
                  <LocalizedField label="Description" value={item.description} onChange={(v) => setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, description: v } : x)))} required textarea maxLength={2000} errors={{ en: errs['description.en'], ar: errs['description.ar'] }} />

                  <div className={ui.field}>
                    <label className={ui.label}>Link URL (optional)</label>
                    <input className={ui.input} value={item.linkUrl} onChange={(e) => setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, linkUrl: e.target.value } : x)))} placeholder="https://..." />
                  </div>
                  <div className={ui.field}>
                    <label className={ui.label}>Replace image (optional)</label>
                    <input className={ui.input} type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={(e) => uploadReplaceImage(item.id, e.target.files?.[0] ?? null)} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
