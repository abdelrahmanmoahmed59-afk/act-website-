import 'server-only'

import { z } from 'zod'

import { pagesTemplates } from '@/lib/content/pages/templates'
import { readOrInitJsonFile, withFileLock, writeJsonFile } from '@/lib/server/file-store'

export const pageContentSchema = z.object({
  en: z.record(z.any()).default({}),
  ar: z.record(z.any()).default({}),
})

export type PageContent = z.infer<typeof pageContentSchema>

type PagesStore = {
  pages: Record<string, PageContent>
  updatedAt: string
}

const STORE_PATH = 'content/pages.json'

function initStore(): PagesStore {
  return { pages: {}, updatedAt: new Date().toISOString() }
}

async function readStore() {
  return readOrInitJsonFile<PagesStore>(STORE_PATH, initStore)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function deepMerge(base: unknown, patch: unknown): unknown {
  if (Array.isArray(base) || Array.isArray(patch)) return patch
  if (!isPlainObject(base) || !isPlainObject(patch)) return patch

  const next: Record<string, unknown> = { ...base }
  for (const [key, patchValue] of Object.entries(patch)) {
    const baseValue = (base as Record<string, unknown>)[key]
    next[key] = key in base ? deepMerge(baseValue, patchValue) : patchValue
  }
  return next
}

function getTemplateForKey(key: string): PageContent {
  const template = (pagesTemplates as any)[key] ?? { en: {}, ar: {} }
  return pageContentSchema.parse(template)
}

export async function getPageContent(key: string): Promise<PageContent | null> {
  const store = await readStore()
  const existing = store.pages[key]
  if (existing) return pageContentSchema.parse(existing)

  // Initialize missing pages from template (so the JSON file becomes the source of truth).
  const seeded = getTemplateForKey(key)
  await withFileLock(STORE_PATH, async () => {
    const current = await readStore()
    if (current.pages[key]) return
    const next: PagesStore = {
      ...current,
      pages: { ...current.pages, [key]: seeded },
      updatedAt: new Date().toISOString(),
    }
    await writeJsonFile(STORE_PATH, next)
  })
  return seeded
}

export async function upsertPageContent(key: string, content: PageContent): Promise<PageContent> {
  const parsed = pageContentSchema.parse(content)
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    const next: PagesStore = {
      ...store,
      pages: { ...store.pages, [key]: parsed },
      updatedAt: new Date().toISOString(),
    }
    await writeJsonFile(STORE_PATH, next)
    return parsed
  })
}

export async function patchPageContent(key: string, patch: Partial<PageContent>): Promise<PageContent> {
  const base = (await getPageContent(key)) ?? pageContentSchema.parse({})
  const next = deepMerge(base, patch) as PageContent
  return upsertPageContent(key, next)
}
