import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const response = NextResponse.json({
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || null,
  });
  
  // Disable caching
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  
  return response;
}
