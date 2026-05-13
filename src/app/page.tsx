'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">API Relay Hub</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#models" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Models</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#docs" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Docs</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
                <a href="#models" className="text-sm text-gray-600 hover:text-gray-900">Models</a>
                <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
                <a href="#docs" className="text-sm text-gray-600 hover:text-gray-900">Docs</a>
                <div className="flex gap-3 pt-2">
                  <Link href="/login" className="flex-1 text-center text-sm font-medium px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Sign In</Link>
                  <Link href="/register" className="flex-1 text-center text-sm font-medium px-4 py-2 gradient-bg text-white rounded-lg">Get Started</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 hero-grid">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-sm text-indigo-700 font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            All systems operational
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 animate-fade-in">
            Unified API for
            <span className="gradient-text block mt-2">Chinese LLMs</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-fade-in-delay-1">
            Access ERNIE Bot, Tongyi Qianwen, Spark Desk, DeepSeek and more through a single,
            OpenAI-compatible API. No Chinese payment methods or phone numbers required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delay-2">
            <Link
              href="/register"
              className="px-8 py-4 gradient-bg text-white font-semibold rounded-xl text-lg hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
            >
              Start Building Free
            </Link>
            <a
              href="#docs"
              className="px-8 py-4 border border-gray-200 text-gray-700 font-semibold rounded-xl text-lg hover:bg-gray-50 transition-colors"
            >
              View Documentation
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 animate-fade-in-delay-3">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No Chinese phone required
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Pay with Stripe/PayPal
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              OpenAI-compatible
            </span>
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="gradient-border rounded-2xl bg-white p-1">
            <div className="rounded-xl bg-gray-900 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-sm text-gray-400">bash</span>
              </div>
              <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
                <code>{`curl https://api-relay-hub.com/v1/chat/completions \\
  -H "Authorization: Bearer sk-your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "ernie-4.0",
    "messages": [
      {"role": "user", "content": "Hello! What can you do?"}
    ]
  }'`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to integrate Chinese LLMs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              One platform, one API key, access to all major Chinese language models.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Unified API',
                description: 'OpenAI-compatible endpoints for all providers. Switch between models with a single parameter change.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                title: 'Global Payments',
                description: 'Pay with Stripe, PayPal, or cryptocurrency. No Chinese payment methods needed.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ),
              },
              {
                title: 'Real-time Usage',
                description: 'Monitor your token consumption, response times, and costs in real-time through the dashboard.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                title: 'Streaming Support',
                description: 'Full SSE streaming support for real-time token-by-token responses from all providers.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                title: 'API Key Management',
                description: 'Create multiple API keys with different permissions. Rotate and revoke keys instantly.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                ),
              },
              {
                title: '99.9% Uptime',
                description: 'Global edge deployment on Cloudflare. Automatic failover and intelligent routing.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
              },
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 group-hover:gradient-bg group-hover:text-white transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Models Section */}
      <section id="models" className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Supported Models</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Access the latest and most powerful Chinese language models through a single API.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'ERNIE 4.0', provider: 'Baidu', desc: 'Baidu\'s most advanced model with superior reasoning and generation capabilities.', popular: true },
              { name: 'ERNIE 3.5', provider: 'Baidu', desc: 'Cost-effective model balancing performance and efficiency.', popular: false },
              { name: 'Qwen Max', provider: 'Alibaba', desc: 'Alibaba\'s flagship model excelling in complex reasoning tasks.', popular: true },
              { name: 'Qwen Plus', provider: 'Alibaba', desc: 'Balanced model for general-purpose applications.', popular: false },
              { name: 'Qwen Turbo', provider: 'Alibaba', desc: 'Fast and lightweight model for high-throughput scenarios.', popular: false },
              { name: 'Spark 4.0', provider: 'iFlytek', desc: 'iFlytek\'s latest model with strong multilingual capabilities.', popular: true },
              { name: 'Spark 3.0', provider: 'iFlytek', desc: 'Reliable model for everyday conversational AI tasks.', popular: false },
              { name: 'DeepSeek Chat', provider: 'DeepSeek', desc: 'Highly efficient model with competitive pricing.', popular: true },
              { name: 'DeepSeek Reasoner', provider: 'DeepSeek', desc: 'Enhanced reasoning model for complex problem-solving.', popular: false },
            ].map((model, i) => (
              <div key={i} className={`p-6 rounded-xl border ${model.popular ? 'border-indigo-200 bg-white shadow-md' : 'border-gray-100 bg-white'} hover:shadow-lg transition-shadow`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{model.name}</h3>
                  {model.popular && (
                    <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">Popular</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-2">{model.provider}</p>
                <p className="text-sm text-gray-600">{model.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pay only for what you use. No hidden fees, no minimum commitments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {[
              { name: 'Starter', tokens: '400K', price: 5, bonus: 0 },
              { name: 'Basic', tokens: '1M', price: 10, bonus: '50K' },
              { name: 'Pro', tokens: '2.5M', price: 25, bonus: '200K', popular: true },
              { name: 'Enterprise', tokens: '5.5M', price: 50, bonus: '500K' },
              { name: 'Custom', tokens: '12M', price: 100, bonus: '1M' },
            ].map((pkg, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border text-center ${
                  pkg.popular
                    ? 'border-indigo-200 bg-indigo-50 shadow-lg scale-105'
                    : 'border-gray-100 bg-white'
                } hover:shadow-xl transition-all`}
              >
                {pkg.popular && (
                  <div className="text-xs font-semibold text-indigo-700 mb-2">BEST VALUE</div>
                )}
                <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-bold text-gray-900">${pkg.price}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{pkg.tokens} tokens</p>
                {pkg.bonus > 0 && (
                  <p className="text-xs text-green-600 font-medium">+{pkg.bonus} bonus</p>
                )}
                <Link
                  href="/register"
                  className={`mt-6 block w-full py-2.5 rounded-xl text-sm font-semibold ${
                    pkg.popular
                      ? 'gradient-bg text-white'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-all`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 gradient-bg">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to integrate Chinese LLMs?
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Get started in minutes. No Chinese payment methods, no phone verification, no hassle.
          </p>
          <Link
            href="/register"
            className="inline-flex px-8 py-4 bg-white text-indigo-700 font-semibold rounded-xl text-lg hover:bg-indigo-50 transition-colors shadow-xl"
          >
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 gradient-bg rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">API Relay Hub</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-700">Terms</a>
              <a href="#" className="hover:text-gray-700">Privacy</a>
              <a href="#" className="hover:text-gray-700">Status</a>
              <a href="#" className="hover:text-gray-700">Contact</a>
            </div>
            <p className="text-sm text-gray-400">© 2026 API Relay Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}