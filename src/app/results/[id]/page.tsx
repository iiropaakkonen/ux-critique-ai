import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { FeedbackButtons } from "@/components/FeedbackButtons";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const analysis = await prisma.analysis.findUnique({
    where: { id },
    include: {
      findings: {
        include: { criterion: true },
      },
    },
  });

  if (!analysis) notFound();

  const established = analysis.findings.filter((f) => f.criterion.tier === "ESTABLISHED");
  const exploratory = analysis.findings.filter((f) => f.criterion.tier === "EXPLORATORY");

  return (
    <main className="max-w-3xl mx-auto p-8 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Critique Results</h1>
        <img
          src={analysis.imageUrl}
          alt="Analyzed screenshot"
          className="rounded-lg border max-h-96 object-contain"
        />
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-1">Established Findings</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Grounded in peer-reviewed trust/HCI research — high confidence.
        </p>
        <div className="flex flex-col gap-3">
          {established.length === 0 && (
            <p className="text-sm text-muted-foreground">No findings in this category.</p>
          )}
          {established.map((f) => (
            <Card key={f.id} className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{f.criterion.category}</span>
                <SeverityBadge severity={f.severity} />
              </div>
              <p className="text-sm text-muted-foreground">{f.explanation}</p>
              <p className="text-xs text-muted-foreground mt-2">Source: {f.criterion.source}</p>
              <FeedbackButtons findingId={f.id} />
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-1">Exploratory Findings</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Derived from an original small-sample study — treat as directional, not conclusive.
        </p>
        <div className="flex flex-col gap-3">
          {exploratory.length === 0 && (
            <p className="text-sm text-muted-foreground">No findings in this category.</p>
          )}
          {exploratory.map((f) => (
            <Card key={f.id} className="p-4 border-dashed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{f.criterion.category}</span>
                <SeverityBadge severity={f.severity} />
              </div>
              <p className="text-sm text-muted-foreground">{f.explanation}</p>
              {f.criterion.confidenceNote && (
                <p className="text-xs text-amber-600 mt-2">⚠ {f.criterion.confidenceNote}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Source: {f.criterion.source}</p>
              <FeedbackButtons findingId={f.id} />
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    HIGH: "bg-red-100 text-red-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    LOW: "bg-green-100 text-green-700",
    NOT_APPLICABLE: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[severity] ?? ""}`}>
      {severity.replace("_", " ")}
    </span>
  );
}