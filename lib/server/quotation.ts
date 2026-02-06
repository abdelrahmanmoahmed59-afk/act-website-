import 'server-only'

import { readOrInitJsonFile, withFileLock, writeJsonFile } from '@/lib/server/file-store'
import type { QuotationSubmissionInput } from '@/lib/validation/quotation'

export type QuotationSubmission = {
  id: number
  fullName: string
  company: string
  email: string
  phone: string
  location: string
  scope: string
  sector: string
  areaSqm: string
  complexity: string
  timeline: string
  details: string
  contactMethod: string
  consent: boolean
  createdAt: string
}

type QuotationStore = {
  submissions: QuotationSubmission[]
  nextId: number
  updatedAt: string
}

const STORE_PATH = 'private/quotation-submissions.json'

function initStore(): QuotationStore {
  return { submissions: [], nextId: 1, updatedAt: new Date().toISOString() }
}

async function readStore() {
  return readOrInitJsonFile<QuotationStore>(STORE_PATH, initStore)
}

export async function createQuotationSubmission(input: QuotationSubmissionInput): Promise<QuotationSubmission> {
  return withFileLock(STORE_PATH, async () => {
    const store = await readStore()
    const id = Math.max(1, Math.floor(store.nextId || 1))
    const created: QuotationSubmission = {
      id,
      fullName: input.fullName,
      company: input.company ?? '',
      email: input.email,
      phone: input.phone ?? '',
      location: input.location,
      scope: input.scope,
      sector: input.sector,
      areaSqm: input.areaSqm,
      complexity: input.complexity ?? '',
      timeline: input.timeline ?? '',
      details: input.details ?? '',
      contactMethod: input.contactMethod,
      consent: input.consent,
      createdAt: new Date().toISOString(),
    }
    const next: QuotationStore = {
      ...store,
      submissions: [created, ...(store.submissions ?? [])],
      nextId: id + 1,
      updatedAt: new Date().toISOString(),
    }
    await writeJsonFile(STORE_PATH, next)
    return created
  })
}

export async function listQuotationSubmissions(opts?: { limit?: number }): Promise<QuotationSubmission[]> {
  const store = await readStore()
  const limit = typeof opts?.limit === 'number' ? Math.max(1, Math.min(500, opts.limit)) : 200
  return (store.submissions ?? []).slice(0, limit)
}
