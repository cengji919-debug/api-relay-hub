import { SignJWT, jwtVerify } from 'jose';

const getSecret = (secret: string) => new TextEncoder().encode(secret);

export async function signJWT(
  payload: { sub: string; email: string; role: string },
  secret: string,
  expiresIn: string = '15m',
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret(secret));
}

export async function verifyJWT<T>(token: string, secret: string): Promise<T> {
  const { payload } = await jwtVerify(token, getSecret(secret));
  return payload as T;
}

async function pbkdf2(password: string, salt: string, iterations: number): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations, hash: 'SHA-256' },
    key,
    256,
  );
}

function arrayBufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  return Array.from(buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomUUID();
  const hash = await pbkdf2(password, salt, 100000);
  return `${salt}:${arrayBufferToHex(hash)}`;
}

export async function comparePassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  const newHash = await pbkdf2(password, salt, 100000);
  return arrayBufferToHex(newHash) === hash;
}

export function generateApiKey(): { key: string; preview: string; hash: string } {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const key = `sk-${arrayBufferToHex(bytes)}`;
  const preview = key.substring(0, 8);
  const hashBytes = new Uint8Array(32);
  crypto.getRandomValues(hashBytes);
  const hash = arrayBufferToHex(hashBytes);
  return { key, preview, hash };
}

export async function hashApiKey(key: string): Promise<string> {
  const keyData = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
  return arrayBufferToHex(hashBuffer);
}