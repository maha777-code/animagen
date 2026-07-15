import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Animagen — 3D Animation from Text',
  description: 'Generate procedural 3D animations from natural language prompts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
