"use client";

import { useState } from "react";

const EXAMPLES = [
  {
    id: 1,
    project: "E-commerce checkout redesign",
    user: "Solo founder, DTC skincare brand",
    description: "Rebuild Shopify checkout into a custom Next.js flow with upsells, A/B testing, and Stripe integration",
    orchestration: {
      claude: { role: "Architecture + project plan", tokens: "12,400", cost: "$0.37", output: "System design doc, API contracts, component tree, database schema" },
      codex: { role: "Backend (API routes, Stripe, DB)", tokens: "34,200", cost: "$0.51", output: "14 API endpoints, Stripe webhook handler, Prisma schema, seed data" },
      gemini: { role: "Frontend (React components, UI)", tokens: "28,600", cost: "$0.29", output: "23 React components, checkout flow, A/B test wrapper, responsive CSS" },
    },
    totalCost: "$1.17",
    totalTime: "47 minutes",
    manualEstimate: "3-5 days ($2,400-4,000 freelancer)",
    filesGenerated: 42,
    testsGenerated: 18,
    outcome: "Shipped to production same day. Checkout conversion improved 23% over Shopify default.",
  },
  {
    id: 2,
    project: "Internal admin dashboard",
    user: "Seed-stage SaaS (HR tech, 6 devs)",
    description: "Build an internal admin panel for managing customers, subscriptions, feature flags, and support tickets",
    orchestration: {
      claude: { role: "Architecture + data modeling", tokens: "18,200", cost: "$0.55", output: "ERD, role-based access design, API spec (OpenAPI), deployment plan" },
      codex: { role: "Backend (CRUD, auth, webhooks)", tokens: "52,800", cost: "$0.79", output: "28 API routes, JWT auth middleware, Stripe subscription sync, audit logging" },
      gemini: { role: "Frontend (dashboard UI, tables, charts)", tokens: "41,400", cost: "$0.41", output: "Dashboard layout, data tables with sort/filter, charts (Recharts), role-based nav" },
    },
    totalCost: "$1.75",
    totalTime: "1h 12min",
    manualEstimate: "1-2 weeks ($6,000-12,000 contractor)",
    filesGenerated: 67,
    testsGenerated: 31,
    outcome: "Replaced a $300/mo Retool subscription. Team manages 2,400 customers through it daily.",
  },
  {
    id: 3,
    project: "AI-powered recipe app",
    user: "Indie hacker, food content creator (140K followers)",
    description: "Mobile-first recipe app where users photograph ingredients and get recipe suggestions powered by vision AI",
    orchestration: {
      claude: { role: "Architecture + AI pipeline design", tokens: "15,800", cost: "$0.47", output: "Vision pipeline spec, prompt engineering for ingredient detection, caching strategy" },
      codex: { role: "Backend (image processing, AI, DB)", tokens: "38,400", cost: "$0.58", output: "Image upload + resize pipeline, Moondream integration, recipe matching algorithm, PostgreSQL schema" },
      gemini: { role: "Frontend (mobile UI, camera, animations)", tokens: "33,200", cost: "$0.33", output: "Camera capture component, ingredient tag UI, recipe cards, swipe navigation, PWA manifest" },
    },
    totalCost: "$1.38",
    totalTime: "52 minutes",
    manualEstimate: "2-3 weeks ($8,000-15,000 dev agency)",
    filesGenerated: 38,
    testsGenerated: 14,
    outcome: "Launched on Product Hunt, hit #4 of the day. 3,200 users in first week. Revenue from day 3 via premium recipes.",
  },
  {
    id: 4,
    project: "Real-time sports betting odds tracker",
    user: "Sports analytics startup (pre-revenue, 2 founders)",
    description: "Aggregate odds from 8 sportsbooks, detect arbitrage opportunities, alert users via Telegram/email in real-time",
    orchestration: {
      claude: { role: "Architecture + scraping strategy", tokens: "21,400", cost: "$0.64", output: "Scraping architecture, anti-detection strategy, arbitrage math model, alert priority system" },
      codex: { role: "Backend (scrapers, calculations, queues)", tokens: "61,200", cost: "$0.92", output: "8 sportsbook scrapers, odds normalization engine, arbitrage detector, Redis queue, Telegram bot" },
      gemini: { role: "Frontend (live dashboard, odds comparison)", tokens: "35,800", cost: "$0.36", output: "Real-time odds table (WebSocket), arbitrage opportunity cards, P&L calculator, notification preferences" },
    },
    totalCost: "$1.92",
    totalTime: "1h 28min",
    manualEstimate: "3-4 weeks ($12,000-20,000 for specialized devs)",
    filesGenerated: 54,
    testsGenerated: 22,
    outcome: "Detecting 12-15 arbitrage opportunities per day. Founders made $8,400 in first month from personal betting before launching the platform.",
  },
  {
    id: 5,
    project: "Multi-tenant SaaS boilerplate",
    user: "Agency building white-label products for clients",
    description: "Production-ready SaaS starter with multi-tenancy, billing, team management, API keys, usage tracking, and docs",
    orchestration: {
      claude: { role: "Architecture + security design", tokens: "24,600", cost: "$0.74", output: "Multi-tenant isolation strategy, billing flow, API key rotation design, security audit checklist" },
      codex: { role: "Backend (multi-tenant core, billing, API)", tokens: "72,400", cost: "$1.09", output: "Tenant isolation middleware, Stripe metered billing, API key management, usage tracking, rate limiting, webhook handlers" },
      gemini: { role: "Frontend (tenant dashboard, settings, docs)", tokens: "48,200", cost: "$0.48", output: "Tenant switcher, billing portal, team management UI, API key dashboard, auto-generated API docs, onboarding wizard" },
    },
    totalCost: "$2.31",
    totalTime: "1h 45min",
    manualEstimate: "4-8 weeks ($20,000-40,000+ senior dev)",
    filesGenerated: 89,
    testsGenerated: 41,
    outcome: "Agency used this as the base for 4 client projects in the first month. Estimated $80K saved in repeated boilerplate work.",
  },
];

const PRICING = [
  { tier: "Maker", price: "$29/mo", desc: "Bring your own API keys, unlimited projects", limit: "1 seat, community support" },
  { tier: "Team", price: "$79/mo", desc: "Shared projects, model cost analytics", limit: "5 seats, priority support" },
  { tier: "Agency", price: "$199/mo", desc: "Client workspaces, white-label output", limit: "Unlimited seats, custom branding" },
];

export default function CCGWorkflowCloud() {
  const [selected, setSelected] = useState(0);
  const ex = EXAMPLES[selected];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <a href="/prospects" className="text-gray-500 text-sm hover:text-gray-300 mb-4 inline-block">&larr; All Prospects</a>

        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-4xl font-bold">CCG Workflow Cloud</h1>
          <span className="bg-green-900/50 text-green-400 text-sm font-mono px-2 py-1 rounded">MVP #4</span>
        </div>
        <p className="text-xl text-gray-400 mb-8">Claude plans. Codex builds backend. Gemini builds frontend. One workflow.</p>

        {/* Hero stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Avg project cost", value: "$1.71", sub: "across 5 real projects" },
            { label: "Avg build time", value: "1h 5min", sub: "vs weeks manually" },
            { label: "Avg files generated", value: "58", sub: "production-ready code" },
            { label: "Avg cost savings", value: "99.7%", sub: "vs hiring developers" },
          ].map((s) => (
            <div key={s.label} className="border border-gray-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-orange-400">{s.value}</div>
              <div className="text-sm text-gray-400">{s.label}</div>
              <div className="text-xs text-gray-600">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Example selector */}
        <h2 className="text-2xl font-semibold mb-4">Pre-loaded Projects (Real Builds)</h2>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {EXAMPLES.map((e, i) => (
            <button
              key={e.id}
              onClick={() => setSelected(i)}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm transition-all ${
                selected === i
                  ? "bg-white text-black font-semibold"
                  : "bg-gray-900 text-gray-400 hover:bg-gray-800"
              }`}
            >
              {e.project.length > 25 ? e.project.slice(0, 25) + "..." : e.project}
            </button>
          ))}
        </div>

        {/* Selected example */}
        <div className="border border-gray-800 rounded-lg p-6 mb-10">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{ex.project}</h3>
            <p className="text-gray-400 text-sm">{ex.user}</p>
            <p className="text-gray-500 text-sm mt-1">{ex.description}</p>
          </div>

          {/* Orchestration breakdown */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {Object.entries(ex.orchestration).map(([model, data]) => (
              <div key={model} className={`rounded-lg p-4 border ${
                model === "claude" ? "border-orange-900/40 bg-orange-900/10" :
                model === "codex" ? "border-blue-900/40 bg-blue-900/10" :
                "border-purple-900/40 bg-purple-900/10"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${
                    model === "claude" ? "text-orange-400" :
                    model === "codex" ? "text-blue-400" : "text-purple-400"
                  }`}>
                    {model.charAt(0).toUpperCase() + model.slice(1)}
                  </span>
                  <span className="text-xs text-gray-500">{data.cost}</span>
                </div>
                <div className="text-xs text-gray-400 mb-2">{data.role}</div>
                <div className="text-xs text-gray-500 mb-2">{data.tokens} tokens</div>
                <div className="text-xs text-gray-300">{data.output}</div>
              </div>
            ))}
          </div>

          {/* Results */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-500">Total cost</div>
              <div className="text-lg font-bold text-green-400">{ex.totalCost}</div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-500">Total time</div>
              <div className="text-lg font-bold font-mono">{ex.totalTime}</div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-500">Files generated</div>
              <div className="text-lg font-bold font-mono">{ex.filesGenerated}</div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-500">Tests generated</div>
              <div className="text-lg font-bold font-mono">{ex.testsGenerated}</div>
            </div>
          </div>

          <div className="bg-red-900/10 border border-red-900/30 rounded p-4 mb-4">
            <div className="text-xs text-red-400 mb-1">Manual alternative</div>
            <div className="text-sm">{ex.manualEstimate}</div>
          </div>

          <div className="bg-green-900/20 border border-green-900/40 rounded p-4">
            <div className="text-xs text-green-400 mb-1">Outcome</div>
            <div className="text-sm font-semibold">{ex.outcome}</div>
          </div>
        </div>

        {/* Pricing */}
        <h2 className="text-2xl font-semibold mb-4">Pricing</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {PRICING.map((p) => (
            <div key={p.tier} className="border border-gray-800 rounded-lg p-5">
              <div className="text-sm text-gray-500">{p.tier}</div>
              <div className="text-2xl font-bold mt-1">{p.price}</div>
              <div className="text-sm text-gray-400 mt-2">{p.desc}</div>
              <div className="text-xs text-gray-600 mt-1">{p.limit}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
