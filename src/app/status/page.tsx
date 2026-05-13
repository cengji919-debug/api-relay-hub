'use client';

import { useState, useEffect, useCallback } from 'react';
import { defaultLocale, type Locale, t } from '@/lib/i18n';

export default function StatusPage() {
  const [locale, setLocale] = useState<Locale>('en');
  const [statuses, setStatuses] = useState([
    { name: 'API Gateway', status: 'operational' as const },
    { name: 'SiliconFlow', status: 'operational' as const },
    { name: 'Database', status: 'operational' as const },
    { name: 'Payment Processing', status: 'operational' as const },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved) setLocale(saved);
    const handler = (e: Event) => setLocale((e as CustomEvent).detail);
    window.addEventListener('locale-change', handler);
    return () => window.removeEventListener('locale-change', handler);
  }, []);

  const tr = useCallback((...keys: string[]) => t(locale, ...keys), [locale]);

  const uptime = '99.97%';

  const statusLabels: Record<string, string> = {
    operational: tr('status', 'operational'),
    degraded: tr('status', 'degraded'),
    down: tr('status', 'outage'),
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full text-sm text-green-700 font-medium mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {tr('status', 'allOperational')}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{tr('status', 'title')}</h1>
          <p className="text-gray-600">{tr('status', 'uptimeDesc', 'last30Days').replace('{uptime}', uptime)}</p>
        </div>

        <div className="space-y-3">
          {statuses.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
              <span className="text-sm font-medium text-gray-900">{item.name}</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                item.status === 'operational' ? 'bg-green-50 text-green-700' :
                item.status === 'degraded' ? 'bg-amber-50 text-amber-700' :
                'bg-red-50 text-red-700'
              }`}>
                {statusLabels[item.status]}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-gray-50 rounded-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{tr('status', 'recentIncidents')}</h2>
          <p className="text-sm text-gray-500">{tr('status', 'noIncidents')}</p>
        </div>
      </div>
    </div>
  );
}