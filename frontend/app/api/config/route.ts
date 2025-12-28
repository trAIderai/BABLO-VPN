import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Debug: log all env vars starting with TURNSTILE
  console.log('TURNSTILE_SITE_KEY:', process.env.TURNSTILE_SITE_KEY);
  console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('TURNSTILE')));
  
  return NextResponse.json({
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || null,
    debug: {
      hasKey: !!process.env.TURNSTILE_SITE_KEY,
      envKeys: Object.keys(process.env).filter(k => k.includes('TURN')).length
    }
  });
}
