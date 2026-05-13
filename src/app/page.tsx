'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { defaultLocale, type Locale, t } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved) setLocale(saved);

    const handler = (e: Event) => {
      setLocale((e as CustomEvent).detail);
    };
    window.addEventListener('locale-change', handler);
    return () => window.removeEventListener('locale-change', handler);
  }, []);

  const tr = useCallback((...keys: string[]) => t(locale, ...keys), [locale]);

  const models = [
    { name: 'Qwen 2.5 72B', provider: 'Alibaba', desc: '通义千问最新模型，超强推理和生成能力', popular: true },
    { name: 'Qwen 2.5 32B', provider: 'Alibaba', desc: '平衡性能和效率的通用模型', popular: false },
    { name: 'DeepSeek V3', provider: 'DeepSeek', desc: '高效模型，价格极具竞争力', popular: true },
    { name: 'DeepSeek R1', provider: 'DeepSeek', desc: '增强推理模型，适合复杂问题解决', popular: false },
    { name: 'GLM-4 9B', provider: '智谱 AI', desc: '智谱最新模型，多语言能力强', popular: true },
    { name: 'InternLM 2.5 20B', provider: '书生', desc: '开源模型，适合高吞吐场景', popular: false },
    { name: 'Yi 1.5 34B', provider: '零一万物', desc: '高质量中英文理解能力', popular: false },
    { name: 'Baichuan 2 13B', provider: '百川智能', desc: '轻量级模型，成本低', popular: false },
  ];

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
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{tr('nav', 'home')}</a>
              <a href="#models" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{tr('home', 'models', 'title')}</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{tr('home', 'pricing', 'title')}</a>
              <a href="#docs" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{tr('nav', 'docs')}</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <LanguageSwitcher />
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                {tr('nav', 'login')}
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                {tr('nav', 'register')}
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
                <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">{tr('nav', 'home')}</a>
                <a href="#models" className="text-sm text-gray-600 hover:text-gray-900">{tr('home', 'models', 'title')}</a>
                <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">{tr('home', 'pricing', 'title')}</a>
                <a href="#docs" className="text-sm text-gray-600 hover:text-gray-900">{tr('nav', 'docs')}</a>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <LanguageSwitcher />
                  <div className="flex gap-3">
                    <Link href="/login" className="text-sm font-medium px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">{tr('nav', 'login')}</Link>
                    <Link href="/register" className="text-sm font-medium px-4 py-2 gradient-bg text-white rounded-lg">{tr('nav', 'register')}</Link>
                  </div>
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
            {locale === 'zh' ? (
              <>
                一个 API 接入
                <span className="gradient-text block mt-2">所有中国大模型</span>
              </>
            ) : (
              <>
                Unified API for
                <span className="gradient-text block mt-2">Chinese LLMs</span>
              </>
            )}
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-fade-in-delay-1">
            {tr('home', 'hero', 'subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delay-2">
            <Link
              href="/register"
              className="px-8 py-4 gradient-bg text-white font-semibold rounded-xl text-lg hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
            >
              {tr('home', 'hero', 'getStarted')}
            </Link>
            <a
              href="#docs"
              className="px-8 py-4 border border-gray-200 text-gray-700 font-semibold rounded-xl text-lg hover:bg-gray-50 transition-colors"
            >
              {tr('home', 'hero', 'viewDocs')}
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 animate-fade-in-delay-3">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {locale === 'zh' ? '无需中国手机号' : 'No Chinese phone required'}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {locale === 'zh' ? '支持 Stripe/PayPal' : 'Pay with Stripe/PayPal'}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {locale === 'zh' ? '兼容 OpenAI' : 'OpenAI-compatible'}
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

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {locale === 'zh' ? '集成中国大模型所需的一切' : 'Everything you need to integrate Chinese LLMs'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {locale === 'zh' ? '一个平台，一个 API 密钥，接入所有主流中国语言模型。' : 'One platform, one API key, access to all major Chinese language models.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: locale === 'zh' ? '统一 API' : 'Unified API',
                description: locale === 'zh' ? '所有提供商使用 OpenAI 兼容端点。只需更改一个参数即可切换模型。' : 'OpenAI-compatible endpoints for all providers. Switch between models with a single parameter change.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                title: locale === 'zh' ? '多模型支持' : 'Multiple Models',
                description: locale === 'zh' ? '接入通义千问、DeepSeek、GLM、书生、零一万物、百川等主流模型。' : 'Access Qwen, DeepSeek, GLM, InternLM, Yi, Baichuan and more.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                ),
              },
              {
                title: locale === 'zh' ? '全球访问' : 'Global Access',
                description: locale === 'zh' ? '无需中国手机号或支付方式。' : 'No Chinese phone number or payment method required.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: locale === 'zh' ? '按需付费' : 'Pay as You Go',
                description: locale === 'zh' ? '灵活的 Token 套餐，永不过期。' : 'Flexible token packages with no expiration date.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ),
              },
              {
                title: locale === 'zh' ? '流式支持' : 'Streaming Support',
                description: locale === 'zh' ? '完整 SSE 流式支持，实时逐 token 返回。' : 'Full SSE streaming support for real-time token-by-token responses.',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                title: locale === 'zh' ? '99.9% 可用性' : '99.9% Uptime',
                description: locale === 'zh' ? 'Cloudflare 全球边缘部署。自动故障转移和智能路由。' : 'Global edge deployment on Cloudflare. Automatic failover and intelligent routing.',
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{tr('home', 'models', 'title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {tr('home', 'models', 'subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model, i) => (
              <div key={i} className={`p-6 rounded-xl border ${model.popular ? 'border-indigo-200 bg-white shadow-md' : 'border-gray-100 bg-white'} hover:shadow-lg transition-shadow`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{model.name}</h3>
                  {model.popular && (
                    <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                      {locale === 'zh' ? '热门' : 'Popular'}
                    </span>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{tr('home', 'pricing', 'title')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {tr('home', 'pricing', 'subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {[
              { name: 'Starter', tokens: '400K', price: 5, bonus: 0 },
              { name: 'Basic', tokens: '1M', price: 10, bonus: 50000 },
              { name: 'Pro', tokens: '2.5M', price: 25, bonus: 200000, popular: true },
              { name: 'Enterprise', tokens: '5.5M', price: 50, bonus: 500000 },
              { name: 'Custom', tokens: '12M', price: 100, bonus: 1000000 },
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
                  <div className="text-xs font-semibold text-indigo-700 mb-2">{tr('home', 'pricing', 'popular')}</div>
                )}
                <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-bold text-gray-900">${pkg.price}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{pkg.tokens} {tr('billing', 'tokens')}</p>
                {pkg.bonus > 0 && (
                  <p className="text-xs text-green-600 font-medium">+{pkg.bonus.toLocaleString()} {tr('home', 'pricing', 'bonus')}</p>
                )}
                <Link
                  href="/register"
                  className={`mt-6 block w-full py-2.5 rounded-xl text-sm font-semibold ${
                    pkg.popular
                      ? 'gradient-bg text-white'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  } transition-all`}
                >
                  {tr('home', 'pricing', 'buyNow')}
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
            {tr('home', 'cta', 'title')}
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            {tr('home', 'cta', 'subtitle')}
          </p>
          <Link
            href="/register"
            className="inline-flex px-8 py-4 bg-white text-indigo-700 font-semibold rounded-xl text-lg hover:bg-indigo-50 transition-colors shadow-xl"
          >
            {tr('home', 'cta', 'button')}
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
              <a href="#" className="hover:text-gray-700">{locale === 'zh' ? '条款' : 'Terms'}</a>
              <a href="#" className="hover:text-gray-700">{locale === 'zh' ? '隐私' : 'Privacy'}</a>
              <a href="#" className="hover:text-gray-700">{locale === 'zh' ? '状态' : 'Status'}</a>
              <a href="#" className="hover:text-gray-700">{locale === 'zh' ? '联系' : 'Contact'}</a>
            </div>
            <p className="text-sm text-gray-400">© 2026 API Relay Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
