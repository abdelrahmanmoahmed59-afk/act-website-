import 'server-only'

import { promises as fs } from 'node:fs'

import { contactTemplate } from '@/lib/content/contact-template'
import { readOrInitJsonFile, resolveDataPath, withFileLock, writeJsonFile } from '@/lib/server/file-store'
import type { ContactSettingsInput, ContactSubmissionInput } from '@/lib/validation/contact'

export type ContactSettingsI18n = ContactSettingsInput

export type ContactSubmission = {
  id: number
  fullName: string
  email: string
  details: string
  createdAt: string
}

type ContactSettingsStore = {
  settings: ContactSettingsI18n
  updatedAt: string
}

type ContactSubmissionsStore = {
  submissions: ContactSubmission[]
  nextId: number
  updatedAt: string
}

const SETTINGS_PATH = 'content/contact-settings.json'
const SUBMISSIONS_PATH = 'private/contact-submissions.json'
const LEGACY_PATH = 'contact.json'

function initSettingsStore(): ContactSettingsStore {
  return { settings: contactTemplate, updatedAt: new Date().toISOString() }
}

function initSubmissionsStore(): ContactSubmissionsStore {
  return { submissions: [], nextId: 1, updatedAt: new Date().toISOString() }
}

async function readSettingsStore() {
  await migrateLegacyStoreIfNeeded()
  return readOrInitJsonFile<ContactSettingsStore>(SETTINGS_PATH, initSettingsStore)
}

async function readSubmissionsStore() {
  await migrateLegacyStoreIfNeeded()
  return readOrInitJsonFile<ContactSubmissionsStore>(SUBMISSIONS_PATH, initSubmissionsStore)
}

async function migrateLegacyStoreIfNeeded() {
  // Migrate from `data/contact.json` (legacy) to the split store:
  // - `data/content/contact-settings.json`
  // - `data/private/contact-submissions.json`
  await withFileLock(SETTINGS_PATH, async () => {
    const settingsFull = resolveDataPath(SETTINGS_PATH)
    const submissionsFull = resolveDataPath(SUBMISSIONS_PATH)

    const hasNewSettings = await fs
      .stat(settingsFull)
      .then(() => true)
      .catch(() => false)
    const hasNewSubmissions = await fs
      .stat(submissionsFull)
      .then(() => true)
      .catch(() => false)
    if (hasNewSettings || hasNewSubmissions) return

    const legacyFull = resolveDataPath(LEGACY_PATH)
    const legacyRaw = await fs
      .readFile(legacyFull, 'utf8')
      .catch((error: any) => {
        if (error?.code === 'ENOENT') return null
        throw error
      })
    if (!legacyRaw) return

    const legacy = JSON.parse(legacyRaw) as any
    const updatedAt = typeof legacy?.updatedAt === 'string' ? legacy.updatedAt : new Date().toISOString()
    const legacySettings = legacy?.settings ?? contactTemplate
    const legacySubmissions = Array.isArray(legacy?.submissions) ? legacy.submissions : []
    const legacyNextId =
      typeof legacy?.nextSubmissionId === 'number' && Number.isFinite(legacy.nextSubmissionId)
        ? legacy.nextSubmissionId
        : 1

    await writeJsonFile(SETTINGS_PATH, { settings: legacySettings, updatedAt } satisfies ContactSettingsStore)
    await writeJsonFile(SUBMISSIONS_PATH, { submissions: legacySubmissions, nextId: legacyNextId, updatedAt } satisfies ContactSubmissionsStore)
  })
}

export async function getContactSettings(): Promise<ContactSettingsI18n | null> {
  const store = await readSettingsStore()
  return store.settings ?? null
}

export async function upsertContactSettings(input: ContactSettingsInput): Promise<ContactSettingsI18n> {
  return withFileLock(SETTINGS_PATH, async () => {
    const store = await readSettingsStore()
    const next: ContactSettingsStore = { ...store, settings: input, updatedAt: new Date().toISOString() }
    await writeJsonFile(SETTINGS_PATH, next)
    return next.settings
  })
}

export async function createContactSubmission(input: ContactSubmissionInput): Promise<ContactSubmission> {
  return withFileLock(SUBMISSIONS_PATH, async () => {
    const store = await readSubmissionsStore()
    const id = Math.max(1, Math.floor(store.nextId || 1))
    const created: ContactSubmission = {
      id,
      fullName: input.fullName,
      email: input.email,
      details: input.details,
      createdAt: new Date().toISOString(),
    }
    const next: ContactSubmissionsStore = {
      ...store,
      submissions: [created, ...(store.submissions ?? [])],
      nextId: id + 1,
      updatedAt: new Date().toISOString(),
    }
    await writeJsonFile(SUBMISSIONS_PATH, next)
    return created
  })
}

export async function listContactSubmissions(opts?: { limit?: number }): Promise<ContactSubmission[]> {
  const store = await readSubmissionsStore()
  const limit = typeof opts?.limit === 'number' ? Math.max(1, Math.min(500, opts.limit)) : 200
  return (store.submissions ?? []).slice(0, limit)
}
