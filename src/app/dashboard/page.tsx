'use client';

import { useEffect, useState, useCallback } from 'react';
import { defaultLocale, type Locale, t } from '@/lib/i18n';

interface UsageSummary {
  totalTokens: number;
  totalCost: number;
  totalCalls: number;
  avgResponseTime: number;
}

export default function DashboardPage() {
  const [locale, setLocale] = useState<Locale>('en');
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [balance, setBalance] = useState(0);
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
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    Promise.all([
      fetch('/api/user/balance', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()) as Promise<{ balance: number }>,
      fetch('/api/usage', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()) as Promise<{ summary?: UsageSummary }>,
    ]).then(([balanceData, usageData]) => {
      setBalance(balanceData.balance || 0);
      setSummary(usageData.summary || null);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: tr('dashboard', 'balance'), value: balance.toLocaleString(), sub: `${(balance / 1000000).toFixed(2)}M`, color: 'bg-indigo-500' },
    { label: tr('dashboard', 'apiKeys'), value: (summary?.totalCalls || 0).toLocaleString(), sub: 'all time', color: 'bg-emerald-500' },
    { label: tr('dashboard', 'totalUsed'), value: (summary?.totalTokens || 0).toLocaleString(), sub: `${((summary?.totalCost || 0) / 1000000).toFixed(2)}M`, color: 'bg-violet-500' },
    { label: tr('usage', 'avgResponse'), value: `${(summary?.avgResponseTime || 0).toFixed(0)}ms`, sub: 'p95 latency', color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{tr('dashboard', 'title')}</h1>
        <p className="text-gray-600 mt-1">{tr('dashboard', 'subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${stat.color}`} />
              <span className="text-sm text-gray-600">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{tr('dashboard', 'quickActions')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="/dashboard/api-keys"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:gradient-bg group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{tr('dashboard', 'createKey')}</div>
              <div className="text-xs text-gray-500">{tr('dashboard', 'apiKeys')}</div>
            </div>
          </a>

          <a
            href="/dashboard/billing"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{tr('dashboard', 'buyTokens')}</div>
              <div className="text-xs text-gray-500">{tr('billing', 'purchaseTokens')}</div>
            </div>
          </a>

          <a
            href="/docs"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center group-hover:bg-violet-500 group-hover:text-white transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{tr('dashboard', 'viewDocs')}</div>
              <div className="text-xs text-gray-500">{tr('docs', 'subtitle')}</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
