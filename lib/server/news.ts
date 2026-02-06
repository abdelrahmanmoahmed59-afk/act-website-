import 'server-only'

import type { Language } from '@/lib/i18n/base-translations'
import { newsTemplateItems, newsTemplateSettings } from '@/lib/content/news-template'
import { readOrInitJsonFile, withFileLock, writeJsonFile } from '@/lib/server/file-store'
import { slugify, withSlugSuffix } from '@/lib/server/slug'

export type NewsSettingsI18n = {
  title: Record<Language, string>
  intro: Record<Language, string>
  filterLabel: Record<Language, string>
  allLabel: Record<Language, string>
  readMore: Record<Language, string>
  close: Record<Language, string>
  contactTitle: Record<Language, string>
  contactDesc: Record<Language, string>
  contactEmail: string
  contactButton: Record<Language, string>
}

export type NewsItemI18n = {
  id: number
  slug: string | null
  sortOrder: number
  title: Record<Language, string>
  dateLabel: Record<Language, string>
  category: Record<Language, string>
  excerpt: Record<Language, string>
  imageUploadId: number | null
  imageUrl: string
}

export type LocalizedNewsItem = {
  id: number
  slug: string | null
  sortOrder: number
  title: string
  dateLabel: string
  category: string
  excerpt: string
  image: string
}

type NewsStore = {
  settings: NewsSettingsI18n
  items: NewsItemI18n[]
  nextId: number
  updatedAt: string
}

const STORE_PATH = 'content/news.json'

function initStore(): NewsStore {
  const items: NewsItemI18n[] = newsTemplateItems.map((seed, index) => {
    const id = index + 1
    const base = slugify(seed.title.en) || slugify(seed.title.ar) || `news-item-${id}`
    return {
      id,
      slug: withSlugSuffix(base, 0, 120) || `news-item-${id}`,
      sortOrder: seed.sortOrder,
      title: seed.title,
      dateLabel: seed.dateLabel,
      category: seed.category,
      excerpt: seed.excerpt,
      imageUploadId: null,
      imageUrl: seed.imageUrl || '/placeholder.jpg',
    }
  })

  return {
    settings: {
      title: newsTemplateSettings.title,
      intro: newsTemplateSettings.intro,
      filterLabel: newsTemplateSettings.filterLabel,
      allLabel: newsTemplateSettings.allLabel,
      readMore: newsTemplateSettings.readMore,
      close: newsTemplateSettings.close,
      contactTitle: newsTemplateSettings.contactTitle,
      contactDesc: newsTemplateSettings.contactDesc,
      contactEmail: newsTemplateSettings.contactEmail,
      contactButton: newsTemplateSettings.contactButton,
    },
    items,
    nextId: items.length + 1,
    updatedAt: new Date().toISOString(),
  }
}

async function readStore(): Promise<NewsStore> {
  return readOrInitJsonFile<NewsStore>(STORE_PATH, initStore)
}

function sortItems(items: NewsItemI18n[]) {
  return [...items].sort((a, b) => (a.sortOrder - b.sortOrder) || (b.id - a.id))
}

function ensureUniqueSlug(input: { preferred: string; existing: NewsItemI18n[]; excludeId?: number }) {
  const base = input.preferred.slice(0, 120) || 'news-item'
  const used = new Set(
    input.existing
      .filter((i) => (input.excludeId ? i.id !== input.excludeId : true))
      .map((i) => i.slug)
      .filter((s): s is string => Boolean(s))
  )

  for (let suffix = 0; suffix < 200; suffix++) {
    const candidate = withSlugSuffix(base, suffix, 120)
    if (!candidate) continue
    if (!used.has(candidate)) return candidate
  }
  return `${base}-${Date.now()}`
}

export function localizeNewsItem(item: NewsItemI18n, lang: Language): LocalizedNewsItem {
  return {
    id: item.id,
    slug: item.slug,
    sortOrder: item.sortOrder,
    title: item.title[lang],
    dateLabel: item.dateLabel[lang],
    category: item.category[lang],
    excerpt: item.excerpt[lang],
    image: item.imageUploadId ? `/api/uploads/${item.imageUploadId}` : item.imageUrl,
  }
}

export function localizeNewsSettings(settings: NewsSettingsI18n, lang: Language) {
  return {
    title: settings.title[lang],
    intro: settings.intro[lang],
    filterLabel: settings.filterLabel[lang],
    allLabel: settings.allLabel[lang],
    readMore: settings.readMore[lang],
    close: settings.close[lang],
    contactTitle: settings.contactTitle[lang],
    contactDesc: settings.contactDesc[lang],
    contactEmail: settings.contactEmail,
    contactButton: settings.contactButton[lang],
  }
}

export async function getNewsSettings(): Promise<NewsSettingsI18n | null> {
  const store = await readStore()
  return store.settings ?? null
}

export async function upsertNewsSettings(settings: NewsSettingsI18n): Promise<NewsSettingsI18n> {
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    const next: NewsStore = { ...store, settings, updatedAt: new Date().toISOString() }
    await writeJsonFile(STORE_PATH, next)
    return next.settings
  })
}

export async function listNewsItems(): Promise<NewsItemI18n[]> {
  const store = await readStore()
  return sortItems(store.items ?? [])
}

export async function getNewsItemBySlug(slug: string): Promise<NewsItemI18n | null> {
  const store = await readStore()
  const wanted = slug.trim()
  if (!wanted) return null
  return store.items.find((i) => i.slug === wanted) ?? null
}

export async function createNewsItem(item: Omit<NewsItemI18n, 'id'>): Promise<NewsItemI18n> {
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    const id = Math.max(1, Math.floor(store.nextId || 1))
    const preferredBase =
      item.slug?.trim() ||
      slugify(item.title.en) ||
      slugify(item.title.ar) ||
      `news-item-${id}`
    const preferred = slugify(preferredBase) || `news-item-${id}`
    const uniqueSlug = ensureUniqueSlug({ preferred, existing: store.items })

    const created: NewsItemI18n = {
      id,
      slug: uniqueSlug,
      sortOrder: item.sortOrder,
      title: item.title,
      dateLabel: item.dateLabel,
      category: item.category,
      excerpt: item.excerpt,
      imageUploadId: item.imageUploadId ?? null,
      imageUrl: item.imageUrl || '/placeholder.jpg',
    }

    const next: NewsStore = {
      ...store,
      items: [...store.items, created],
      nextId: id + 1,
      updatedAt: new Date().toISOString(),
    }
    await writeJsonFile(STORE_PATH, next)
    return created
  })
}

export async function updateNewsItem(id: number, item: Omit<NewsItemI18n, 'id'>): Promise<NewsItemI18n | null> {
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    const index = store.items.findIndex((i) => i.id === id)
    if (index < 0) return null
    const existing = store.items[index]

    const maybeSlug = item.slug && item.slug.trim().length ? slugify(item.slug) : null
    const nextSlug = maybeSlug ? ensureUniqueSlug({ preferred: maybeSlug, existing: store.items, excludeId: id }) : existing.slug

    const updated: NewsItemI18n = {
      ...existing,
      slug: nextSlug ?? existing.slug,
      sortOrder: item.sortOrder,
      title: item.title,
      dateLabel: item.dateLabel,
      category: item.category,
      excerpt: item.excerpt,
      imageUploadId: item.imageUploadId ?? null,
      imageUrl: item.imageUrl || existing.imageUrl || '/placeholder.jpg',
    }

    const items = [...store.items]
    items[index] = updated
    const next: NewsStore = { ...store, items, updatedAt: new Date().toISOString() }
    await writeJsonFile(STORE_PATH, next)
    return updated
  })
}

export async function deleteNewsItem(id: number): Promise<boolean> {
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    const before = store.items.length
    const items = store.items.filter((i) => i.id !== id)
    const deleted = items.length !== before
    const next: NewsStore = { ...store, items, updatedAt: new Date().toISOString() }
    await writeJsonFile(STORE_PATH, next)
    return deleted
  })
}
