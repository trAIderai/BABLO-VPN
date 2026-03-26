import { NextRequest, NextResponse } from 'next/server';

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
// Note: AmneziaWG is NOT included here — sing-box doesn't support AmneziaWG obfuscation.
// AmneziaWG clients use the native AmneziaVPN app with .conf files instead.
function generateSingBoxConfig(
  clientName: string,
  vlessUuid: string | null
): SingBoxConfig {
  const outbounds: any[] = [];

  // VLESS Reality gRPC outbound (primary — gRPC over H2 defeats Russia DPI threshold)
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

  // Hysteria2 outbound (fallback — QUIC/UDP)
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

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const clientId = params.clientId;

    // Use shared VLESS UUID from environment
    const vlessUuid = process.env.VLESS_UUID || null;

    // Generate SingBox config (VLESS Reality + Hysteria2, no WireGuard — use AmneziaVPN app for AmneziaWG)
    const config = generateSingBoxConfig(
      clientId,
      vlessUuid
    );

    // Return as JSON download
    return new NextResponse(JSON.stringify(config, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${clientId.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_=+.\-]/g, '')}-singbox.json"`,
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
