import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    const analysis = await prisma.analysis.create({
      data: {
        userId: "temp-user", // placeholder until real auth exists
        imageUrl,
      },
    });

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create analysis" }, { status: 500 });
  }
}