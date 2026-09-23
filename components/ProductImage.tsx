import { category as findCategory } from '@/lib/catalog';
import { ProductArt } from './ProductArt';

type Props = {
  src: string | null;
  name: string;
  slug: string;
  category?: string;
  className?: string;
};

// Foto als die er is, anders een illustratie. Achtergrond in de kleur van de categorie.
export function ProductImage({ src, name, slug, category = '', className = '' }: Props) {
  const color = findCategory(category)?.color ?? 'var(--c-kammen)';
  return (
    <div className={`product-img ${className}`} style={{ '--art-bg': color } as React.CSSProperties}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} loading="lazy" />
      ) : (
        <ProductArt slug={slug} category={category} name={name} />
      )}
    </div>
  );
}
