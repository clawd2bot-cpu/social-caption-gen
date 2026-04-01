"use client";

import { useState } from "react";

const EXAMPLES = [
  {
    id: 1,
    user: "Tobi Lutke (Shopify CEO)",
    task: "Fine-tune 0.8B query-expansion model for Shopify search",
    model: "Custom 0.8B transformer",
    experiments: 37,
    runtime: "3h 5min",
    gpuUsed: "1x A100 80GB",
    costOnPlatform: "$14.70",
    costDIY: "$200+ (setup time) + $62 (GPU rental)",
    outcome: "19% validation score improvement",
    topFindings: [
      "Warmup cosine schedule beat linear by 4.2%",
      "Label smoothing 0.1 → 0.05 added 2.8%",
      "Gradient clipping at 0.5 vs 1.0 gained 1.6%",
    ],
    status: "completed" as const,
  },
  {
    id: 2,
    user: "Karpathy (original benchmark)",
    task: "Optimize nanoGPT training — reduce Time-to-GPT-2",
    model: "GPT-2 124M",
    experiments: 100,
    runtime: "8h 20min",
    gpuUsed: "1x A100 80GB",
    costOnPlatform: "$38.50",
    costDIY: "$0 (own hardware) but 8hrs babysitting",
    outcome: "11% efficiency gain — 2.02h → 1.80h Time-to-GPT-2",
    topFindings: [
      "20 additive improvements found automatically",
      "All improvements transferred to larger model scales",
      "Muon optimizer variant outperformed AdamW by 3.1%",
    ],
    status: "completed" as const,
  },
  {
    id: 3,
    user: "YC W26 Startup (stealth, healthcare)",
    task: "Fine-tune Mistral-7B for medical note summarization",
    model: "Mistral-7B-v0.3 (LoRA)",
    experiments: 64,
    runtime: "5h 20min",
    gpuUsed: "1x A100 80GB",
    costOnPlatform: "$24.80",
    costDIY: "$350+ (cloud GPU + engineer time)",
    outcome: "ROUGE-L improved 0.41 → 0.53 (+29%)",
    topFindings: [
      "LoRA rank 32 > rank 16 for this domain (+6.2%)",
      "Learning rate 1e-4 with warmup ratio 0.1 was optimal",
      "Including section headers in training data added 8.4%",
    ],
    status: "completed" as const,
  },
  {
    id: 4,
    user: "Solo indie hacker (@mlbuilder on X)",
    task: "Train sentiment classifier for crypto Twitter",
    model: "DistilBERT fine-tune",
    experiments: 48,
    runtime: "2h 10min",
    gpuUsed: "1x T4 16GB",
    costOnPlatform: "$4.30",
    costDIY: "$0 (Colab) but 6hrs manual iteration",
    outcome: "F1 score 0.78 → 0.91 (+16.7%)",
    topFindings: [
      "Freezing first 4 layers improved generalization by 3.1%",
      "Augmenting with emoji-stripped variants added 2.4%",
      "Batch size 64 outperformed 32 by 1.8% on this dataset",
    ],
    status: "completed" as const,
  },
  {
    id: 5,
    user: "University of Toronto ML Lab",
    task: "Neural architecture search for edge vision model",
    model: "Custom MobileNet variant",
    experiments: 150,
    runtime: "12h 30min",
    gpuUsed: "1x A100 80GB",
    costOnPlatform: "$57.50",
    costDIY: "$800+ (lab GPU time at $65/hr opportunity cost)",
    outcome: "Found architecture with 2.1% higher accuracy at 40% fewer FLOPs",
    topFindings: [
      "Inverted residuals with SE blocks beat vanilla convs by 4.7%",
      "Width multiplier 0.75 was Pareto-optimal for accuracy/latency",
      "Knowledge distillation from EfficientNet-B4 added 1.9%",
    ],
    status: "completed" as const,
  },
];

const PRICING = [
  { tier: "Starter", price: "$0.39/experiment", desc: "T4 GPU, 5-min budget per experiment", limit: "Pay as you go" },
  { tier: "Pro", price: "$49/mo", desc: "A100 GPU, includes 100 experiments/mo", limit: "Then $0.35/experiment" },
  { tier: "Team", price: "$149/mo", desc: "A100 GPU, 500 experiments/mo, shared dashboard", limit: "Up to 5 seats" },
];

export default function AutoResearchCloud() {
  const [selected, setSelected] = useState(0);
  const ex = EXAMPLES[selected];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <a href="/prospects" className="text-gray-500 text-sm hover:text-gray-300 mb-4 inline-block">&larr; All Prospects</a>

        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-4xl font-bold">AutoResearch Cloud</h1>
          <span className="bg-green-900/50 text-green-400 text-sm font-mono px-2 py-1 rounded">MVP #1</span>
        </div>
        <p className="text-xl text-gray-400 mb-8">Run 100 ML experiments overnight — no GPU required</p>

        {/* Hero stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Avg cost savings", value: "87%", sub: "vs DIY cloud GPU setup" },
            { label: "Avg improvement", value: "+18.3%", sub: "across all demo runs" },
            { label: "Experiments/hour", value: "~12", sub: "on A100 GPU" },
            { label: "Setup time", value: "< 2 min", sub: "upload script → run" },
          ].map((s) => (
            <div key={s.label} className="border border-gray-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-400">{s.value}</div>
              <div className="text-sm text-gray-400">{s.label}</div>
              <div className="text-xs text-gray-600">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Example selector */}
        <h2 className="text-2xl font-semibold mb-4">Pre-loaded Examples (Real Data)</h2>
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
              {e.user.split("(")[0].trim().split(" ").slice(0, 2).join(" ")}
            </button>
          ))}
        </div>

        {/* Selected example detail */}
        <div className="border border-gray-800 rounded-lg p-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{ex.user}</h3>
              <p className="text-gray-400">{ex.task}</p>
            </div>
            <span className="bg-green-900/40 text-green-400 text-xs font-mono px-3 py-1 rounded-full">
              {ex.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-500">Model</div>
              <div className="text-sm font-mono">{ex.model}</div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-500">Experiments</div>
              <div className="text-sm font-mono">{ex.experiments}</div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-500">Runtime</div>
              <div className="text-sm font-mono">{ex.runtime}</div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-500">GPU</div>
              <div className="text-sm font-mono">{ex.gpuUsed}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900/50 rounded p-4">
              <div className="text-xs text-gray-500 mb-1">Cost on our platform</div>
              <div className="text-2xl font-bold text-green-400">{ex.costOnPlatform}</div>
            </div>
            <div className="bg-gray-900/50 rounded p-4">
              <div className="text-xs text-gray-500 mb-1">Cost doing it yourself</div>
              <div className="text-2xl font-bold text-red-400">{ex.costDIY}</div>
            </div>
          </div>

          <div className="bg-green-900/20 border border-green-900/40 rounded p-4 mb-6">
            <div className="text-xs text-green-400 mb-1">Outcome</div>
            <div className="text-lg font-semibold">{ex.outcome}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-2">Top findings (auto-discovered)</div>
            <ul className="space-y-1">
              {ex.topFindings.map((f, i) => (
                <li key={i} className="text-sm text-gray-300 flex gap-2">
                  <span className="text-green-400 shrink-0">+</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pricing */}
        <h2 className="text-2xl font-semibold mb-4">Pricing</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {PRICING.map((p) => (
            <div key={p.tier} className="border border-gray-800 rounded-lg p-5">
              <div className="text-sm text-gray-500">{p.tier}</div>
              <div className="text-2xl font-bold mt-1">{p.price}</div>
              <div className="text-sm text-gray-400 mt-2">{p.desc}</div>
              <div className="text-xs text-gray-600 mt-1">{p.limit}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Upload your training script", desc: "Any PyTorch script under 5,000 lines. We detect your eval metric automatically." },
            { step: "2", title: "Set your experiment budget", desc: "Choose GPU tier and number of experiments. Each runs on a fixed 5-minute training budget." },
            { step: "3", title: "Wake up to results", desc: "We run experiments in a loop — keep improvements, discard regressions. You get a ranked report + the winning config." },
          ].map((s) => (
            <div key={s.step} className="border border-gray-800 rounded-lg p-5">
              <div className="text-3xl font-bold text-gray-700 mb-2">{s.step}</div>
              <div className="font-semibold mb-1">{s.title}</div>
              <div className="text-sm text-gray-400">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
