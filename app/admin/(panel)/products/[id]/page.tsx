import { notFound } from 'next/navigation';
import { db, type Product } from '@/lib/db';
import { ProductForm } from '../ProductForm';

export const dynamic = 'force-dynamic';

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await db().from('products').select('*').eq('id', id).maybeSingle<Product>();
  if (!data) notFound();
  return (
    <section className="narrow">
      <h1>{data.name}</h1>
      <ProductForm product={data} />
    </section>
  );
}
