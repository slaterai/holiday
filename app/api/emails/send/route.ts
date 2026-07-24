import { google } from "googleapis";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { toEmail, subject, replyText } = await req.json();

  if (!toEmail || !subject || !replyText) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const accessToken = req.cookies.get("gmail_access_token")?.value;
  const refreshToken = req.cookies.get("gmail_refresh_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Gmail not connected" }, { status: 401 });
  }

  try {
    const oauth2Client = getOAuthClient(accessToken, refreshToken);
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Create email message
    const message = [
      `To: ${toEmail}`,
      `Subject: Re: ${subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      replyText,
    ].join("\n");

    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Send email
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Gmail send error:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
