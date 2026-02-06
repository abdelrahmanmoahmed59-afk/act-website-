'use client'

import React, { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import ui from '../admin-ui.module.css'
import { blogPostSchema, blogSettingsSchema } from '@/lib/validation/blog'
import { blogTemplatePosts } from '@/lib/content/blog-template'

type LocalizedText = { en: string; ar: string }

type BlogSettings = {
  eyebrow: LocalizedText
  title: LocalizedText
  subtitle: LocalizedText
  intro: LocalizedText
}

type BlogPost = {
  id: number
  slug: string
  sortOrder: number
  published: boolean
  isFeatured: boolean
  title: LocalizedText
  dateLabel: LocalizedText
  category: LocalizedText
  readTime: LocalizedText
  summary: LocalizedText
  content: LocalizedText
  highlights: { en: string[]; ar: string[] }
  imageUploadId: number | null
  imageUrl?: string
}

function emptyLocalized(): LocalizedText {
  return { en: '', ar: '' }
}

function slugifyClient(input: string) {
  const normalized = input
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')

  const slug = normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-')

  return slug
}

function defaultSettings(): BlogSettings {
  return {
    eyebrow: { en: 'ACT Blog', ar: 'مدونة ACT' },
    title: { en: 'Blog', ar: 'المدونة' },
    subtitle: { en: 'Insights from ACT project teams across Kuwait.', ar: 'رؤى من فرق ACT حول تنفيذ المشاريع في الكويت.' },
    intro: {
      en: 'Practical notes on delivery strategy, safety, and procurement for complex construction programs.',
      ar: 'ملاحظات عملية حول استراتيجيات التنفيذ والسلامة والمشتريات للبرامج الإنشائية المعقدة.',
    },
  }
}

function newEmptyPost(): BlogPost {
  return {
    id: -1,
    slug: '',
    sortOrder: 0,
    published: true,
    isFeatured: false,
    title: emptyLocalized(),
    dateLabel: emptyLocalized(),
    category: emptyLocalized(),
    readTime: emptyLocalized(),
    summary: emptyLocalized(),
    content: emptyLocalized(),
    highlights: { en: [], ar: [] },
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

function textAreaList(value: string[]) {
  return value.join('\n')
}

function parseTextAreaList(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
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

export default function AdminBlogPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)

  const [settings, setSettings] = useState<BlogSettings>(defaultSettings())
  const [settingsErrors, setSettingsErrors] = useState<Record<string, string>>({})
  const [savingSettings, setSavingSettings] = useState(false)

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [savingId, setSavingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [postErrors, setPostErrors] = useState<Record<number, Record<string, string>>>({})

  const [newPost, setNewPost] = useState<BlogPost>(() => newEmptyPost())
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
    setPostErrors({})
    try {
      const [sRes, pRes] = await Promise.all([
        fetch('/api/admin/blog/settings', { cache: 'no-store' }),
        fetch('/api/admin/blog/posts', { cache: 'no-store' }),
      ])
      if (sRes.status === 401 || pRes.status === 401) {
        router.replace('/admin/login')
        return
      }
      const [sJson, pJson] = await Promise.all([sRes.json(), pRes.json()])
      setSettings((sJson.settings as BlogSettings) ?? defaultSettings())
      setPosts(((pJson.posts as BlogPost[]) ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder || b.id - a.id))
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
      const res = await fetch('/api/admin/blog/seed', { method: 'POST' })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setError((json as any)?.error ?? 'Failed to seed.')
        return
      }
      setSuccess((json as any)?.seededCount ? `Seeded ${String((json as any).seededCount)} post(s).` : 'Seed complete.')
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
    const validated = blogSettingsSchema.safeParse(settings)
    if (!validated.success) {
      setSettingsErrors(issuesToFieldErrors(validated.error.issues))
      setError('Please fix the highlighted fields.')
      setSavingSettings(false)
      return
    }
    try {
      const res = await fetch('/api/admin/blog/settings', {
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

  const validatePost = (post: BlogPost) => {
    const parsed = blogPostSchema.safeParse(post)
    if (!parsed.success) return { ok: false as const, issues: issuesToFieldErrors(parsed.error.issues) }
    return { ok: true as const, data: parsed.data }
  }

  const addPost = async () => {
    setError(null)
    setSuccess(null)
    try {
      let imageUploadId: number | null = newPost.imageUploadId ?? null
      if (newImage) {
        const uploaded = await uploadFile(newImage)
        if (uploaded) imageUploadId = uploaded.id
      }
      const payload: BlogPost = { ...newPost, imageUploadId, highlights: newPost.highlights }
      const validated = validatePost(payload)
      if (!validated.ok) {
        setError('Please fix the new post fields.')
        return
      }
      const res = await fetch('/api/admin/blog/posts', {
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
      setNewPost(newEmptyPost())
      setNewImage(null)
      setSuccess('Post added.')
      await loadAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add post.')
    }
  }

  const savePost = async (id: number) => {
    if (savingId) return
    setSavingId(id)
    setError(null)
    setSuccess(null)
    try {
      const post = posts.find((p) => p.id === id)
      if (!post) return
      const validated = validatePost(post)
      if (!validated.ok) {
        setPostErrors((prev) => ({ ...prev, [id]: validated.issues }))
        setError('Please fix the highlighted fields.')
        return
      }
      const res = await fetch(`/api/admin/blog/posts/${id}`, {
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
      setSuccess('Post saved.')
      await loadAll()
    } finally {
      setSavingId(null)
    }
  }

  const deletePost = async (id: number) => {
    if (deletingId) return
    setDeletingId(id)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/admin/blog/posts/${id}`, { method: 'DELETE' })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        setError((json as any)?.error ?? 'Failed to delete.')
        return
      }
      setSuccess('Post deleted.')
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
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, imageUploadId: uploaded.id, imageUrl: uploaded.url } : p)))
      setSuccess('Image uploaded (pending save).')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    }
  }

  const sortedPosts = useMemo(() => posts.slice().sort((a, b) => a.sortOrder - b.sortOrder || b.id - a.id), [posts])

  return (
    <div>
      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>Blog settings</h2>
            <p className={ui.sectionHint}>Update hero copy for /blog.</p>
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
          <LocalizedField label="Eyebrow" value={settings.eyebrow} onChange={(v) => setSettings((p) => ({ ...p, eyebrow: v }))} required maxLength={200} errors={{ en: settingsErrors['eyebrow.en'], ar: settingsErrors['eyebrow.ar'] }} />
          <LocalizedField label="Title" value={settings.title} onChange={(v) => setSettings((p) => ({ ...p, title: v }))} required maxLength={200} errors={{ en: settingsErrors['title.en'], ar: settingsErrors['title.ar'] }} />
          <LocalizedField label="Subtitle" value={settings.subtitle} onChange={(v) => setSettings((p) => ({ ...p, subtitle: v }))} required maxLength={200} errors={{ en: settingsErrors['subtitle.en'], ar: settingsErrors['subtitle.ar'] }} />
          <LocalizedField label="Intro" value={settings.intro} onChange={(v) => setSettings((p) => ({ ...p, intro: v }))} required textarea maxLength={2000} errors={{ en: settingsErrors['intro.en'], ar: settingsErrors['intro.ar'] }} />
        </div>
      </section>

      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>Posts</h2>
            <p className={ui.sectionHint}>Add, edit, delete posts. One featured post can be flagged.</p>
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

        {!loading && posts.length === 0 && (
          <div className={ui.card}>
            <p className={ui.sectionHint} style={{ margin: 0 }}>
              No posts saved in the database yet. The public site will fall back to the built-in template.
            </p>
            <div style={{ height: 10 }} />
            <p className={ui.sectionHint} style={{ margin: 0 }}>
              Template posts (preview):
            </p>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
              {blogTemplatePosts.map((p) => (
                <li key={p.slug} className={ui.sectionHint} style={{ margin: '6px 0' }}>
                  {p.title.en} <span style={{ opacity: 0.7 }}>({p.slug})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={ui.card}>
          <h3 className={ui.sectionTitle} style={{ fontSize: '1.15rem' }}>
            Add new post
          </h3>
          <div className={ui.gridTwoWide}>
            <div className={ui.field}>
              <label className={ui.label}>Slug</label>
              <input className={ui.input} value={newPost.slug} onChange={(e) => setNewPost((p) => ({ ...p, slug: e.target.value }))} placeholder="my-post" />
              <p className={ui.sectionHint} style={{ margin: 0 }}>
                Leave blank to auto-generate from the English title.
              </p>
            </div>
            <div className={ui.field}>
              <label className={ui.label}>Sort order</label>
              <input className={ui.input} type="number" value={newPost.sortOrder} onChange={(e) => setNewPost((p) => ({ ...p, sortOrder: Number(e.target.value) }))} />
            </div>
          </div>
          <div className={ui.field}>
            <label className={ui.label}>Flags</label>
            <div className={ui.toolbar} style={{ justifyContent: 'flex-start' }}>
              <label className={ui.label}>
                <input type="checkbox" checked={newPost.published} onChange={(e) => setNewPost((p) => ({ ...p, published: e.target.checked }))} /> Published
              </label>
              <label className={ui.label}>
                <input type="checkbox" checked={newPost.isFeatured} onChange={(e) => setNewPost((p) => ({ ...p, isFeatured: e.target.checked }))} /> Featured
              </label>
            </div>
          </div>

          <LocalizedField
            label="Title"
            value={newPost.title}
            onChange={(v) => {
              setNewPost((p) => {
                const nextSlug = p.slug.trim().length ? p.slug : slugifyClient(v.en)
                return { ...p, title: v, slug: nextSlug }
              })
            }}
            required
            maxLength={200}
          />
          <div className={ui.gridTwoWide}>
            <LocalizedField label="Date label" value={newPost.dateLabel} onChange={(v) => setNewPost((p) => ({ ...p, dateLabel: v }))} required maxLength={200} />
            <LocalizedField label="Category" value={newPost.category} onChange={(v) => setNewPost((p) => ({ ...p, category: v }))} required maxLength={200} />
          </div>
          <LocalizedField label="Read time" value={newPost.readTime} onChange={(v) => setNewPost((p) => ({ ...p, readTime: v }))} required maxLength={200} />
          <LocalizedField label="Summary" value={newPost.summary} onChange={(v) => setNewPost((p) => ({ ...p, summary: v }))} required textarea maxLength={2000} />
          <LocalizedField label="Content (Markdown)" value={newPost.content} onChange={(v) => setNewPost((p) => ({ ...p, content: v }))} required textarea maxLength={12000} />

          <div className={ui.gridTwoWide}>
            <div className={ui.field}>
              <label className={ui.label}>Highlights (EN, one per line)</label>
              <textarea className={ui.textarea} value={textAreaList(newPost.highlights.en)} onChange={(e) => setNewPost((p) => ({ ...p, highlights: { ...p.highlights, en: parseTextAreaList(e.target.value) } }))} />
            </div>
            <div className={ui.field}>
              <label className={ui.label}>Highlights (AR, one per line)</label>
              <textarea dir="rtl" className={ui.textarea} value={textAreaList(newPost.highlights.ar)} onChange={(e) => setNewPost((p) => ({ ...p, highlights: { ...p.highlights, ar: parseTextAreaList(e.target.value) } }))} />
            </div>
          </div>

          <div className={ui.field}>
            <label className={ui.label}>Post image</label>
            <input className={ui.input} type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={(e) => setNewImage(e.target.files?.[0] ?? null)} />
            {newImagePreview && <p className={ui.sectionHint} style={{ margin: 0 }}>Selected: {newImage?.name}</p>}
          </div>

          <div className={ui.toolbar} style={{ justifyContent: 'flex-end' }}>
            <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={addPost}>
              Add post
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
            {sortedPosts.map((post) => {
              const errs = postErrors[post.id] ?? {}
              return (
                <div key={post.id} className={ui.card}>
                  <div className={ui.itemHeader}>
                    <div>
                      <h3 className={ui.itemTitle}>
                        {post.title.en || post.slug} <span style={{ opacity: 0.6 }}>#{post.id}</span>
                      </h3>
                      <p className={ui.itemMeta}>
                        Slug: <code>{post.slug}</code> · Sort: {post.sortOrder} · {post.published ? 'Published' : 'Draft'} ·{' '}
                        {post.isFeatured ? 'Featured' : 'Standard'}
                      </p>
                    </div>
                    <div className={ui.itemActions}>
                      <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={() => savePost(post.id)} aria-disabled={savingId === post.id ? 'true' : 'false'}>
                        {savingId === post.id ? 'Saving…' : 'Save'}
                      </button>
                      <button type="button" className={`${ui.button} ${ui.buttonDanger}`} onClick={() => deletePost(post.id)} aria-disabled={deletingId === post.id ? 'true' : 'false'}>
                        {deletingId === post.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>

                  <div className={ui.gridTwoWide}>
                    <div className={ui.field}>
                      <label className={ui.label}>Slug</label>
                      <input className={ui.input} value={post.slug} onChange={(e) => setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, slug: e.target.value } : p)))} aria-invalid={errs.slug ? 'true' : undefined} style={errs.slug ? ({ borderColor: 'rgba(248,113,113,0.9)' } as const) : undefined} />
                      {errs.slug && (
                        <p className={ui.sectionHint} style={{ marginTop: 6, color: 'rgba(248,113,113,0.95)' }}>
                          {errs.slug}
                        </p>
                      )}
                    </div>
                    <div className={ui.field}>
                      <label className={ui.label}>Sort order</label>
                      <input className={ui.input} type="number" value={post.sortOrder} onChange={(e) => setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, sortOrder: Number(e.target.value) } : p)))} />
                    </div>
                  </div>

                  <div className={ui.field}>
                    <label className={ui.label}>Flags</label>
                    <div className={ui.toolbar} style={{ justifyContent: 'flex-start' }}>
                      <label className={ui.label}>
                        <input type="checkbox" checked={post.published} onChange={(e) => setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, published: e.target.checked } : p)))} /> Published
                      </label>
                      <label className={ui.label}>
                        <input type="checkbox" checked={post.isFeatured} onChange={(e) => setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, isFeatured: e.target.checked } : p)))} /> Featured
                      </label>
                    </div>
                  </div>

                  <LocalizedField label="Title" value={post.title} onChange={(v) => setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, title: v } : p)))} required maxLength={200} errors={{ en: errs['title.en'], ar: errs['title.ar'] }} />
                  <div className={ui.gridTwoWide}>
                    <LocalizedField label="Date label" value={post.dateLabel} onChange={(v) => setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, dateLabel: v } : p)))} required maxLength={200} errors={{ en: errs['dateLabel.en'], ar: errs['dateLabel.ar'] }} />
                    <LocalizedField label="Category" value={post.category} onChange={(v) => setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, category: v } : p)))} required maxLength={200} errors={{ en: errs['category.en'], ar: errs['category.ar'] }} />
                  </div>
                  <LocalizedField label="Read time" value={post.readTime} onChange={(v) => setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, readTime: v } : p)))} required maxLength={200} errors={{ en: errs['readTime.en'], ar: errs['readTime.ar'] }} />
                  <LocalizedField label="Summary" value={post.summary} onChange={(v) => setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, summary: v } : p)))} required textarea maxLength={2000} errors={{ en: errs['summary.en'], ar: errs['summary.ar'] }} />
                  <LocalizedField label="Content (Markdown)" value={post.content} onChange={(v) => setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, content: v } : p)))} required textarea maxLength={12000} errors={{ en: errs['content.en'], ar: errs['content.ar'] }} />

                  <div className={ui.gridTwoWide}>
                    <div className={ui.field}>
                      <label className={ui.label}>Highlights (EN, one per line)</label>
                      <textarea className={ui.textarea} value={textAreaList(post.highlights.en)} onChange={(e) => setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, highlights: { ...p.highlights, en: parseTextAreaList(e.target.value) } } : p)))} />
                    </div>
                    <div className={ui.field}>
                      <label className={ui.label}>Highlights (AR, one per line)</label>
                      <textarea dir="rtl" className={ui.textarea} value={textAreaList(post.highlights.ar)} onChange={(e) => setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, highlights: { ...p.highlights, ar: parseTextAreaList(e.target.value) } } : p)))} />
                    </div>
                  </div>

                  <div className={ui.field}>
                    <label className={ui.label}>Replace image</label>
                    <input className={ui.input} type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={(e) => uploadReplaceImage(post.id, e.target.files?.[0] ?? null)} />
                    <p className={ui.sectionHint} style={{ margin: 0 }}>
                      UploadId: {post.imageUploadId ?? 'none'}
                    </p>
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
