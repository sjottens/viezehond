import { promises as fs } from 'node:fs';
import path from 'node:path';
import { isDemoData } from '@/lib/env';
import { UPLOAD_DIR } from '@/lib/store/local';

// Toont productfoto's die in de demo zijn geüpload (in .data/uploads).
const TYPES: Record<string, string> = { '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif' };

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const type = TYPES[path.extname(file)];
  if (!isDemoData() || !type || !/^[\w.-]+$/.test(file)) return new Response('Not found', { status: 404 });
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, file));
    return new Response(data, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable' } });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
