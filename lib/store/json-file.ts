import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';

// Kleine JSON-"database" voor de demo. Lokaal in de map .data (niet in git).
// Op Vercel mag je alleen in /tmp schrijven; die wordt gewist zodra de server opnieuw opstart.
export const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'viezehond-data') : path.join(process.cwd(), '.data');

let queue: Promise<unknown> = Promise.resolve();

export async function readJson<T>(file: string, initial: () => T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, file), 'utf8')) as T;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return initial();
    throw e;
  }
}

async function writeJson(file: string, data: unknown) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const target = path.join(DATA_DIR, file);
  const tmp = `${target}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  // Windows kan kort "bezet" melden als het bestand net gelezen wordt
  for (let attempt = 0; ; attempt++) {
    try {
      return await fs.rename(tmp, target);
    } catch (e) {
      const code = (e as NodeJS.ErrnoException).code;
      if (attempt >= 5 || (code !== 'EPERM' && code !== 'EBUSY')) throw e;
      await new Promise((r) => setTimeout(r, 20 * (attempt + 1)));
    }
  }
}

/** Leest, past aan en schrijft terug; wijzigingen lopen één voor één. */
export function updateJson<T, R>(file: string, initial: () => T, change: (data: T) => R | Promise<R>): Promise<R> {
  const run = queue.then(async () => {
    const data = await readJson(file, initial);
    const result = await change(data);
    await writeJson(file, data);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}
