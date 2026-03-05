'use client'

import React, { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import ui from '../admin-ui.module.css'
import { projectInputSchema, projectsSettingsSchema } from '@/lib/validation/projects'
import { projects as staticProjects } from '@/lib/projects'

type LocalizedText = { en: string; ar: string }

type ProjectsSettings = {
  homeTitle: LocalizedText
  homeSubtitle: LocalizedText
  homeShowAllLabel: LocalizedText
  homeReadMoreLabel: LocalizedText
  pageTitle: LocalizedText
  pageIntro: LocalizedText
  pageGridLabel: LocalizedText
  pageClientLabel: LocalizedText
  pageReadMoreLabel: LocalizedText
}

type Project = {
  id: number
  slug: string
  sortOrder: number
  published: boolean
  showInMenu: boolean
  showInGrid: boolean
  title: LocalizedText
  sector: LocalizedText
  projectType: LocalizedText
  year: string
  status: LocalizedText
  client: LocalizedText
  location: LocalizedText
  cost: LocalizedText
  summary: LocalizedText
  details: LocalizedText
  methodology: { en: string[]; ar: string[] }
  galleryUploadIds: number[]
}

function emptyLocalized(): LocalizedText {
  return { en: '', ar: '' }
}

function defaultSettings(): ProjectsSettings {
  return {
    homeTitle: { en: 'Featured Projects', ar: 'المشاريع المميزة' },
    homeSubtitle: { en: 'Showcasing Our Recent Work', ar: 'عرض أعمالنا الأخيرة' },
    homeShowAllLabel: { en: 'Show all projects', ar: 'عرض جميع المشاريع' },
    homeReadMoreLabel: { en: 'Read more', ar: 'اقرأ المزيد' },
    pageTitle: { en: 'Our Projects', ar: 'مشاريعنا' },
    pageIntro: {
      en: 'Selected projects delivered across commercial, residential, and infrastructure sectors.',
      ar: 'عرض لأهم المشاريع المنجزة عبر قطاعات متعددة.',
    },
    pageGridLabel: { en: 'Project cards', ar: 'بطاقات المشاريع' },
    pageClientLabel: { en: 'Client', ar: 'العميل' },
    pageReadMoreLabel: { en: 'Read more', ar: 'اقرأ المزيد' },
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

function GalleryPreview({
  ids,
  onMove,
  onRemove,
}: {
  ids: number[]
  onMove: (index: number, direction: -1 | 1) => void
  onRemove: (id: number) => void
}) {
  if (!ids.length) return null
  return (
    <div className={ui.thumbGrid} aria-label="Gallery preview">
      {ids.map((id, index) => (
        <div key={`${id}-${index}`} className={ui.thumbItem}>
          <div className={ui.thumbImageWrap}>
            <img className={ui.thumbImage} src={`/api/uploads/${id}`} alt="" loading="lazy" />
          </div>
          <div className={ui.thumbBar}>
            <span className={ui.thumbMeta}>#{id}</span>
            <div className={ui.thumbButtons}>
              <button
                type="button"
                className={`${ui.thumbButton} ${ui.thumbButtonMuted}`}
                onClick={() => onMove(index, -1)}
                disabled={index === 0}
                aria-disabled={index === 0 ? 'true' : undefined}
                title="Move left"
              >
                ‹
              </button>
              <button
                type="button"
                className={`${ui.thumbButton} ${ui.thumbButtonMuted}`}
                onClick={() => onMove(index, 1)}
                disabled={index === ids.length - 1}
                aria-disabled={index === ids.length - 1 ? 'true' : undefined}
                title="Move right"
              >
                ›
              </button>
              <button type="button" className={`${ui.thumbButton} ${ui.thumbButtonDanger}`} onClick={() => onRemove(id)} title="Remove">
                ×
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
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

const MAX_GALLERY_IMAGES = 30

function mergeUniqueNumbers(existing: number[], added: number[]) {
  const next: number[] = []
  const seen = new Set<number>()
  for (const value of [...existing, ...added]) {
    if (typeof value !== 'number' || !Number.isFinite(value)) continue
    if (seen.has(value)) continue
    seen.add(value)
    next.push(value)
  }
  return next
}

function moveInArray<T>(items: T[], from: number, to: number) {
  const next = items.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

function newEmptyProject(): Project {
  return {
    id: -1,
    slug: '',
    sortOrder: 0,
    published: true,
    showInMenu: true,
    showInGrid: true,
    title: emptyLocalized(),
    sector: emptyLocalized(),
    projectType: emptyLocalized(),
    year: '',
    status: emptyLocalized(),
    client: emptyLocalized(),
    location: emptyLocalized(),
    cost: emptyLocalized(),
    summary: emptyLocalized(),
    details: emptyLocalized(),
    methodology: { en: [], ar: [] },
    galleryUploadIds: [],
  }
}

export default function AdminProjectsPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)

  const [settings, setSettings] = useState<ProjectsSettings>(defaultSettings())
  const [projects, setProjects] = useState<Project[]>([])

  const [settingsErrors, setSettingsErrors] = useState<Record<string, string>>({})
  const [projectErrors, setProjectErrors] = useState<Record<number, Record<string, string>>>({})
  const [newProjectErrors, setNewProjectErrors] = useState<Record<string, string>>({})

  const [savingSettings, setSavingSettings] = useState(false)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const [uploadingNew, setUploadingNew] = useState(false)

  const [newProject, setNewProject] = useState<Project>(() => newEmptyProject())

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

  const uploadFiles = async (files: File[]) => {
    const results = await Promise.allSettled(
      files.map(async (file) => {
        try {
          return await uploadFile(file)
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          const name = file?.name?.trim() ? file.name.trim() : 'file'
          throw new Error(`${name}: ${message}`)
        }
      })
    )

    const ids: number[] = []
    const errors: string[] = []

    for (const result of results) {
      if (result.status === 'fulfilled') {
        if (result.value) ids.push(result.value.id)
        continue
      }

      errors.push(result.reason instanceof Error ? result.reason.message : String(result.reason))
    }

    return { ids, errors }
  }

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setSettingsErrors({})
    setProjectErrors({})
    setNewProjectErrors({})
    try {
      const [sRes, pRes] = await Promise.all([
        fetch('/api/admin/projects/settings', { cache: 'no-store' }),
        fetch('/api/admin/projects', { cache: 'no-store' }),
      ])
      if (sRes.status === 401 || pRes.status === 401) {
        router.replace('/admin/login')
        return
      }
      const [sJson, pJson] = await Promise.all([sRes.json(), pRes.json()])
      setSettings((sJson.settings as ProjectsSettings) ?? defaultSettings())
      setProjects(((pJson.projects as Project[]) ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder || b.id - a.id))
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
      const res = await fetch('/api/admin/projects/seed', { method: 'POST' })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setError((json as any)?.error ?? 'Failed to seed.')
        return
      }
      setSuccess((json as any)?.seededCount ? `Seeded ${String((json as any).seededCount)} project(s).` : 'Seed complete.')
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

    const validated = projectsSettingsSchema.safeParse(settings)
    if (!validated.success) {
      setSettingsErrors(issuesToFieldErrors(validated.error.issues))
      setError('Please fix the highlighted fields.')
      setSavingSettings(false)
      return
    }

    try {
      const res = await fetch('/api/admin/projects/settings', {
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
        setError(
          formatted ? `${(json as any)?.error ?? 'Invalid payload'}\n${formatted}` : (json as any)?.error ?? 'Invalid payload'
        )
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

  const validateProject = (project: Project) => {
    const normalizedSector =
      project.sector?.en?.trim() && project.sector?.ar?.trim()
        ? project.sector
        : {
            en: project.client?.en?.trim() ? project.client.en.trim() : 'General',
            ar: project.client?.ar?.trim() ? project.client.ar.trim() : 'عام',
          }

    const parsed = projectInputSchema.safeParse({ ...project, sector: normalizedSector })
    if (!parsed.success) {
      return {
        ok: false as const,
        issues: issuesToFieldErrors(parsed.error.issues),
        formatted: formatIssues(parsed.error.issues),
      }
    }
    return { ok: true as const, data: parsed.data }
  }

  const persistProject = async (id: number, project: Project, opts?: { successMessage?: string }) => {
    if (savingId) return
    setSavingId(id)
    setError(null)
    setSuccess(null)
    try {
      const validated = validateProject(project)
      if (!validated.ok) {
        setProjectErrors((prev) => ({ ...prev, [id]: validated.issues }))
        setError(validated.formatted ? `Please fix the highlighted fields.\n${validated.formatted}` : 'Please fix the highlighted fields.')
        return
      }

      const res = await fetch(`/api/admin/projects/${id}`, {
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
        setError(
          formatted ? `${(json as any)?.error ?? 'Invalid payload'}\n${formatted}` : (json as any)?.error ?? 'Invalid payload'
        )
        return
      }
      setSuccess(opts?.successMessage ?? 'Project saved.')
      await loadAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save project.')
    } finally {
      setSavingId(null)
    }
  }

  const saveProject = async (id: number) => {
    const project = projects.find((p) => p.id === id)
    if (!project) return
    await persistProject(id, project)
  }

  const deleteProject = async (id: number) => {
    if (deletingId) return
    setDeletingId(id)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
      if (res.status === 401) {
        router.replace('/admin/login')
        return
      }
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        setError((json as any)?.error ?? 'Failed to delete.')
        return
      }
      setSuccess('Project deleted.')
      await loadAll()
    } finally {
      setDeletingId(null)
    }
  }

  const addNewProject = async () => {
    setError(null)
    setSuccess(null)
    setNewProjectErrors({})
    const validated = validateProject(newProject)
    if (!validated.ok) {
      setNewProjectErrors(validated.issues)
      setError(validated.formatted ? `Please fix the highlighted fields.\n${validated.formatted}` : 'Please fix the highlighted fields.')
      return
    }

    try {
      const res = await fetch('/api/admin/projects', {
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
        setError(
          formatted ? `${(json as any)?.error ?? 'Invalid payload'}\n${formatted}` : (json as any)?.error ?? 'Invalid payload'
        )
        return
      }
      setNewProject(newEmptyProject())
      setNewProjectErrors({})
      setSuccess('Project added.')
      await loadAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add project.')
    }
  }

  const uploadGallery = async (projectId: number, files: File[]) => {
    if (!files.length) return
    setError(null)
    setSuccess(null)

    const project = projects.find((p) => p.id === projectId)
    const existingCount = project?.galleryUploadIds?.length ?? 0
    const remaining = Math.max(0, MAX_GALLERY_IMAGES - existingCount)
    if (remaining === 0) {
      setError(`Max ${MAX_GALLERY_IMAGES} images per project. Remove an image to upload more.`)
      return
    }

    const picked = files
    const toUpload = picked.slice(0, remaining)
    const skipped = picked.length - toUpload.length
    if (skipped > 0) {
      setError(`Only ${remaining} more image(s) allowed (max ${MAX_GALLERY_IMAGES}). Skipping ${skipped}.`)
    }

    try {
      setUploadingId(projectId)
      const { ids, errors } = await uploadFiles(toUpload)
      if (ids.length) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? { ...p, galleryUploadIds: mergeUniqueNumbers(p.galleryUploadIds ?? [], ids).slice(0, MAX_GALLERY_IMAGES) }
              : p
          )
        )
        setSuccess(`Uploaded ${ids.length} image(s). Click Save to publish.`)
      }
      if (errors.length) {
        const prefix = ids.length ? 'Some uploads failed:' : 'Upload failed:'
        setError(`${prefix}\n${errors.map((message) => `- ${message}`).join('\n')}`)
      } else if (!ids.length) {
        setError('Upload failed.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setUploadingId((prev) => (prev === projectId ? null : prev))
    }
  }

  const uploadNewGallery = async (files: File[]) => {
    if (!files.length) return
    setError(null)
    setSuccess(null)

    const existingCount = newProject.galleryUploadIds?.length ?? 0
    const remaining = Math.max(0, MAX_GALLERY_IMAGES - existingCount)
    if (remaining === 0) {
      setError(`Max ${MAX_GALLERY_IMAGES} images per project. Remove an image to upload more.`)
      return
    }

    const picked = files
    const toUpload = picked.slice(0, remaining)
    const skipped = picked.length - toUpload.length
    if (skipped > 0) {
      setError(`Only ${remaining} more image(s) allowed (max ${MAX_GALLERY_IMAGES}). Skipping ${skipped}.`)
    }

    try {
      setUploadingNew(true)
      const { ids, errors } = await uploadFiles(toUpload)
      if (ids.length) {
        setNewProject((prev) => ({
          ...prev,
          galleryUploadIds: mergeUniqueNumbers(prev.galleryUploadIds ?? [], ids).slice(0, MAX_GALLERY_IMAGES),
        }))
        setSuccess(`Uploaded ${ids.length} image(s).`)
      }
      if (errors.length) {
        const prefix = ids.length ? 'Some uploads failed:' : 'Upload failed:'
        setError(`${prefix}\n${errors.map((message) => `- ${message}`).join('\n')}`)
      } else if (!ids.length) {
        setError('Upload failed.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setUploadingNew(false)
    }
  }

  const sortedProjects = useMemo(() => projects.slice().sort((a, b) => a.sortOrder - b.sortOrder || b.id - a.id), [projects])

  return (
    <div>
      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>Projects</h2>
            <p className={ui.sectionHint}>Separate Save buttons per section. “Show in menu” controls the header dropdown.</p>
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
          <h3 className={ui.sectionTitle} style={{ fontSize: '1.15rem' }}>
            Homepage featured projects section
          </h3>
          <LocalizedField label="Title" value={settings.homeTitle} onChange={(v) => setSettings((p) => ({ ...p, homeTitle: v }))} required maxLength={200} errors={{ en: settingsErrors['homeTitle.en'], ar: settingsErrors['homeTitle.ar'] }} />
          <LocalizedField label="Subtitle" value={settings.homeSubtitle} onChange={(v) => setSettings((p) => ({ ...p, homeSubtitle: v }))} required maxLength={200} errors={{ en: settingsErrors['homeSubtitle.en'], ar: settingsErrors['homeSubtitle.ar'] }} />
          <LocalizedField label="Show all label" value={settings.homeShowAllLabel} onChange={(v) => setSettings((p) => ({ ...p, homeShowAllLabel: v }))} required maxLength={200} errors={{ en: settingsErrors['homeShowAllLabel.en'], ar: settingsErrors['homeShowAllLabel.ar'] }} />
          <LocalizedField label="Read more label" value={settings.homeReadMoreLabel} onChange={(v) => setSettings((p) => ({ ...p, homeReadMoreLabel: v }))} required maxLength={200} errors={{ en: settingsErrors['homeReadMoreLabel.en'], ar: settingsErrors['homeReadMoreLabel.ar'] }} />
        </div>

        <div style={{ height: 18 }} />

        <div className={ui.card}>
          <h3 className={ui.sectionTitle} style={{ fontSize: '1.15rem' }}>
            /projects page copy
          </h3>
          <LocalizedField label="Page title" value={settings.pageTitle} onChange={(v) => setSettings((p) => ({ ...p, pageTitle: v }))} required maxLength={200} errors={{ en: settingsErrors['pageTitle.en'], ar: settingsErrors['pageTitle.ar'] }} />
          <LocalizedField label="Page intro" value={settings.pageIntro} onChange={(v) => setSettings((p) => ({ ...p, pageIntro: v }))} required textarea maxLength={1200} errors={{ en: settingsErrors['pageIntro.en'], ar: settingsErrors['pageIntro.ar'] }} />
          <div className={ui.gridTwoWide}>
            <LocalizedField label="Grid label (aria)" value={settings.pageGridLabel} onChange={(v) => setSettings((p) => ({ ...p, pageGridLabel: v }))} required maxLength={200} errors={{ en: settingsErrors['pageGridLabel.en'], ar: settingsErrors['pageGridLabel.ar'] }} />
            <LocalizedField label="Client label" value={settings.pageClientLabel} onChange={(v) => setSettings((p) => ({ ...p, pageClientLabel: v }))} required maxLength={200} errors={{ en: settingsErrors['pageClientLabel.en'], ar: settingsErrors['pageClientLabel.ar'] }} />
          </div>
          <LocalizedField label="Read more label" value={settings.pageReadMoreLabel} onChange={(v) => setSettings((p) => ({ ...p, pageReadMoreLabel: v }))} required maxLength={200} errors={{ en: settingsErrors['pageReadMoreLabel.en'], ar: settingsErrors['pageReadMoreLabel.ar'] }} />
        </div>
      </section>

      <section className={ui.section}>
        <div className={ui.sectionTitleRow}>
          <div>
            <h2 className={ui.sectionTitle}>Projects list</h2>
            <p className={ui.sectionHint}>
              Upload images as files (stored locally). Max {MAX_GALLERY_IMAGES} images per project (PNG/JPEG/WebP/AVIF, up to 15MB each). Save each project to publish changes.
            </p>
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

        <div className={ui.card}>
          <h3 className={ui.sectionTitle} style={{ fontSize: '1.15rem' }}>
            Add new project
          </h3>

          <div className={ui.gridTwoWide}>
            <div className={ui.field}>
              <label className={ui.label}>Slug</label>
              <input
                className={ui.input}
                value={newProject.slug}
                onChange={(e) => setNewProject((p) => ({ ...p, slug: e.target.value }))}
                placeholder="my-project-slug"
                aria-invalid={newProjectErrors.slug ? 'true' : undefined}
                style={newProjectErrors.slug ? ({ borderColor: 'rgba(248,113,113,0.9)' } as const) : undefined}
              />
              {newProjectErrors.slug && (
                <p className={ui.sectionHint} style={{ marginTop: 6, color: 'rgba(248,113,113,0.95)' }}>
                  {newProjectErrors.slug}
                </p>
              )}
              <p className={ui.sectionHint} style={{ margin: 0 }}>
                Leave blank to auto-generate from the English title.
              </p>
            </div>
            <div className={ui.field}>
              <label className={ui.label}>Year</label>
              <input
                className={ui.input}
                value={newProject.year}
                onChange={(e) => setNewProject((p) => ({ ...p, year: e.target.value }))}
                placeholder="2026"
                aria-invalid={newProjectErrors.year ? 'true' : undefined}
                style={newProjectErrors.year ? ({ borderColor: 'rgba(248,113,113,0.9)' } as const) : undefined}
              />
              {newProjectErrors.year && (
                <p className={ui.sectionHint} style={{ marginTop: 6, color: 'rgba(248,113,113,0.95)' }}>
                  {newProjectErrors.year}
                </p>
              )}
            </div>
          </div>

          <div className={ui.gridTwoWide}>
            <div className={ui.field}>
              <label className={ui.label}>Sort order</label>
              <input
                className={ui.input}
                type="number"
                value={newProject.sortOrder}
                onChange={(e) => setNewProject((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                aria-invalid={newProjectErrors.sortOrder ? 'true' : undefined}
                style={newProjectErrors.sortOrder ? ({ borderColor: 'rgba(248,113,113,0.9)' } as const) : undefined}
              />
              {newProjectErrors.sortOrder && (
                <p className={ui.sectionHint} style={{ marginTop: 6, color: 'rgba(248,113,113,0.95)' }}>
                  {newProjectErrors.sortOrder}
                </p>
              )}
            </div>
            <div className={ui.field}>
              <label className={ui.label}>Flags</label>
              <div className={ui.toolbar} style={{ justifyContent: 'flex-start' }}>
                <label className={ui.label}>
                  <input type="checkbox" checked={newProject.published} onChange={(e) => setNewProject((p) => ({ ...p, published: e.target.checked }))} /> Published
                </label>
                <label className={ui.label}>
                  <input type="checkbox" checked={newProject.showInMenu} onChange={(e) => setNewProject((p) => ({ ...p, showInMenu: e.target.checked }))} /> Show in menu
                </label>
                <label className={ui.label}>
                  <input type="checkbox" checked={newProject.showInGrid} onChange={(e) => setNewProject((p) => ({ ...p, showInGrid: e.target.checked }))} /> Show in grid
                </label>
              </div>
            </div>
          </div>

          <LocalizedField
            label="Title"
            value={newProject.title}
            onChange={(v) => {
              setNewProject((p) => {
                const nextSlug = p.slug.trim().length ? p.slug : slugifyClient(v.en)
                return { ...p, title: v, slug: nextSlug }
              })
            }}
            required
            maxLength={200}
            errors={{ en: newProjectErrors['title.en'], ar: newProjectErrors['title.ar'] }}
          />
          <div className={ui.gridTwoWide}>
            <LocalizedField label="Project type" value={newProject.projectType} onChange={(v) => setNewProject((p) => ({ ...p, projectType: v }))} required maxLength={200} errors={{ en: newProjectErrors['projectType.en'], ar: newProjectErrors['projectType.ar'] }} />
            <LocalizedField label="Status" value={newProject.status} onChange={(v) => setNewProject((p) => ({ ...p, status: v }))} required maxLength={200} errors={{ en: newProjectErrors['status.en'], ar: newProjectErrors['status.ar'] }} />
          </div>

          <div className={ui.gridTwoWide}>
            <LocalizedField label="Client" value={newProject.client} onChange={(v) => setNewProject((p) => ({ ...p, client: v }))} required maxLength={200} errors={{ en: newProjectErrors['client.en'], ar: newProjectErrors['client.ar'] }} />
            <LocalizedField label="Location" value={newProject.location} onChange={(v) => setNewProject((p) => ({ ...p, location: v }))} required maxLength={200} errors={{ en: newProjectErrors['location.en'], ar: newProjectErrors['location.ar'] }} />
          </div>

          <LocalizedField label="Cost" value={newProject.cost} onChange={(v) => setNewProject((p) => ({ ...p, cost: v }))} required maxLength={200} errors={{ en: newProjectErrors['cost.en'], ar: newProjectErrors['cost.ar'] }} />

          <LocalizedField label="Summary" value={newProject.summary} onChange={(v) => setNewProject((p) => ({ ...p, summary: v }))} required textarea maxLength={1200} errors={{ en: newProjectErrors['summary.en'], ar: newProjectErrors['summary.ar'] }} />
          <LocalizedField label="Details" value={newProject.details} onChange={(v) => setNewProject((p) => ({ ...p, details: v }))} required textarea maxLength={8000} errors={{ en: newProjectErrors['details.en'], ar: newProjectErrors['details.ar'] }} />

          <div className={ui.gridTwoWide}>
            <div className={ui.field}>
              <label className={ui.label}>Methodology (EN, one per line)</label>
              <textarea className={ui.textarea} value={textAreaList(newProject.methodology.en)} onChange={(e) => setNewProject((p) => ({ ...p, methodology: { ...p.methodology, en: parseTextAreaList(e.target.value) } }))} />
            </div>
            <div className={ui.field}>
              <label className={ui.label}>Methodology (AR, one per line)</label>
              <textarea dir="rtl" className={ui.textarea} value={textAreaList(newProject.methodology.ar)} onChange={(e) => setNewProject((p) => ({ ...p, methodology: { ...p.methodology, ar: parseTextAreaList(e.target.value) } }))} />
            </div>
          </div>

          <div className={ui.field}>
            <label className={ui.label}>Gallery images</label>
            <input
              className={ui.input}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              multiple
              disabled={uploadingNew || newProject.galleryUploadIds.length >= MAX_GALLERY_IMAGES}
              onChange={(e) => {
                const files = Array.from(e.currentTarget.files ?? [])
                e.currentTarget.value = ''
                uploadNewGallery(files)
              }}
            />
            <p className={ui.sectionHint} style={{ margin: 0 }}>
              {uploadingNew
                ? 'Uploading…'
                : `Uploaded: ${newProject.galleryUploadIds.length} / ${MAX_GALLERY_IMAGES} (saved when you add the project)`}
            </p>
            <GalleryPreview
              ids={newProject.galleryUploadIds}
              onMove={(index, direction) =>
                setNewProject((prev) => {
                  const ids = prev.galleryUploadIds ?? []
                  const to = index + direction
                  if (to < 0 || to >= ids.length) return prev
                  return { ...prev, galleryUploadIds: moveInArray(ids, index, to) }
                })
              }
              onRemove={(id) => setNewProject((prev) => ({ ...prev, galleryUploadIds: (prev.galleryUploadIds ?? []).filter((x) => x !== id) }))}
            />
          </div>

          <div className={ui.toolbar} style={{ justifyContent: 'flex-end' }}>
            <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={addNewProject}>
              Add project
            </button>
          </div>
        </div>

        <div style={{ height: 18 }} />

        {!loading && projects.length === 0 && (
          <div className={ui.card}>
            <p className={ui.sectionHint} style={{ margin: 0 }}>
              No projects saved in the database yet. The public site will fall back to the built-in template.
            </p>
            <div style={{ height: 10 }} />
            <p className={ui.sectionHint} style={{ margin: 0 }}>
              Template projects (preview):
            </p>
            <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
              {staticProjects.slice(0, 8).map((p) => (
                <li key={p.slug} className={ui.sectionHint} style={{ margin: '6px 0' }}>
                  {p.title.en} <span style={{ opacity: 0.7 }}>({p.slug})</span>
                </li>
              ))}
            </ul>
            {staticProjects.length > 8 && (
              <p className={ui.sectionHint} style={{ marginTop: 8 }}>
                …and {staticProjects.length - 8} more.
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className={ui.card}>
            <p className={ui.sectionHint} style={{ margin: 0 }}>
              Loading…
            </p>
          </div>
        ) : (
          <div className={ui.items}>
            {sortedProjects.map((project) => {
              const errs = projectErrors[project.id] ?? {}
              return (
                <div key={project.id} className={ui.card}>
                  <div className={ui.itemHeader}>
                    <div>
                      <h3 className={ui.itemTitle}>
                        {project.title.en || project.slug} <span style={{ opacity: 0.6 }}>#{project.id}</span>
                      </h3>
                      <p className={ui.itemMeta}>
                        Slug: <code>{project.slug}</code> · Sort: {project.sortOrder} · {project.published ? 'Published' : 'Draft'} ·{' '}
                        {project.showInMenu ? 'In menu' : 'Not in menu'} · {project.showInGrid ? 'In grid' : 'Table only'} · Images: {project.galleryUploadIds.length}
                      </p>
                    </div>
                    <div className={ui.itemActions}>
                      <button type="button" className={`${ui.button} ${ui.buttonPrimary}`} onClick={() => saveProject(project.id)} aria-disabled={savingId === project.id ? 'true' : 'false'}>
                        {savingId === project.id ? 'Saving…' : 'Save'}
                      </button>
                      <button type="button" className={`${ui.button} ${ui.buttonDanger}`} onClick={() => deleteProject(project.id)} aria-disabled={deletingId === project.id ? 'true' : 'false'}>
                        {deletingId === project.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>

                  <div className={ui.gridTwoWide}>
                    <div className={ui.field}>
                      <label className={ui.label}>Slug</label>
                      <input
                        className={ui.input}
                        value={project.slug}
                        onChange={(e) => setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, slug: e.target.value } : p)))}
                        aria-invalid={errs.slug ? 'true' : undefined}
                        style={errs.slug ? ({ borderColor: 'rgba(248,113,113,0.9)' } as const) : undefined}
                      />
                      {errs.slug && (
                        <p className={ui.sectionHint} style={{ marginTop: 6, color: 'rgba(248,113,113,0.95)' }}>
                          {errs.slug}
                        </p>
                      )}
                    </div>
                    <div className={ui.field}>
                      <label className={ui.label}>Year</label>
                      <input className={ui.input} value={project.year} onChange={(e) => setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, year: e.target.value } : p)))} />
                    </div>
                  </div>

                  <div className={ui.gridTwoWide}>
                    <div className={ui.field}>
                      <label className={ui.label}>Sort order</label>
                      <input className={ui.input} type="number" value={project.sortOrder} onChange={(e) => setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, sortOrder: Number(e.target.value) } : p)))} />
                    </div>
                    <div className={ui.field}>
                      <label className={ui.label}>Flags</label>
                      <div className={ui.toolbar} style={{ justifyContent: 'flex-start' }}>
                        <label className={ui.label}>
                          <input type="checkbox" checked={project.published} onChange={(e) => setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, published: e.target.checked } : p)))} /> Published
                        </label>
                        <label className={ui.label}>
                          <input type="checkbox" checked={project.showInMenu} onChange={(e) => setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, showInMenu: e.target.checked } : p)))} /> Show in menu
                        </label>
                        <label className={ui.label}>
                          <input type="checkbox" checked={project.showInGrid} onChange={(e) => setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, showInGrid: e.target.checked } : p)))} /> Show in grid
                        </label>
                      </div>
                    </div>
                  </div>

                  <LocalizedField
                    label="Title"
                    value={project.title}
                    onChange={(v) =>
                      setProjects((prev) =>
                        prev.map((p) => {
                          if (p.id !== project.id) return p
                          const nextSlug = p.slug.trim().length ? p.slug : slugifyClient(v.en)
                          return { ...p, title: v, slug: nextSlug }
                        })
                      )
                    }
                    required
                    maxLength={200}
                    errors={{ en: errs['title.en'], ar: errs['title.ar'] }}
                  />
                  <div className={ui.gridTwoWide}>
                    <LocalizedField label="Project type" value={project.projectType} onChange={(v) => setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, projectType: v } : p)))} required maxLength={200} errors={{ en: errs['projectType.en'], ar: errs['projectType.ar'] }} />
                    <LocalizedField label="Status" value={project.status} onChange={(v) => setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, status: v } : p)))} required maxLength={200} errors={{ en: errs['status.en'], ar: errs['status.ar'] }} />
                  </div>
                  <div className={ui.gridTwoWide}>
                    <LocalizedField label="Client" value={project.client} onChange={(v) => setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, client: v } : p)))} required maxLength={200} errors={{ en: errs['client.en'], ar: errs['client.ar'] }} />
                    <LocalizedField label="Location" value={project.location} onChange={(v) => setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, location: v } : p)))} required maxLength={200} errors={{ en: errs['location.en'], ar: errs['location.ar'] }} />
                  </div>
                  <LocalizedField label="Cost" value={project.cost} onChange={(v) => setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, cost: v } : p)))} required maxLength={200} errors={{ en: errs['cost.en'], ar: errs['cost.ar'] }} />

                  <LocalizedField label="Summary" value={project.summary} onChange={(v) => setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, summary: v } : p)))} required textarea maxLength={1200} errors={{ en: errs['summary.en'], ar: errs['summary.ar'] }} />
                  <LocalizedField label="Details" value={project.details} onChange={(v) => setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, details: v } : p)))} required textarea maxLength={8000} errors={{ en: errs['details.en'], ar: errs['details.ar'] }} />

                  <div className={ui.gridTwoWide}>
                    <div className={ui.field}>
                      <label className={ui.label}>Methodology (EN, one per line)</label>
                      <textarea className={ui.textarea} value={textAreaList(project.methodology.en)} onChange={(e) => setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, methodology: { ...p.methodology, en: parseTextAreaList(e.target.value) } } : p)))} />
                    </div>
                    <div className={ui.field}>
                      <label className={ui.label}>Methodology (AR, one per line)</label>
                      <textarea dir="rtl" className={ui.textarea} value={textAreaList(project.methodology.ar)} onChange={(e) => setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, methodology: { ...p.methodology, ar: parseTextAreaList(e.target.value) } } : p)))} />
                    </div>
                  </div>

                  <div className={ui.field}>
                    <label className={ui.label}>Gallery images</label>
                    <input
                      className={ui.input}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      multiple
                      disabled={uploadingId === project.id || project.galleryUploadIds.length >= MAX_GALLERY_IMAGES}
                      onChange={(e) => {
                        const files = Array.from(e.currentTarget.files ?? [])
                        e.currentTarget.value = ''
                        uploadGallery(project.id, files)
                      }}
                    />
                    <p className={ui.sectionHint} style={{ margin: 0 }}>
                      {uploadingId === project.id
                        ? 'Uploading…'
                        : `Uploaded: ${project.galleryUploadIds.length} / ${MAX_GALLERY_IMAGES} (click Save to publish)`}
                    </p>
                    <GalleryPreview
                      ids={project.galleryUploadIds}
                      onMove={(index, direction) =>
                        setProjects((prev) =>
                          prev.map((p) => {
                            if (p.id !== project.id) return p
                            const ids = p.galleryUploadIds ?? []
                            const to = index + direction
                            if (to < 0 || to >= ids.length) return p
                            return { ...p, galleryUploadIds: moveInArray(ids, index, to) }
                          })
                        )
                      }
                      onRemove={(id) =>
                        setProjects((prev) =>
                          prev.map((p) => (p.id === project.id ? { ...p, galleryUploadIds: (p.galleryUploadIds ?? []).filter((x) => x !== id) } : p))
                        )
                      }
                    />
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
