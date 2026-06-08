import { NextResponse } from 'next/server';

export async function GET(request) {
  const tokenUrl = process.env.AUTHENTIK_TOKEN_URL;
  const clientId = process.env.AUTHENTIK_CLIENT_ID;
  const clientSecret = process.env.AUTHENTIK_CLIENT_SECRET;
  const redirectUri = process.env.AUTHENTIK_REDIRECT_URI;

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  if (!tokenUrl || !clientId || !clientSecret || !redirectUri) {
    return new NextResponse('Missing Authentik configuration', { status: 500 });
  }

  if (!code) {
    return new NextResponse('Missing authorization code', { status: 400 });
  }

  let redirect = '/';
  if (state) {
    try {
      const { redirect: parsedRedirect } = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
      if (parsedRedirect) redirect = parsedRedirect;
    } catch (error) {
      // ignore invalid state and fallback to /
    }
  }

  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    const text = await tokenResponse.text();
    return new NextResponse(`Token exchange failed: ${tokenResponse.status} ${text}`, { status: 500 });
  }

  const tokenData = await tokenResponse.json();
  const response = NextResponse.redirect(redirect);
  response.cookies.set('auth_token', tokenData.access_token || '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: tokenData.expires_in ? Number(tokenData.expires_in) : 60 * 60,
    path: '/',
  });

  return response;
}
