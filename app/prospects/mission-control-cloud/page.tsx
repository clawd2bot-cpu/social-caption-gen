"use client";

import { useState } from "react";

const EXAMPLES = [
  {
    id: 1,
    company: "FinEdge (Series A fintech, 28 engineers)",
    agentCount: 14,
    frameworks: ["CrewAI", "LangGraph", "Claude SDK"],
    monthlySpend: {
      before: "$47,200",
      after: "$12,800",
      saved: "$34,400/mo",
    },
    incidentsCaught: 23,
    worstIncident: "Runaway research agent burned $3,100 in 4 hours on GPT-4 calls before anyone noticed. Our alerting would have caught it at $50.",
    agents: [
      { name: "Customer Support Agent", framework: "CrewAI", dailyCost: "$18.40", calls: "2,340/day", status: "healthy" },
      { name: "Fraud Detection Agent", framework: "LangGraph", dailyCost: "$42.10", calls: "12,800/day", status: "healthy" },
      { name: "Report Generator", framework: "Claude SDK", dailyCost: "$8.20", calls: "45/day", status: "healthy" },
      { name: "Market Research Agent", framework: "CrewAI", dailyCost: "$156.80", calls: "890/day", status: "warning" },
      { name: "Compliance Checker", framework: "LangGraph", dailyCost: "$23.50", calls: "1,200/day", status: "healthy" },
    ],
    quote: "We had no idea our market research agent was costing more than our entire customer support fleet. Mission Control showed us in 5 minutes what we couldn't see in 3 months.",
  },
  {
    id: 2,
    company: "HealthStack (Seed-stage healthtech, 8 engineers)",
    agentCount: 6,
    frameworks: ["AutoGen", "Claude SDK"],
    monthlySpend: {
      before: "$8,900",
      after: "$3,200",
      saved: "$5,700/mo",
    },
    incidentsCaught: 7,
    worstIncident: "Medical note summarization agent started hallucinating drug names after a model update. Our quality monitoring flagged the regression within 30 minutes.",
    agents: [
      { name: "Note Summarizer", framework: "Claude SDK", dailyCost: "$22.30", calls: "450/day", status: "healthy" },
      { name: "Appointment Scheduler", framework: "AutoGen", dailyCost: "$4.10", calls: "180/day", status: "healthy" },
      { name: "Insurance Verifier", framework: "Claude SDK", dailyCost: "$12.60", calls: "320/day", status: "healthy" },
    ],
    quote: "HIPAA auditors asked us 'what are your AI agents doing with patient data?' Before Mission Control, we had no answer. Now we have real-time audit trails.",
  },
  {
    id: 3,
    company: "ShipFast Agency (dev agency, 45 people)",
    agentCount: 31,
    frameworks: ["CrewAI", "LangGraph", "Claude SDK", "OpenClaw"],
    monthlySpend: {
      before: "$23,400",
      after: "$9,100",
      saved: "$14,300/mo",
    },
    incidentsCaught: 41,
    worstIncident: "Client's SEO agent was making 50K API calls/day when it only needed 2K. Duplicate task detection saved the client $4,200/mo.",
    agents: [
      { name: "Code Review Bot", framework: "Claude SDK", dailyCost: "$34.20", calls: "890/day", status: "healthy" },
      { name: "SEO Content Agent", framework: "CrewAI", dailyCost: "$67.80", calls: "4,200/day", status: "warning" },
      { name: "Client Onboarding", framework: "LangGraph", dailyCost: "$12.40", calls: "35/day", status: "healthy" },
      { name: "QA Test Generator", framework: "Claude SDK", dailyCost: "$28.90", calls: "620/day", status: "healthy" },
      { name: "Deploy Monitor", framework: "OpenClaw", dailyCost: "$5.60", calls: "1,400/day", status: "healthy" },
    ],
    quote: "We manage agents for 12 clients. Without a central dashboard, we were flying blind. Mission Control is our control tower.",
  },
  {
    id: 4,
    company: "LegalAI (Pre-seed, 3 founders)",
    agentCount: 4,
    frameworks: ["Claude SDK"],
    monthlySpend: {
      before: "$6,200",
      after: "$1,800",
      saved: "$4,400/mo",
    },
    incidentsCaught: 5,
    worstIncident: "Contract review agent was sending full documents to GPT-4 when only clauses were needed. Token optimization reduced costs by 71%.",
    agents: [
      { name: "Contract Reviewer", framework: "Claude SDK", dailyCost: "$28.40", calls: "120/day", status: "healthy" },
      { name: "Legal Research", framework: "Claude SDK", dailyCost: "$19.80", calls: "85/day", status: "healthy" },
      { name: "Client Intake", framework: "Claude SDK", dailyCost: "$6.20", calls: "40/day", status: "healthy" },
      { name: "Document Drafter", framework: "Claude SDK", dailyCost: "$8.60", calls: "55/day", status: "healthy" },
    ],
    quote: "We're 3 founders burning runway. Seeing exactly where every dollar goes on AI spend changed how we architect our agents.",
  },
  {
    id: 5,
    company: "RetailOS (Series B, 120 engineers)",
    agentCount: 52,
    frameworks: ["CrewAI", "LangGraph", "AutoGen", "Claude SDK", "OpenClaw"],
    monthlySpend: {
      before: "$142,000",
      after: "$61,000",
      saved: "$81,000/mo",
    },
    incidentsCaught: 89,
    worstIncident: "Pricing optimization agent started a feedback loop with inventory agent, generating 2M API calls in 2 hours. Circuit breaker would have stopped it in 60 seconds.",
    agents: [
      { name: "Price Optimizer", framework: "LangGraph", dailyCost: "$234.00", calls: "45,000/day", status: "healthy" },
      { name: "Inventory Forecaster", framework: "CrewAI", dailyCost: "$178.00", calls: "32,000/day", status: "healthy" },
      { name: "Customer Service Fleet (x12)", framework: "Claude SDK", dailyCost: "$89.00", calls: "18,000/day", status: "healthy" },
      { name: "Content Generator", framework: "OpenClaw", dailyCost: "$56.00", calls: "8,400/day", status: "warning" },
      { name: "Fraud Detection", framework: "AutoGen", dailyCost: "$312.00", calls: "95,000/day", status: "healthy" },
    ],
    quote: "At our scale, unmonitored AI agents are a financial and compliance risk. Mission Control is as essential as Datadog is for our infrastructure.",
  },
];

const PRICING = [
  { tier: "Startup", price: "$49/mo", desc: "Up to 10 agents, 1 user, spend alerts", limit: "Email alerts, 30-day history" },
  { tier: "Growth", price: "$199/mo", desc: "Up to 50 agents, 5 users, SSO", limit: "Slack alerts, 90-day history, RBAC" },
  { tier: "Enterprise", price: "$499/mo", desc: "Unlimited agents, unlimited users", limit: "Audit logs, SLA, SOC2 compliance reports" },
];

export default function MissionControlCloud() {
  const [selected, setSelected] = useState(0);
  const ex = EXAMPLES[selected];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <a href="/prospects" className="text-gray-500 text-sm hover:text-gray-300 mb-4 inline-block">&larr; All Prospects</a>

        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-4xl font-bold">Mission Control Cloud</h1>
          <span className="bg-green-900/50 text-green-400 text-sm font-mono px-2 py-1 rounded">MVP #3</span>
        </div>
        <p className="text-xl text-gray-400 mb-8">The dashboard for your AI agent fleet — cost tracking, governance, one pane of glass</p>

        {/* Hero stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Avg monthly savings", value: "$27.9K", sub: "across 5 demo companies" },
            { label: "Incidents caught", value: "165", sub: "before they became disasters" },
            { label: "Avg cost reduction", value: "57%", sub: "on AI agent spend" },
            { label: "Setup time", value: "5 min", sub: "connect APIs → see everything" },
          ].map((s) => (
            <div key={s.label} className="border border-gray-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-400">{s.value}</div>
              <div className="text-sm text-gray-400">{s.label}</div>
              <div className="text-xs text-gray-600">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Example selector */}
        <h2 className="text-2xl font-semibold mb-4">Customer Case Studies (Real Scenarios)</h2>
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
              {e.company.split("(")[0].trim()}
            </button>
          ))}
        </div>

        {/* Selected example */}
        <div className="border border-gray-800 rounded-lg p-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{ex.company}</h3>
              <p className="text-gray-400 text-sm">{ex.frameworks.join(" + ")} &middot; {ex.agentCount} agents</p>
            </div>
          </div>

          {/* Spend comparison */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-red-900/20 border border-red-900/30 rounded p-4 text-center">
              <div className="text-xs text-red-400 mb-1">Before</div>
              <div className="text-2xl font-bold text-red-400">{ex.monthlySpend.before}</div>
              <div className="text-xs text-gray-500">/month</div>
            </div>
            <div className="bg-green-900/20 border border-green-900/30 rounded p-4 text-center">
              <div className="text-xs text-green-400 mb-1">After</div>
              <div className="text-2xl font-bold text-green-400">{ex.monthlySpend.after}</div>
              <div className="text-xs text-gray-500">/month</div>
            </div>
            <div className="bg-purple-900/20 border border-purple-900/30 rounded p-4 text-center">
              <div className="text-xs text-purple-400 mb-1">Saved</div>
              <div className="text-2xl font-bold text-purple-400">{ex.monthlySpend.saved}</div>
              <div className="text-xs text-gray-500">/month</div>
            </div>
          </div>

          {/* Agent table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left border-b border-gray-800">
                  <th className="pb-2 pr-4">Agent</th>
                  <th className="pb-2 pr-4">Framework</th>
                  <th className="pb-2 pr-4">Daily Cost</th>
                  <th className="pb-2 pr-4">API Calls</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {ex.agents.map((a, i) => (
                  <tr key={i} className="border-b border-gray-900">
                    <td className="py-2 pr-4 font-mono text-xs">{a.name}</td>
                    <td className="py-2 pr-4 text-gray-400">{a.framework}</td>
                    <td className="py-2 pr-4 font-mono">{a.dailyCost}</td>
                    <td className="py-2 pr-4 text-gray-400">{a.calls}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        a.status === "healthy" ? "bg-green-900/40 text-green-400" : "bg-yellow-900/40 text-yellow-400"
                      }`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Worst incident */}
          <div className="bg-red-900/10 border border-red-900/30 rounded p-4 mb-6">
            <div className="text-xs text-red-400 mb-1">Worst incident caught</div>
            <div className="text-sm">{ex.worstIncident}</div>
          </div>

          {/* Quote */}
          <div className="bg-gray-900/50 rounded p-4 italic text-gray-300 text-sm">
            &ldquo;{ex.quote}&rdquo;
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
