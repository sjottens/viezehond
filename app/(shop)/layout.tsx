import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider } from '@/components/CartProvider';
import { CookieConsent } from '@/components/CookieConsent';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Marquee } from '@/components/Marquee';
import { isDemoData, isDemoPayments } from '@/lib/env';

// Google Analytics 4 meet-ID (staat ook in de Google-tag in je GA-account)
const GA_ID = 'G-QW6BR5WV38';

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
      <Footer />
      <CartDrawer />
      {/* Alleen de winkel meten, niet het beheer */}
      <Analytics />
      {/* GA pas na toestemming; lokaal nooit, anders vervuil je de cijfers in Google Analytics */}
      <CookieConsent gaId={process.env.NODE_ENV === 'production' ? GA_ID : null} />
    </CartProvider>
  );
}
