import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { Bricolage_Grotesque, Figtree } from 'next/font/google';
import './globals.css';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display' });
const body = Figtree({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'Viezehond.nl – kammen, shampoo en handdoeken voor je hond',
    template: '%s · Viezehond.nl',
  },
  description: 'Kammen, borstels, shampoo en handdoeken voor de vachtverzorging van je hond. Van modderpoot naar showhond.',
  openGraph: { siteName: 'Viezehond.nl', locale: 'nl_NL', type: 'website' },
};

export const viewport: Viewport = { themeColor: '#fff6e9' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" data-scroll-behavior="smooth" className={`${display.variable} ${body.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
