import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token');

  if (!authToken) {
    const envRedirectUri = process.env.AUTHENTIK_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';
    const origin = new URL(envRedirectUri).origin;
    const redirectUrl = new URL('/api/auth/login', origin);
    redirectUrl.searchParams.set('redirect', '/');
    redirect(redirectUrl.toString());
  }

  return (
    <main>
      <h1>Hello World</h1>
      <p>Welcome to the Authentik Middleware Test app.</p>
    </main>
  );
}
