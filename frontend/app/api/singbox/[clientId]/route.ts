import { NextRequest, NextResponse } from 'next/server';

const WG_EASY_URL = 'http://wg-easy:51821';
const SERVER_IP = process.env.WG_HOST || '';
const VLESS_PORT = process.env.VLESS_PORT || '8443';
const HYSTERIA2_PORT = process.env.HYSTERIA2_PORT || '8445';
const HYSTERIA2_PASSWORD = process.env.HYSTERIA2_PASSWORD || '';

interface SingBoxConfig {
  log: { level: string };
  dns: any;
  inbounds: Array<any>;
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
      const wgOutbound: any = {
        type: 'wireguard',
        tag: 'wireguard',
        server: wgParsed.endpoint.split(':')[0],
        server_port: parseInt(wgParsed.endpoint.split(':')[1]) || 51820,
        local_address: [wgParsed.address],
        private_key: wgParsed.privateKey,
        peer_public_key: wgParsed.peerPublicKey,
        mtu: 1280,
      };
      if (wgParsed.preSharedKey) {
        wgOutbound.pre_shared_key = wgParsed.preSharedKey;
      }
      outbounds.push(wgOutbound);
    }
  }

  // Hysteria2 outbound (UDP-based, bypasses TCP-focused DPI)
  if (HYSTERIA2_PASSWORD) {
    outbounds.push({
      type: 'hysteria2',
      tag: 'hysteria2',
      server: SERVER_IP,
      server_port: parseInt(HYSTERIA2_PORT),
      password: HYSTERIA2_PASSWORD,
      tls: {
        enabled: true,
        insecure: true,
        server_name: 'www.bing.com',
      },
    });
  }

  // VLESS Reality gRPC outbound
  if (vlessUuid) {
    outbounds.push({
      type: 'vless',
      tag: 'vless-reality',
      server: SERVER_IP,
      server_port: parseInt(VLESS_PORT),
      uuid: vlessUuid,
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
      transport: {
        type: 'grpc',
        service_name: 'bablo-grpc',
      },
    });
  }

  // Direct outbound (block and dns handled via route actions in 1.11+)
  outbounds.push({ type: 'direct', tag: 'direct' });

  // Auto selector — include proxy outbounds + direct fallback
  const proxyTags = outbounds
    .filter(o => !['direct'].includes(o.tag))
    .map(o => o.tag);
  const selectorOutbounds = proxyTags.length > 0 ? [...proxyTags, 'direct'] : ['direct'];
  outbounds.unshift({
    type: 'selector',
    tag: 'proxy',
    outbounds: selectorOutbounds,
    default: selectorOutbounds[0],
  });

  return {
    log: { level: 'info' },
    dns: {
      servers: [
        { tag: 'remote', address: 'https://8.8.8.8/dns-query', detour: 'proxy' },
        { tag: 'local', address: 'https://1.1.1.1/dns-query', detour: 'direct' },
      ],
      rules: [
        { outbound: 'any', server: 'local' },
      ],
      final: 'remote',
      strategy: 'prefer_ipv4',
    },
    inbounds: [
      {
        type: 'tun',
        tag: 'tun-in',
        address: ['172.19.0.1/30', 'fdfe:dcba:9876::1/126'],
        auto_route: true,
        stack: 'mixed',
        sniff: true,
      },
    ],
    outbounds,
    route: {
      rules: [
        { protocol: 'dns', action: 'hijack-dns' },
        { ip_is_private: true, outbound: 'direct' },
      ],
      final: 'proxy',
    },
  };
}

function parseWireGuardConfig(config: string): {
  privateKey: string;
  address: string;
  peerPublicKey: string;
  preSharedKey: string;
  endpoint: string;
} | null {
  try {
    const privateKey = config.match(/PrivateKey\s*=\s*(\S+)/)?.[1] || '';
    const address = config.match(/Address\s*=\s*(\S+)/)?.[1] || '';
    const peerPublicKey = config.match(/PublicKey\s*=\s*(\S+)/)?.[1] || '';
    const preSharedKey = config.match(/PresharedKey\s*=\s*(\S+)/)?.[1] || '';
    const endpoint = config.match(/Endpoint\s*=\s*(\S+)/)?.[1] || '';

    if (privateKey && address && peerPublicKey && endpoint) {
      return { privateKey, address, peerPublicKey, preSharedKey, endpoint };
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

    // Use shared VLESS UUID from environment
    const vlessUuid = process.env.VLESS_UUID || null;

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
