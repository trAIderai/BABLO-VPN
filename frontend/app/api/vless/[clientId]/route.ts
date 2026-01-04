import { NextResponse } from 'next/server';

// This dynamic route has issues with Next.js 14 App Router
// Use /api/vless-url?id=xxx instead
export async function GET() {
  return NextResponse.json({
    error: 'Use /api/vless-url?id=xxx instead',
    redirect: '/api/vless-url',
  }, { status: 400 });
}
