'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';
import { CATEGORIES } from '@/lib/catalog';
import { SlugTakenError, store } from '@/lib/store';

const IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type SaveState = { error: string | null };

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function saveProduct(_prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  const products = store();

  const id = String(formData.get('id') ?? '') || null;
  const name = String(formData.get('name') ?? '').trim();
  const slug = slugify(String(formData.get('slug') ?? '') || name);
  const price_cents = Math.round(parseFloat(String(formData.get('price') ?? '').replace(',', '.')) * 100);
  const stock = parseInt(String(formData.get('stock') ?? ''), 10);
  const category = String(formData.get('category') ?? '');
  if (!name || !slug || Number.isNaN(price_cents) || price_cents < 0 || Number.isNaN(stock) || stock < 0) {
    return { error: 'Vul een naam, een geldige prijs en voorraad in.' };
  }
  if (!CATEGORIES.some((c) => c.slug === category)) return { error: 'Kies een categorie.' };

  let image_url = String(formData.get('image_url') ?? '') || null;
  const file = formData.get('image');
  if (file instanceof File && file.size > 0) {
    // Controleer het type op de server; de "accept" in het formulier is alleen een hint
    const ext = IMAGE_TYPES[file.type];
    if (!ext) return { error: 'Upload een foto als JPG, PNG, WebP of AVIF.' };
    if (file.size > MAX_IMAGE_BYTES) return { error: 'De foto is groter dan 5 MB. Verklein hem en probeer opnieuw.' };
    try {
      image_url = await products.uploadImage(file, `${Date.now()}-${slug}.${ext}`);
    } catch (e) {
      return { error: `Foto uploaden mislukt: ${(e as Error).message}` };
    }
  }

  try {
    await products.saveProduct(id, {
      name,
      slug,
      price_cents,
      stock,
      category,
      image_url,
      description: String(formData.get('description') ?? '').trim(),
      active: formData.get('active') === 'on',
    });
  } catch (e) {
    if (e instanceof SlugTakenError) return { error: e.message };
    throw e;
  }

  revalidatePath('/', 'layout');
  redirect('/admin/products');
}
