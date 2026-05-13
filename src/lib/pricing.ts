import { PROVIDER_MODELS } from './constants';

export interface PricingConfig {
  modelId: string;
  providerCost: number;
  platformPrice: number;
  profitMargin: number;
  updatedAt: string;
}

const EXCHANGE_RATE = 7.2;
const DEFAULT_PROFIT_MARGIN = 0.4;

export function calculateProviderCost(modelId: string, tokens: number): number {
  const model = PROVIDER_MODELS[modelId as keyof typeof PROVIDER_MODELS];
  if (!model) return 0;
  
  const costPerToken = model.inputPrice / 1000;
  return tokens * costPerToken;
}

export function calculatePlatformPrice(modelId: string, tokens: number, margin: number = DEFAULT_PROFIT_MARGIN): number {
  const providerCost = calculateProviderCost(modelId, tokens);
  return providerCost / (1 - margin);
}

export function calculateProfitMargin(modelId: string): number {
  const model = PROVIDER_MODELS[modelId as keyof typeof PROVIDER_MODELS];
  if (!model) return DEFAULT_PROFIT_MARGIN;
  
  const providerCost = model.inputPrice;
  const minPrice = providerCost * 1.3;
  const suggestedPrice = providerCost * (1 + DEFAULT_PROFIT_MARGIN);
  
  return Math.max(DEFAULT_PROFIT_MARGIN, (suggestedPrice - providerCost) / suggestedPrice);
}

export function getPricingForModel(modelId: string): PricingConfig | null {
  const model = PROVIDER_MODELS[modelId as keyof typeof PROVIDER_MODELS];
  if (!model) return null;
  
  const providerCost = model.inputPrice;
  const profitMargin = calculateProfitMargin(modelId);
  const platformPrice = providerCost / (1 - profitMargin);
  
  return {
    modelId,
    providerCost,
    platformPrice,
    profitMargin,
    updatedAt: new Date().toISOString(),
  };
}

export function getAllPricing(): PricingConfig[] {
  return Object.keys(PROVIDER_MODELS).map(modelId => getPricingForModel(modelId)!);
}

export function adjustPricingForExchangeRate(usdPrice: number): number {
  return usdPrice * EXCHANGE_RATE;
}
