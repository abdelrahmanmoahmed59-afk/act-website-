import 'server-only'

import type { Language } from '@/lib/i18n/base-translations'
import { mediaTemplateItems, mediaTemplateSettings } from '@/lib/content/media-template'
import { readOrInitJsonFile, withFileLock, writeJsonFile } from '@/lib/server/file-store'
import type { MediaItemInput, MediaSettingsInput } from '@/lib/validation/media'

export type MediaSettingsI18n = MediaSettingsInput

export type MediaItemI18n = MediaItemInput & {
  id: number
  imageUrl: string
}

export type LocalizedMediaItem = {
  id: number
  sortOrder: number
  published: boolean
  type: 'video' | 'photo' | 'press'
  title: string
  dateLabel: string
  description: string
  linkUrl: string
  imageUploadId: number | null
  imageUrl: string
}

type MediaStore = {
  settings: MediaSettingsI18n
  items: MediaItemI18n[]
  nextId: number
  updatedAt: string
}

const STORE_PATH = 'content/media.json'

function initStore(): MediaStore {
  const items: MediaItemI18n[] = mediaTemplateItems.map((seed, index) => ({
    id: index + 1,
    sortOrder: seed.sortOrder,
    published: seed.published,
    type: seed.type,
    title: seed.title,
    dateLabel: seed.dateLabel,
    description: seed.description,
    linkUrl: seed.linkUrl,
    imageUploadId: seed.imageUploadId ?? null,
    imageUrl: seed.imageUploadId ? `/api/uploads/${seed.imageUploadId}` : '/placeholder.jpg',
  }))

  return {
    settings: mediaTemplateSettings,
    items,
    nextId: items.length + 1,
    updatedAt: new Date().toISOString(),
  }
}

async function readStore() {
  return readOrInitJsonFile<MediaStore>(STORE_PATH, initStore)
}

function sortItems(items: MediaItemI18n[]) {
  return [...items].sort((a, b) => (a.sortOrder - b.sortOrder) || (b.id - a.id))
}

export function localizeMediaItem(item: MediaItemI18n, lang: Language): LocalizedMediaItem {
  return {
    id: item.id,
    sortOrder: item.sortOrder,
    published: item.published,
    type: item.type,
    title: item.title[lang],
    dateLabel: item.dateLabel[lang],
    description: item.description[lang],
    linkUrl: item.linkUrl,
    imageUploadId: item.imageUploadId ?? null,
    imageUrl: item.imageUploadId ? `/api/uploads/${item.imageUploadId}` : item.imageUrl,
  }
}

export function localizeMediaSettings(settings: MediaSettingsI18n, lang: Language) {
  return {
    title: settings.title[lang],
    subtitle: settings.subtitle[lang],
    intro: settings.intro[lang],
  }
}

export async function getMediaSettings(): Promise<MediaSettingsI18n | null> {
  const store = await readStore()
  return store.settings ?? null
}

export async function upsertMediaSettings(settings: MediaSettingsI18n): Promise<MediaSettingsI18n> {
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    const next: MediaStore = { ...store, settings, updatedAt: new Date().toISOString() }
    await writeJsonFile(STORE_PATH, next)
    return next.settings
  })
}

export async function listMediaItems(opts?: { publishedOnly?: boolean; limit?: number }): Promise<MediaItemI18n[]> {
  const store = await readStore()
  const publishedOnly = opts?.publishedOnly ?? true
  const limit = typeof opts?.limit === 'number' ? Math.max(1, Math.min(200, opts.limit)) : null
  const items = sortItems(store.items ?? []).filter((i) => (publishedOnly ? i.published : true))
  return typeof limit === 'number' ? items.slice(0, limit) : items
}

export async function getMediaItemById(id: number): Promise<MediaItemI18n | null> {
  const store = await readStore()
  return store.items.find((i) => i.id === id) ?? null
}

export async function createMediaItem(input: MediaItemInput): Promise<MediaItemI18n> {
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    const id = Math.max(1, Math.floor(store.nextId || 1))
    const created: MediaItemI18n = {
      id,
      ...input,
      imageUploadId: input.imageUploadId ?? null,
      imageUrl: input.imageUploadId ? `/api/uploads/${input.imageUploadId}` : '/placeholder.jpg',
    }
    const next: MediaStore = {
      ...store,
      items: [...store.items, created],
      nextId: id + 1,
      updatedAt: new Date().toISOString(),
    }
    await writeJsonFile(STORE_PATH, next)
    return created
  })
}

export async function updateMediaItem(id: number, input: MediaItemInput): Promise<MediaItemI18n | null> {
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    const index = store.items.findIndex((i) => i.id === id)
    if (index < 0) return null
    const updated: MediaItemI18n = {
      id,
      ...input,
      imageUploadId: input.imageUploadId ?? null,
      imageUrl: input.imageUploadId ? `/api/uploads/${input.imageUploadId}` : '/placeholder.jpg',
    }
    const items = [...store.items]
    items[index] = updated
    const next: MediaStore = { ...store, items, updatedAt: new Date().toISOString() }
    await writeJsonFile(STORE_PATH, next)
    return updated
  })
}

export async function deleteMediaItem(id: number): Promise<boolean> {
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    const before = store.items.length
    const items = store.items.filter((i) => i.id !== id)
    const deleted = items.length !== before
    const next: MediaStore = { ...store, items, updatedAt: new Date().toISOString() }
    await writeJsonFile(STORE_PATH, next)
    return deleted
  })
}
