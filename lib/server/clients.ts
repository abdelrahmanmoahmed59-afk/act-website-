import 'server-only'

import type { Language } from '@/lib/i18n/base-translations'
import { clientsTemplate } from '@/lib/content/clients-template'
import { successClientsTemplate } from '@/lib/content/success-clients-template'
import { readOrInitJsonFile, withFileLock, writeJsonFile } from '@/lib/server/file-store'
import type { ClientsSettingsInput, SuccessClientsLogoInput, SuccessClientsSettingsInput } from '@/lib/validation/clients'

export type ClientsSettingsI18n = ClientsSettingsInput

export type SuccessClientsSettingsI18n = SuccessClientsSettingsInput

export type SuccessClientsLogoI18n = {
  id: number
  sortOrder: number
  uploadId: number
  imageUrl: string
  alt: Record<Language, string>
}

type ClientsStore = {
  settings: ClientsSettingsI18n
  updatedAt: string
}

type SuccessClientsStore = {
  settings: SuccessClientsSettingsI18n
  logos: SuccessClientsLogoI18n[]
  nextId: number
  updatedAt: string
}

const CLIENTS_PATH = 'content/clients.json'
const SUCCESS_PATH = 'content/success-clients.json'

function initClientsStore(): ClientsStore {
  return {
    settings: clientsTemplate as ClientsSettingsI18n,
    updatedAt: new Date().toISOString(),
  }
}

function initSuccessStore(): SuccessClientsStore {
  return {
    settings: { title: successClientsTemplate.title, subtitle: successClientsTemplate.subtitle },
    logos: [],
    nextId: 1,
    updatedAt: new Date().toISOString(),
  }
}

async function readClientsStore() {
  return readOrInitJsonFile<ClientsStore>(CLIENTS_PATH, initClientsStore)
}

async function readSuccessStore() {
  return readOrInitJsonFile<SuccessClientsStore>(SUCCESS_PATH, initSuccessStore)
}

function sortLogos(logos: SuccessClientsLogoI18n[]) {
  return [...logos].sort((a, b) => (a.sortOrder - b.sortOrder) || (b.id - a.id))
}

export async function getClientsSettings(): Promise<ClientsSettingsI18n | null> {
  const store = await readClientsStore()
  return store.settings ?? null
}

export async function upsertClientsSettings(settings: ClientsSettingsI18n): Promise<ClientsSettingsI18n> {
  return withFileLock(CLIENTS_PATH, async () => {
    const store = await readClientsStore()
    const next: ClientsStore = { ...store, settings, updatedAt: new Date().toISOString() }
    await writeJsonFile(CLIENTS_PATH, next)
    return next.settings
  })
}

export async function getSuccessClientsSettings(): Promise<SuccessClientsSettingsI18n | null> {
  const store = await readSuccessStore()
  return store.settings ?? null
}

export async function upsertSuccessClientsSettings(settings: SuccessClientsSettingsI18n) {
  return withFileLock(SUCCESS_PATH, async () => {
    const store = await readSuccessStore()
    const next: SuccessClientsStore = { ...store, settings, updatedAt: new Date().toISOString() }
    await writeJsonFile(SUCCESS_PATH, next)
    return next.settings
  })
}

export async function listSuccessClientsLogos(): Promise<SuccessClientsLogoI18n[]> {
  const store = await readSuccessStore()
  return sortLogos(store.logos ?? [])
}

export async function createSuccessClientsLogo(input: SuccessClientsLogoInput) {
  return withFileLock(SUCCESS_PATH, async () => {
    const store = await readSuccessStore()
    const id = Math.max(1, Math.floor(store.nextId || 1))
    const created: SuccessClientsLogoI18n = {
      id,
      sortOrder: input.sortOrder,
      uploadId: input.uploadId,
      imageUrl: `/api/uploads/${input.uploadId}`,
      alt: input.alt,
    }
    const next: SuccessClientsStore = {
      ...store,
      logos: [...store.logos, created],
      nextId: id + 1,
      updatedAt: new Date().toISOString(),
    }
    await writeJsonFile(SUCCESS_PATH, next)
    return created
  })
}

export async function updateSuccessClientsLogo(id: number, input: SuccessClientsLogoInput) {
  return withFileLock(SUCCESS_PATH, async () => {
    const store = await readSuccessStore()
    const index = store.logos.findIndex((l) => l.id === id)
    if (index < 0) return null
    const updated: SuccessClientsLogoI18n = {
      id,
      sortOrder: input.sortOrder,
      uploadId: input.uploadId,
      imageUrl: `/api/uploads/${input.uploadId}`,
      alt: input.alt,
    }
    const logos = [...store.logos]
    logos[index] = updated
    const next: SuccessClientsStore = { ...store, logos, updatedAt: new Date().toISOString() }
    await writeJsonFile(SUCCESS_PATH, next)
    return updated
  })
}

export async function deleteSuccessClientsLogo(id: number) {
  return withFileLock(SUCCESS_PATH, async () => {
    const store = await readSuccessStore()
    const before = store.logos.length
    const logos = store.logos.filter((l) => l.id !== id)
    const deleted = logos.length !== before
    const next: SuccessClientsStore = { ...store, logos, updatedAt: new Date().toISOString() }
    await writeJsonFile(SUCCESS_PATH, next)
    return deleted
  })
}
