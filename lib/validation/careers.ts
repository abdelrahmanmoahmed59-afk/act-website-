import { z } from 'zod'

const localizedShort = z.object({
  en: z.string().trim().min(1).max(200),
  ar: z.string().trim().min(1).max(200),
})

const localizedMedium = z.object({
  en: z.string().trim().min(1).max(1200),
  ar: z.string().trim().min(1).max(1200),
})

export const careerJobSchema = z.object({
  sortOrder: z.coerce.number().int().min(0).max(1_000_000).default(0),
  published: z.coerce.boolean().default(true),
  title: localizedShort,
  location: localizedShort,
  type: localizedShort,
  summary: localizedMedium,
})

export const careerApplicationSchema = z.object({
  jobId: z.coerce.number().int().positive().nullable().default(null),
  jobTitle: z.string().trim().min(1).max(200),
  fullName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(3).max(40),
})

export type CareerJobInput = z.infer<typeof careerJobSchema>
export type CareerApplicationInput = z.infer<typeof careerApplicationSchema>

