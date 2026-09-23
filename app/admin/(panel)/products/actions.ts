'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const supabase = db();

  const id = String(formData.get('id') ?? '') || null;
  const name = String(formData.get('name') ?? '').trim();
  const slug = slugify(String(formData.get('slug') ?? '') || name);
  const price_cents = Math.round(parseFloat(String(formData.get('price') ?? '').replace(',', '.')) * 100);
  const stock = parseInt(String(formData.get('stock') ?? ''), 10);
  if (!name || !slug || Number.isNaN(price_cents) || price_cents < 0 || Number.isNaN(stock) || stock < 0) {
    throw new Error('Vul een naam, een geldige prijs en voorraad in.');
  }

  let image_url = String(formData.get('image_url') ?? '') || null;
  const file = formData.get('image');
  if (file instanceof File && file.size > 0) {
    const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ''))}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file, { contentType: file.type });
    if (error) throw new Error(`Foto uploaden mislukt: ${error.message}`);
    image_url = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
  }

  const row = {
    name,
    slug,
    price_cents,
    stock,
    image_url,
    description: String(formData.get('description') ?? ''),
    category: String(formData.get('category') ?? 'accessoires'),
    active: formData.get('active') === 'on',
  };

  const { error } = id
    ? await supabase.from('products').update(row).eq('id', id)
    : await supabase.from('products').insert(row);
  if (error) throw new Error(error.code === '23505' ? 'Deze slug bestaat al. Kies een andere.' : error.message);

  revalidatePath('/', 'layout');
  redirect('/admin/products');
}
