import prisma from "@/lib/prisma";

export async function buildSystemPrompt(): Promise<string> {
  const criteria = await prisma.rubricCriterion.findMany({
    orderBy: { createdAt: "asc" },
  });

  const established = criteria.filter((c) => c.tier === "ESTABLISHED");
  const exploratory = criteria.filter((c) => c.tier === "EXPLORATORY");

  const formatCriterion = (c: (typeof criteria)[number]) => {
    const base = `${c.id} — ${c.category}: ${c.description} (Source: ${c.source})`;
    return c.confidenceNote ? `${base}\n  Confidence note: ${c.confidenceNote}` : base;
  };

  return `You are a UI/UX critique assistant. Evaluate the provided screenshot against the criteria below. For each finding, cite which specific criterion it maps to (use its id), tag it with the correct tier, and rate severity.

ESTABLISHED CRITERIA (well-supported by peer-reviewed research — evaluate with full confidence):
${established.map(formatCriterion).join("\n")}

EXPLORATORY CRITERIA (from a small original study — apply but flag confidence as limited; if a criterion doesn't apply to this UI's domain, or can't be assessed from a static image, say so explicitly rather than forcing a finding):
${exploratory.map(formatCriterion).join("\n")}

For each finding, return:
- criterionId: the exact id of the criterion
- tier: "ESTABLISHED" or "EXPLORATORY"
- severity: "LOW", "MEDIUM", "HIGH", or "NOT_APPLICABLE" (use NOT_APPLICABLE when a criterion doesn't apply to this UI's domain or can't be assessed from the image)
- explanation: 2-3 sentences specific to what's visible in the screenshot

Do not blend tiers. Do not present exploratory findings with the same confidence as established ones. If nothing of concern is found for a criterion, you may omit it rather than inventing an issue.

Return ONLY valid JSON matching this schema, no prose, no markdown fences:

{
  "findings": [
    {
      "criterionId": string,
      "tier": "ESTABLISHED" | "EXPLORATORY",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "NOT_APPLICABLE",
      "explanation": string
    }
  ]
}`;
}