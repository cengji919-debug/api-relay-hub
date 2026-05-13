'use client';

import { useState, useEffect, useCallback } from 'react';
import { defaultLocale, type Locale, t } from '@/lib/i18n';

export default function DocsPage() {
  const [locale, setLocale] = useState<Locale>('en');
  const [activeTab, setActiveTab] = useState('quickstart');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved) setLocale(saved);
    const handler = (e: Event) => setLocale((e as CustomEvent).detail);
    window.addEventListener('locale-change', handler);
    return () => window.removeEventListener('locale-change', handler);
  }, []);

  const tr = useCallback((...keys: string[]) => t(locale, ...keys), [locale]);

  const tabs = [
    { id: 'quickstart', label: tr('docs', 'quickStart') },
    { id: 'authentication', label: tr('docs', 'authentication') },
    { id: 'models', label: tr('docs', 'models') },
    { id: 'examples', label: tr('docs', 'examples') },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 mb-4">
            <a href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 gradient-bg rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">API Relay Hub</span>
            </a>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-600">{tr('nav', 'docs')}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{tr('docs', 'title')}</h1>
          <p className="text-gray-600 mt-2">{tr('docs', 'subtitle')}</p>
        </div>
      </div>

      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-indigo-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'quickstart' && (
          <div className="max-w-3xl space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{tr('docs', 'quickStart')}</h2>
              <p className="text-gray-600 mb-6">{tr('docs', 'quickStartDesc')}</p>

              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">{tr('docs', 'step1', 'title')}</h3>
                  <p className="text-sm text-gray-600 mb-3">{tr('docs', 'step1', 'desc')}</p>
                  <a href="/register" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">{tr('docs', 'createAccount')} →</a>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">{tr('docs', 'step2', 'title')}</h3>
                  <p className="text-sm text-gray-600 mb-3">{tr('docs', 'step2', 'desc')}</p>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">{tr('docs', 'step3', 'title')}</h3>
                  <p className="text-sm text-gray-600 mb-4">{tr('docs', 'step3', 'desc')}</p>
                  <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300 font-mono">
                      <code>{`curl https://api-relay-hub.com/v1/chat/completions \\
  -H "Authorization: Bearer sk-your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "Qwen/Qwen2.5-72B-Instruct",
    "messages": [
      {"role": "user", "content": "Hello! What can you do?"}
    ]
  }'`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'authentication' && (
          <div className="max-w-3xl space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{tr('docs', 'authentication')}</h2>
              <p className="text-gray-600 mb-6">{tr('docs', 'authDesc')}</p>

              <div className="p-6 bg-gray-50 rounded-xl mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">{tr('docs', 'apiKeyAuth')}</h3>
                <p className="text-sm text-gray-600 mb-3">{tr('docs', 'authHeaderDesc')}</p>
                <div className="bg-gray-900 rounded-xl p-4">
                  <pre className="text-sm text-gray-300 font-mono">
                    <code>Authorization: Bearer sk-your-api-key</code>
                  </pre>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-3">{tr('docs', 'baseUrl')}</h3>
                <div className="bg-gray-900 rounded-xl p-4">
                  <pre className="text-sm text-gray-300 font-mono">
                    <code>https://api-relay-hub.com/v1</code>
                  </pre>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'models' && (
          <div className="max-w-3xl space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{tr('docs', 'availableModels')}</h2>
              <p className="text-gray-600 mb-6">{tr('docs', 'modelsDesc')}</p>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-500">{tr('docs', 'modelId')}</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-500">{tr('docs', 'provider')}</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-500">{tr('docs', 'inputPrice')}</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-500">{tr('docs', 'outputPrice')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      ['Qwen/Qwen2.5-72B-Instruct', 'Alibaba', '$0.004/1K', '$0.004/1K'],
                      ['Qwen/Qwen2.5-32B-Instruct', 'Alibaba', '$0.001/1K', '$0.001/1K'],
                      ['Qwen/Qwen2.5-14B-Instruct', 'Alibaba', '$0.0008/1K', '$0.0008/1K'],
                      ['Qwen/Qwen2.5-7B-Instruct', 'Alibaba', '$0.0005/1K', '$0.0005/1K'],
                      ['deepseek-ai/DeepSeek-V3', 'DeepSeek', '$0.002/1K', '$0.002/1K'],
                      ['deepseek-ai/DeepSeek-R1', 'DeepSeek', '$0.004/1K', '$0.004/1K'],
                      ['THUDM/glm-4-9b-chat', 'Zhipu AI', '$0.0005/1K', '$0.0005/1K'],
                      ['internlm/internlm2_5-20b-chat', 'InternLM', '$0.001/1K', '$0.001/1K'],
                      ['01-ai/Yi-1.5-34B-Chat', '01.AI', '$0.0015/1K', '$0.0015/1K'],
                      ['baichuan-inc/Baichuan2-13B-Chat', 'Baichuan', '$0.0008/1K', '$0.0008/1K'],
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-3 text-sm font-mono text-gray-900">{row[0]}</td>
                        <td className="py-3 text-sm text-gray-600">{row[1]}</td>
                        <td className="py-3 text-sm text-gray-600 text-right">{row[2]}</td>
                        <td className="py-3 text-sm text-gray-600 text-right">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="max-w-3xl space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{tr('docs', 'codeExamples')}</h2>
              <p className="text-gray-600 mb-6">{tr('docs', 'examplesDesc')}</p>

              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Python</h3>
                  <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300 font-mono">
                      <code>{`import requests

API_KEY = "sk-your-api-key"
URL = "https://api-relay-hub.com/v1/chat/completions"

response = requests.post(
    URL,
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "model": "Qwen/Qwen2.5-72B-Instruct",
        "messages": [
            {"role": "user", "content": "Hello!"}
        ],
    },
)

print(response.json())`}</code>
                    </pre>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Node.js</h3>
                  <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300 font-mono">
                      <code>{`const API_KEY = "sk-your-api-key";
const URL = "https://api-relay-hub.com/v1/chat/completions";

const response = await fetch(URL, {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "Qwen/Qwen2.5-72B-Instruct",
    messages: [{ role: "user", content: "Hello!" }],
  }),
});

const data = await response.json();
console.log(data);`}</code>
                    </pre>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">{tr('docs', 'streaming')}</h3>
                  <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300 font-mono">
                      <code>{`import requests

API_KEY = "sk-your-api-key"
URL = "https://api-relay-hub.com/v1/chat/completions"

response = requests.post(
    URL,
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "model": "Qwen/Qwen2.5-72B-Instruct",
        "messages": [{"role": "user", "content": "Tell me a story"}],
        "stream": True,
    },
    stream=True,
)

for line in response.iter_lines():
    if line:
        print(line.decode())`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}