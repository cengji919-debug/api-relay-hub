import type { D1Database, KVNamespace } from '@cloudflare/workers-types';

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    CACHE: KVNamespace;
    ENVIRONMENT: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    PAYPAL_CLIENT_ID: string;
    PAYPAL_CLIENT_SECRET: string;
    NEXT_PUBLIC_SITE_URL: string;
  }
}

export {};