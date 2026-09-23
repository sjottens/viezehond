import Link from 'next/link';
import { CATEGORIES } from '@/lib/catalog';
import { PawIcon } from './icons';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <p className="footer-logo">viezehond<span className="tld">.nl</span></p>
          <p>Alles om je hond thuis te wassen, kammen en drogen. Zodat de modder buiten blijft en de bank schoon.</p>
        </div>
        <nav aria-label="Winkel">
          <h2>Winkel</h2>
          <ul>
            {CATEGORIES.map((c) => (
              <li key={c.slug}><Link href={`/?categorie=${c.slug}#producten`}>{c.label}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Service">
          <h2>Service</h2>
          <ul>
            <li><Link href="/winkelwagen">Winkelwagen</Link></li>
            <li><Link href="/voorwaarden">Algemene voorwaarden</Link></li>
          </ul>
        </nav>
      </div>
      <p className="footer-bottom">
        <PawIcon size={14} /> © {new Date().getFullYear()} Viezehond.nl · Veilig betalen via Mollie
      </p>
    </footer>
  );
}
