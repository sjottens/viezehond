import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider } from '@/components/CartProvider';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Marquee } from '@/components/Marquee';
import { isDemoData, isDemoPayments } from '@/lib/env';

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
    </CartProvider>
  );
}
