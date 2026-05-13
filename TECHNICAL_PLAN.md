# API Relay Platform - Technical Design & Implementation Plan

## 1. Project Overview

### 1.1 Platform Positioning
**API Relay Hub** - A relay service platform that enables international users to access Chinese mainland LLM APIs (ERNIE Bot, Tongyi Qianwen, Spark Desk, etc.) through a unified, developer-friendly interface.

### 1.2 Core Value Proposition
- Unified API gateway for all major Chinese LLM providers
- Automated currency conversion and payment processing (USD/Crypto)
- Dynamic pricing engine maintaining 30-50% profit margin
- Zero configuration - works out of the box for international developers

---

## 2. Technology Stack

### 2.1 Backend
| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Runtime** | Node.js 20 LTS | High I/O performance, excellent for API proxy scenarios |
| **Framework** | NestJS | Modular architecture, built-in DI, guards, interceptors |
| **API Gateway** | Express + http-proxy-middleware | Lightweight, battle-tested proxy capabilities |
| **Language** | TypeScript 5.x | Type safety, better maintainability |
| **ORM** | Prisma | Type-safe database access, migrations |
| **Queue** | Bull + Redis | Async task processing (recharge, notifications) |
| **Validation** | Zod | Runtime type validation, OpenAPI integration |

### 2.2 Frontend
| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Framework** | Next.js 14 (App Router) | SSR, SEO, excellent DX |
| **UI Library** | Tailwind CSS + shadcn/ui | Modern, customizable, accessible |
| **State Management** | React Query + Zustand | Server state + client state separation |
| **Forms** | React Hook Form + Zod | Performant form validation |
| **i18n** | next-intl | Multi-language support (EN, JP, KR, etc.) |

### 2.3 Infrastructure
| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Database** | PostgreSQL 16 | Reliability, JSON support, full-text search |
| **Cache** | Redis 7 | Sub-millisecond latency, session store |
| **Container** | Docker + Docker Compose | Consistent environments |
| **CI/CD** | GitHub Actions | Automated testing & deployment |
| **Hosting** | DigitalOcean / AWS Lightsail | Cost-effective, global regions |
| **CDN** | Cloudflare | DDoS protection, edge caching |
| **Monitoring** | Sentry + Grafana | Error tracking + metrics |

### 2.4 Payment Integration
| Provider | Purpose | Region |
|----------|---------|--------|
| **Stripe** | Primary payment (Credit Card) | Global |
| **PayPal** | Alternative payment | Global |
| **USDT (TRC-20)** | Crypto payments | Optional MVP+ |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Cloudflare CDN                        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (HAProxy)                    │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
    ┌─────────▼─────────┐           ┌─────────▼─────────┐
    │   Next.js App     │           │   NestJS API      │
    │   (Frontend)      │◄─────────►│   (Backend)       │
    └───────────────────┘           └─────────┬─────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
          ┌─────────▼─────────┐   ┌──────────▼──────────┐   ┌─────────▼─────────┐
          │   PostgreSQL      │   │      Redis          │   │   Bull Queue      │
          │   (Primary DB)    │   │   (Cache/Session)   │   │   (Async Tasks)   │
          └───────────────────┘   └─────────────────────┘   └───────────────────┘
                                                                        │
                    ┌────────────────────────────────────────────────────┼────────────┐
                    │                         │                         │            │
          ┌─────────▼─────────┐   ┌──────────▼──────────┐   ┌─────────▼─────────┐  │
          │   ERNIE Bot API   │   │  Tongyi Qianwen API │   │  Spark Desk API   │  │
          │   (Baidu)         │   │  (Alibaba)          │   │  (iFlytek)        │  │
          └───────────────────┘   └─────────────────────┘   └───────────────────┘  │
                                                                                   │
          ┌────────────────────────────────────────────────────────────────────────┘
          │
┌─────────▼──────────────────────────────────────────────────┐
│              External Services                              │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐  │
│  │   Stripe    │  │   PayPal    │  │   Email Service   │  │
│  └─────────────┘  └─────────────┘  └───────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### 3.2 Database Schema Design

```sql
-- Core Tables

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    api_key VARCHAR(64) UNIQUE NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys (support multiple keys per user)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    key_preview VARCHAR(8) NOT NULL, -- First 8 chars for identification
    key_hash VARCHAR(255) NOT NULL, -- Hashed full key
    name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Token Balance
CREATE TABLE token_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id),
    balance BIGINT DEFAULT 0, -- Token amount (smallest unit)
    lifetime_usage BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Token Transactions
CREATE TABLE token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type ENUM('purchase', 'usage', 'refund', 'bonus') NOT NULL,
    amount BIGINT NOT NULL, -- Positive for credit, negative for debit
    balance_before BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    reference_type VARCHAR(50), -- 'payment', 'api_call', etc.
    reference_id UUID,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Records
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    provider ENUM('stripe', 'paypal', 'usdt') NOT NULL,
    provider_payment_id VARCHAR(255),
    amount DECIMAL(12,2) NOT NULL, -- USD amount
    currency VARCHAR(3) DEFAULT 'USD',
    tokens BIGINT NOT NULL, -- Tokens purchased
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Providers
CREATE TABLE api_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- 'ernie', 'tongyi', 'spark'
    display_name VARCHAR(100) NOT NULL,
    base_url VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider Pricing (historical tracking)
CREATE TABLE provider_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES api_providers(id),
    model_name VARCHAR(100) NOT NULL, -- 'ernie-4.0', 'qwen-max', etc.
    input_price DECIMAL(12,6) NOT NULL, -- Price per 1K input tokens (CNY)
    output_price DECIMAL(12,6) NOT NULL, -- Price per 1K output tokens (CNY)
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform Pricing (dynamic)
CREATE TABLE platform_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES api_providers(id),
    model_name VARCHAR(100) NOT NULL,
    price_per_token DECIMAL(12,8) NOT NULL, -- USD per token
    profit_margin DECIMAL(5,2) NOT NULL, -- Current margin percentage
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Usage Logs
CREATE TABLE api_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    api_key_id UUID REFERENCES api_keys(id),
    provider_id UUID NOT NULL REFERENCES api_providers(id),
    model_name VARCHAR(100) NOT NULL,
    input_tokens INTEGER NOT NULL,
    output_tokens INTEGER NOT NULL,
    total_tokens INTEGER NOT NULL,
    tokens_cost BIGINT NOT NULL, -- Platform tokens consumed
    response_time_ms INTEGER,
    status_code INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_transactions_user ON token_transactions(user_id);
CREATE INDEX idx_transactions_created ON token_transactions(created_at);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_usage_user ON api_usage_logs(user_id);
CREATE INDEX idx_usage_created ON api_usage_logs(created_at);
CREATE INDEX idx_usage_provider ON api_usage_logs(provider_id);
CREATE INDEX idx_provider_pricing_active ON provider_pricing(effective_from, effective_to);
```

---

## 4. Core Module Design

### 4.1 API Integration Module

#### Unified API Interface
All Chinese LLM providers are abstracted behind a single OpenAI-compatible interface:

```
POST /v1/chat/completions
Authorization: Bearer <platform_api_key>

{
    "model": "ernie-4.0",       // Unified model name
    "messages": [...],
    "temperature": 0.7,
    "stream": true/false
}
```

#### Provider Adapter Pattern
```
┌─────────────────────────────────────────────────────────┐
│                  Unified API Controller                   │
├─────────────────────────────────────────────────────────┤
│  1. Authenticate request (API Key validation)            │
│  2. Resolve provider from model name                     │
│  3. Calculate estimated token cost                       │
│  4. Check user balance                                   │
│  5. Transform request to provider format                 │
│  6. Forward request to provider                          │
│  7. Transform response to unified format                 │
│  8. Deduct tokens from user balance                      │
│  9. Log usage metrics                                    │
└─────────────────────────────────────────────────────────┘
```

#### Provider Adapters (to be implemented)

| Provider | Auth Method | Rate Limit | Streaming Support |
|----------|-------------|------------|-------------------|
| **ERNIE Bot (Baidu)** | OAuth 2.0 (access_token) | 120 QPM | SSE |
| **Tongyi Qianwen (Alibaba)** | API Key | 100 QPM | SSE |
| **Spark Desk (iFlytek)** | API Key + App ID | 200 QPM | WebSocket |
| **DeepSeek** | API Key | 500 QPM | SSE |
| **Moonshot (Kimi)** | API Key | 60 QPM | SSE |

### 4.2 User Management System

#### Authentication Flow
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────►│  Auth    │────►│  Email   │────►│  JWT     │
│          │◄────│  Service │◄────│  Verify  │◄────│  Issue   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

- **Registration**: Email + password (bcrypt hashed)
- **Verification**: Email verification link (6-digit code fallback)
- **Authentication**: JWT (access token 15min + refresh token 7 days)
- **API Authentication**: API Key (Bearer token in header)
- **OAuth**: Google OAuth 2.0 (MVP+)

#### Security Measures
- Rate limiting: 10 requests/min for auth endpoints
- Brute force protection: Account lockout after 5 failed attempts
- Session management: Redis-based session store
- API Key rotation: Support for key regeneration

### 4.3 Payment System

#### Supported Payment Flows

**Stripe Integration:**
```
1. User selects token package (e.g., $10 for 1M tokens)
2. Frontend creates Stripe Checkout Session
3. User completes payment on Stripe hosted page
4. Stripe webhook → POST /webhooks/stripe
5. Backend verifies event signature
6. Credits tokens to user account
7. Sends confirmation email
```

**PayPal Integration:**
```
1. User selects token package
2. Backend creates PayPal order
3. Frontend redirects to PayPal approval URL
4. User approves payment on PayPal
5. PayPal webhook → POST /webhooks/paypal
6. Backend captures order
7. Credits tokens to user account
```

#### Token Packages (Suggested)

| Package | Price (USD) | Tokens | Bonus |
|---------|-------------|--------|-------|
| Starter | $5 | 400K | - |
| Basic | $10 | 1M | 50K |
| Pro | $25 | 2.5M | 200K |
| Enterprise | $50 | 5.5M | 500K |
| Custom | $100+ | Custom | Negotiable |

### 4.4 Dynamic Pricing Engine

#### Pricing Algorithm

```
Input: Provider base price (CNY per 1K tokens)
       Exchange rate (CNY/USD)
       Target profit margin (30-50%)
       Competitor prices (reference)

Process:
  1. Convert provider cost to USD
     cost_usd = (provider_price_cny / 1000) / exchange_rate

  2. Calculate base platform price
     base_price = cost_usd / (1 - target_margin)

  3. Adjust for market conditions
     - If competitor prices are 20%+ higher → increase margin
     - If competitor prices are 20%+ lower → decrease margin (floor at 30%)
     - If provider has promotion → pass partial savings to users

  4. Apply volume discounts
     - Tier 1 (< 100K tokens/month): standard price
     - Tier 2 (100K-1M): 5% discount
     - Tier 3 (1M-10M): 10% discount
     - Tier 4 (10M+): custom pricing

Output: Final price per token (USD)
```

#### Price Update Frequency
- Provider price changes: Real-time (webhook/polling)
- Exchange rate: Every hour
- Competitor prices: Every 6 hours
- Platform prices: Recalculated on any of the above changes

### 4.5 Auto-Recharge System

#### Flow for Automatic Provider Recharge
```
1. Monitor platform token balance for each provider
2. When balance < threshold (e.g., 20% remaining):
   a. Calculate required top-up amount
   b. Initiate recharge via provider's recharge API
   c. Record transaction in provider_balance_log
   d. Send notification to admin
3. Retry logic: 3 attempts with exponential backoff
4. Alert admin if all retries fail
```

---

## 5. Frontend Design

### 5.1 Page Structure

```
/                          → Landing page (marketing)
/login                     → Login page
/register                  → Registration page
/dashboard                 → User dashboard (overview)
/dashboard/usage           → Usage statistics & charts
/dashboard/api-keys        → API key management
/dashboard/billing         → Billing & payment history
/dashboard/pricing         → Pricing & token packages
/docs                      → API documentation
/docs/quickstart           → Quick start guide
/docs/examples             → Code examples (curl, Python, Node.js)
/status                    → System status page
/admin/*                   → Admin panel (admin only)
```

### 5.2 Design System

- **Design Inspiration**: Vercel, Stripe, Linear (clean, minimal, functional)
- **Color Palette**:
  - Primary: Indigo (#4F46E5)
  - Secondary: Slate (#64748B)
  - Accent: Emerald (#10B981)
  - Background: White (#FFFFFF) / Gray 50 (#F9FAFB)
  - Text: Gray 900 (#111827)
- **Typography**: Inter (headings) + JetBrains Mono (code)
- **Components**: shadcn/ui (Radix primitives + Tailwind)

### 5.3 Key UI Features

- **Real-time usage dashboard** with interactive charts (Recharts)
- **API Key management** with copy-to-clipboard and reveal/hide
- **Token balance indicator** in navigation bar
- **Dark mode support** (system preference + manual toggle)
- **Responsive design** (mobile-first)
- **Loading skeletons** for all data-fetching states

---

## 6. Development Plan & Milestones

### Phase 1: Foundation (Week 1-2)
| Task | Duration | Deliverable |
|------|----------|-------------|
| Project scaffolding (monorepo setup) | 2 days | NestJS + Next.js project structure |
| Database schema & migrations | 2 days | PostgreSQL schema with Prisma |
| User auth system (register/login/JWT) | 3 days | Auth endpoints + UI |
| API Key management | 2 days | Key generation + CRUD |
| Basic UI framework | 3 days | Layout, navigation, theme |

### Phase 2: Core API Proxy (Week 3-4)
| Task | Duration | Deliverable |
|------|----------|-------------|
| ERNIE Bot adapter | 2 days | Working proxy for ERNIE |
| Tongyi Qianwen adapter | 2 days | Working proxy for Tongyi |
| Spark Desk adapter | 2 days | Working proxy for Spark |
| Unified API endpoint | 2 days | OpenAI-compatible /v1/chat/completions |
| Streaming support | 2 days | SSE proxy for all providers |
| Token usage tracking | 1 day | Usage logging & balance deduction |

### Phase 3: Payment & Pricing (Week 5-6)
| Task | Duration | Deliverable |
|------|----------|-------------|
| Stripe integration | 3 days | Checkout + webhook + token credit |
| PayPal integration | 2 days | Order creation + webhook |
| Token package system | 1 day | Package CRUD + purchase flow |
| Dynamic pricing engine | 3 days | Price calculation + auto-update |
| Billing UI | 2 days | Payment history + invoices |

### Phase 4: Polish & Launch (Week 7-8)
| Task | Duration | Deliverable |
|------|----------|-------------|
| API documentation | 3 days | Interactive docs (Next.js based) |
| Dashboard analytics | 2 days | Usage charts + statistics |
| Email notifications | 2 days | Welcome, receipt, alerts |
| Admin panel | 3 days | User management, monitoring |
| Load testing & optimization | 2 days | Performance report |
| Security audit | 2 days | Penetration test report |
| Production deployment | 2 days | Live platform |

### Phase 5: MVP+ Enhancements (Post-Launch)
| Task | Priority |
|------|----------|
| Google OAuth login | Medium |
| Crypto payments (USDT) | Low |
| Team/Organization accounts | Low |
| Rate limiting per API key | Medium |
| Webhook notifications for usage | Low |
| SDK libraries (Python, Node.js) | Medium |

---

## 7. Resource Budget

### 7.1 Initial Setup Costs (Monthly)

| Item | Provider | Cost (USD/mo) |
|------|----------|---------------|
| **Server** (4 vCPU, 8GB RAM, 80GB SSD) | DigitalOcean | $48 |
| **Database** (Managed PostgreSQL, 2GB RAM) | DigitalOcean | $15 |
| **Redis** (Managed, 250MB) | DigitalOcean | $12 |
| **Domain** (1 year) | Namecheap | $12/yr ($1/mo) |
| **Cloudflare** (CDN + DDoS) | Cloudflare Free | $0 |
| **Sentry** (Error tracking) | Sentry Free | $0 |
| **Stripe** (Payment processing) | Stripe | 2.9% + $0.30/transaction |
| **PayPal** (Payment processing) | PayPal | 3.49% + $0.49/transaction |
| **Email Service** (Resend/SendGrid) | Resend Free | $0 (100 emails/day) |
| **SSL Certificate** | Let's Encrypt | $0 |
| **Total Monthly** | | **~$76** |

### 7.2 One-Time Setup Costs

| Item | Cost (USD) |
|------|------------|
| Legal/Incorporation (LLC) | $100-300 |
| API开通费用 (per provider) | $50-200 |
| Initial provider充值 | $200-500 |
| **Total One-Time** | **~$350-1,000** |

### 7.3 Development Resources

| Role | Hours | Rate | Cost |
|------|-------|------|------|
| Full-stack Developer | 320 hrs (8 weeks) | Self | $0 |
| UI/UX Design | 40 hrs | Self/AI | $0 |
| DevOps | 20 hrs | Self | $0 |
| **Total Labor** | **380 hrs** | | **$0 (self-built)** |

### 7.4 Total Initial Investment

| Category | Amount |
|----------|--------|
| Monthly infrastructure | ~$76/mo |
| One-time setup | ~$350-1,000 |
| First 2 months runway | ~$500 |
| **Total Required** | **~$850-1,500** |

---

## 8. Risk Assessment & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Provider API changes | Medium | High | Adapter pattern, automated tests |
| Payment fraud | Medium | High | Stripe Radar, manual review triggers |
| Exchange rate volatility | Low | Medium | Hourly rate updates, margin buffer |
| Competitor price war | Medium | Medium | Focus on reliability, not price |
| Regulatory changes | Low | High | Legal consultation, jurisdiction planning |
| Service abuse | Medium | Medium | Rate limiting, usage monitoring |

---

## 9. Monitoring & Analytics

### 9.1 Key Metrics to Track
- **User Acquisition**: Sign-ups, activation rate, referral sources
- **Usage**: Daily active users, API calls, tokens consumed
- **Revenue**: MRR, ARPU, conversion rate, churn rate
- **Performance**: P50/P95/P99 latency, error rate, uptime
- **Provider Costs**: Cost per token, margin by provider, total spend

### 9.2 Alerting Thresholds
- Error rate > 1% → Slack/Email alert
- P95 latency > 5s → Investigation trigger
- Provider balance < 20% → Auto-recharge trigger
- Daily token usage > 2x average → Review trigger

---

## 10. Deployment Architecture

### 10.1 Docker Compose (MVP)
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: apihub
      POSTGRES_PASSWORD: ${DB_PASSWORD}

  redis:
    image: redis:7-alpine

  api:
    build: ./apps/api
    depends_on: [postgres, redis]
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      # Provider API keys
      ERNIE_API_KEY: ${ERNIE_API_KEY}
      TONGYI_API_KEY: ${TONGYI_API_KEY}
      SPARK_API_KEY: ${SPARK_API_KEY}

  web:
    build: ./apps/web
    ports: ["80:3000"]
    depends_on: [api]
    environment:
      NEXT_PUBLIC_API_URL: ${API_URL}

  nginx:
    image: nginx:alpine
    ports: ["443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on: [web, api]
```

### 10.2 CI/CD Pipeline (GitHub Actions)
```
Push to main → Build & Test → Docker Build → Deploy to DO
                ├── Lint        ├── api:latest
                ├── Type check  ├── web:latest
                ├── Unit tests  └── Push to registry
                └── Integration tests
```

---

## 11. Next Steps & Action Items

### Immediate Actions (Week 1)
1. [ ] Set up monorepo structure (Nx or Turborepo)
2. [ ] Initialize NestJS backend project
3. [ ] Initialize Next.js frontend project
4. [ ] Configure Docker development environment
5. [ ] Set up PostgreSQL + Prisma schema
6. [ ] Implement user authentication (register/login/JWT)

### Week 2 Actions
1. [ ] Complete user management UI
2. [ ] Implement API Key management
3. [ ] Set up Redis caching layer
4. [ ] Create dashboard layout with charts
5. [ ] Implement token balance system

### Week 3-4 Actions
1. [ ] Build ERNIE Bot adapter
2. [ ] Build Tongyi Qianwen adapter
3. [ ] Build Spark Desk adapter
4. [ ] Implement unified API endpoint
5. [ ] Add streaming support
6. [ ] Implement usage tracking

### Week 5-6 Actions
1. [ ] Integrate Stripe payments
2. [ ] Integrate PayPal payments
3. [ ] Build dynamic pricing engine
4. [ ] Create billing UI
5. [ ] Implement auto-recharge system

### Week 7-8 Actions
1. [ ] Write API documentation
2. [ ] Build admin panel
3. [ ] Performance testing
4. [ ] Security audit
5. [ ] Production deployment
6. [ ] Launch MVP

---

## 12. Appendix: API Endpoints

### Public Endpoints
```
POST   /api/auth/register          - User registration
POST   /api/auth/login             - User login
POST   /api/auth/refresh           - Refresh JWT token
POST   /api/auth/forgot-password   - Password reset request
POST   /api/auth/reset-password    - Password reset
GET    /api/pricing                - Get current pricing
GET    /api/status                 - System status
```

### Authenticated Endpoints
```
GET    /api/user/profile           - Get user profile
PUT    /api/user/profile           - Update user profile
GET    /api/user/balance           - Get token balance
GET    /api/user/transactions      - Get transaction history

GET    /api/api-keys               - List API keys
POST   /api/api-keys               - Create API key
DELETE /api/api-keys/:id           - Delete API key

GET    /api/usage                  - Get usage statistics
GET    /api/usage/logs             - Get detailed usage logs

POST   /api/payments/create-checkout  - Create Stripe checkout
POST   /api/payments/create-order     - Create PayPal order
GET    /api/payments/history          - Payment history
```

### Webhook Endpoints
```
POST   /api/webhooks/stripe        - Stripe webhook
POST   /api/webhooks/paypal        - PayPal webhook
```

### API Proxy Endpoints
```
POST   /v1/chat/completions        - Chat completion (OpenAI-compatible)
POST   /v1/embeddings              - Embeddings (OpenAI-compatible)
GET    /v1/models                  - List available models
```

### Admin Endpoints
```
GET    /api/admin/users            - List all users
PUT    /api/admin/users/:id        - Update user
GET    /api/admin/providers        - List providers
PUT    /api/admin/providers/:id    - Update provider config
GET    /api/admin/pricing          - View pricing config
PUT    /api/admin/pricing/:id      - Update pricing
GET    /api/admin/analytics        - Platform analytics
GET    /api/admin/logs             - System logs
```