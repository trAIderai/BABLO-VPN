import { NextResponse } from 'next/server';

// UUIDs registered in 3x-ui panel
const REGISTERED_UUIDS = [
  '***REDACTED-UUID***',
  '***REDACTED-UUID***',
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('id') || 'default';

    const SERVER_IP = process.env.WG_HOST || '91.184.250.14';
    const VLESS_PORT = process.env.VLESS_PORT || '8443';
    const REALITY_PUBLIC_KEY = process.env.REALITY_PUBLIC_KEY || '1ULl7LzQbfyx6jS2VxwwAomvxr-_vOFcX-gqF-7DUTc';
    const REALITY_SHORT_ID = process.env.REALITY_SHORT_ID || '6cf08f5fd8c7f7';

    // Use first registered UUID (all users share the same VLESS client for now)
    const uuid = REGISTERED_UUIDS[0];

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

    const vlessUrl = `vless://${uuid}@${SERVER_IP}:${VLESS_PORT}?${vlessParams.toString()}#BABLO-VPN`;

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
