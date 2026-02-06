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
  intro: localizedTextSchema({ min: 1, max: 4000 }),
  emailText: z.string().trim().min(3).max(320),
  phoneNum: z.string().trim().min(3).max(80),
  address: localizedTextSchema({ min: 1, max: 400 }),
  mapSrc: z.string().trim().min(1).max(2000),
})

export const contactSubmissionSchema = z.object({
  fullName: z.string().trim().min(1).max(200),
  email: z.string().trim().min(3).max(320).email(),
  details: z.string().trim().min(1).max(5000),
})

export type ContactSettingsInput = z.infer<typeof contactSettingsSchema>
export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>

