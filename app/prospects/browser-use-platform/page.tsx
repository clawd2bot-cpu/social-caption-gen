"use client";

import { useState } from "react";

const EXAMPLES = [
  {
    id: 1,
    taskName: "Competitor price monitoring",
    user: "DTC supplement brand ($2.4M ARR)",
    description: "Monitor 12 competitor products across Amazon, iHerb, and Walmart.com — check prices every 6 hours, alert on changes > 5%",
    steps: [
      "Navigate to Amazon product page for each competitor SKU",
      "Extract current price, deal price, Subscribe & Save price",
      "Navigate to iHerb equivalent listing, extract price + promo codes",
      "Navigate to Walmart.com, extract price + shipping threshold",
      "Compare against previous scan, flag changes > 5%",
      "Send Slack alert with price comparison table",
    ],
    frequency: "Every 6 hours",
    runsCompleted: 1240,
    successRate: "97.3%",
    avgRunTime: "4min 12s",
    costPerRun: "$0.08",
    monthlyCost: "$9.60",
    previousSolution: "$299/mo Prisync subscription + manual checks",
    moneySaved: "$289/mo + caught 3 competitor price drops the old tool missed",
    outcome: "Adjusted pricing on 4 SKUs within hours of competitor changes. Estimated $18K additional revenue from competitive pricing in Q1.",
  },
  {
    id: 2,
    taskName: "LinkedIn lead scraping + enrichment",
    user: "B2B sales agency (8 SDRs)",
    description: "Search LinkedIn for VP/Director of Engineering at Series A-C startups, extract profiles, enrich with company data from Crunchbase",
    steps: [
      "Search LinkedIn Sales Navigator for 'VP Engineering' at companies with 50-500 employees",
      "Extract name, title, company, location from first 25 results",
      "Navigate to each company's Crunchbase page",
      "Extract funding stage, total raised, last round date, investor names",
      "Cross-reference with company website to find direct email pattern",
      "Output enriched CSV: name, title, company, funding, email, LinkedIn URL",
    ],
    frequency: "Daily (weekdays)",
    runsCompleted: 88,
    successRate: "94.1%",
    avgRunTime: "18min 45s",
    costPerRun: "$0.42",
    monthlyCost: "$8.82",
    previousSolution: "$2,400/mo for Apollo.io (8 seats) + $99/mo LinkedIn Sales Nav",
    moneySaved: "$2,490/mo — replaced both tools entirely",
    outcome: "Generating 500+ enriched leads/month. SDR team's booked meeting rate improved 34% because leads are more targeted.",
  },
  {
    id: 3,
    taskName: "Government contract monitoring",
    user: "Defense contractor (small business, 40 employees)",
    description: "Monitor SAM.gov, GovWin, and agency-specific procurement sites for new RFPs matching their NAICS codes",
    steps: [
      "Navigate to SAM.gov contract opportunities search",
      "Filter by NAICS codes 541511, 541512, 541519 (IT services)",
      "Filter by posting date (last 24 hours) and set-aside type (small business)",
      "Extract opportunity title, agency, deadline, estimated value, point of contact",
      "Navigate to GovWin for supplemental intel on each opportunity",
      "Generate summary email with opportunity scores ranked by fit",
    ],
    frequency: "Daily at 7am ET",
    runsCompleted: 156,
    successRate: "98.7%",
    avgRunTime: "8min 30s",
    costPerRun: "$0.18",
    monthlyCost: "$5.40",
    previousSolution: "$450/mo GovWin subscription + 2 hours/day manual searching by BD manager",
    moneySaved: "$450/mo + 40 hours/month of BD manager time ($3,200 value)",
    outcome: "Found and won a $1.2M contract that the BD manager would have missed. ROI on the tool: ~22,000x in first 6 months.",
  },
  {
    id: 4,
    taskName: "Real estate listing aggregation",
    user: "Real estate investor (residential multifamily, Midwest)",
    description: "Scan Zillow, Redfin, Realtor.com, and LoopNet for new multifamily listings matching criteria, calculate cap rates, alert on deals",
    steps: [
      "Search Zillow for multifamily properties in target ZIP codes, 4-20 units, listed in last 24h",
      "Extract address, price, units, sq ft, year built, listing agent",
      "Navigate to county tax assessor to pull property tax records",
      "Search Rentometer for area rent comps by unit type",
      "Calculate estimated NOI and cap rate using actual tax + insurance + rent data",
      "Flag properties with cap rate > 8% and send alert with full analysis",
    ],
    frequency: "Every 4 hours",
    runsCompleted: 720,
    successRate: "93.8%",
    avgRunTime: "12min 15s",
    costPerRun: "$0.28",
    monthlyCost: "$50.40",
    previousSolution: "$175/mo PropStream + $99/mo Rentometer + 3hrs/day manual analysis",
    moneySaved: "$224/mo + 90 hours/month of analysis time",
    outcome: "Closed on a 12-unit building found within 2 hours of listing. Beat 4 other offers because of speed. Projected 11.2% cap rate.",
  },
  {
    id: 5,
    taskName: "Academic paper monitoring + summarization",
    user: "AI research lab at a pharmaceutical company",
    description: "Monitor arXiv, bioRxiv, PubMed for new papers matching drug discovery + ML keywords, generate executive summaries for leadership",
    steps: [
      "Search arXiv cs.LG and cs.AI for papers posted in last 24h matching keywords: protein folding, drug discovery, molecular generation",
      "Search bioRxiv for bioinformatics papers with ML methods",
      "Search PubMed for clinical trial results using AI-assisted design",
      "Extract title, authors, abstract, key figures for each paper",
      "Navigate to each paper's PDF, extract methodology and results sections",
      "Generate 3-sentence executive summary + relevance score (1-10) for each paper",
    ],
    frequency: "Daily at 6am ET",
    runsCompleted: 198,
    successRate: "96.5%",
    avgRunTime: "22min 30s",
    costPerRun: "$0.52",
    monthlyCost: "$15.60",
    previousSolution: "2 PhD research assistants spending 5hrs/week each ($4,800/mo total)",
    moneySaved: "$4,784/mo — research assistants now focus on actual research",
    outcome: "Caught a relevant paper from a Chinese university 3 days before competitors noticed it. Led to a patent filing that is now pending.",
  },
];

const PRICING = [
  { tier: "Starter", price: "$29/mo", desc: "5 automated tasks, 100 runs/mo", limit: "Email alerts, 1 seat" },
  { tier: "Pro", price: "$79/mo", desc: "25 tasks, 1,000 runs/mo, proxy rotation", limit: "Slack + webhook alerts, 5 seats" },
  { tier: "Business", price: "$199/mo", desc: "Unlimited tasks, 5,000 runs/mo, stealth mode", limit: "API access, custom integrations, 20 seats" },
];

export default function BrowserUsePlatform() {
  const [selected, setSelected] = useState(0);
  const ex = EXAMPLES[selected];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <a href="/prospects" className="text-gray-500 text-sm hover:text-gray-300 mb-4 inline-block">&larr; All Prospects</a>

        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-4xl font-bold">Browser Use Platform</h1>
          <span className="bg-yellow-900/50 text-yellow-400 text-sm font-mono px-2 py-1 rounded">MVP #5</span>
        </div>
        <p className="text-xl text-gray-400 mb-8">Describe any web task in English. AI does it. Schedule it to repeat.</p>

        {/* Hero stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Avg monthly savings", value: "$1,847", sub: "per customer across demos" },
            { label: "Avg success rate", value: "96.1%", sub: "across 2,402 total runs" },
            { label: "Avg cost per run", value: "$0.30", sub: "vs $200/mo ChatGPT Operator" },
            { label: "Setup time", value: "< 5 min", sub: "describe task → schedule → done" },
          ].map((s) => (
            <div key={s.label} className="border border-gray-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-cyan-400">{s.value}</div>
              <div className="text-sm text-gray-400">{s.label}</div>
              <div className="text-xs text-gray-600">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Example selector */}
        <h2 className="text-2xl font-semibold mb-4">Pre-loaded Automations (Real Use Cases)</h2>
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
              {e.taskName.length > 20 ? e.taskName.slice(0, 20) + "..." : e.taskName}
            </button>
          ))}
        </div>

        {/* Selected example */}
        <div className="border border-gray-800 rounded-lg p-6 mb-10">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{ex.taskName}</h3>
            <p className="text-gray-400 text-sm">{ex.user}</p>
            <p className="text-gray-500 text-sm mt-1">{ex.description}</p>
          </div>

          {/* Steps the AI executes */}
          <div className="bg-gray-950 rounded-lg p-4 mb-6">
            <div className="text-xs text-gray-500 mb-2">Steps the AI executes automatically:</div>
            {ex.steps.map((step, i) => (
              <div key={i} className="flex gap-3 mb-2 text-sm">
                <span className="text-cyan-400 shrink-0 font-mono text-xs mt-0.5">{i + 1}.</span>
                <span className="text-gray-300">{step}</span>
              </div>
            ))}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-500">Frequency</div>
              <div className="text-sm font-mono">{ex.frequency}</div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-500">Runs completed</div>
              <div className="text-sm font-mono">{ex.runsCompleted.toLocaleString()}</div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-500">Success rate</div>
              <div className="text-sm font-mono">{ex.successRate}</div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-500">Avg run time</div>
              <div className="text-sm font-mono">{ex.avgRunTime}</div>
            </div>
          </div>

          {/* Cost comparison */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-900/20 border border-green-900/30 rounded p-4">
              <div className="text-xs text-green-400 mb-1">Our platform</div>
              <div className="text-2xl font-bold text-green-400">{ex.monthlyCost}</div>
              <div className="text-xs text-gray-500">{ex.costPerRun}/run</div>
            </div>
            <div className="bg-red-900/20 border border-red-900/30 rounded p-4">
              <div className="text-xs text-red-400 mb-1">Previous solution</div>
              <div className="text-sm text-red-400 font-semibold">{ex.previousSolution}</div>
            </div>
          </div>

          <div className="bg-purple-900/20 border border-purple-900/40 rounded p-4 mb-4">
            <div className="text-xs text-purple-400 mb-1">Money saved</div>
            <div className="text-sm font-semibold">{ex.moneySaved}</div>
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
