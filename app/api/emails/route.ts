import { google } from "googleapis";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getOAuthClient(accessToken: string, refreshToken?: string) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return client;
}

function decodeBody(payload: any): string {
  if (!payload) return "";
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return Buffer.from(part.body.data, "base64").toString("utf-8");
      }
    }
    for (const part of payload.parts) {
      const nested = decodeBody(part);
      if (nested) return nested;
    }
  }
  return "";
}

async function classifyEmail(subject: string, body: string, fromName: string) {
  const prompt = `You are an assistant for Nick Slater, a luxury travel and lifestyle content creator with 500K followers who earns ~$20k/month from brand partnerships.

Classify this email and extract key information. Reply with JSON only, no explanation.

Email:
From: ${fromName}
Subject: ${subject}
Body: ${body.slice(0, 1500)}

Reply with this exact JSON structure:
{
  "classification": one of: brand_inquiry, contract, invoice, usage_rights, follow_up_needed, action_required, noise,
  "urgency": number 1-5 (5 = urgent),
  "summary": "2-3 sentence plain English summary of what this email is actually about",
  "suggestedAction": "One sentence on what Nick should do next",
  "suggestedReply": "A draft reply in Nick's voice if a reply is needed, otherwise null. Nick's tone: direct, warm, professional. Never sycophantic. Gets to the point fast."
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in Claude response");
  return JSON.parse(jsonMatch[0]);
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accessToken = req.cookies.get("gmail_access_token")?.value;
  const refreshToken = req.cookies.get("gmail_refresh_token")?.value;
  const gmailEmail = req.cookies.get("gmail_email")?.value;

  if (!accessToken) {
    return NextResponse.json({ connected: false });
  }

  try {
    const oauth2Client = getOAuthClient(accessToken, refreshToken);
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Fetch last 20 emails
    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: 20,
      q: "in:inbox",
    });

    const messages = listRes.data.messages || [];

    const emails = await Promise.all(
      messages.slice(0, 15).map(async (msg) => {
        const full = await gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "full",
        });

        const headers = full.data.payload?.headers || [];
        const get = (name: string) => headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";

        const subject = get("Subject") || "(no subject)";
        const from = get("From");
        const date = get("Date");
        const fromName = from.includes("<") ? from.split("<")[0].trim().replace(/"/g, "") : from;
        const fromEmail = from.match(/<(.+)>/)?.[1] || from;

        const body = decodeBody(full.data.payload);

        // Classify with Claude
        const classification = await classifyEmail(subject, body, fromName);

        return {
          id: msg.id,
          from: fromEmail,
          fromName: fromName || fromEmail,
          subject,
          receivedAt: date,
          body: body.slice(0, 500),
          ...classification,
        };
      })
    );

    // Filter out noise unless everything is noise
    const meaningful = emails.filter((e) => e.classification !== "noise");
    const result = meaningful.length > 0 ? meaningful : emails;

    return NextResponse.json({
      connected: true,
      gmailEmail,
      emails: result,
    });
  } catch (err: any) {
    console.error("Gmail fetch error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
