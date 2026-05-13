import type { TokenPackage } from './validations';

export const TOKEN_PACKAGES: TokenPackage[] = [
  { id: 'starter', name: 'Starter', tokens: 400_000, price: 5, bonus: 0 },
  { id: 'basic', name: 'Basic', tokens: 1_000_000, price: 10, bonus: 50_000 },
  { id: 'pro', name: 'Pro', tokens: 2_500_000, price: 25, bonus: 200_000 },
  { id: 'enterprise', name: 'Enterprise', tokens: 5_500_000, price: 50, bonus: 500_000 },
  { id: 'custom', name: 'Custom', tokens: 12_000_000, price: 100, bonus: 1_000_000 },
];

export interface ModelConfig {
  provider: string;
  displayName: string;
  inputPrice: number;
  outputPrice: number;
  category?: string;
  reasoning?: boolean;
}

export const PROVIDER_MODELS: Record<string, ModelConfig> = {
  // SiliconFlow Models
  'Qwen/Qwen2.5-72B-Instruct': { provider: 'siliconflow', displayName: 'Qwen 2.5 72B', inputPrice: 0.004, outputPrice: 0.004, category: 'chat' },
  'Qwen/Qwen2.5-32B-Instruct': { provider: 'siliconflow', displayName: 'Qwen 2.5 32B', inputPrice: 0.001, outputPrice: 0.001, category: 'chat' },
  'Qwen/Qwen2.5-14B-Instruct': { provider: 'siliconflow', displayName: 'Qwen 2.5 14B', inputPrice: 0.0008, outputPrice: 0.0008, category: 'chat' },
  'Qwen/Qwen2.5-7B-Instruct': { provider: 'siliconflow', displayName: 'Qwen 2.5 7B', inputPrice: 0.0005, outputPrice: 0.0005, category: 'chat' },
  'deepseek-ai/DeepSeek-V3': { provider: 'siliconflow', displayName: 'DeepSeek V3', inputPrice: 0.002, outputPrice: 0.002, category: 'chat' },
  'deepseek-ai/DeepSeek-R1': { provider: 'siliconflow', displayName: 'DeepSeek R1', inputPrice: 0.004, outputPrice: 0.004, category: 'chat', reasoning: true },
  'THUDM/glm-4-9b-chat': { provider: 'siliconflow', displayName: 'GLM-4 9B', inputPrice: 0.0005, outputPrice: 0.0005, category: 'chat' },
  'internlm/internlm2_5-20b-chat': { provider: 'siliconflow', displayName: 'InternLM 2.5 20B', inputPrice: 0.001, outputPrice: 0.001, category: 'chat' },
  '01-ai/Yi-1.5-34B-Chat': { provider: 'siliconflow', displayName: 'Yi 1.5 34B', inputPrice: 0.0015, outputPrice: 0.0015, category: 'chat' },
  'baichuan-inc/Baichuan2-13B-Chat': { provider: 'siliconflow', displayName: 'Baichuan 2 13B', inputPrice: 0.0008, outputPrice: 0.0008, category: 'chat' },
  
  // DeepSeek Official Models
  'deepseek-chat': { provider: 'deepseek', displayName: 'DeepSeek Chat V3', inputPrice: 0.00027, outputPrice: 0.0011, category: 'chat' },
  'deepseek-reasoner': { provider: 'deepseek', displayName: 'DeepSeek Reasoner R1', inputPrice: 0.00055, outputPrice: 0.0022, category: 'chat', reasoning: true },
  
  // Moonshot Models
  'moonshot-v1-8k': { provider: 'moonshot', displayName: 'Moonshot V1 8K', inputPrice: 0.012, outputPrice: 0.012, category: 'chat' },
  'moonshot-v1-32k': { provider: 'moonshot', displayName: 'Moonshot V1 32K', inputPrice: 0.024, outputPrice: 0.024, category: 'chat' },
  'moonshot-v1-128k': { provider: 'moonshot', displayName: 'Moonshot V1 128K', inputPrice: 0.06, outputPrice: 0.06, category: 'chat' },
  
  // Zhipu Models
  'glm-4': { provider: 'zhipu', displayName: 'GLM-4', inputPrice: 0.007, outputPrice: 0.007, category: 'chat' },
  'glm-4-plus': { provider: 'zhipu', displayName: 'GLM-4 Plus', inputPrice: 0.007, outputPrice: 0.007, category: 'chat' },
  'glm-4-flash': { provider: 'zhipu', displayName: 'GLM-4 Flash', inputPrice: 0, outputPrice: 0, category: 'chat' },
  'glm-4-flashx': { provider: 'zhipu', displayName: 'GLM-4 FlashX', inputPrice: 0.00014, outputPrice: 0.00014, category: 'chat' },
  
  // Alibaba Models
  'qwen-turbo': { provider: 'dashscope', displayName: 'Qwen Turbo', inputPrice: 0.00028, outputPrice: 0.00083, category: 'chat' },
  'qwen-plus': { provider: 'dashscope', displayName: 'Qwen Plus', inputPrice: 0.0011, outputPrice: 0.0011, category: 'chat' },
  'qwen-max': { provider: 'dashscope', displayName: 'Qwen Max', inputPrice: 0.0028, outputPrice: 0.0083, category: 'chat' },
  'qwen-max-latest': { provider: 'dashscope', displayName: 'Qwen Max Latest', inputPrice: 0.0028, outputPrice: 0.0083, category: 'chat' },
  
  // Baidu Models
  'ernie-4.0-8k': { provider: 'qianfan', displayName: 'ERNIE 4.0 8K', inputPrice: 0.0042, outputPrice: 0.0084, category: 'chat' },
  'ernie-3.5-8k': { provider: 'qianfan', displayName: 'ERNIE 3.5 8K', inputPrice: 0.0017, outputPrice: 0.0017, category: 'chat' },
  'ernie-speed-8k': { provider: 'qianfan', displayName: 'ERNIE Speed 8K', inputPrice: 0, outputPrice: 0, category: 'chat' },
  
  // Image Generation Models
  'black-forest-labs/FLUX.1-schnell': { provider: 'siliconflow', displayName: 'FLUX.1 Schnell', inputPrice: 0, outputPrice: 0, category: 'image' },
  'stabilityai/stable-diffusion-xl-base-1.0': { provider: 'siliconflow', displayName: 'SDXL Base 1.0', inputPrice: 0, outputPrice: 0, category: 'image' },
};

export const PROVIDERS = {
  siliconflow: { name: 'SiliconFlow', baseUrl: 'https://api.siliconflow.cn/v1', envKey: 'SILICONFLOW_API_KEY' },
  deepseek: { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', envKey: 'DEEPSEEK_API_KEY' },
  moonshot: { name: 'Moonshot', baseUrl: 'https://api.moonshot.cn/v1', envKey: 'MOONSHOT_API_KEY' },
  zhipu: { name: 'Zhipu', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', envKey: 'ZHIPU_API_KEY' },
  dashscope: { name: 'DashScope', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', envKey: 'DASHSCOPE_API_KEY' },
  qianfan: { name: 'Qianfan', baseUrl: 'https://qianfan.baidubce.com/v2', envKey: 'QIANFAN_API_KEY' },
} as const;

export const EXCHANGE_RATE = 7.2;

export const TARGET_MARGIN_MIN = 0.30;
export const TARGET_MARGIN_MAX = 0.50;
export const DEFAULT_MARGIN = 0.40;

export const REFERRAL_BONUS = 0.10; // 10% bonus for referrals
