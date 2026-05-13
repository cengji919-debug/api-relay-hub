'use client';

import { useEffect, useState, useCallback } from 'react';
import { defaultLocale, type Locale, t } from '@/lib/i18n';
import { REFERRAL_BONUS } from '@/lib/constants';

interface ReferralStats {
  totalReferrals: number;
  totalEarned: number;
  bonusRate: number;
}

interface ReferralHistory {
  id: string;
  referredUserEmail: string;
  bonusTokens: number;
  createdAt: string;
}

export default function ReferralsPage() {
  const [locale, setLocale] = useState<Locale>('en');
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState<ReferralStats>({ totalReferrals: 0, totalEarned: 0, bonusRate: REFERRAL_BONUS });
  const [history, setHistory] = useState<ReferralHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved) setLocale(saved);
    const handler = (e: Event) => setLocale((e as CustomEvent).detail);
    window.addEventListener('locale-change', handler);
    return () => window.removeEventListener('locale-change', handler);
  }, []);

  const tr = useCallback((...keys: string[]) => t(locale, ...keys), [locale]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const [codeRes, statsRes, historyRes] = await Promise.all([
      fetch('/api/referrals/code', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/referrals/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/referrals/history', { headers: { 'Authorization': `Bearer ${token}` } }),
    ]);

    if (codeRes.ok) {
      const data = await codeRes.json() as { code: string };
      setReferralCode(data.code);
    }
    if (statsRes.ok) {
      const data = await statsRes.json() as ReferralStats;
      setStats(data);
    }
    if (historyRes.ok) {
      const data = await historyRes.json() as { history: ReferralHistory[] };
      setHistory(data.history);
    }
    setLoading(false);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const shareLink = `${window.location.origin}/register?ref=${referralCode}`;

  if (loading) {
    return (
      <div className="min-h-screen hero-grid flex items-center justify-center">
        <div className="text-cyan-400 font-orbitron animate-pulse-glow">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-grid">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold gradient-text mb-4">
            {tr('referrals', 'title')}
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {tr('referrals', 'subtitle')}
          </p>
        </div>

        {/* Referral Code Section */}
        <div className="card-sci-fi p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 animate-scan-line pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-xl font-orbitron font-semibold text-white mb-6">{tr('referrals', 'yourCode')}</h2>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 p-4 bg-black/40 rounded-lg border border-cyan-500/30">
                <code className="text-2xl font-mono-tech text-cyan-400 neon-text">{referralCode || 'N/A'}</code>
              </div>
              <button
                onClick={() => copyToClipboard(referralCode)}
                className="btn-sci-fi whitespace-nowrap"
              >
                {copied ? tr('referrals', 'copied') : tr('referrals', 'copyCode')}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 p-4 bg-black/40 rounded-lg border border-purple-500/30">
                <code className="text-sm font-mono-tech text-purple-400 break-all">{shareLink}</code>
              </div>
              <button
                onClick={() => copyToClipboard(shareLink)}
                className="btn-sci-fi-outline whitespace-nowrap"
              >
                {tr('referrals', 'copyLink')}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-sci-fi p-6 text-center">
            <div className="text-4xl font-orbitron font-bold text-cyan-400 mb-2">{stats.totalReferrals}</div>
            <div className="text-gray-400">{tr('referrals', 'totalReferrals')}</div>
          </div>
          <div className="card-sci-fi p-6 text-center">
            <div className="text-4xl font-orbitron font-bold text-purple-400 mb-2">{stats.totalEarned.toLocaleString()}</div>
            <div className="text-gray-400">{tr('referrals', 'totalEarned')}</div>
          </div>
          <div className="card-sci-fi p-6 text-center">
            <div className="text-4xl font-orbitron font-bold text-pink-400 mb-2">{(stats.bonusRate * 100).toFixed(0)}%</div>
            <div className="text-gray-400">{tr('referrals', 'bonus')}</div>
          </div>
        </div>

        {/* History */}
        <div className="card-sci-fi p-8">
          <h2 className="text-xl font-orbitron font-semibold text-white mb-6">{tr('referrals', 'history')}</h2>
          
          {history.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500">{tr('referrals', 'noReferrals')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left">{tr('referrals', 'date')}</th>
                    <th className="px-4 py-3 text-left">{tr('referrals', 'user')}</th>
                    <th className="px-4 py-3 text-left">{tr('referrals', 'reward')}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(item => (
                    <tr key={item.id} className="border-b border-gray-800">
                      <td className="px-4 py-3 text-gray-400 font-mono-tech text-sm">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{item.referredUserEmail}</td>
                      <td className="px-4 py-3 text-cyan-400 font-mono-tech">+{item.bonusTokens.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
