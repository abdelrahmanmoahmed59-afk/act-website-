import 'server-only'

import { z } from 'zod'

import type { Language } from '@/lib/i18n/base-translations'
import { projectsTemplateInputs } from '@/lib/content/projects-template'
import { readOrInitJsonFile, withFileLock, writeJsonFile } from '@/lib/server/file-store'
import type { ProjectInput, ProjectsSettingsInput } from '@/lib/validation/projects'

export type ProjectsSettingsI18n = ProjectsSettingsInput

export type ProjectI18n = ProjectInput & {
  id: number
  images: string[]
}

export type LocalizedProject = {
  id: number
  slug: string
  sortOrder: number
  title: string
  sector: string
  projectType: string
  year: string
  status: string
  client: string
  location: string
  cost: string
  summary: string
  details: string
  methodology: string[]
  images: string[]
  published: boolean
  showInMenu: boolean
}

type ProjectsStore = {
  settings: ProjectsSettingsI18n | null
  projects: ProjectI18n[]
  nextId: number
  updatedAt: string
}

const STORE_PATH = 'content/projects.json'

const defaultSettings: ProjectsSettingsI18n = {
  homeTitle: { en: 'Featured projects', ar: 'أبرز المشاريع' },
  homeSubtitle: { en: 'A selection of work delivered across Kuwait.', ar: 'مختارات من أعمالنا المنفذة في الكويت.' },
  homeShowAllLabel: { en: 'Show all projects', ar: 'عرض كل المشاريع' },
  homeReadMoreLabel: { en: 'Read more', ar: 'اقرأ المزيد' },
  pageTitle: { en: 'Projects', ar: 'المشاريع' },
  pageIntro: {
    en: 'Explore delivery highlights, project context, and outcomes across sectors. Use the filters to find relevant references.',
    ar: 'استعرض أبرز الأعمال وسياق المشاريع والنتائج عبر القطاعات. استخدم عوامل التصفية للوصول إلى المراجع المناسبة.',
  },
  pageGridLabel: { en: 'Projects grid', ar: 'شبكة المشاريع' },
  pageClientLabel: { en: 'Client', ar: 'العميل' },
  pageReadMoreLabel: { en: 'Read more', ar: 'اقرأ المزيد' },
}

const uploadIdList = z.array(z.coerce.number().int().positive()).default([])

function galleryIdsToUrls(ids: number[]): string[] {
  if (!ids.length) return ['/placeholder.jpg']
  return ids.map((id) => `/api/uploads/${id}`)
}

function normalizeGalleryIds(value: unknown): number[] {
  if (Array.isArray(value)) return uploadIdList.parse(value)
  if (typeof value === 'string') {
    try {
      return uploadIdList.parse(JSON.parse(value))
    } catch {
      return uploadIdList.parse(value)
    }
  }
  return uploadIdList.parse(value)
}

function initStore(): ProjectsStore {
  const projects: ProjectI18n[] = projectsTemplateInputs.map((input, index) => {
    const galleryUploadIds = normalizeGalleryIds(input.galleryUploadIds)
    return {
      ...input,
      id: index + 1,
      galleryUploadIds,
      images: galleryIdsToUrls(galleryUploadIds),
    }
  })

  return {
    settings: defaultSettings,
    projects,
    nextId: projects.length + 1,
    updatedAt: new Date().toISOString(),
  }
}

async function readStore() {
  return readOrInitJsonFile<ProjectsStore>(STORE_PATH, initStore)
}

function sortProjects(projects: ProjectI18n[]) {
  return [...projects].sort((a, b) => (a.sortOrder - b.sortOrder) || (b.id - a.id))
}

export function localizeSettings(settings: ProjectsSettingsI18n, lang: Language) {
  return {
    homeTitle: settings.homeTitle[lang],
    homeSubtitle: settings.homeSubtitle[lang],
    homeShowAllLabel: settings.homeShowAllLabel[lang],
    homeReadMoreLabel: settings.homeReadMoreLabel[lang],
    pageTitle: settings.pageTitle[lang],
    pageIntro: settings.pageIntro[lang],
    pageGridLabel: settings.pageGridLabel[lang],
    pageClientLabel: settings.pageClientLabel[lang],
    pageReadMoreLabel: settings.pageReadMoreLabel[lang],
  }
}

export function localizeProject(project: ProjectI18n, lang: Language): LocalizedProject {
  return {
    id: project.id,
    slug: project.slug,
    sortOrder: project.sortOrder,
    published: project.published,
    showInMenu: project.showInMenu,
    title: project.title[lang],
    sector: project.sector[lang],
    projectType: project.projectType[lang],
    year: project.year,
    status: project.status[lang],
    client: project.client[lang],
    location: project.location[lang],
    cost: project.cost[lang],
    summary: project.summary[lang],
    details: project.details[lang],
    methodology: project.methodology[lang] ?? [],
    images: project.images ?? galleryIdsToUrls(normalizeGalleryIds(project.galleryUploadIds)),
  }
}

export async function getProjectsSettings(): Promise<ProjectsSettingsI18n | null> {
  const store = await readStore()
  return store.settings ?? null
}

export async function upsertProjectsSettings(settings: ProjectsSettingsI18n): Promise<ProjectsSettingsI18n> {
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    const next: ProjectsStore = { ...store, settings, updatedAt: new Date().toISOString() }
    await writeJsonFile(STORE_PATH, next)
    return settings
  })
}

export async function listProjects(opts?: { publishedOnly?: boolean; menuOnly?: boolean; limit?: number }): Promise<ProjectI18n[]> {
  const store = await readStore()
  const publishedOnly = opts?.publishedOnly ?? true
  const menuOnly = opts?.menuOnly ?? false
  const limit = typeof opts?.limit === 'number' ? Math.max(1, Math.min(200, opts.limit)) : null
  const items = sortProjects(store.projects ?? [])
    .filter((p) => (publishedOnly ? p.published : true))
    .filter((p) => (menuOnly ? p.showInMenu : true))
    .map((p) => ({ ...p, images: p.images ?? galleryIdsToUrls(normalizeGalleryIds(p.galleryUploadIds)) }))
  return typeof limit === 'number' ? items.slice(0, limit) : items
}

export async function getProjectBySlug(slug: string, opts?: { publishedOnly?: boolean }): Promise<ProjectI18n | null> {
  const store = await readStore()
  const publishedOnly = opts?.publishedOnly ?? true
  const wanted = slug.trim()
  if (!wanted) return null
  const project = store.projects.find((p) => p.slug === wanted) ?? null
  if (!project) return null
  if (publishedOnly && !project.published) return null
  return { ...project, images: project.images ?? galleryIdsToUrls(normalizeGalleryIds(project.galleryUploadIds)) }
}

export async function getProjectById(id: number): Promise<ProjectI18n | null> {
  const store = await readStore()
  const project = store.projects.find((p) => p.id === id) ?? null
  if (!project) return null
  return { ...project, images: project.images ?? galleryIdsToUrls(normalizeGalleryIds(project.galleryUploadIds)) }
}

export async function createProject(input: ProjectInput): Promise<ProjectI18n> {
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    if (store.projects.some((p) => p.slug === input.slug)) throw new Error('Slug already exists')
    const id = Math.max(1, Math.floor(store.nextId || 1))
    const galleryUploadIds = normalizeGalleryIds(input.galleryUploadIds)
    const created: ProjectI18n = { id, ...input, galleryUploadIds, images: galleryIdsToUrls(galleryUploadIds) }
    const next: ProjectsStore = {
      ...store,
      projects: [...store.projects, created],
      nextId: id + 1,
      updatedAt: new Date().toISOString(),
    }
    await writeJsonFile(STORE_PATH, next)
    return created
  })
}

export async function updateProject(id: number, input: ProjectInput): Promise<ProjectI18n | null> {
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    const index = store.projects.findIndex((p) => p.id === id)
    if (index < 0) return null
    if (store.projects.some((p) => p.slug === input.slug && p.id !== id)) throw new Error('Slug already exists')
    const galleryUploadIds = normalizeGalleryIds(input.galleryUploadIds)
    const updated: ProjectI18n = { id, ...input, galleryUploadIds, images: galleryIdsToUrls(galleryUploadIds) }
    const projects = [...store.projects]
    projects[index] = updated
    const next: ProjectsStore = { ...store, projects, updatedAt: new Date().toISOString() }
    await writeJsonFile(STORE_PATH, next)
    return updated
  })
}

export async function deleteProject(id: number): Promise<boolean> {
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    const before = store.projects.length
    const projects = store.projects.filter((p) => p.id !== id)
    const deleted = projects.length !== before
    const next: ProjectsStore = { ...store, projects, updatedAt: new Date().toISOString() }
    await writeJsonFile(STORE_PATH, next)
    return deleted
  })
}
