import type { Metadata } from 'next';
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
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
          integrity="sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGExxAU4wnPrtvYcIIxoUUXzHZQvQb"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-slate-950 text-slate-100 flex flex-col min-h-screen">
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
