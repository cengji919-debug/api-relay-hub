import type { TokenPackage } from './validations';

export const TOKEN_PACKAGES: TokenPackage[] = [
  { id: 'starter', name: 'Starter', tokens: 400_000, price: 5, bonus: 0 },
  { id: 'basic', name: 'Basic', tokens: 1_000_000, price: 10, bonus: 50_000 },
  { id: 'pro', name: 'Pro', tokens: 2_500_000, price: 25, bonus: 200_000 },
  { id: 'enterprise', name: 'Enterprise', tokens: 5_500_000, price: 50, bonus: 500_000 },
  { id: 'custom', name: 'Custom', tokens: 12_000_000, price: 100, bonus: 1_000_000 },
];

export const PROVIDER_MODELS = {
  'Qwen/Qwen2.5-72B-Instruct': { provider: 'siliconflow', displayName: 'Qwen 2.5 72B', inputPrice: 0.004, outputPrice: 0.004 },
  'Qwen/Qwen2.5-32B-Instruct': { provider: 'siliconflow', displayName: 'Qwen 2.5 32B', inputPrice: 0.001, outputPrice: 0.001 },
  'Qwen/Qwen2.5-14B-Instruct': { provider: 'siliconflow', displayName: 'Qwen 2.5 14B', inputPrice: 0.0008, outputPrice: 0.0008 },
  'Qwen/Qwen2.5-7B-Instruct': { provider: 'siliconflow', displayName: 'Qwen 2.5 7B', inputPrice: 0.0005, outputPrice: 0.0005 },
  'deepseek-ai/DeepSeek-V3': { provider: 'siliconflow', displayName: 'DeepSeek V3', inputPrice: 0.002, outputPrice: 0.002 },
  'deepseek-ai/DeepSeek-R1': { provider: 'siliconflow', displayName: 'DeepSeek R1', inputPrice: 0.004, outputPrice: 0.004 },
  'THUDM/glm-4-9b-chat': { provider: 'siliconflow', displayName: 'GLM-4 9B', inputPrice: 0.0005, outputPrice: 0.0005 },
  'internlm/internlm2_5-20b-chat': { provider: 'siliconflow', displayName: 'InternLM 2.5 20B', inputPrice: 0.001, outputPrice: 0.001 },
  '01-ai/Yi-1.5-34B-Chat': { provider: 'siliconflow', displayName: 'Yi 1.5 34B', inputPrice: 0.0015, outputPrice: 0.0015 },
  'baichuan-inc/Baichuan2-13B-Chat': { provider: 'siliconflow', displayName: 'Baichuan 2 13B', inputPrice: 0.0008, outputPrice: 0.0008 },
} as const;

export const EXCHANGE_RATE = 7.2;

export const TARGET_MARGIN_MIN = 0.30;
export const TARGET_MARGIN_MAX = 0.50;
export const DEFAULT_MARGIN = 0.40;