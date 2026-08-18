import prisma from "@/lib/prisma";
import anthropic from "@/lib/anthropic";
import { buildSystemPrompt } from "@/lib/rubric";
import { ClaudeResponseSchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const analysis = await prisma.analysis.findUnique({ where: { id } });
    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    // Fetch the image and convert to base64 for Claude's vision input
    const imageRes = await fetch(analysis.imageUrl);
    if (!imageRes.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
    }
    const imageBuffer = await imageRes.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mediaType = imageRes.headers.get("content-type") || "image/png";

    const systemPrompt = await buildSystemPrompt();

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
                data: base64Image,
              },
            },
            {
              type: "text",
              text: "Analyze this UI screenshot against the criteria in your system prompt.",
            },
          ],
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No text response from Claude" }, { status: 500 });
    }

    let parsed: unknown;
    try {
        const cleanedText = textBlock.text
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();
        parsed = JSON.parse(cleanedText);
    }   catch {
        return NextResponse.json(
            { error: "Claude did not return valid JSON", raw: textBlock.text },
            { status: 500 }
        );
    }

    const result = ClaudeResponseSchema.safeParse(parsed);
    if (!result.success) {
      return NextResponse.json(
        { error: "Response failed schema validation", details: result.error.format() },
        { status: 500 }
      );
    }

    const findings = await prisma.$transaction(
      result.data.findings.map((f) =>
        prisma.finding.create({
          data: {
            analysisId: id,
            criterionId: f.criterionId,
            severity: f.severity,
            explanation: f.explanation,
          },
        })
      )
    );

    return NextResponse.json({ findings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}