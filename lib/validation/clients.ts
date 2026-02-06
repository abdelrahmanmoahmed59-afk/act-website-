import { z } from 'zod'

const localizedText = z.object({
  en: z.string().trim().min(1).max(8000),
  ar: z.string().trim().min(1).max(8000),
})

export const clientsSettingsSchema = z.object({
  eyebrow: z.object({ en: z.string().trim().min(1).max(120), ar: z.string().trim().min(1).max(120) }),
  title: z.object({ en: z.string().trim().min(1).max(120), ar: z.string().trim().min(1).max(120) }),
  subtitle: z.object({ en: z.string().trim().min(1).max(600), ar: z.string().trim().min(1).max(600) }),
  primaryAction: z.object({ en: z.string().trim().min(1).max(120), ar: z.string().trim().min(1).max(120) }),
  secondaryAction: z.object({ en: z.string().trim().min(1).max(120), ar: z.string().trim().min(1).max(120) }),
  introTitle: z.object({ en: z.string().trim().min(1).max(160), ar: z.string().trim().min(1).max(160) }),
  intro: z.object({ en: z.string().trim().min(1).max(4000), ar: z.string().trim().min(1).max(4000) }),
  segmentsTitle: z.object({ en: z.string().trim().min(1).max(160), ar: z.string().trim().min(1).max(160) }),
  testimonialsTitle: z.object({ en: z.string().trim().min(1).max(160), ar: z.string().trim().min(1).max(160) }),
  logosTitle: z.object({ en: z.string().trim().min(1).max(180), ar: z.string().trim().min(1).max(180) }),
  logosIntro: z.object({ en: z.string().trim().min(1).max(600), ar: z.string().trim().min(1).max(600) }),
  ctaTitle: z.object({ en: z.string().trim().min(1).max(180), ar: z.string().trim().min(1).max(180) }),
  ctaDesc: z.object({ en: z.string().trim().min(1).max(800), ar: z.string().trim().min(1).max(800) }),
  ctaButton: z.object({ en: z.string().trim().min(1).max(120), ar: z.string().trim().min(1).max(120) }),
  stats: z
    .array(
      z.object({
        value: z.string().trim().min(1).max(40),
        label: z.object({ en: z.string().trim().min(1).max(120), ar: z.string().trim().min(1).max(120) }),
      })
    )
    .default([]),
  segments: z
    .array(
      z.object({
        title: z.object({ en: z.string().trim().min(1).max(180), ar: z.string().trim().min(1).max(180) }),
        description: z.object({ en: z.string().trim().min(1).max(800), ar: z.string().trim().min(1).max(800) }),
      })
    )
    .default([]),
  testimonials: z
    .array(
      z.object({
        quote: z.object({ en: z.string().trim().min(1).max(1200), ar: z.string().trim().min(1).max(1200) }),
        name: z.object({ en: z.string().trim().min(1).max(120), ar: z.string().trim().min(1).max(120) }),
        role: z.object({ en: z.string().trim().min(1).max(160), ar: z.string().trim().min(1).max(160) }),
      })
    )
    .default([]),
  logosText: z.array(z.object({ en: z.string().trim().min(1).max(160), ar: z.string().trim().min(1).max(160) })).default([]),
})

export const successClientsSettingsSchema = z.object({
  title: z.object({ en: z.string().trim().min(1).max(180), ar: z.string().trim().min(1).max(180) }),
  subtitle: z.object({ en: z.string().trim().min(1).max(400), ar: z.string().trim().min(1).max(400) }),
})

export const successClientsLogoSchema = z.object({
  sortOrder: z.coerce.number().int().min(0).max(1_000_000).default(0),
  uploadId: z.coerce.number().int().positive(),
  alt: z.object({ en: z.string().trim().min(1).max(200), ar: z.string().trim().min(1).max(200) }),
})

export type ClientsSettingsInput = z.infer<typeof clientsSettingsSchema>
export type SuccessClientsSettingsInput = z.infer<typeof successClientsSettingsSchema>
export type SuccessClientsLogoInput = z.infer<typeof successClientsLogoSchema>

