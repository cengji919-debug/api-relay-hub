'use client';

import { useEffect, useState } from 'react';

interface UsageLog {
  id: string;
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  tokensCost: number;
  responseTimeMs: number;
  statusCode: number;
  createdAt: string;
}

interface UsageSummary {
  totalTokens: number;
  totalCost: number;
  totalCalls: number;
  avgResponseTime: number;
}

export default function UsagePage() {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    fetch('/api/usage', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setLogs(data.logs || []);
        setSummary(data.summary || null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usage</h1>
        <p className="text-gray-600 mt-1">Monitor your API usage and token consumption.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Total API Calls</div>
          <div className="text-2xl font-bold text-gray-900">{summary?.totalCalls || 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Tokens Used</div>
          <div className="text-2xl font-bold text-gray-900">{(summary?.totalTokens || 0).toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Avg Response Time</div>
          <div className="text-2xl font-bold text-gray-900">{(summary?.avgResponseTime || 0).toFixed(0)}ms</div>
        </div>
      </div>

      {/* Usage Logs */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Recent Usage</h2>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500">No usage data yet. Start making API calls to see your usage.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Model</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Input</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Output</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.modelName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{log.inputTokens}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{log.outputTokens}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{log.totalTokens}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{log.tokensCost}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{log.responseTimeMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}