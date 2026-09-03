import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const response = NextResponse.json({
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || null,
    // Метка узла в шапке. Не задана — плашки нет (так у пражской панели).
    nodeLabel: process.env.NODE_LABEL || null,
    // Соседняя панель: кнопка перехода. Не задана — кнопки нет.
    peerUrl: process.env.PEER_URL || null,
    peerLabel: process.env.PEER_LABEL || null,
  });
  
  // Disable caching
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  
  return response;
}
