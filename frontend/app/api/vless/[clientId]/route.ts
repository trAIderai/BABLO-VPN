import { NextRequest, NextResponse } from 'next/server';

const WG_EASY_URL = 'http://wg-easy:51821';
const SERVER_IP = process.env.WG_HOST || '91.184.250.14';
const VLESS_PORT = process.env.VLESS_PORT || '8443';
const REALITY_PUBLIC_KEY = process.env.REALITY_PUBLIC_KEY || '';
const REALITY_SHORT_ID = process.env.REALITY_SHORT_ID || '';

// Generate VLESS Reality URL for proxy clients (NekoBox, v2rayN, etc.)
function generateVlessUrl(clientName: string, uuid: string): string {
  const params = new URLSearchParams({
    encryption: 'none',
    flow: 'xtls-rprx-vision',
    security: 'reality',
    sni: 'www.google.com',
    fp: 'chrome',
    pbk: REALITY_PUBLIC_KEY,
    sid: REALITY_SHORT_ID,
    type: 'tcp',
  });

  // vless://UUID@SERVER:PORT?params#NAME
  const url = `vless://${uuid}@${SERVER_IP}:${VLESS_PORT}?${params.toString()}#${encodeURIComponent(clientName)}`;
  return url;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const clientId = params.clientId;
    const cookie = request.headers.get('cookie') || '';

    // Get client info
    let clientName = clientId;
    try {
      const clientResponse = await fetch(
        `${WG_EASY_URL}/api/wireguard/client`,
        { headers: { Cookie: cookie } }
      );
      if (clientResponse.ok) {
        const clients = await clientResponse.json();
        const client = clients.find((c: any) => c.id === clientId);
        if (client) {
          clientName = client.name.replace(' [PRO]', '');
        }
      }
    } catch (e) {
      console.error('Client info fetch error:', e);
    }

    // Generate UUID from client ID (deterministic)
    // Using client ID to create a consistent UUID for this client
    const uuid = generateUuidFromString(clientId);

    // Generate VLESS URL
    const vlessUrl = generateVlessUrl(clientName, uuid);

    return NextResponse.json({
      url: vlessUrl,
      uuid: uuid,
      server: SERVER_IP,
      port: VLESS_PORT,
    });
  } catch (error) {
    console.error('VLESS URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate VLESS URL' },
      { status: 500 }
    );
  }
}

// Generate a deterministic UUID from a string
function generateUuidFromString(str: string): string {
  // Simple hash-based UUID generation
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  // Convert to positive number and create UUID-like string
  const num = Math.abs(hash);
  const hex = num.toString(16).padStart(8, '0');

  // Format as UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuid = `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-a${hex.slice(1, 4)}-${hex}${hex.slice(0, 4)}`;
  return uuid;
}
