import 'server-only'

import crypto from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'

declare global {
  // Serialize writes per file within this Node.js process.
  var __actFileLocks: Map<string, Promise<void>> | undefined
}

function getLocks() {
  if (!globalThis.__actFileLocks) globalThis.__actFileLocks = new Map()
  return globalThis.__actFileLocks
}

export function getDataDir() {
  const override = process.env.ACT_DATA_DIR
  if (override && override.trim()) {
    const value = override.trim()
    return path.isAbsolute(value) ? value : path.join(process.cwd(), value)
  }
  return path.join(process.cwd(), 'data')
}

export function resolveDataPath(...parts: string[]) {
  return path.join(getDataDir(), ...parts)
}

async function ensureDir(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
}

export async function withFileLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const locks = getLocks()
  const previous = locks.get(key) ?? Promise.resolve()
  let release!: () => void
  const next = new Promise<void>((r) => (release = r))
  locks.set(key, previous.then(() => next))
  await previous
  try {
    return await fn()
  } finally {
    release()
    if (locks.get(key) === next) locks.delete(key)
  }
}

export async function readJsonFile<T>(relativePath: string, fallback: T): Promise<T> {
  const fullPath = resolveDataPath(relativePath)
  try {
    const raw = await fs.readFile(fullPath, 'utf8')
    return JSON.parse(raw) as T
  } catch (error: any) {
    if (error?.code === 'ENOENT') return fallback
    throw error
  }
}

export async function readOrInitJsonFile<T>(relativePath: string, init: () => T | Promise<T>): Promise<T> {
  const fullPath = resolveDataPath(relativePath)
  try {
    const raw = await fs.readFile(fullPath, 'utf8')
    return JSON.parse(raw) as T
  } catch (error: any) {
    if (error?.code !== 'ENOENT') throw error

    // Legacy migration: earlier versions stored JSON directly under `data/*.json`.
    // If the new nested path doesn't exist yet, migrate the legacy file once.
    if (relativePath.includes('/')) {
      const legacyRelative = path.basename(relativePath)
      const legacyFullPath = resolveDataPath(legacyRelative)
      try {
        const legacyRaw = await fs.readFile(legacyFullPath, 'utf8')
        const legacyValue = JSON.parse(legacyRaw) as T
        await writeJsonFile(relativePath, legacyValue)
        return legacyValue
      } catch (legacyError: any) {
        if (legacyError?.code !== 'ENOENT') throw legacyError
      }
    }

    const value = await init()
    await writeJsonFile(relativePath, value)
    return value
  }
}

export async function writeJsonFile(relativePath: string, data: unknown): Promise<void> {
  const fullPath = resolveDataPath(relativePath)
  await ensureDir(fullPath)
  const tmp = `${fullPath}.tmp-${crypto.randomBytes(8).toString('hex')}`
  const payload = JSON.stringify(data, null, 2) + '\n'
  await fs.writeFile(tmp, payload, 'utf8')

  try {
    await fs.rename(tmp, fullPath)
  } catch (error: any) {
    // Windows can fail renames if the destination file is being read.
    // Fall back to replacing the destination.
    if (error?.code === 'EPERM' || error?.code === 'EEXIST') {
      await fs.rm(fullPath, { force: true })
      await fs.rename(tmp, fullPath)
      return
    }
    throw error
  }
}

export async function readBinaryFile(relativePath: string): Promise<Buffer | null> {
  const fullPath = resolveDataPath(relativePath)
  try {
    return await fs.readFile(fullPath)
  } catch (error: any) {
    if (error?.code === 'ENOENT') return null
    throw error
  }
}

export async function writeBinaryFile(relativePath: string, bytes: Uint8Array): Promise<void> {
  const fullPath = resolveDataPath(relativePath)
  await ensureDir(fullPath)
  const tmp = `${fullPath}.tmp-${crypto.randomBytes(8).toString('hex')}`
  await fs.writeFile(tmp, Buffer.from(bytes))
  try {
    await fs.rename(tmp, fullPath)
  } catch (error: any) {
    if (error?.code === 'EPERM' || error?.code === 'EEXIST') {
      await fs.rm(fullPath, { force: true })
      await fs.rename(tmp, fullPath)
      return
    }
    throw error
  }
}

export function nextId(current: number | undefined) {
  const value = typeof current === 'number' && Number.isFinite(current) ? current : 1
  return Math.max(1, Math.floor(value))
}
