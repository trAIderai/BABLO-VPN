import { NextResponse } from "next/server";

const ADGUARD_URL = process.env.ADGUARD_URL || "http://host.docker.internal:8053";
const ADGUARD_USER = process.env.ADGUARD_USER || "admin";
const ADGUARD_PASS = process.env.ADGUARD_PASS || "";

async function adguardFetch(path: string, options: RequestInit = {}) {
  const auth = Buffer.from(`${ADGUARD_USER}:${ADGUARD_PASS}`).toString("base64");

  const res = await fetch(`${ADGUARD_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  });

  return res;
}

// GET /api/adguard - get protection status
export async function GET() {
  try {
    const res = await adguardFetch("/control/status");

    if (!res.ok) {
      return NextResponse.json({ error: "AdGuard unavailable" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({
      enabled: data.protection_enabled,
      running: data.running,
    });
  } catch (e) {
    console.error("AdGuard status error:", e);
    return NextResponse.json({ error: "AdGuard unavailable" }, { status: 502 });
  }
}

// POST /api/adguard - toggle protection
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const enabled = body.enabled ?? true;

    const res = await adguardFetch("/control/protection", {
      method: "POST",
      body: JSON.stringify({ enabled, duration: 0 }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to toggle protection" }, { status: 502 });
    }

    return NextResponse.json({ enabled });
  } catch (e) {
    console.error("AdGuard toggle error:", e);
    return NextResponse.json({ error: "Failed to toggle protection" }, { status: 502 });
  }
}
