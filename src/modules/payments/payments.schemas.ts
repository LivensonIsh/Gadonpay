import { z } from "zod";

export const createPaymentSchema = z.object({
  amount: z.number().positive().max(99_999_999),
  currency: z.literal("HTG").optional(),
  provider: z.enum(["NATCASH", "MONCASH"]),
  reference: z.string().trim().min(1).max(120),
});

export type CreatePaymentBody = z.infer<typeof createPaymentSchema>;
