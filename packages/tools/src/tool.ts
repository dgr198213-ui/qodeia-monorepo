import { z } from 'zod'

export const toolSchema = z.object({
  query: z.string()
})

export async function executeTool(input: unknown) {
  const parsed = toolSchema.parse(input)

  return {
    success: true,
    data: parsed
  }
}
