'use client'

import React, { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import ui from '../admin-ui.module.css'
import { newsTemplateItems, newsTemplateSettings } from '@/lib/content/news-template'
import { newsItemSchema, newsSettingsSchema } from '@/lib/validation/news'

type LocalizedText = { en: string; ar: string }

type NewsSettings = {
  title: LocalizedText
  intro: LocalizedText
  filterLabel: LocalizedText
  allLabel: LocalizedText
  readMore: LocalizedText
  close: LocalizedText
  contactTitle: LocalizedText
  contactDesc: LocalizedText
  contactEmail: string
  contactButton: LocalizedText
}

type NewsItem = {
  id: number
  slug?: string | null
  sortOrder: number
  title: LocalizedText
  dateLabel: LocalizedText
  category: LocalizedText
  excerpt: LocalizedText
  imageUploadId?: number | null
  imageUrl: string
}

type DraftNewsItem = Omit<NewsItem, 'id'> & { id?: number }

const templateSettings: NewsSettings = newsTemplateSettings
const templateItems: Array<Omit<DraftNewsItem, 'id'>> = newsTemplateItems

function emptyDraft(): DraftNewsItem {
  return {
    slug: null,
    sortOrder: 0,
    title: { en: '', ar: '' },
    dateLabel: { en: '', ar: '' },
    category: { en: '', ar: '' },
    excerpt: { en: '', ar: '' },
    imageUploadId: null,
    imageUrl: '/placeholder.jpg',
  }
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

export default function AdminNewsPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<NewsSettings>(templateSettings)
  const [items, setItems] = useState<NewsItem[]>([])

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [settingsErrors, setSettingsErrors] = useState<Record<string, string>>({})
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({})

  const [savingSettings, setSavingSettings] = useState(false)

  const [editorMode, setEditorMode] = useState<'new' | 'edit' | null>(null)
  const [draft, setDraft] = useState<DraftNewsItem>(() => emptyDraft())
  const [draftImageFile, setDraftImageFile] = useState<File | null>(null)
  const [savingItem, setSavingItem] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const showError = (message: string) => {
    setSuccess(null)
    setError(message)
  }

  const showSuccess = (message: string) => {
    setError(null)
    setSuccess(message)
  }

  const issuesToFieldErrors = (issues: Array<{ path: Array<string | number>; message: string }>) => {
    const next: Record<string, string> = {}
    for (const issue of issues) {
      const key = issue.path.join('.')
      if (!next[key]) next[key] = issue.message
    }
    return next
  }

  const formatIssues = (issues: unknown) => {
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

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setSettingsErrors({})
    setItemErrors({})

    try {
      const [settingsRes, itemsRes] = await Promise.all([
        fetch('/api/admin/news/settings', { cache: 'no-store' }),
        fetch('/api/admin/news/items', { cache: 'no-store' }),
      ])

      if (settingsRes.status === 401 || itemsRes.status === 401) {
        router.replace('/admin/login')
        return
      }

      const [settingsJson, itemsJson] = await Promise.all([settingsRes.json(), itemsRes.json()])
      setSettings((settingsJson.settings as NewsSettings) ?? templateSettings)
      setItems(((itemsJson.items as NewsItem[]) ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder || b.id - a.id))
      setLoading(false)
    } catch {
      showError('Failed to load data. Check the local JSON store under `data/` and restart the dev server.')
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const draftImagePreviewUrl = useMemo(() => {
    if (!draftImageFile) return null
    return URL.createObjectURL(draftImageFile)
  }, [draftImageFile])

  useEffect(() => {
    if (!draftImagePreviewUrl) return
    return () => URL.revokeObjectURL(draftImagePreviewUrl)
  }, [draftImagePreviewUrl])

  const seedFromTemplate = async () => {
    setSavingSettings(true)
    setSavingItem(true)
    setError(null)
    setSuccess(null)
    try {
      const putRes = await fetch('/api/admin/news/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateSettings),
      })
      if (putRes.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!putRes.ok) throw new Error('settings')

      for (const item of templateItems) {
        const postRes = await fetch('/api/admin/news/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })
        if (!postRes.ok) throw new Error('items')
      }

      showSuccess('Seeded settings and items from the current template.')
      await loadAll()
    } catch {
      showError('Seeding failed. Please try again.')
    } finally {
      setSavingSettings(false)
      setSavingItem(false)
    }
  }

  const uploadDraftImage = async (file: File) => {
    const form = new FormData()
    form.set('file', file)

    const res = await fetch('/api/admin/uploads', { method: 'POST', body: form })
    if (res.status === 401) {
      router.replace('/admin/login')
      return null
    }
    if (!res.ok) throw new Error('upload')
    return (await res.json()) as { id: number; url: string }
  }

  const saveSettings = async () => {
    if (savingSettings) return
    setSavingSettings(true)
    setError(null)
    setSuccess(null)
    setSettingsErrors({})

    const validated = newsSettingsSchema.safeParse(settings)
    if (!validated.success) {
      setSettingsErrors(issuesToFieldErrors(validated.error.issues))
      showError('Please fix the highlighted fields.')
      setSavingSettings(false)
      return
    }
    try {
      const res = await fetch('/api/admin/news/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated.data),
      })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!res.ok) {
        try {
          const json = await res.json()
          const msg = typeof (json as any)?.error === 'string' ? (json as any).error : 'Invalid payload'
          const formatted = formatIssues((json as any)?.issues)
          showError(formatted ? `${msg}\n${formatted}` : msg)
        } catch {
          showError('Failed to save settings.')
        }
        return
      }
      showSuccess('Settings saved.')
      await loadAll()
    } catch {
      showError('Failed to save settings.')
    } finally {
      setSavingSettings(false)
    }
  }

  const openNew = () => {
    setEditorMode('new')
    setDraft(emptyDraft())
    setDraftImageFile(null)
    setItemErrors({})
  }

  const openEdit = (item: NewsItem) => {
    setEditorMode('edit')
    setDraft({ ...item })
    setDraftImageFile(null)
    setItemErrors({})
  }

  const closeEditor = () => {
    setEditorMode(null)
    setDraft(emptyDraft())
    setDraftImageFile(null)
    setItemErrors({})
  }

  const saveItem = async () => {
    if (savingItem) return
    setSavingItem(true)
    setError(null)
    setSuccess(null)
    setItemErrors({})
    try {
      const draftId =
        typeof draft.id === 'number' ? draft.id : typeof draft.id === 'string' ? Number(draft.id) : null
      const isEdit = editorMode === 'edit' && typeof draftId === 'number' && Number.isFinite(draftId) && draftId > 0
      const endpoint = isEdit ? `/api/admin/news/items/${draftId}` : '/api/admin/news/items'
      const method = isEdit ? 'PUT' : 'POST'

      if (!isEdit && !draftImageFile && !draft.imageUploadId) {
        showError('Please choose an image file for this news item.')
        setItemErrors({ image: 'Image file is required.' })
        return
      }

      let imageUploadId = draft.imageUploadId ?? null
      let imageUrl = draft.imageUrl
      if (draftImageFile) {
        const uploaded = await uploadDraftImage(draftImageFile)
        if (!uploaded) return
        imageUploadId = uploaded.id
        imageUrl = uploaded.url
        setDraft((prev) => ({ ...prev, imageUploadId, imageUrl }))
      }

      const payload: Omit<DraftNewsItem, 'id'> = {
        sortOrder: draft.sortOrder,
        slug: draft.slug ?? null,
        title: draft.title,
        dateLabel: draft.dateLabel,
        category: draft.category,
        excerpt: draft.excerpt,
        imageUploadId,
        imageUrl,
      }

      const validated = newsItemSchema.safeParse(payload)
      if (!validated.success) {
        setItemErrors(issuesToFieldErrors(validated.error.issues))
        showError('Please fix the highlighted fields.')
        return
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated.data),
      })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!res.ok) {
        let details: unknown = null
        try {
          const json = await res.json()
          details = (json as any)?.issues ?? null
          const msg = typeof (json as any)?.error === 'string' ? (json as any).error : null
          const formatted = formatIssues(details)
          showError(formatted ? `${msg ?? 'Invalid payload'}\n${formatted}` : msg ?? 'Invalid payload')
        } catch {
          showError('Failed to save item.')
        }
        return
      }
      showSuccess(isEdit ? 'Item updated.' : 'Item created.')
      closeEditor()
      await loadAll()
    } catch {
      showError('Failed to save item.')
    } finally {
      setSavingItem(false)
    }
  }

  const persistItem = async (item: NewsItem) => {
    const payload = {
      sortOrder: item.sortOrder,
      slug: item.slug ?? null,
      title: item.title,
      dateLabel: item.dateLabel,
      category: item.category,
      excerpt: item.excerpt,
      imageUploadId: item.imageUploadId ?? null,
      imageUrl: item.imageUrl,
    }

    const validated = newsItemSchema.safeParse(payload)
    if (!validated.success) {
      setItemErrors(issuesToFieldErrors(validated.error.issues))
      showError('Please fix the highlighted fields before reordering.')
      return false
    }

    const res = await fetch(`/api/admin/news/items/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validated.data),
    })

    if (res.status === 401) {
      router.replace('/admin/login')
      return false
    }

    if (!res.ok) {
      try {
        const json = await res.json()
        const msg = typeof (json as any)?.error === 'string' ? (json as any).error : 'Failed to reorder.'
        const formatted = formatIssues((json as any)?.issues)
        showError(formatted ? `${msg}\n${formatted}` : msg)
      } catch {
        showError('Failed to reorder.')
      }
      return false
    }

    return true
  }

  const moveItem = async (id: number, direction: -1 | 1) => {
    const idx = items.findIndex((i) => i.id === id)
    const swapIdx = idx + direction
    if (idx < 0 || swapIdx < 0 || swapIdx >= items.length) return

    const a = items[idx]
    const b = items[swapIdx]
    if (!a || !b) return

    let aSort = a.sortOrder
    let bSort = b.sortOrder
    if (aSort === bSort) {
      if (direction < 0) {
        aSort = Math.max(0, bSort - 1)
      } else {
        bSort = aSort + 1
      }
    }

    const nextA = { ...a, sortOrder: bSort }
    const nextB = { ...b, sortOrder: aSort }

    setItems((prev) => {
      const next = prev.slice()
      next[idx] = nextA
      next[swapIdx] = nextB
      return next.slice().sort((x, y) => x.sortOrder - y.sortOrder || y.id - x.id)
    })

    setError(null)
    setSuccess(null)
    const ok = await Promise.all([persistItem(nextA), persistItem(nextB)])
    if (ok.every(Boolean)) {
      showSuccess('Order updated.')
      await loadAll()
    } else {
      await loadAll()
    }
  }

  const deleteItem = async (id: number) => {
    if (deletingId) return
    setDeletingId(id)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/admin/news/items/${id}`, { method: 'DELETE' })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!res.ok) throw new Error('bad')
      showSuccess('Item deleted.')
      await loadAll()
    } catch {
      showError('Failed to delete item.')
    } finally {
      setDeletingId(null)
    }
  }

  const itemsById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])

  const editorTitle = editorMode === 'new' ? 'Add News Item' : 'Edit News Item'
  const editorSubtitle =
    editorMode === 'new'
      ? 'Create a new bilingual entry. It will appear on /news after saving.'
      : 'Update the selected entry. Changes revalidate the public /news page.'

  return (
    <div>
      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>News page settings</h2>
            <p className={ui.sectionHint}>These fields control the hero + labels + contact section.</p>
          </div>
          <div className={ui.toolbar}>
            <button
              type="button"
              className={`${ui.button} ${ui.buttonMuted}`}
              onClick={loadAll}
              aria-disabled={loading ? 'true' : 'false'}
            >
              Refresh
            </button>
            <button
              type="button"
              className={`${ui.button} ${ui.buttonPrimary}`}
              onClick={saveSettings}
              aria-disabled={savingSettings ? 'true' : 'false'}
            >
              {savingSettings ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </div>

        {error && (
          <div className={ui.alert} role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className={ui.success} role="status">
            {success}
          </div>
        )}

        <div className={ui.card}>
          <div className={ui.toolbar} style={{ justifyContent: 'space-between' }}>
            <p className={ui.sectionHint} style={{ margin: 0 }}>
              Tip: Seed your database with the current template to start fast.
            </p>
            <button
              type="button"
              className={`${ui.button} ${ui.buttonMuted}`}
              onClick={seedFromTemplate}
              aria-disabled={savingSettings || savingItem ? 'true' : 'false'}
            >
              Seed from template
            </button>
          </div>

          <div style={{ height: 12 }} />

          <LocalizedField
            label="Title"
            value={settings.title}
            onChange={(next) => setSettings((prev) => ({ ...prev, title: next }))}
            required
            maxLength={180}
            errors={{ en: settingsErrors['title.en'], ar: settingsErrors['title.ar'] }}
          />
          <LocalizedField
            label="Intro"
            value={settings.intro}
            onChange={(next) => setSettings((prev) => ({ ...prev, intro: next }))}
            textarea
            required
            maxLength={4000}
            errors={{ en: settingsErrors['intro.en'], ar: settingsErrors['intro.ar'] }}
          />
          <LocalizedField
            label="Filter label"
            value={settings.filterLabel}
            onChange={(next) => setSettings((prev) => ({ ...prev, filterLabel: next }))}
            required
            maxLength={120}
            errors={{ en: settingsErrors['filterLabel.en'], ar: settingsErrors['filterLabel.ar'] }}
          />
          <LocalizedField
            label="All label"
            value={settings.allLabel}
            onChange={(next) => setSettings((prev) => ({ ...prev, allLabel: next }))}
            required
            maxLength={80}
            errors={{ en: settingsErrors['allLabel.en'], ar: settingsErrors['allLabel.ar'] }}
          />
          <LocalizedField
            label="Read more"
            value={settings.readMore}
            onChange={(next) => setSettings((prev) => ({ ...prev, readMore: next }))}
            required
            maxLength={80}
            errors={{ en: settingsErrors['readMore.en'], ar: settingsErrors['readMore.ar'] }}
          />
          <LocalizedField
            label="Close label"
            value={settings.close}
            onChange={(next) => setSettings((prev) => ({ ...prev, close: next }))}
            required
            maxLength={80}
            errors={{ en: settingsErrors['close.en'], ar: settingsErrors['close.ar'] }}
          />
          <LocalizedField
            label="Contact title"
            value={settings.contactTitle}
            onChange={(next) => setSettings((prev) => ({ ...prev, contactTitle: next }))}
            required
            maxLength={160}
            errors={{ en: settingsErrors['contactTitle.en'], ar: settingsErrors['contactTitle.ar'] }}
          />
          <LocalizedField
            label="Contact description"
            value={settings.contactDesc}
            onChange={(next) => setSettings((prev) => ({ ...prev, contactDesc: next }))}
            textarea
            required
            maxLength={2000}
            errors={{ en: settingsErrors['contactDesc.en'], ar: settingsErrors['contactDesc.ar'] }}
          />
          <div className={ui.field}>
            <label className={ui.label} htmlFor="contactEmail">
              Contact email
            </label>
            <input
              id="contactEmail"
              className={ui.input}
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings((prev) => ({ ...prev, contactEmail: e.target.value }))}
              required
              maxLength={320}
            />
            {settingsErrors.contactEmail && (
              <p className={ui.hint} style={{ marginTop: 6, color: 'rgba(248,113,113,0.95)' }}>
                {settingsErrors.contactEmail}
              </p>
            )}
          </div>
          <LocalizedField
            label="Contact button"
            value={settings.contactButton}
            onChange={(next) => setSettings((prev) => ({ ...prev, contactButton: next }))}
            required
            maxLength={120}
            errors={{ en: settingsErrors['contactButton.en'], ar: settingsErrors['contactButton.ar'] }}
          />
        </div>
      </section>

      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>News items</h2>
            <p className={ui.sectionHint}>Add, edit, and delete entries shown on the public News page.</p>
          </div>
          <div className={ui.toolbar}>
            <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={openNew}>
              Add item
            </button>
          </div>
        </div>

        {editorMode && (
          <div className={ui.card} aria-label={editorTitle}>
            <div className={ui.sectionTitleRow}>
              <div>
                <h3 className={ui.sectionTitle} style={{ fontSize: '1.2rem' }}>
                  {editorTitle}
                </h3>
                <p className={ui.sectionHint} style={{ margin: 0 }}>
                  {editorSubtitle}
                </p>
              </div>
              <div className={ui.toolbar}>
                <button type="button" className={`${ui.button} ${ui.buttonMuted}`} onClick={closeEditor}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={`${ui.button} ${ui.buttonPrimary}`}
                  onClick={saveItem}
                  aria-disabled={savingItem ? 'true' : 'false'}
                >
                  {savingItem ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            <div className={ui.gridTwoWide}>
              <div className={ui.field}>
                <label className={ui.label} htmlFor="sortOrder">
                  Sort order (lower first)
                </label>
                <input
                  id="sortOrder"
                  className={ui.input}
                  type="number"
                  value={draft.sortOrder}
                  onChange={(e) => setDraft((prev) => ({ ...prev, sortOrder: Number(e.target.value || 0) }))}
                  min={0}
                  max={1_000_000}
                />
                {itemErrors.sortOrder && (
                  <p className={ui.hint} style={{ marginTop: 6, color: 'rgba(248,113,113,0.95)' }}>
                    {itemErrors.sortOrder}
                  </p>
                )}
              </div>
              <div className={ui.field}>
                <label className={ui.label} htmlFor="slug">
                  Slug (optional)
                </label>
                <input
                  id="slug"
                  className={ui.input}
                  value={draft.slug ?? ''}
                  onChange={(e) => setDraft((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g. company-expands-to-kenya"
                  maxLength={120}
                />
                {itemErrors.slug && (
                  <p className={ui.hint} style={{ marginTop: 6, color: 'rgba(248,113,113,0.95)' }}>
                    {itemErrors.slug}
                  </p>
                )}
                <p className={ui.hint} style={{ marginTop: 6 }}>
                  Used for the public URL: <code>/news/&lt;slug&gt;</code>. Leave blank to auto-generate from the title.
                </p>
              </div>
              <div className={ui.field}>
                <label className={ui.label} htmlFor="imageUrl">
                  Image file
                </label>
                <input
                  id="imageUrl"
                  className={ui.input}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  onChange={(e) => setDraftImageFile(e.target.files?.[0] ?? null)}
                />
                {itemErrors.image && (
                  <p className={ui.hint} style={{ marginTop: 6, color: 'rgba(248,113,113,0.95)' }}>
                    {itemErrors.image}
                  </p>
                )}
                <div style={{ marginTop: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 84,
                      height: 56,
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: '1px solid rgba(148,163,184,0.2)',
                      background: 'rgba(2,6,23,0.35)',
                      display: 'grid',
                      placeItems: 'center',
                      flex: '0 0 auto',
                    }}
                    aria-label="Image preview"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={draftImagePreviewUrl ?? draft.imageUrl}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <p className={ui.hint} style={{ margin: 0 }}>
                    {draftImageFile ? `Selected: ${draftImageFile.name}` : 'Choose an image to upload.'}
                  </p>
                </div>
              </div>
            </div>

            <LocalizedField
              label="Item title"
              value={draft.title}
              onChange={(next) => setDraft((prev) => ({ ...prev, title: next }))}
              required
              maxLength={180}
              errors={{ en: itemErrors['title.en'], ar: itemErrors['title.ar'] }}
            />
            <LocalizedField
              label="Date label"
              value={draft.dateLabel}
              onChange={(next) => setDraft((prev) => ({ ...prev, dateLabel: next }))}
              required
              maxLength={80}
              errors={{ en: itemErrors['dateLabel.en'], ar: itemErrors['dateLabel.ar'] }}
            />
            <LocalizedField
              label="Category"
              value={draft.category}
              onChange={(next) => setDraft((prev) => ({ ...prev, category: next }))}
              required
              maxLength={80}
              errors={{ en: itemErrors['category.en'], ar: itemErrors['category.ar'] }}
            />
            <LocalizedField
              label="Excerpt"
              value={draft.excerpt}
              onChange={(next) => setDraft((prev) => ({ ...prev, excerpt: next }))}
              textarea
              required
              maxLength={1000}
              errors={{ en: itemErrors['excerpt.en'], ar: itemErrors['excerpt.ar'] }}
            />
          </div>
        )}

        <div className={ui.items}>
          {loading && <div className={ui.card}>Loading…</div>}

          {!loading && items.length === 0 && (
            <div className={ui.card}>
              <p style={{ margin: 0, color: 'rgba(226,232,240,0.75)' }}>
                No items yet. Click “Add item” or “Seed from template”.
              </p>
              <div style={{ height: 10 }} />
              <p className={ui.sectionHint} style={{ margin: 0 }}>
                Template items (preview):
              </p>
              <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
                {templateItems.slice(0, 8).map((t, idx) => (
                  <li key={`${t.slug ?? 'item'}-${idx}`} className={ui.sectionHint} style={{ margin: '6px 0' }}>
                    {(t.title?.en || '').trim() || '(Untitled)'} <span style={{ opacity: 0.7 }}>{t.slug ? `(${t.slug})` : ''}</span>
                  </li>
                ))}
              </ul>
              {templateItems.length > 8 && (
                <p className={ui.sectionHint} style={{ marginTop: 8 }}>
                  …and {templateItems.length - 8} more.
                </p>
              )}
            </div>
          )}

          {!loading &&
            items.map((item, index) => {
              const display = item.title.en || item.title.ar || `Item #${item.id}`
              const isDeleting = deletingId === item.id
              const isEditing = editorMode === 'edit' && draft.id === item.id
              return (
                <div key={item.id} className={ui.card} aria-label={`News item ${display}`}>
                  <div className={ui.itemHeader}>
                    <div>
                      <p className={ui.itemTitle}>
                        {display} <span style={{ opacity: 0.65, fontWeight: 800 }}>· #{item.id}</span>
                      </p>
                      <p className={ui.itemMeta}>
                        Sort: {item.sortOrder} · {item.category.en || item.category.ar} · {item.dateLabel.en || item.dateLabel.ar}
                      </p>
                      {item.slug && (
                        <p className={ui.itemMeta}>
                          Slug: <code>{item.slug}</code> ·{' '}
                          <a href={`/news/${item.slug}`} target="_blank" rel="noreferrer">
                            Preview
                          </a>
                        </p>
                      )}
                    </div>
                    <div className={ui.itemActions}>
                      <button
                        type="button"
                        className={`${ui.button} ${ui.buttonMuted}`}
                        onClick={() => moveItem(item.id, -1)}
                        aria-disabled={index === 0 ? 'true' : 'false'}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className={`${ui.button} ${ui.buttonMuted}`}
                        onClick={() => moveItem(item.id, 1)}
                        aria-disabled={index === items.length - 1 ? 'true' : 'false'}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className={`${ui.button} ${ui.buttonMuted}`}
                        onClick={() => openEdit(itemsById.get(item.id) ?? item)}
                        aria-disabled={isEditing ? 'true' : 'false'}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={`${ui.button} ${ui.buttonDanger}`}
                        onClick={() => deleteItem(item.id)}
                        aria-disabled={isDeleting ? 'true' : 'false'}
                      >
                        {isDeleting ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                  <div className={ui.gridTwoWide}>
                    <div className={ui.field}>
                      <p className={ui.label}>English excerpt</p>
                      <p style={{ margin: 0, color: 'rgba(226,232,240,0.8)', lineHeight: 1.6 }}>
                        {item.excerpt.en}
                      </p>
                    </div>
                    <div className={ui.field}>
                      <p className={ui.label}>Arabic excerpt</p>
                      <p
                        dir="rtl"
                        style={{ margin: 0, color: 'rgba(226,232,240,0.8)', lineHeight: 1.6 }}
                      >
                        {item.excerpt.ar}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </section>
    </div>
  )
}
