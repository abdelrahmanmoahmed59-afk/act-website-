import { z } from 'zod'

export const adminUserCreateSchema = z.object({
  email: z.string().trim().min(3).max(320).email(),
  password: z.string().min(8).max(200),
})

export type AdminUserCreateInput = z.infer<typeof adminUserCreateSchema>

