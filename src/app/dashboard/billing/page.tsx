'use client';

import { useEffect, useState, useCallback } from 'react';
import { defaultLocale, type Locale, t } from '@/lib/i18n';

interface Payment {
  id: string;
  provider: string;
  amount: number;
  currency: string;
  tokens: number;
  status: string;
  createdAt: string;
}

interface AutoRechargeSettings {
  isEnabled: boolean;
  thresholdBalance: number;
  rechargeAmount: number;
  packageId: string;
  lastRechargedAt: string | null;
}

export default function BillingPage() {
  const [locale, setLocale] = useState<Locale>('en');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [autoRecharge, setAutoRecharge] = useState<AutoRechargeSettings>({
    isEnabled: false,
    thresholdBalance: 10000,
    rechargeAmount: 100000,
    packageId: 'basic',
    lastRechargedAt: null,
  });
  const [savingAutoRecharge, setSavingAutoRecharge] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved) setLocale(saved);
    const handler = (e: Event) => setLocale((e as CustomEvent).detail);
    window.addEventListener('locale-change', handler);
    return () => window.removeEventListener('locale-change', handler);
  }, []);

  const tr = useCallback((...keys: string[]) => t(locale, ...keys), [locale]);

  useEffect(() => {
    fetchHistory();
    fetchAutoRechargeSettings();
  }, []);

  async function fetchHistory() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const res = await fetch('/api/payments/history', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json() as { history: Payment[] };
      setPayments(data.history);
    }
    setLoading(false);
  }

  async function fetchAutoRechargeSettings() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const res = await fetch('/api/auto-recharge', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json() as AutoRechargeSettings;
      setAutoRecharge(data);
    }
  }

  async function saveAutoRechargeSettings() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setSavingAutoRecharge(true);
    try {
      await fetch('/api/auto-recharge', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(autoRecharge),
      });
    } catch (error) {
      console.error('Save auto-recharge error:', error);
    } finally {
      setSavingAutoRecharge(false);
    }
  }

  async function handlePurchase(packageId: string) {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setCheckoutLoading(packageId);
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      const data = await res.json() as { url?: string };
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setCheckoutLoading(null);
    }
  }

  const packages = [
    { id: 'starter', name: 'Starter', tokens: '400K', price: 5, bonus: 0 },
    { id: 'basic', name: 'Basic', tokens: '1M', price: 10, bonus: 50000 },
    { id: 'pro', name: 'Pro', tokens: '2.5M', price: 25, bonus: 200000, popular: true },
    { id: 'enterprise', name: 'Enterprise', tokens: '5.5M', price: 50, bonus: 500000 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{tr('billing', 'title')}</h1>
        <p className="text-gray-600 mt-1">{tr('billing', 'subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {packages.map(pkg => (
          <div
            key={pkg.id}
            className={`bg-white rounded-xl border p-6 ${
              pkg.popular ? 'border-indigo-200 ring-1 ring-indigo-200' : 'border-gray-100'
            } hover:shadow-lg transition-shadow`}
          >
            {pkg.popular && (
              <div className="text-xs font-semibold text-indigo-700 mb-2">{tr('home', 'pricing', 'popular')}</div>
            )}
            <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
            <div className="mt-3 mb-2">
              <span className="text-3xl font-bold text-gray-900">${pkg.price}</span>
            </div>
            <p className="text-sm text-gray-600">{pkg.tokens} {tr('billing', 'tokens').toLowerCase()}</p>
            {pkg.bonus > 0 && (
              <p className="text-xs text-green-600 font-medium">+{pkg.bonus.toLocaleString()} {tr('home', 'pricing', 'bonus')}</p>
            )}
            <button
              onClick={() => handlePurchase(pkg.id)}
              disabled={checkoutLoading === pkg.id}
              className={`mt-5 w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                pkg.popular
                  ? 'gradient-bg text-white hover:opacity-90'
                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              {checkoutLoading === pkg.id ? 'Redirecting...' : tr('home', 'pricing', 'buyNow')}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">{tr('billing', 'history')}</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p className="text-gray-500">{tr('billing', 'noHistory')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{tr('billing', 'date')}</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{tr('billing', 'package')}</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{tr('billing', 'amount')}</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{tr('billing', 'tokens')}</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{tr('billing', 'status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.provider}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.tokens.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        payment.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                        payment.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {payment.status === 'COMPLETED' ? tr('billing', 'completed') : 
                         payment.status === 'PENDING' ? tr('billing', 'pending') : payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{tr('billing', 'autoRecharge', 'title')}</h2>
            <p className="text-sm text-gray-600 mt-1">{tr('billing', 'autoRecharge', 'subtitle')}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoRecharge.isEnabled}
              onChange={e => {
                setAutoRecharge(prev => ({ ...prev, isEnabled: e.target.checked }));
                setTimeout(saveAutoRechargeSettings, 0);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {autoRecharge.isEnabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{tr('billing', 'autoRecharge', 'threshold')}</label>
                <input
                  type="number"
                  value={autoRecharge.thresholdBalance}
                  onChange={e => setAutoRecharge(prev => ({ ...prev, thresholdBalance: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{tr('billing', 'autoRecharge', 'amount')}</label>
                <input
                  type="number"
                  value={autoRecharge.rechargeAmount}
                  onChange={e => setAutoRecharge(prev => ({ ...prev, rechargeAmount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{tr('billing', 'autoRecharge', 'package')}</label>
              <select
                value={autoRecharge.packageId}
                onChange={e => setAutoRecharge(prev => ({ ...prev, packageId: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
              >
                {packages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>{pkg.name} - ${pkg.price} ({pkg.tokens})</option>
                ))}
              </select>
            </div>

            <button
              onClick={saveAutoRechargeSettings}
              disabled={savingAutoRecharge}
              className="px-6 py-2.5 gradient-bg text-white font-medium rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
            >
              {savingAutoRecharge ? tr('common', 'saving') : tr('common', 'save')}
            </button>

            {autoRecharge.lastRechargedAt && (
              <p className="text-xs text-gray-500">
                {tr('billing', 'autoRecharge', 'lastRecharge')}: {new Date(autoRecharge.lastRechargedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}