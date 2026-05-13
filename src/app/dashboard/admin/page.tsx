'use client';

import { useEffect, useState, useCallback } from 'react';
import { defaultLocale, type Locale, t } from '@/lib/i18n';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalTokens: number;
}

interface User {
  id: string;
  email: string;
  displayName: string | null;
  isActive: number;
  balance: number;
  createdAt: string;
}

export default function AdminPage() {
  const [locale, setLocale] = useState<Locale>('en');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'providers' | 'channels'>('overview');
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, activeUsers: 0, totalRevenue: 0, totalTokens: 0 });
  const [users, setUsers] = useState<User[]>([]);
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
    fetchData();
  }, []);

  async function fetchData() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const [statsRes, usersRes] = await Promise.all([
      fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
    ]);

    if (statsRes.ok) {
      const data = await statsRes.json() as AdminStats;
      setStats(data);
    }
    if (usersRes.ok) {
      const data = await usersRes.json() as { users: User[] };
      setUsers(data.users);
    }
    setLoading(false);
  }

  async function toggleUserStatus(userId: string, currentStatus: number) {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: currentStatus ? 0 : 1 }),
    });
    fetchData();
  }

  const tabs = [
    { id: 'overview' as const, label: tr('admin', 'overview') },
    { id: 'users' as const, label: tr('admin', 'users') },
    { id: 'providers' as const, label: tr('admin', 'providers') },
    { id: 'channels' as const, label: tr('admin', 'channels') },
  ];

  if (loading) {
    return (
      <div className="min-h-screen hero-grid flex items-center justify-center">
        <div className="text-cyan-400 font-orbitron animate-pulse-glow">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-orbitron font-bold gradient-text mb-2">
            {tr('admin', 'title')}
          </h1>
          <p className="text-gray-400">{tr('admin', 'subtitle')}</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id ? 'btn-sci-fi' : 'btn-sci-fi-outline'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-sci-fi p-6 text-center">
              <div className="text-4xl font-orbitron font-bold text-cyan-400 mb-2">{stats.totalUsers}</div>
              <div className="text-gray-400">{tr('admin', 'totalUsers')}</div>
            </div>
            <div className="card-sci-fi p-6 text-center">
              <div className="text-4xl font-orbitron font-bold text-green-400 mb-2">{stats.activeUsers}</div>
              <div className="text-gray-400">{tr('admin', 'activeUsers')}</div>
            </div>
            <div className="card-sci-fi p-6 text-center">
              <div className="text-4xl font-orbitron font-bold text-purple-400 mb-2">${stats.totalRevenue.toFixed(2)}</div>
              <div className="text-gray-400">{tr('admin', 'totalRevenue')}</div>
            </div>
            <div className="card-sci-fi p-6 text-center">
              <div className="text-4xl font-orbitron font-bold text-pink-400 mb-2">{(stats.totalTokens / 1_000_000).toFixed(1)}M</div>
              <div className="text-gray-400">{tr('admin', 'totalTokens')}</div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card-sci-fi p-8">
            <h2 className="text-xl font-orbitron font-semibold text-white mb-6">{tr('admin', 'userManagement')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left">{tr('admin', 'email')}</th>
                    <th className="px-4 py-3 text-left">{tr('admin', 'balance')}</th>
                    <th className="px-4 py-3 text-left">{tr('admin', 'status')}</th>
                    <th className="px-4 py-3 text-left">{tr('admin', 'actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-gray-800">
                      <td className="px-4 py-3 text-gray-300">{user.email}</td>
                      <td className="px-4 py-3 text-cyan-400 font-mono-tech">{user.balance.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {user.isActive ? tr('admin', 'active') : tr('admin', 'suspended')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                          className="btn-sci-fi-outline px-3 py-1 text-xs"
                        >
                          {user.isActive ? tr('admin', 'suspend') : tr('admin', 'activate')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Providers Tab */}
        {activeTab === 'providers' && (
          <div className="card-sci-fi p-8 text-center py-16">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            <p className="text-gray-500">{tr('admin', 'providerManagement')} - {tr('common', 'comingSoon')}</p>
          </div>
        )}

        {/* Channels Tab */}
        {activeTab === 'channels' && (
          <div className="card-sci-fi p-8 text-center py-16">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">{tr('admin', 'channelManagement')} - {tr('common', 'comingSoon')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
