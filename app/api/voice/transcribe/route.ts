import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const buffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString("base64");

    const response = await anthropic.messages.create({
      model: "claude-opus-4-1-20250805",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "audio",
              source: {
                type: "base64",
                media_type: "audio/webm",
                data: base64Audio,
              },
            },
            {
              type: "text",
              text: "Transcribe this audio message. Return only the transcribed text, nothing else.",
            },
          ] as any,
        },
      ],
    } as any);

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("Voice transcribe error:", err.message);
    return NextResponse.json(
      { error: err.message || "Transcription failed" },
      { status: 500 }
    );
  }
}
