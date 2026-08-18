import { z } from "zod";

export const FindingSchema = z.object({
  criterionId: z.string(),
  tier: z.enum(["ESTABLISHED", "EXPLORATORY"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "NOT_APPLICABLE"]),
  explanation: z.string().min(1),
});

export const ClaudeResponseSchema = z.object({
  findings: z.array(FindingSchema),
});

export type ClaudeResponse = z.infer<typeof ClaudeResponseSchema>;