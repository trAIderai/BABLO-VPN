import { NextRequest, NextResponse } from 'next/server';

const XRAY_UI_URL = process.env.XRAY_UI_URL || 'http://xray-ui:2053';
const XRAY_UI_USERNAME = process.env.XRAY_UI_USERNAME || 'admin';
const XRAY_UI_PASSWORD = process.env.XRAY_UI_PASSWORD || 'admin';

// Store session cookie
let sessionCookie: string | null = null;

async function login(): Promise<string | null> {
  try {
    const response = await fetch(`${XRAY_UI_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        username: XRAY_UI_USERNAME,
        password: XRAY_UI_PASSWORD,
      }),
    });

    const cookies = response.headers.get('set-cookie');
    if (cookies) {
      sessionCookie = cookies.split(';')[0];
      return sessionCookie;
    }
    return null;
  } catch (error) {
    console.error('3x-ui login error:', error);
    return null;
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  if (!sessionCookie) {
    await login();
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Cookie': sessionCookie || '',
    },
  });

  // If unauthorized, try to re-login
  if (response.status === 401 || response.status === 404) {
    await login();
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Cookie': sessionCookie || '',
      },
    });
  }

  return response;
}

// Get all inbounds
export async function GET(request: NextRequest) {
  try {
    const response = await fetchWithAuth(`${XRAY_UI_URL}/panel/api/inbounds/list`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Get inbounds error:', error);
    return NextResponse.json({ error: 'Failed to get inbounds' }, { status: 500 });
  }
}

// Add client to inbound
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inboundId, email, uuid } = body;

    const clientData = {
      id: inboundId,
      settings: JSON.stringify({
        clients: [{
          id: uuid,
          email: email,
          flow: 'xtls-rprx-vision',
          limitIp: 0,
          totalGB: 0,
          expiryTime: 0,
          enable: true,
        }]
      })
    };

    const response = await fetchWithAuth(`${XRAY_UI_URL}/panel/api/inbounds/addClient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Add client error:', error);
    return NextResponse.json({ error: 'Failed to add client' }, { status: 500 });
  }
}
