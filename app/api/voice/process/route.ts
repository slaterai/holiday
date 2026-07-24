import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function classifyAndProcess(transcript: string) {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an AI assistant for Nick Slater, a luxury travel and lifestyle content creator.

Analyze this voice memo and classify it. Then expand it into a polished concept or interpretation.

Voice memo: "${transcript}"

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "classification": one of: content_concept, email_draft, brand_inquiry, idea, note,
  "summary": "One sentence summary",
  "interpretation": "Expanded/polished version (2-3 sentences) that turns this into actionable insight",
  "tags": ["tag1", "tag2"]
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in Claude response");
  return JSON.parse(jsonMatch[0]);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { transcript } = await req.json();
    if (!transcript) {
      return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
    }

    // Process with Claude
    const processed = await classifyAndProcess(transcript);

    // Save to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Save to voice_messages
    const { data: voiceData, error: voiceError } = await supabase
      .from("voice_messages")
      .insert({
        user_id: userId,
        text: transcript,
        classification: processed.classification,
        ai_interpretation: processed.interpretation,
        routed_to: processed.classification,
        processed_at: new Date().toISOString(),
      } as any)
      .select();

    if (voiceError) throw voiceError;

    // Also save to concepts
    const { data: conceptData, error: conceptError } = await supabase
      .from("concepts")
      .insert({
        user_id: userId,
        title: processed.summary,
        description: processed.interpretation,
        classification: processed.classification,
        tags: processed.tags,
        source: "voice",
      } as any)
      .select();

    if (conceptError) throw conceptError;

    return NextResponse.json({
      success: true,
      id: (voiceData as any)?.[0]?.id,
      conceptId: (conceptData as any)?.[0]?.id,
      classification: processed.classification,
      summary: processed.summary,
      interpretation: processed.interpretation,
      tags: processed.tags,
    });
  } catch (err: any) {
    console.error("Voice process error:", err.message);
    return NextResponse.json(
      { error: err.message || "Processing failed" },
      { status: 500 }
    );
  }
}
