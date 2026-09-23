// Beheersessie: een ondertekend token met verloopdatum. Werkt in proxy én op de server
// (alleen Web Crypto, geen Node-modules).

export const ADMIN_COOKIE = 'admin_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

const DEV_PASSWORD = 'demo';
const DEV_SECRET = 'alleen-voor-lokaal-ontwikkelen-niet-in-productie';
const enc = new TextEncoder();

const isProduction = () => process.env.NODE_ENV === 'production';

export function usingDevPassword() {
  return !process.env.ADMIN_PASSWORD && !isProduction();
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD || (isProduction() ? null : DEV_PASSWORD);
}

function adminSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (secret && secret.length >= 32) return secret;
  return isProduction() ? null : DEV_SECRET;
}

// Het wachtwoord zit in de sleutel: wachtwoord wijzigen maakt alle sessies ongeldig
async function signingKey() {
  const password = adminPassword();
  const secret = adminSecret();
  if (!password || !secret) return null;
  return crypto.subtle.importKey('raw', enc.encode(`${secret}\u0000${password}`), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

function toBase64Url(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(s: string) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export async function createSessionToken(now = Date.now()) {
  const key = await signingKey();
  if (!key) throw new Error('ADMIN_PASSWORD en ADMIN_SECRET (minstens 32 tekens) zijn verplicht');
  const exp = Math.floor(now / 1000) + SESSION_TTL_SECONDS;
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`admin.${exp}`));
  return `${exp}.${toBase64Url(sig)}`;
}

export async function verifySessionToken(token: string | undefined, now = Date.now()) {
  if (!token) return false;
  const [expText, sig] = token.split('.');
  const exp = Number(expText);
  if (!Number.isInteger(exp) || !sig || exp * 1000 < now) return false;
  const key = await signingKey();
  if (!key) return false;
  try {
    // verify() vergelijkt in constante tijd
    return await crypto.subtle.verify('HMAC', key, fromBase64Url(sig), enc.encode(`admin.${exp}`));
  } catch {
    return false;
  }
}

/** Vergelijkt het ingevulde wachtwoord in constante tijd. */
export async function checkPassword(input: string) {
  const password = adminPassword();
  const key = await signingKey();
  if (!password || !key) return false;
  const [a, b] = await Promise.all([
    crypto.subtle.sign('HMAC', key, enc.encode(input)),
    crypto.subtle.sign('HMAC', key, enc.encode(password)),
  ]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}
