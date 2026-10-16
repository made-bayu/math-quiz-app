import type { Metadata } from 'next';
import 'katex/dist/katex.min.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Calculus & Algebra Quiz — Diagnostic Assessment',
  description: 'Interactive mathematical quiz measuring understanding, intervals, limits, and derivatives with error tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 flex flex-col min-h-screen">
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
