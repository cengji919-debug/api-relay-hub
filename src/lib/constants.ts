import type { TokenPackage } from './validations';

export const TOKEN_PACKAGES: TokenPackage[] = [
  { id: 'starter', name: 'Starter', tokens: 400_000, price: 5, bonus: 0 },
  { id: 'basic', name: 'Basic', tokens: 1_000_000, price: 10, bonus: 50_000 },
  { id: 'pro', name: 'Pro', tokens: 2_500_000, price: 25, bonus: 200_000 },
  { id: 'enterprise', name: 'Enterprise', tokens: 5_500_000, price: 50, bonus: 500_000 },
  { id: 'custom', name: 'Custom', tokens: 12_000_000, price: 100, bonus: 1_000_000 },
];

export const PROVIDER_MODELS = {
  'ernie-4.0': { provider: 'ernie', displayName: 'ERNIE 4.0', inputPrice: 0.12, outputPrice: 0.12 },
  'ernie-3.5': { provider: 'ernie', displayName: 'ERNIE 3.5', inputPrice: 0.04, outputPrice: 0.04 },
  'qwen-max': { provider: 'tongyi', displayName: 'Qwen Max', inputPrice: 0.04, outputPrice: 0.12 },
  'qwen-plus': { provider: 'tongyi', displayName: 'Qwen Plus', inputPrice: 0.004, outputPrice: 0.012 },
  'qwen-turbo': { provider: 'tongyi', displayName: 'Qwen Turbo', inputPrice: 0.002, outputPrice: 0.006 },
  'spark-4.0': { provider: 'spark', displayName: 'Spark 4.0', inputPrice: 0.1, outputPrice: 0.1 },
  'spark-3.0': { provider: 'spark', displayName: 'Spark 3.0', inputPrice: 0.03, outputPrice: 0.03 },
  'deepseek-chat': { provider: 'deepseek', displayName: 'DeepSeek Chat', inputPrice: 0.001, outputPrice: 0.002 },
  'deepseek-reasoner': { provider: 'deepseek', displayName: 'DeepSeek Reasoner', inputPrice: 0.004, outputPrice: 0.008 },
} as const;

export const EXCHANGE_RATE = 7.2; // CNY to USD (updated hourly)

export const TARGET_MARGIN_MIN = 0.30;
export const TARGET_MARGIN_MAX = 0.50;
export const DEFAULT_MARGIN = 0.40;