import 'server-only'

import crypto from 'node:crypto'
import { promises as fs } from 'node:fs'

import { readBinaryFile, readJsonFile, resolveDataPath, withFileLock, writeBinaryFile, writeJsonFile } from '@/lib/server/file-store'

export type UploadRecord = {
  id: number
  contentType: string
  byteSize: number
  sha256: string
  originalName: string
  bytes: Buffer
}

type UploadIndexItem = {
  id: number
  contentType: string
  byteSize: number
  sha256: string
  originalName: string
  createdAt: string
}

type UploadIndex = {
  nextId: number
  items: UploadIndexItem[]
}

const INDEX_PATH = 'private/uploads/index.json'
const FILES_DIR = 'private/uploads/files'

export function getUploadUrl(id: number) {
  return `/api/uploads/${id}`
}

export async function ensureUploadsIndex() {
  await withFileLock(INDEX_PATH, async () => {
    const fullPath = resolveDataPath(INDEX_PATH)
    const exists = await fs
      .stat(fullPath)
      .then(() => true)
      .catch((error: any) => (error?.code === 'ENOENT' ? false : Promise.reject(error)))
    if (exists) return
    await writeJsonFile(INDEX_PATH, { nextId: 1, items: [] } satisfies UploadIndex)
  })
}

export async function createUpload(input: {
  bytes: Uint8Array
  contentType: string
  originalName: string
}): Promise<{ id: number; sha256: string }> {
  const hash = crypto.createHash('sha256').update(input.bytes).digest('hex')
  return await withFileLock(INDEX_PATH, async () => {
    const index = await readJsonFile<UploadIndex>(INDEX_PATH, { nextId: 1, items: [] })

    const existing = index.items.find((i) => i.sha256 === hash)
    if (existing) return { id: existing.id, sha256: existing.sha256 }

    const id = Math.max(1, Math.floor(index.nextId || 1))
    const filePath = `${FILES_DIR}/${id}`
    await writeBinaryFile(filePath, input.bytes)

    index.items.push({
      id,
      contentType: input.contentType,
      byteSize: input.bytes.byteLength,
      sha256: hash,
      originalName: input.originalName || '',
      createdAt: new Date().toISOString(),
    })
    index.nextId = id + 1
    await writeJsonFile(INDEX_PATH, index)

    return { id, sha256: hash }
  })
}

export async function getUploadById(id: number): Promise<UploadRecord | null> {
  const index = await readJsonFile<UploadIndex>(INDEX_PATH, { nextId: 1, items: [] })
  const item = index.items.find((i) => i.id === id)
  if (!item) return null

  const bytes = await readBinaryFile(`${FILES_DIR}/${id}`)
  if (!bytes) return null

  return {
    id: item.id,
    contentType: item.contentType,
    byteSize: item.byteSize,
    sha256: item.sha256,
    originalName: item.originalName,
    bytes,
  }
}
