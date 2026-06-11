 import { NextResponse } from 'next/server';

export async function GET(request) {
  const tokenUrl = process.env.AUTHENTIK_TOKEN_URL;
  const clientId = process.env.AUTHENTIK_CLIENT_ID;
  const clientSecret = process.env.AUTHENTIK_CLIENT_SECRET;
  const envRedirectUri = process.env.AUTHENTIK_REDIRECT_URI;
  const runtimeRedirectUri = `${request.nextUrl.origin}/api/auth/callback`;
  const redirectUri = envRedirectUri && new URL(envRedirectUri).origin === request.nextUrl.origin
    ? envRedirectUri
    : runtimeRedirectUri;

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  console.log('[auth/callback] request', {
    code: !!code,
    state: !!state,
    tokenUrl: !!tokenUrl,
    clientId: !!clientId,
    clientSecret: !!clientSecret,
    envRedirectUri: !!envRedirectUri,
    runtimeRedirectUri,
    redirectUri,
  });

  if (!tokenUrl || !clientId || !clientSecret) {
    console.error('[auth/callback] missing Authentik config', {
      tokenUrl: !!tokenUrl,
      clientId: !!clientId,
      clientSecret: !!clientSecret,
      envRedirectUri: !!envRedirectUri,
    });
    return new NextResponse('Missing Authentik configuration', { status: 500 });
  }

  if (envRedirectUri && redirectUri !== envRedirectUri) {
    console.warn('[auth/callback] using runtime redirect URI instead of env redirect URI', {
      envRedirectUri,
      runtimeRedirectUri,
    });
  }

  if (!code) {
    console.warn('[auth/callback] missing authorization code in callback');
    return new NextResponse('Missing authorization code', { status: 400 });
  }

  let redirect = '/';
  if (state) {
    try {
      const { redirect: parsedRedirect } = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
      if (parsedRedirect) redirect = parsedRedirect;
    } catch (error) {
      console.warn('[auth/callback] invalid state payload, fallback to /', error);
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
    console.error('[auth/callback] token exchange failed', tokenResponse.status, text);
    return new NextResponse(`Token exchange failed: ${tokenResponse.status} ${text}`, { status: 500 });
  }

  const tokenData = await tokenResponse.json();
  console.log('[auth/callback] token exchange succeeded', {
    redirect,
    expires_in: tokenData.expires_in,
    hasAccessToken: !!tokenData.access_token,
  });

  const redirectUrl = new URL(redirect, request.url).toString();
  console.log('[auth/callback] redirecting to absolute URL', redirectUrl);
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set('auth_token', tokenData.access_token || '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: tokenData.expires_in ? Number(tokenData.expires_in) : 60 * 60,
    path: '/',
  });

  return response;
}
