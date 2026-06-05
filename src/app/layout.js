import './globals.css';

export const metadata = {
  title: 'Authentik Middleware Test',
  description: 'Basic Next.js Hello World app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
