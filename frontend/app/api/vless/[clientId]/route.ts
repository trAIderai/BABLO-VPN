import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: { clientId: string } }
) {
  try {
    const clientId = context.params?.clientId || 'unknown';

    const SERVER_IP = process.env.WG_HOST || '91.184.250.14';
    const VLESS_PORT = process.env.VLESS_PORT || '8443';
    const REALITY_PUBLIC_KEY = process.env.REALITY_PUBLIC_KEY || '';
    const REALITY_SHORT_ID = process.env.REALITY_SHORT_ID || '';

    // Generate deterministic UUID from clientId
    let hash = 0;
    for (let i = 0; i < clientId.length; i++) {
      hash = ((hash << 5) - hash) + clientId.charCodeAt(i);
      hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    const uuid = `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-a${hex.slice(1, 4)}-${hex}${hex.slice(0, 4)}`;

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

    const vlessUrl = `vless://${uuid}@${SERVER_IP}:${VLESS_PORT}?${vlessParams.toString()}#${encodeURIComponent(clientId)}`;

    return NextResponse.json({
      url: vlessUrl,
      uuid: uuid,
      server: SERVER_IP,
      port: VLESS_PORT,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
