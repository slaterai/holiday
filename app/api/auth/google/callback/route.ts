import { google } from "googleapis";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/dashboard?gmail=error", req.url));
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Get user email from Google
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data: googleUser } = await oauth2.userinfo.get();

  // Store tokens in a cookie temporarily (Supabase storage comes later)
  const response = NextResponse.redirect(new URL("/dashboard?gmail=connected", req.url));

  response.cookies.set("gmail_access_token", tokens.access_token || "", {
    httpOnly: true,
    secure: true,
    maxAge: 3600,
    path: "/",
  });

  if (tokens.refresh_token) {
    response.cookies.set("gmail_refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  response.cookies.set("gmail_email", googleUser.email || "", {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
