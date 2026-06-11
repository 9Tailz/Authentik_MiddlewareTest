import { NextResponse } from 'next/server';

export async function GET(request) {
  const authUrl = process.env.AUTHENTIK_AUTH_URL;
  const clientId = process.env.AUTHENTIK_CLIENT_ID;
  const envRedirectUri = process.env.AUTHENTIK_REDIRECT_URI;
  const fallbackRedirectUri = `${request.nextUrl.origin}/api/auth/callback`;
  const redirect = request.nextUrl.searchParams.get('redirect') || '/';

  const redirectUri = envRedirectUri && new URL(envRedirectUri).origin === request.nextUrl.origin
    ? envRedirectUri
    : fallbackRedirectUri;

  console.log('[auth/login] request', {
    redirect,
    authUrl: !!authUrl,
    clientId: !!clientId,
    envRedirectUri: !!envRedirectUri,
    redirectUri,
  });

  if (!authUrl || !clientId) {
    console.error('[auth/login] missing Authentik config', {
      authUrl: !!authUrl,
      clientId: !!clientId,
      envRedirectUri: !!envRedirectUri,
    });
    return new NextResponse('Missing Authentik configuration', { status: 500 });
  }

  if (envRedirectUri && redirectUri !== envRedirectUri) {
    console.warn('[auth/login] using runtime redirect URI instead of env redirect URI', {
      envRedirectUri,
      runtimeRedirectUri: redirectUri,
    });
  }

  const state = Buffer.from(JSON.stringify({ redirect })).toString('base64url');
  const authorizeUrl = new URL(authUrl);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('scope', 'openid profile email');
  authorizeUrl.searchParams.set('state', state);

  console.log('[auth/login] redirecting to Authentik authorize URL', authorizeUrl.toString());
  return NextResponse.redirect(authorizeUrl);
}
