import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || null,
  });
}
