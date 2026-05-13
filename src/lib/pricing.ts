import { PROVIDER_MODELS } from './constants';
import type { ModelConfig } from './constants';

export interface PricingConfig {
  modelId: string;
  name: string;
  provider: string;
  category: string;
  inputPrice: number;
  outputPrice: number;
  platformInputPrice: number;
  platformOutputPrice: number;
  profitMargin: number;
  reasoning?: boolean;
  updatedAt: string;
}

const DEFAULT_PROFIT_MARGIN = 0.4;

export function calculatePlatformPrice(providerPrice: number, margin: number = DEFAULT_PROFIT_MARGIN): number {
  if (providerPrice === 0) return 0;
  return providerPrice / (1 - margin);
}

export function calculateProfitMargin(providerPrice: number, platformPrice: number): number {
  if (platformPrice === 0) return 0;
  return (platformPrice - providerPrice) / platformPrice;
}

export function getPricingForModel(modelId: string): PricingConfig | null {
  const model = PROVIDER_MODELS[modelId];
  if (!model) return null;
  
  const margin = DEFAULT_PROFIT_MARGIN;
  const platformInputPrice = calculatePlatformPrice(model.inputPrice, margin);
  const platformOutputPrice = calculatePlatformPrice(model.outputPrice, margin);
  
  return {
    modelId,
    name: model.displayName,
    provider: model.provider,
    category: model.category || 'chat',
    inputPrice: model.inputPrice,
    outputPrice: model.outputPrice,
    platformInputPrice,
    platformOutputPrice,
    profitMargin: margin,
    reasoning: model.reasoning,
    updatedAt: new Date().toISOString(),
  };
}

export function getAllPricing(): PricingConfig[] {
  return Object.keys(PROVIDER_MODELS).map(modelId => getPricingForModel(modelId)!).filter(Boolean);
}

export function getPricingByCategory(category: string): PricingConfig[] {
  if (category === 'all') return getAllPricing();
  if (category === 'reasoning') return getAllPricing().filter(p => p.reasoning);
  return getAllPricing().filter(p => p.category === category);
}
