import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // All values must come from environment variables
    const SERVER_IP = process.env.WG_HOST;
    const VLESS_PORT = process.env.VLESS_PORT || '8443';
    const VLESS_UUID = process.env.VLESS_UUID;
    const REALITY_PUBLIC_KEY = process.env.REALITY_PUBLIC_KEY;
    const REALITY_SHORT_ID = process.env.REALITY_SHORT_ID;

    // Check required env vars
    if (!SERVER_IP || !VLESS_UUID || !REALITY_PUBLIC_KEY || !REALITY_SHORT_ID) {
      return NextResponse.json({
        error: 'VLESS not configured. Required env vars: WG_HOST, VLESS_UUID, REALITY_PUBLIC_KEY, REALITY_SHORT_ID',
        configured: false,
      }, { status: 503 });
    }

    // Build VLESS URL
    const vlessParams = new URLSearchParams({
      encryption: 'none',
      flow: 'xtls-rprx-vision',
      security: 'reality',
      sni: 'www.google.com',
      fp: 'chrome',
      pbk: REALITY_PUBLIC_KEY,
      sid: REALITY_SHORT_ID,
      type: 'tcp',
    });

    const vlessUrl = `vless://${VLESS_UUID}@${SERVER_IP}:${VLESS_PORT}?${vlessParams.toString()}#BABLO-VPN`;

    return NextResponse.json({
      url: vlessUrl,
      uuid: VLESS_UUID,
      server: SERVER_IP,
      port: VLESS_PORT,
      configured: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
