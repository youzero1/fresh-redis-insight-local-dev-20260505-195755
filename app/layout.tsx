import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redis Insight Key Manager',
  description: 'A production-ready Redis key inspection and management tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0f1117', color: '#e2e8f0', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
