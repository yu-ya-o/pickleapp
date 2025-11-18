import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PickleHub API',
  description: 'Backend API for PickleHub app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
