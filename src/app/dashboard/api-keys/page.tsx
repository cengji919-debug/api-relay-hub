'use client';

import { useEffect, useState, useCallback } from 'react';
import { defaultLocale, type Locale, t } from '@/lib/i18n';

interface ApiKey {
  id: string;
  keyPreview: string;
  name: string | null;
  isActive: number;
  lastUsedAt: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [locale, setLocale] = useState<Locale>('en');
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keyName, setKeyName] = useState('');
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
    fetchKeys();
  }, []);

  async function fetchKeys() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const res = await fetch('/api/keys', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json() as { keys: ApiKey[] };
      setKeys(data.keys);
    }
    setLoading(false);
  }

  async function createKey() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const res = await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: keyName || undefined }),
    });

    if (res.ok) {
      const data = await res.json() as { key: string };
      setNewKey(data.key);
      setKeyName('');
      fetchKeys();
    }
  }

  async function deleteKey(id: string) {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    await fetch(`/api/keys?id=${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    fetchKeys();
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{tr('apiKeys', 'title')}</h1>
        <p className="text-gray-600 mt-1">{tr('apiKeys', 'subtitle')}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{tr('apiKeys', 'createKey')}</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={keyName}
            onChange={e => setKeyName(e.target.value)}
            placeholder={tr('apiKeys', 'name')}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
          />
          <button
            onClick={createKey}
            className="px-6 py-2.5 gradient-bg text-white font-medium rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            {tr('apiKeys', 'createKey')}
          </button>
        </div>

        {newKey && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-sm font-medium text-amber-800 mb-2">{tr('apiKeys', 'key')}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm font-mono break-all">
                {newKey}
              </code>
              <button
                onClick={() => copyToClipboard(newKey)}
                className="px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm hover:bg-amber-50 transition-colors"
              >
                {copied ? tr('apiKeys', 'copied') : tr('apiKeys', 'copy')}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">{tr('apiKeys', 'title')}</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <p className="text-gray-500">{tr('apiKeys', 'noKeys')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {keys.map(key => (
              <div key={key.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-gray-900">{key.name || 'Unnamed Key'}</span>
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {key.keyPreview}...
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${key.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {key.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {tr('apiKeys', 'created')} {new Date(key.createdAt).toLocaleDateString()}
                    {key.lastUsedAt && ` · ${tr('apiKeys', 'lastUsed')} ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={() => deleteKey(key.id)}
                  className="ml-4 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  {tr('apiKeys', 'delete')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}