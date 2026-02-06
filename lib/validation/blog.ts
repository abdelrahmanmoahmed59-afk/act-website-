import { z } from 'zod'

const localizedShort = z.object({
  en: z.string().trim().min(1).max(200),
  ar: z.string().trim().min(1).max(200),
})

const localizedMedium = z.object({
  en: z.string().trim().min(1).max(2000),
  ar: z.string().trim().min(1).max(2000),
})

const localizedLong = z.object({
  en: z.string().trim().min(1).max(12000),
  ar: z.string().trim().min(1).max(12000),
})

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only.')

export const blogSettingsSchema = z.object({
  eyebrow: localizedShort,
  title: localizedShort,
  subtitle: localizedShort,
  intro: localizedMedium,
})

export const blogPostSchema = z.object({
  slug: slugSchema,
  sortOrder: z.coerce.number().int().min(0).max(1_000_000).default(0),
  published: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  title: localizedShort,
  dateLabel: localizedShort,
  category: localizedShort,
  readTime: localizedShort,
  summary: localizedMedium,
  content: localizedLong,
  highlights: z.object({ en: z.array(z.string().trim().min(1).max(240)).default([]), ar: z.array(z.string().trim().min(1).max(240)).default([]) }).default({ en: [], ar: [] }),
  imageUploadId: z.coerce.number().int().positive().nullable().default(null),
})

export type BlogSettingsInput = z.infer<typeof blogSettingsSchema>
export type BlogPostInput = z.infer<typeof blogPostSchema>

