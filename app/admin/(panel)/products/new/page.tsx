import { requireAdmin } from '@/lib/admin';
import { ProductForm } from '../ProductForm';

export default async function NewProduct() {
  await requireAdmin();
  return (
    <section className="narrow">
      <h1>Product toevoegen</h1>
      <ProductForm />
    </section>
  );
}
