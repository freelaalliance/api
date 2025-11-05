import z from "zod";

export const reqUserSchema = z.object({
  id: z.string().uuid(),
  cliente: z.string().uuid(),
  isAdmin: z.boolean(),
})
