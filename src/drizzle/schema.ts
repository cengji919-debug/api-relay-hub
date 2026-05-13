import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name'),
  role: text('role').default('USER').notNull(),
  isActive: integer('is_active').default(1).notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`).notNull(),
});

export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text('user_id').notNull().references(() => users.id),
  keyPreview: text('key_preview').notNull(),
  keyHash: text('key_hash').notNull(),
  name: text('name'),
  permissions: text('permissions').default('chat:read,chat:write').notNull(),
  isActive: integer('is_active').default(1).notNull(),
  lastUsedAt: text('last_used_at'),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
});

export const tokenBalances = sqliteTable('token_balances', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text('user_id').unique().notNull().references(() => users.id),
  balance: integer('balance').default(0).notNull(),
  lifetimeUsage: integer('lifetime_usage').default(0).notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`).notNull(),
});

export const tokenTransactions = sqliteTable('token_transactions', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  amount: integer('amount').notNull(),
  balanceBefore: integer('balance_before').notNull(),
  balanceAfter: integer('balance_after').notNull(),
  referenceType: text('reference_type'),
  referenceId: text('reference_id'),
  description: text('description'),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
});

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text('user_id').notNull().references(() => users.id),
  provider: text('provider').notNull(),
  providerPaymentId: text('provider_payment_id'),
  amount: real('amount').notNull(),
  currency: text('currency').default('USD').notNull(),
  tokens: integer('tokens').notNull(),
  status: text('status').default('PENDING').notNull(),
  metadata: text('metadata'),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`).notNull(),
});

export const apiProviders = sqliteTable('api_providers', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text('name').unique().notNull(),
  displayName: text('display_name').notNull(),
  baseUrl: text('base_url').notNull(),
  isActive: integer('is_active').default(1).notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
});

export const providerPricing = sqliteTable('provider_pricing', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  providerId: text('provider_id').notNull().references(() => apiProviders.id),
  modelName: text('model_name').notNull(),
  inputPrice: real('input_price').notNull(),
  outputPrice: real('output_price').notNull(),
  effectiveFrom: text('effective_from').notNull(),
  effectiveTo: text('effective_to'),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
});

export const platformPricing = sqliteTable('platform_pricing', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  providerId: text('provider_id').notNull().references(() => apiProviders.id),
  modelName: text('model_name').notNull(),
  pricePerToken: real('price_per_token').notNull(),
  profitMargin: real('profit_margin').notNull(),
  isActive: integer('is_active').default(1).notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`).notNull(),
});

export const apiUsageLogs = sqliteTable('api_usage_logs', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text('user_id').notNull().references(() => users.id),
  apiKeyId: text('api_key_id'),
  providerId: text('provider_id').notNull().references(() => apiProviders.id),
  modelName: text('model_name').notNull(),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  totalTokens: integer('total_tokens').notNull(),
  tokensCost: integer('tokens_cost').notNull(),
  responseTimeMs: integer('response_time_ms'),
  statusCode: integer('status_code'),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
});

export const autoRechargeSettings = sqliteTable('auto_recharge_settings', {
  id: text('id').primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text('user_id').unique().notNull().references(() => users.id),
  isEnabled: integer('is_enabled').default(0).notNull(),
  thresholdBalance: integer('threshold_balance').default(10000).notNull(),
  rechargeAmount: integer('recharge_amount').default(100000).notNull(),
  packageId: text('package_id').default('basic').notNull(),
  lastRechargedAt: text('last_recharged_at'),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`).notNull(),
});