import { z } from 'zod'

export const quotationSubmissionSchema = z.object({
  fullName: z.string().trim().min(1).max(200),
  company: z.string().trim().max(200).default(''),
  email: z.string().trim().min(3).max(320).email(),
  phone: z.string().trim().max(80).default(''),
  location: z.string().trim().min(1).max(200),
  scope: z.string().trim().min(1).max(80),
  sector: z.string().trim().min(1).max(80),
  areaSqm: z.string().trim().min(1).max(80),
  complexity: z.string().trim().max(80).default(''),
  timeline: z.string().trim().max(200).default(''),
  details: z.string().trim().max(5000).default(''),
  contactMethod: z.string().trim().min(1).max(40),
  consent: z.coerce.boolean(),
})

export type QuotationSubmissionInput = z.infer<typeof quotationSubmissionSchema>

