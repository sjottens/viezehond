import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider } from '@/components/CartProvider';
import { CookieConsent } from '@/components/CookieConsent';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Marquee } from '@/components/Marquee';
import { isDemoData, isDemoPayments } from '@/lib/env';

// Google Analytics 4 meet-ID (staat ook in de Google-tag in je GA-account)
const GA_ID = 'G-T0NXV2QJP8';
const gaId = process.env.NODE_ENV === 'production' ? GA_ID : null;

// Vraag toestemming voor analytische cookies (verplicht in Nederland). Alleen op false zetten om GA te testen.
const ASK_COOKIE_CONSENT = true;

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const demo = isDemoData() || isDemoPayments();
  return (
    <CartProvider>
      <a href="#inhoud" className="skip-link">Naar de inhoud</a>
      {demo && (
        <p className="demo-banner">
          <strong>Demomodus</strong> {isDemoData() && 'nepproducten'}{isDemoData() && isDemoPayments() && ' en '}
          {isDemoPayments() && 'nep-betalingen'}. Er wordt niets echt verkocht. Beheer: <Link href="/admin">/admin</Link>
        </p>
      )}
      <Marquee />
      <Header />
      <main id="inhoud">{children}</main>
      <Footer cookieSettings={ASK_COOKIE_CONSENT} />
      <CartDrawer />
      {/* Alleen de winkel meten, niet het beheer */}
      <Analytics />
      {/* GA pas na toestemming; lokaal nooit, anders vervuil je de cijfers in Google Analytics */}
      {ASK_COOKIE_CONSENT ? <CookieConsent gaId={gaId} /> : gaId && <GoogleAnalytics gaId={gaId} />}
    </CartProvider>
  );
}
