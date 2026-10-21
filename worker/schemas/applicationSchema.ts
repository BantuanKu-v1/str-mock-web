import { z } from "zod";

export const createApplicationSchema = z.object({
  externalApplicationId: z.string().trim().min(1).max(100),
  applicantName: z.string().trim().min(1).max(150),
  applicationYear: z.number().int().min(2027),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    "submitted",
    "under_review",
    "approved",
    "rejected",
  ]),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
