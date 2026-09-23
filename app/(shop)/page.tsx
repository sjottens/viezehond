import Link from 'next/link';
import { MudWipe } from '@/components/MudWipe';
import { ProductCard } from '@/components/ProductCard';
import { ArrowIcon } from '@/components/icons';
import { CATEGORIES, category } from '@/lib/catalog';
import { euro, FREE_SHIPPING_FROM_CENTS } from '@/lib/money';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

const STEPS = [
  { n: 1, slug: 'kammen', title: 'Kammen', text: 'Eerst klitten en losse haren eruit. Een natte klit wordt alleen maar erger.' },
  { n: 2, slug: 'shampoo', title: 'Wassen', text: 'Milde shampoo, goed uitspoelen. Parfumvrij, want je hond ruikt al genoeg.' },
  { n: 3, slug: 'handdoeken', title: 'Drogen', text: 'Stevig deppen met microvezel. Dan schudt hij de rest niet over jou heen.' },
];

export default async function Home({ searchParams }: { searchParams: Promise<{ categorie?: string }> }) {
  const { categorie } = await searchParams;
  const active = categorie && category(categorie) ? categorie : undefined;
  const products = await store().listProducts({ category: active });

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Vachtverzorging voor honden</p>
          <h1>
            <span className="h-dirty">Vieze hond?</span>
            <span className="h-clean">Zo weer schoon.</span>
          </h1>
          <p className="lede">
            Kammen, borstels, shampoo en handdoeken om je hond thuis te wassen. Gratis verzending vanaf {euro(FREE_SHIPPING_FROM_CENTS)}.
          </p>
          <div className="hero-actions">
            <a href="#producten" className="btn btn-big">Naar de producten <ArrowIcon /></a>
            <a href="#wasstraat" className="btn btn-big btn-ghost">Hoe was je een hond?</a>
          </div>
          <p className="hero-hint" aria-hidden="true">Probeer maar: veeg de modder eraf</p>
        </div>
        <div className="hero-art">
          <MudWipe />
        </div>
      </section>

      <section className="steps" id="wasstraat" aria-labelledby="steps-title">
        <h2 id="steps-title" className="section-title">De wasstraat <span>in 3 stappen</span></h2>
        <ol>
          {STEPS.map((s) => (
            <li key={s.n} style={{ '--step': category(s.slug)?.color } as React.CSSProperties}>
              <span className="step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <Link href={`/?categorie=${s.slug}#producten`} className="step-link">
                Bekijk {category(s.slug)?.short.toLowerCase()} <ArrowIcon size={18} />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="shop" id="producten" aria-labelledby="shop-title">
        <div className="shop-head">
          <h2 id="shop-title" className="section-title">{active ? category(active)?.label : 'Alles voor een schone hond'}</h2>
          <nav className="filters" aria-label="Filter op categorie">
            <Link href="/#producten" className={!active ? 'chip active' : 'chip'} scroll={false}>Alles</Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/?categorie=${c.slug}#producten`}
                className={active === c.slug ? 'chip active' : 'chip'}
                style={{ '--dot': c.color } as React.CSSProperties}
                scroll={false}
              >
                {c.label}
              </Link>
            ))}
          </nav>
        </div>

        {products.length === 0 ? (
          <p className="empty">Er staan nog geen producten in deze categorie.</p>
        ) : (
          <ul className="grid">
            {products.map((p) => (
              <li key={p.id}><ProductCard product={p} /></li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
