import { NextResponse } from 'next/server';

export async function GET(request) {
  const authUrl = process.env.AUTHENTIK_AUTH_URL;
  const clientId = process.env.AUTHENTIK_CLIENT_ID;
  const redirectUri = process.env.AUTHENTIK_REDIRECT_URI;
  const redirect = request.nextUrl.searchParams.get('redirect') || '/';

  if (!authUrl || !clientId || !redirectUri) {
    return new NextResponse('Missing Authentik configuration', { status: 500 });
  }

  const state = Buffer.from(JSON.stringify({ redirect })).toString('base64url');
  const authorizeUrl = new URL(authUrl);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('scope', 'openid profile email');
  authorizeUrl.searchParams.set('state', state);

  return NextResponse.redirect(authorizeUrl);
}
