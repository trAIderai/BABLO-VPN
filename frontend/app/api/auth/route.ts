import { NextRequest, NextResponse } from 'next/server';

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const WG_EASY_URL = 'http://wg-easy:51821';

async function verifyTurnstile(token: string): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) {
    // If no secret key configured, skip verification
    return true;
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: TURNSTILE_SECRET_KEY,
        response: token,
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, turnstileToken } = body;

    // Verify Turnstile token if configured
    if (TURNSTILE_SECRET_KEY && turnstileToken) {
      const isValid = await verifyTurnstile(turnstileToken);
      if (!isValid) {
        return NextResponse.json(
          { error: 'CAPTCHA verification failed' },
          { status: 403 }
        );
      }
    } else if (TURNSTILE_SECRET_KEY && !turnstileToken) {
      return NextResponse.json(
        { error: 'CAPTCHA token required' },
        { status: 400 }
      );
    }

    // Forward to wg-easy
    const wgResponse = await fetch(`${WG_EASY_URL}/api/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    const cookies = wgResponse.headers.get('set-cookie');
    
    const response = new NextResponse(wgResponse.body, {
      status: wgResponse.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (cookies) {
      response.headers.set('Set-Cookie', cookies);
    }

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
