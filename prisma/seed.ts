import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.rubricCriterion.createMany({
    data: [
      {
        tier: "ESTABLISHED",
        source: "Nielsen Norman Group / usability heuristics",
        category: "feedback_timing",
        description:
          "System status should be visible within reasonable time after a user action (e.g., loading states, confirmation feedback).",
      },
      {
        tier: "ESTABLISHED",
        source: "Hancock et al., trust in automation research",
        category: "trust_cue",
        description:
          "Interfaces handling sensitive actions (payments, data sharing) should provide explicit, unambiguous confirmation before the action is finalized.",
      },
      {
        tier: "EXPLORATORY",
        source: "Thesis study, n=14 across 2 focus groups",
        category: "trust_cue",
        description:
          "Subtle animation on successful transaction confirmation may increase perceived trustworthiness compared to static confirmation.",
        confidenceNote:
          "Based on a small qualitative study; directionally suggestive, not statistically validated at scale.",
      },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });