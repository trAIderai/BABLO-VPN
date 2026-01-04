import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const SERVER_IP = process.env.WG_HOST;

    // VLESS Reality config
    const VLESS_PORT = process.env.VLESS_PORT || '8443';
    const VLESS_UUID = process.env.VLESS_UUID;
    const REALITY_PUBLIC_KEY = process.env.REALITY_PUBLIC_KEY;
    const REALITY_SHORT_ID = process.env.REALITY_SHORT_ID;

    // Trojan Reality config
    const TROJAN_PORT = process.env.TROJAN_PORT || '8444';
    const TROJAN_PASSWORD = process.env.TROJAN_PASSWORD;

    // Hysteria2 config
    const HYSTERIA2_PORT = process.env.HYSTERIA2_PORT || '8445';
    const HYSTERIA2_PASSWORD = process.env.HYSTERIA2_PASSWORD;

    const protocols: {
      name: string;
      url: string | null;
      configured: boolean;
      description: string;
    }[] = [];

    // VLESS Reality
    if (SERVER_IP && VLESS_UUID && REALITY_PUBLIC_KEY && REALITY_SHORT_ID) {
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
      const vlessUrl = `vless://${VLESS_UUID}@${SERVER_IP}:${VLESS_PORT}?${vlessParams.toString()}#BABLO-VLESS`;
      protocols.push({
        name: 'VLESS Reality',
        url: vlessUrl,
        configured: true,
        description: 'Обход DPI, маскировка под HTTPS',
      });
    } else {
      protocols.push({
        name: 'VLESS Reality',
        url: null,
        configured: false,
        description: 'Не настроен',
      });
    }

    // Trojan Reality
    if (SERVER_IP && TROJAN_PASSWORD && REALITY_PUBLIC_KEY && REALITY_SHORT_ID) {
      const trojanParams = new URLSearchParams({
        security: 'reality',
        sni: 'www.google.com',
        fp: 'chrome',
        pbk: REALITY_PUBLIC_KEY,
        sid: REALITY_SHORT_ID,
        type: 'tcp',
      });
      const trojanUrl = `trojan://${TROJAN_PASSWORD}@${SERVER_IP}:${TROJAN_PORT}?${trojanParams.toString()}#BABLO-Trojan`;
      protocols.push({
        name: 'Trojan Reality',
        url: trojanUrl,
        configured: true,
        description: 'Маскировка под обычный HTTPS трафик',
      });
    } else {
      protocols.push({
        name: 'Trojan Reality',
        url: null,
        configured: false,
        description: 'Не настроен',
      });
    }

    // Hysteria2
    if (SERVER_IP && HYSTERIA2_PASSWORD) {
      const hy2Params = new URLSearchParams({
        insecure: '1',
        sni: 'www.google.com',
      });
      const hy2Url = `hysteria2://${HYSTERIA2_PASSWORD}@${SERVER_IP}:${HYSTERIA2_PORT}?${hy2Params.toString()}#BABLO-Hysteria2`;
      protocols.push({
        name: 'Hysteria2',
        url: hy2Url,
        configured: true,
        description: 'Быстрый UDP, для плохих сетей',
      });
    } else {
      protocols.push({
        name: 'Hysteria2',
        url: null,
        configured: false,
        description: 'Не настроен',
      });
    }

    return NextResponse.json({
      protocols,
      server: SERVER_IP,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
