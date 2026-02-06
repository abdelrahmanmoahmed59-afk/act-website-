import 'server-only'

import { readOrInitJsonFile, withFileLock, writeJsonFile } from '@/lib/server/file-store'

export type AdminUser = {
  id: number
  email: string
  passwordHash: string
  role: 'admin'
  createdAt: string
  updatedAt: string
}

type AdminUsersStore = {
  users: AdminUser[]
  nextId: number
  updatedAt: string
}

const STORE_PATH = 'private/admin-users.json'

function initStore(): AdminUsersStore {
  return { users: [], nextId: 1, updatedAt: new Date().toISOString() }
}

async function readStore() {
  return readOrInitJsonFile<AdminUsersStore>(STORE_PATH, initStore)
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function countAdminUsers() {
  const store = await readStore()
  return store.users.length
}

export async function getAdminUserById(id: number): Promise<AdminUser | null> {
  const store = await readStore()
  return store.users.find((u) => u.id === id) ?? null
}

export async function getAdminUserByEmail(email: string): Promise<AdminUser | null> {
  const store = await readStore()
  const wanted = normalizeEmail(email)
  return store.users.find((u) => normalizeEmail(u.email) === wanted) ?? null
}

export async function createAdminUser(input: { email: string; passwordHash: string; role?: 'admin' }): Promise<AdminUser> {
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    const email = normalizeEmail(input.email)
    if (store.users.some((u) => normalizeEmail(u.email) === email)) {
      throw new Error('Email already exists')
    }
    const id = Math.max(1, Math.floor(store.nextId || 1))
    const now = new Date().toISOString()
    const user: AdminUser = {
      id,
      email,
      passwordHash: input.passwordHash,
      role: input.role ?? 'admin',
      createdAt: now,
      updatedAt: now,
    }
    const next: AdminUsersStore = {
      ...store,
      users: [...store.users, user],
      nextId: id + 1,
      updatedAt: now,
    }
    await writeJsonFile(STORE_PATH, next)
    return user
  })
}
