"use client";

const PROSPECTS = [
  {
    slug: "autoresearch-cloud",
    name: "AutoResearch Cloud",
    tagline: "100 ML experiments overnight — no GPU required",
    grade: "A+",
    stars: "53.5k",
    license: "MIT",
    risk: "Low",
    startupCost: "$7-17K",
    breakEven: "~50 users",
  },
  {
    slug: "cli-anything-cloud",
    name: "CLI-Anything Cloud",
    tagline: "Make any software AI-agent-native in one click",
    grade: "A",
    stars: "23k",
    license: "MIT",
    risk: "Low",
    startupCost: "$5-10K",
    breakEven: "~30 teams",
  },
  {
    slug: "mission-control-cloud",
    name: "Mission Control Cloud",
    tagline: "The dashboard for your AI agent fleet",
    grade: "A",
    stars: "3.6k",
    license: "MIT",
    risk: "Medium",
    startupCost: "$8-13K",
    breakEven: "~20 teams",
  },
  {
    slug: "ccg-workflow-cloud",
    name: "CCG Workflow Cloud",
    tagline: "Claude + Codex + Gemini orchestrated in one workflow",
    grade: "A-",
    stars: "4.6k",
    license: "MIT",
    risk: "Low",
    startupCost: "$3-6K",
    breakEven: "~100 users",
  },
  {
    slug: "browser-use-platform",
    name: "Browser Use Platform",
    tagline: "AI browser automation for the rest of us",
    grade: "B+",
    stars: "78k",
    license: "MIT",
    risk: "High",
    startupCost: "$13-23K",
    breakEven: "~200 users",
  },
];

export default function ProspectsIndex() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">OSS-to-SaaS Prospects</h1>
        <p className="text-gray-400 mb-8">
          5 open-source repos with no cloud offering — ranked by opportunity.
          Click any card to see the full MVP demo with real data.
        </p>

        <div className="grid gap-4">
          {PROSPECTS.map((p, i) => (
            <a
              key={p.slug}
              href={`/prospects/${p.slug}`}
              className="block border border-gray-800 rounded-lg p-6 hover:border-gray-600 hover:bg-gray-900/50 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-gray-500 text-sm font-mono">
                      #{i + 1}
                    </span>
                    <h2 className="text-xl font-semibold">{p.name}</h2>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded ${
                        p.grade.startsWith("A")
                          ? "bg-green-900/50 text-green-400"
                          : "bg-yellow-900/50 text-yellow-400"
                      }`}
                    >
                      {p.grade}
                    </span>
                  </div>
                  <p className="text-gray-400">{p.tagline}</p>
                </div>
                <div className="text-right text-sm text-gray-500 space-y-1 shrink-0">
                  <div>
                    {p.stars} stars &middot; {p.license}
                  </div>
                  <div>
                    {p.startupCost} &middot; Break-even: {p.breakEven}
                  </div>
                  <div>
                    Competition risk:{" "}
                    <span
                      className={
                        p.risk === "Low"
                          ? "text-green-400"
                          : p.risk === "Medium"
                          ? "text-yellow-400"
                          : "text-red-400"
                      }
                    >
                      {p.risk}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
