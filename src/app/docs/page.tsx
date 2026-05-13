'use client';

import { useState } from 'react';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('quickstart');

  const tabs = [
    { id: 'quickstart', label: 'Quick Start' },
    { id: 'authentication', label: 'Authentication' },
    { id: 'models', label: 'Models' },
    { id: 'examples', label: 'Examples' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
            <span className="text-sm text-gray-600">Docs</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
          <p className="text-gray-600 mt-2">Learn how to integrate Chinese LLMs into your applications.</p>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'quickstart' && (
          <div className="max-w-3xl space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
              <p className="text-gray-600 mb-6">Get started with API Relay Hub in under 5 minutes.</p>

              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">1. Create an account</h3>
                  <p className="text-sm text-gray-600 mb-3">Sign up for a free account to get your API key.</p>
                  <a href="/register" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">Create Account →</a>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">2. Get your API key</h3>
                  <p className="text-sm text-gray-600 mb-3">Generate an API key from the dashboard. Keep it secure.</p>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">3. Make your first request</h3>
                  <p className="text-sm text-gray-600 mb-4">Use your API key to make a request to any supported model:</p>
                  <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300 font-mono">
                      <code>{`curl https://api-relay-hub.com/v1/chat/completions \\
  -H "Authorization: Bearer sk-your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "qwen-plus",
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h2>
              <p className="text-gray-600 mb-6">All API requests require authentication via API key.</p>

              <div className="p-6 bg-gray-50 rounded-xl mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">API Key Authentication</h3>
                <p className="text-sm text-gray-600 mb-3">Include your API key in the Authorization header:</p>
                <div className="bg-gray-900 rounded-xl p-4">
                  <pre className="text-sm text-gray-300 font-mono">
                    <code>Authorization: Bearer sk-your-api-key</code>
                  </pre>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-3">Base URL</h3>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Models</h2>
              <p className="text-gray-600 mb-6">All models are accessible through the unified chat completions endpoint.</p>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Model ID</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Provider</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-500">Input Price</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-500">Output Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      ['ernie-4.0', 'Baidu', '¥0.12/1K', '¥0.12/1K'],
                      ['ernie-3.5', 'Baidu', '¥0.04/1K', '¥0.04/1K'],
                      ['qwen-max', 'Alibaba', '¥0.04/1K', '¥0.12/1K'],
                      ['qwen-plus', 'Alibaba', '¥0.004/1K', '¥0.012/1K'],
                      ['qwen-turbo', 'Alibaba', '¥0.002/1K', '¥0.006/1K'],
                      ['spark-4.0', 'iFlytek', '¥0.10/1K', '¥0.10/1K'],
                      ['spark-3.0', 'iFlytek', '¥0.03/1K', '¥0.03/1K'],
                      ['deepseek-chat', 'DeepSeek', '¥0.001/1K', '¥0.002/1K'],
                      ['deepseek-reasoner', 'DeepSeek', '¥0.004/1K', '¥0.008/1K'],
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Code Examples</h2>
              <p className="text-gray-600 mb-6">Example code in various programming languages.</p>

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
        "model": "qwen-plus",
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
    model: "ernie-4.0",
    messages: [{ role: "user", content: "Hello!" }],
  }),
});

const data = await response.json();
console.log(data);`}</code>
                    </pre>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Streaming (Python)</h3>
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
        "model": "qwen-plus",
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