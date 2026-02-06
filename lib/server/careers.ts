import 'server-only'

import type { Language } from '@/lib/i18n/base-translations'
import { readOrInitJsonFile, withFileLock, writeJsonFile } from '@/lib/server/file-store'
import type { CareerApplicationInput, CareerJobInput } from '@/lib/validation/careers'

export type CareerJobI18n = CareerJobInput & {
  id: number
}

export type LocalizedCareerJob = {
  id: number
  sortOrder: number
  published: boolean
  title: string
  location: string
  type: string
  summary: string
}

export type CareerApplication = {
  id: number
  jobId: number | null
  jobTitle: string
  fullName: string
  email: string
  phone: string
  createdAt: string
}

type CareersJobsStore = {
  jobs: CareerJobI18n[]
  nextId: number
  updatedAt: string
}

type CareersApplicationsStore = {
  applications: CareerApplication[]
  nextId: number
  updatedAt: string
}

const JOBS_PATH = 'content/careers-jobs.json'
const APPLICATIONS_PATH = 'private/careers-applications.json'

function initJobsStore(): CareersJobsStore {
  return { jobs: [], nextId: 1, updatedAt: new Date().toISOString() }
}

function initApplicationsStore(): CareersApplicationsStore {
  return { applications: [], nextId: 1, updatedAt: new Date().toISOString() }
}

async function readJobsStore() {
  return readOrInitJsonFile<CareersJobsStore>(JOBS_PATH, initJobsStore)
}

async function readApplicationsStore() {
  return readOrInitJsonFile<CareersApplicationsStore>(APPLICATIONS_PATH, initApplicationsStore)
}

function sortJobs(jobs: CareerJobI18n[]) {
  return [...jobs].sort((a, b) => (a.sortOrder - b.sortOrder) || (b.id - a.id))
}

export function localizeCareerJob(job: CareerJobI18n, lang: Language): LocalizedCareerJob {
  return {
    id: job.id,
    sortOrder: job.sortOrder,
    published: job.published,
    title: job.title[lang],
    location: job.location[lang],
    type: job.type[lang],
    summary: job.summary[lang],
  }
}

export async function listCareerJobs(opts?: { publishedOnly?: boolean }): Promise<CareerJobI18n[]> {
  const store = await readJobsStore()
  const publishedOnly = opts?.publishedOnly ?? true
  return sortJobs(store.jobs ?? []).filter((j) => (publishedOnly ? j.published : true))
}

export async function getCareerJobById(id: number): Promise<CareerJobI18n | null> {
  const store = await readJobsStore()
  return store.jobs.find((j) => j.id === id) ?? null
}

export async function createCareerJob(input: CareerJobInput): Promise<CareerJobI18n> {
  return withFileLock(JOBS_PATH, async () => {
    const store = await readJobsStore()
    const id = Math.max(1, Math.floor(store.nextId || 1))
    const created: CareerJobI18n = { id, ...input }
    const next: CareersJobsStore = { ...store, jobs: [...store.jobs, created], nextId: id + 1, updatedAt: new Date().toISOString() }
    await writeJsonFile(JOBS_PATH, next)
    return created
  })
}

export async function updateCareerJob(id: number, input: CareerJobInput): Promise<CareerJobI18n | null> {
  return withFileLock(JOBS_PATH, async () => {
    const store = await readJobsStore()
    const index = store.jobs.findIndex((j) => j.id === id)
    if (index < 0) return null
    const updated: CareerJobI18n = { id, ...input }
    const jobs = [...store.jobs]
    jobs[index] = updated
    const next: CareersJobsStore = { ...store, jobs, updatedAt: new Date().toISOString() }
    await writeJsonFile(JOBS_PATH, next)
    return updated
  })
}

export async function deleteCareerJob(id: number): Promise<boolean> {
  return withFileLock(JOBS_PATH, async () => {
    const store = await readJobsStore()
    const before = store.jobs.length
    const jobs = store.jobs.filter((j) => j.id !== id)
    const deleted = jobs.length !== before
    const next: CareersJobsStore = { ...store, jobs, updatedAt: new Date().toISOString() }
    await writeJsonFile(JOBS_PATH, next)
    return deleted
  })
}

export async function createCareerApplication(input: CareerApplicationInput): Promise<CareerApplication> {
  return withFileLock(APPLICATIONS_PATH, async () => {
    const store = await readApplicationsStore()
    const id = Math.max(1, Math.floor(store.nextId || 1))
    const created: CareerApplication = {
      id,
      jobId: input.jobId ?? null,
      jobTitle: input.jobTitle,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      createdAt: new Date().toISOString(),
    }
    const next: CareersApplicationsStore = {
      ...store,
      applications: [created, ...(store.applications ?? [])],
      nextId: id + 1,
      updatedAt: new Date().toISOString(),
    }
    await writeJsonFile(APPLICATIONS_PATH, next)
    return created
  })
}

export async function listCareerApplications(opts?: { limit?: number }): Promise<CareerApplication[]> {
  const store = await readApplicationsStore()
  const limit = typeof opts?.limit === 'number' ? Math.max(1, Math.min(500, opts.limit)) : 200
  return (store.applications ?? []).slice(0, limit)
}

