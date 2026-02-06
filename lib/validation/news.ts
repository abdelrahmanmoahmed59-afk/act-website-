import { z } from 'zod'

export type LocalizedText = { en: string; ar: string }

function localizedTextSchema(options: { min: number; max: number }) {
  return z.object({
    en: z.string().trim().min(options.min).max(options.max),
    ar: z.string().trim().min(options.min).max(options.max),
  })
}

export const newsSettingsSchema = z.object({
  title: localizedTextSchema({ min: 1, max: 180 }),
  intro: localizedTextSchema({ min: 1, max: 4000 }),
  filterLabel: localizedTextSchema({ min: 1, max: 120 }),
  allLabel: localizedTextSchema({ min: 1, max: 80 }),
  readMore: localizedTextSchema({ min: 1, max: 80 }),
  close: localizedTextSchema({ min: 1, max: 80 }),
  contactTitle: localizedTextSchema({ min: 1, max: 160 }),
  contactDesc: localizedTextSchema({ min: 1, max: 2000 }),
  contactEmail: z.string().trim().min(3).max(320).email(),
  contactButton: localizedTextSchema({ min: 1, max: 120 }),
})

export const newsItemSchema = z.object({
  sortOrder: z.coerce.number().int().min(0).max(1_000_000).default(0),
  slug: z
    .preprocess((value) => {
      if (typeof value !== 'string') return value
      const trimmed = value.trim()
      return trimmed.length ? trimmed : null
    }, z.union([z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i), z.null()]))
    .optional()
    .default(null),
  title: localizedTextSchema({ min: 1, max: 180 }),
  dateLabel: localizedTextSchema({ min: 1, max: 80 }),
  category: localizedTextSchema({ min: 1, max: 80 }),
  excerpt: localizedTextSchema({ min: 1, max: 1000 }),
  imageUploadId: z.union([z.coerce.number().int().positive(), z.null()]).optional().default(null),
  imageUrl: z.string().min(1).max(2000).optional().default('/placeholder.jpg'),
})

export type NewsSettingsInput = z.infer<typeof newsSettingsSchema>
export type NewsItemInput = z.infer<typeof newsItemSchema>
