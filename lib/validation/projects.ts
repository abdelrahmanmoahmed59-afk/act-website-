import { z } from 'zod'

const localizedShort = z.object({
  en: z.string().trim().min(1).max(200),
  ar: z.string().trim().min(1).max(200),
})

const localizedLong = z.object({
  en: z.string().trim().min(1).max(8000),
  ar: z.string().trim().min(1).max(8000),
})

const localizedMedium = z.object({
  en: z.string().trim().min(1).max(1200),
  ar: z.string().trim().min(1).max(1200),
})

const stringList = z.array(z.string().trim().min(1).max(240)).default([])

export const projectsSettingsSchema = z.object({
  homeTitle: localizedShort,
  homeSubtitle: localizedShort,
  homeShowAllLabel: localizedShort,
  homeReadMoreLabel: localizedShort,
  pageTitle: localizedShort,
  pageIntro: localizedMedium,
  pageGridLabel: localizedShort,
  pageClientLabel: localizedShort,
  pageReadMoreLabel: localizedShort,
})

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only.')

export const projectInputSchema = z.object({
  slug: slugSchema,
  sortOrder: z.coerce.number().int().min(0).max(1_000_000).default(0),
  published: z.coerce.boolean().default(true),
  showInMenu: z.coerce.boolean().default(true),
  title: localizedShort,
  sector: localizedShort,
  projectType: localizedShort,
  year: z.string().trim().min(1).max(10),
  status: localizedShort,
  client: localizedShort,
  location: localizedShort,
  cost: localizedShort,
  summary: localizedMedium,
  details: localizedLong,
  methodology: z.object({ en: stringList, ar: stringList }).default({ en: [], ar: [] }),
  galleryUploadIds: z.array(z.coerce.number().int().positive()).max(30).default([]),
})

export type ProjectsSettingsInput = z.infer<typeof projectsSettingsSchema>
export type ProjectInput = z.infer<typeof projectInputSchema>
