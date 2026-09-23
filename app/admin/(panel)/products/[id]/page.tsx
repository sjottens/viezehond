import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';
import { store } from '@/lib/store';
import { ProductForm } from '../ProductForm';

export const dynamic = 'force-dynamic';

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const product = await store().getProduct(id);
  if (!product) notFound();
  return (
    <section className="narrow">
      <h1>{product.name}</h1>
      <ProductForm product={product} />
    </section>
  );
}
