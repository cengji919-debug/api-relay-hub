'use client';

import { useEffect, useState, useCallback } from 'react';
import { defaultLocale, type Locale, t } from '@/lib/i18n';
import { PROVIDER_MODELS, PROVIDERS } from '@/lib/constants';

interface ModelPricing {
  id: string;
  name: string;
  provider: string;
  category: string;
  inputPrice: number;
  outputPrice: number;
  platformInputPrice: number;
  platformOutputPrice: number;
  margin: number;
  reasoning?: boolean;
}

export default function PricingPage() {
  const [locale, setLocale] = useState<Locale>('en');
  const [pricing, setPricing] = useState<ModelPricing[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved) setLocale(saved);
    const handler = (e: Event) => setLocale((e as CustomEvent).detail);
    window.addEventListener('locale-change', handler);
    return () => window.removeEventListener('locale-change', handler);
  }, []);

  const tr = useCallback((...keys: string[]) => t(locale, ...keys), [locale]);

  useEffect(() => {
    fetchPricing();
  }, []);

  async function fetchPricing() {
    const res = await fetch('/api/pricing');
    if (res.ok) {
      const data = await res.json() as { pricing: ModelPricing[] };
      setPricing(data.pricing);
    }
    setLoading(false);
  }

  const categories = ['all', 'chat', 'image', 'reasoning'];
  const filteredPricing = filter === 'all' 
    ? pricing 
    : filter === 'reasoning'
      ? pricing.filter(p => p.reasoning)
      : pricing.filter(p => p.category === filter);

  return (
    <div className="min-h-screen hero-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold gradient-text mb-4">
            {tr('pricing', 'title')}
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {tr('pricing', 'subtitle')}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === cat
                  ? 'btn-sci-fi'
                  : 'btn-sci-fi-outline'
              }`}
            >
              {tr('pricing', 'filter', cat)}
            </button>
          ))}
        </div>

        {/* Pricing Table */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-sci-fi p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded mb-4" />
                <div className="h-4 bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-700 rounded mb-2" />
                <div className="h-10 bg-gray-700 rounded mt-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPricing.map(model => (
              <div key={model.id} className="card-sci-fi p-6 relative overflow-hidden">
                {/* Scan Line Effect */}
                <div className="absolute inset-0 animate-scan-line pointer-events-none" />
                
                {/* Model Info */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white font-orbitron">{model.name}</h3>
                    {model.reasoning && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                        {tr('pricing', 'reasoning')}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">{tr('pricing', 'provider')}</span>
                      <span className="text-cyan-400 font-mono-tech text-sm">
                        {PROVIDERS[model.provider as keyof typeof PROVIDERS]?.name || model.provider}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">{tr('pricing', 'category')}</span>
                      <span className="text-gray-300 text-sm capitalize">{model.category}</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                      <span className="text-gray-400 text-sm">{tr('pricing', 'input')}</span>
                      <div className="text-right">
                        <div className="text-cyan-400 font-mono-tech font-semibold">
                          ${model.platformInputPrice.toFixed(6)}
                        </div>
                        <div className="text-gray-500 text-xs line-through">
                          ${model.inputPrice.toFixed(6)}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                      <span className="text-gray-400 text-sm">{tr('pricing', 'output')}</span>
                      <div className="text-right">
                        <div className="text-cyan-400 font-mono-tech font-semibold">
                          ${model.platformOutputPrice.toFixed(6)}
                        </div>
                        <div className="text-gray-500 text-xs line-through">
                          ${model.outputPrice.toFixed(6)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Margin Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">{tr('pricing', 'margin')}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      model.margin >= 0.4 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {(model.margin * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 card-sci-fi p-8">
          <h2 className="text-2xl font-orbitron font-bold text-white mb-6 text-center">
            {tr('pricing', 'info', 'title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{tr('pricing', 'info', 'fast')}</h3>
              <p className="text-gray-400 text-sm">{tr('pricing', 'info', 'fastDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{tr('pricing', 'info', 'transparent')}</h3>
              <p className="text-gray-400 text-sm">{tr('pricing', 'info', 'transparentDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{tr('pricing', 'info', 'auto')}</h3>
              <p className="text-gray-400 text-sm">{tr('pricing', 'info', 'autoDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
