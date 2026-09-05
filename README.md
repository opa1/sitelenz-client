# SiteLenz Client 🔍⚡

**SiteLenz Client** is a web application for AI-powered website analysis and technical auditing. Built with Next.js 16, React 19, and Tailwind CSS v4, it leverages the **x402 Micropayment Protocol** on the **Algorand Blockchain** to enable seamless, pay-per-use website intelligence without recurring subscriptions.

---

## 💡 Features

- 💳 **Pay-Per-Use via Algorand (x402 Protocol)**: Transparent on-chain micro-payments using `@x402/avm` with instant settlement over HTTP `402 Payment Required`.
- 👛 **Web3 Wallet Support**: Native integration with Pera, Defly, and Algorand wallets via `@txnlab/use-wallet-react`. Supports seamless switching between **Testnet** and **Mainnet**.
- 📊 **Multi-Tier Website Audits**:
  - **Standard Tier**: Core audits covering SEO, Security, Performance, UX, Tech Stack, and Business details.
  - **Deep Tier**: Extended analysis with AI-powered interpretations, business model detection, full page screenshot captures, and advanced Lighthouse scoring.
- 🔬 **Comprehensive Report Dashboard**:
  - **Overview**: AI executive summary, strengths, weaknesses, and actionable recommendations.
  - **Technology**: Detected web technologies, frameworks, and tools with confidence scores and evidence.
  - **SEO**: Meta tags, heading hierarchy, OpenGraph, Twitter Cards, canonical tags, and Lighthouse SEO metrics.
  - **Security**: HTTPS check, SSL status, and full Security Headers evaluation (CSP, HSTS, X-Frame-Options, Referrer-Policy, etc.).
  - **Performance**: TTFB, FCP, LCP, CLS, Speed Index, page weight breakdowns by asset type, and caching headers.
  - **Business Intelligence**: Contact details, social links, primary CTAs, and business model classification (SaaS, E-commerce, Marketplace).
  - **UX & Accessibility**: Form breakdown, navigation structure, mobile viewport configuration, and accessibility scores.
  - **Screenshots**: Desktop and mobile preview captures.
  - **Developer Tools**: Raw JSON viewer with single-click copy functionality.
- 📜 **Local Analysis History**: Automatically caches completed reports in browser `localStorage` for instant re-visits without re-paying or re-fetching.
- 🔄 **Real-Time Polling & Retries**: Live progress tracking across analysis pipeline stages with automatic timeout handling and single-click failure retry.
- 🎨 **Modern Dark/Light UI**: Built with Tailwind CSS v4, `next-themes`, and clean micro-interactions.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [`next-themes`](https://github.com/pacocoursey/next-themes), [Lucide Icons](https://lucide.dev/), [Tabler Icons](https://tabler.io/icons)
- **Blockchain & Micropayments**:
  - Algorand SDK (`algosdk`, `@algorandfoundation/algokit-utils`)
  - Wallet Provider (`@txnlab/use-wallet-react`, Pera, Defly)
  - x402 Protocol (`@x402/avm`, `@x402/fetch`, `@x402/core`)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.17+ or v20+ recommended
- **Package Manager**: `npm`, `pnpm`, `yarn`, or `bun`
- **Algorand Wallet**: Pera Wallet or Defly Wallet installed on your browser or mobile device (with testnet ALGO / ASAs for Testnet testing).

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/opa1/sitelenz.git
   cd sitelenz-example
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` or `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SITELENZ_API_URL=https://api.sitelenz.online
   NEXT_PUBLIC_DEFAULT_NETWORK=testnet
   NEXT_PUBLIC_DOCS_URL=https://api.sitelenz.online/docs
   NEXT_PUBLIC_GITHUB_URL=https://github.com/opa1/sitelenz
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open the Application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
.
├── app/                  # Next.js App Router pages & layout
│   ├── globals.css       # Tailwind CSS styles & design tokens
│   ├── layout.tsx        # Main app shell & providers
│   └── page.tsx          # Main entry route (wallet connection gate)
├── components/           # UI components
│   ├── analyze/          # Analysis form, status banner & payment modal
│   ├── layout/           # App layout, header, sidebar & network switcher
│   ├── providers/        # Wallet & theme providers
│   ├── report/           # Report view & section tabs (SEO, Tech, Security, etc.)
│   └── states/           # Wallet disconnected & loading fallback states
├── lib/                  # Core utility functions & API clients
│   ├── api.ts            # SiteLenz API HTTP client & polling utilities
│   ├── env.ts            # Environment variable validation & URL builders
│   ├── history.ts        # LocalStorage history persistence handlers
│   ├── types.ts          # TypeScript interfaces for API & reports
│   └── x402/             # Algorand x402 payment client integration
├── store/                # Zustand global state store (analysisStore)
├── public/               # Static assets & icons
├── .env                  # Default environment configuration
├── package.json          # Project dependencies & scripts
└── tsconfig.json         # TypeScript configuration
```

---

## 🌐 API & Protocol Integration

SiteLenz Client interacts with the **SiteLenz Backend API** via standard REST endpoints and x402 headers:

1. **Submit Analysis (`POST /v1/analyses`)**: Responds with a `402 Payment Required` challenge containing Algorand payment specifications.
2. **x402 Interceptor**: `@x402/avm` prompts the connected Algorand wallet to sign the payment transaction group, attaching `PAYMENT-SIGNATURE` headers to the retry request.
3. **Status Polling (`GET /v1/analyses/{id}`)**: Polls the job status (`queued` -> `running` -> `completed`).
4. **Fetch Report (`GET /v1/analyses/{id}/report`)**: Retrieves the complete structured audit JSON once completed.

---

## 📄 License

This project is licensed under the MIT License.
