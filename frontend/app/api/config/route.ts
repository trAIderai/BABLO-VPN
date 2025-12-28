import { NextResponse } from 'next/server';

// Force dynamic to read env vars at runtime, not build time
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || null,
  });
}
