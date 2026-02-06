import { z } from 'zod'

const localizedShort = z.object({
  en: z.string().trim().min(1).max(200),
  ar: z.string().trim().min(1).max(200),
})

const localizedMedium = z.object({
  en: z.string().trim().min(1).max(2000),
  ar: z.string().trim().min(1).max(2000),
})

export const mediaSettingsSchema = z.object({
  title: localizedShort,
  subtitle: localizedShort,
  intro: localizedMedium,
})

export const mediaItemSchema = z.object({
  sortOrder: z.coerce.number().int().min(0).max(1_000_000).default(0),
  published: z.coerce.boolean().default(true),
  type: z.enum(['video', 'photo', 'press']).default('press'),
  title: localizedShort,
  dateLabel: localizedShort,
  description: localizedMedium,
  linkUrl: z.string().trim().max(4000).default(''),
  imageUploadId: z.coerce.number().int().positive().nullable().default(null),
})

export type MediaSettingsInput = z.infer<typeof mediaSettingsSchema>
export type MediaItemInput = z.infer<typeof mediaItemSchema>

