import { z } from 'zod'

export type LocalizedText = { en: string; ar: string }

function localizedTextSchema(options: { min: number; max: number }) {
  return z.object({
    en: z.string().trim().min(options.min).max(options.max),
    ar: z.string().trim().min(options.min).max(options.max),
  })
}

export const contactSettingsSchema = z.object({
  title: localizedTextSchema({ min: 1, max: 180 }),
  introLineOne: localizedTextSchema({ min: 1, max: 4000 }),
  introLineTwo: z.object({
    en: z.string().trim().max(4000),
    ar: z.string().trim().max(4000),
  }),
  emailText: z.string().trim().min(3).max(320),
  phoneNum: z.string().trim().min(3).max(80),
  address: localizedTextSchema({ min: 1, max: 400 }),
  mapSrc: z.preprocess((value) => {
    if (typeof value !== 'string') return value
    const trimmed = value.trim()
    if (!trimmed) return trimmed

    // Allow pasting a full iframe snippet. We'll extract the src attribute.
    const match = trimmed.match(/src\s*=\s*["']([^"']+)["']/i)
    if (match?.[1]) return match[1].trim()

    return trimmed
  }, z.string().trim().min(1).max(8000)),
})

export const contactSubmissionSchema = z.object({
  fullName: z.string().trim().min(1).max(200),
  email: z.string().trim().min(3).max(320).email(),
  details: z.string().trim().min(1).max(5000),
})

export type ContactSettingsInput = z.infer<typeof contactSettingsSchema>
export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>

