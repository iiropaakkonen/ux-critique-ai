import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await req.json();

    if (!["ACCEPTED", "DISMISSED", "FLAGGED_WRONG"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const feedback = await prisma.feedback.upsert({
      where: { findingId: id },
      update: { action },
      create: {
        findingId: id,
        userId: "temp-user",
        action,
      },
    });

    return NextResponse.json({ feedback });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}