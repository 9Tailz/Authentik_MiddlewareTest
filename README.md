# Authentik_MiddlewareTest

A basic Next.js Hello World application generated manually for the Authentik_MiddlewareTest repository.

## Commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run start`

## Authentik Middleware

This project now includes middleware to protect all frontend routes and redirect unauthenticated users to Authentik.

### Environment variables

Create a `.env.local` file with values for:

- `AUTHENTIK_AUTH_URL` — Authentik authorization endpoint
- `AUTHENTIK_TOKEN_URL` — Authentik token endpoint
- `AUTHENTIK_CLIENT_ID`
- `AUTHENTIK_CLIENT_SECRET`
- `AUTHENTIK_REDIRECT_URI` — e.g. `http://localhost:3000/api/auth/callback`

### How it works

- Unauthenticated requests are redirected to `/api/auth/login`
- The login route redirects to Authentik with an OIDC authorization request
- Authentik sends the user back to `/api/auth/callback`
- The callback route exchanges the authorization code for a token and sets an `auth_token` cookie
