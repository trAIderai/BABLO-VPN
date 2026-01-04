import { NextRequest, NextResponse } from 'next/server';

const WG_EASY_URL = 'http://wg-easy:51821';
const SERVER_IP = process.env.WG_HOST || '91.184.250.14';
const VLESS_PORT = process.env.VLESS_PORT || '8443';

interface SingBoxConfig {
  log: { level: string };
  dns: { servers: Array<{ tag: string; address: string; detour?: string }> };
  inbounds: Array<{ type: string; tag: string; listen: string; listen_port?: number; sniff?: boolean }>;
  outbounds: Array<any>;
  route: { rules: Array<any>; final: string };
}

// Generate SingBox config with multiple protocols
function generateSingBoxConfig(
  clientName: string,
  wgConfig: string | null,
  vlessUuid: string | null
): SingBoxConfig {
  const outbounds: any[] = [];

  // WireGuard outbound (if available)
  if (wgConfig) {
    const wgParsed = parseWireGuardConfig(wgConfig);
    if (wgParsed) {
      outbounds.push({
        type: 'wireguard',
        tag: 'wireguard',
        server: wgParsed.endpoint.split(':')[0],
        server_port: parseInt(wgParsed.endpoint.split(':')[1]) || 51820,
        local_address: [wgParsed.address],
        private_key: wgParsed.privateKey,
        peer_public_key: wgParsed.peerPublicKey,
        mtu: 1280,
      });
    }
  }

  // VLESS Reality outbound (if available)
  if (vlessUuid) {
    outbounds.push({
      type: 'vless',
      tag: 'vless-reality',
      server: SERVER_IP,
      server_port: parseInt(VLESS_PORT),
      uuid: vlessUuid,
      flow: 'xtls-rprx-vision',
      tls: {
        enabled: true,
        server_name: 'www.google.com',
        utls: { enabled: true, fingerprint: 'chrome' },
        reality: {
          enabled: true,
          public_key: process.env.REALITY_PUBLIC_KEY || '',
          short_id: process.env.REALITY_SHORT_ID || '',
        },
      },
    });
  }

  // Auto selector
  outbounds.push({
    type: 'selector',
    tag: 'proxy',
    outbounds: outbounds.map(o => o.tag).filter(t => t !== 'proxy'),
    default: outbounds.length > 0 ? outbounds[0].tag : 'direct',
  });

  // Direct and block
  outbounds.push({ type: 'direct', tag: 'direct' });
  outbounds.push({ type: 'block', tag: 'block' });

  return {
    log: { level: 'info' },
    dns: {
      servers: [
        { tag: 'google', address: 'https://8.8.8.8/dns-query', detour: 'proxy' },
        { tag: 'local', address: '223.5.5.5' },
      ],
    },
    inbounds: [
      { type: 'tun', tag: 'tun-in', listen: '::', sniff: true },
    ],
    outbounds,
    route: {
      rules: [
        { protocol: 'dns', outbound: 'dns' },
        { geoip: ['private'], outbound: 'direct' },
      ],
      final: 'proxy',
    },
  };
}

function parseWireGuardConfig(config: string): {
  privateKey: string;
  address: string;
  peerPublicKey: string;
  endpoint: string;
} | null {
  try {
    const privateKey = config.match(/PrivateKey\s*=\s*(\S+)/)?.[1] || '';
    const address = config.match(/Address\s*=\s*(\S+)/)?.[1] || '';
    const peerPublicKey = config.match(/PublicKey\s*=\s*(\S+)/)?.[1] || '';
    const endpoint = config.match(/Endpoint\s*=\s*(\S+)/)?.[1] || '';

    if (privateKey && address && peerPublicKey && endpoint) {
      return { privateKey, address, peerPublicKey, endpoint };
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const clientId = params.clientId;
    const cookie = request.headers.get('cookie') || '';

    // Get WireGuard config
    let wgConfig: string | null = null;
    try {
      const wgResponse = await fetch(
        `${WG_EASY_URL}/api/wireguard/client/${clientId}/configuration`,
        { headers: { Cookie: cookie } }
      );
      if (wgResponse.ok) {
        wgConfig = await wgResponse.text();
      }
    } catch (e) {
      console.error('WireGuard config fetch error:', e);
    }

    // Get client info to find VLESS UUID (stored in client name as suffix)
    let vlessUuid: string | null = null;
    try {
      const clientResponse = await fetch(
        `${WG_EASY_URL}/api/wireguard/client`,
        { headers: { Cookie: cookie } }
      );
      if (clientResponse.ok) {
        const clients = await clientResponse.json();
        const client = clients.find((c: any) => c.id === clientId);
        // UUID stored in client metadata or generate from client ID
        if (client?.vlessUuid) {
          vlessUuid = client.vlessUuid;
        }
      }
    } catch (e) {
      console.error('Client info fetch error:', e);
    }

    // Generate SingBox config
    const config = generateSingBoxConfig(
      clientId,
      wgConfig,
      vlessUuid
    );

    // Return as JSON download
    return new NextResponse(JSON.stringify(config, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${clientId}-singbox.json"`,
      },
    });
  } catch (error) {
    console.error('SingBox config error:', error);
    return NextResponse.json(
      { error: 'Failed to generate config' },
      { status: 500 }
    );
  }
}
