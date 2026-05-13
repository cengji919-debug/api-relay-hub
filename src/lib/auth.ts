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

export async function hashPassword(password: string): Promise<string> {
  const { hash } = await import('bcryptjs');
  return hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const { compare } = await import('bcryptjs');
  return compare(password, hash);
}

export function generateApiKey(): { key: string; preview: string; hash: string } {
  const crypto = require('crypto');
  const key = `sk-${crypto.randomBytes(32).toString('hex')}`;
  const preview = key.substring(0, 8);
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  return { key, preview, hash };
}

export function generateTokenId(): string {
  const crypto = require('crypto');
  return crypto.randomUUID();
}