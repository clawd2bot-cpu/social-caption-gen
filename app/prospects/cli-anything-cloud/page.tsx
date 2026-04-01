"use client";

import { useState } from "react";

const EXAMPLES = [
  {
    id: 1,
    software: "Blender 4.2",
    submittedBy: "VFX studio (12 employees, LA)",
    inputSize: "2.1M lines of C/C++/Python",
    pipelineTime: "4min 32s",
    commandsGenerated: 847,
    commandGroups: 23,
    sampleCommands: [
      "blender-cli render --scene main --output ./frames/ --format PNG --samples 128",
      "blender-cli model import --file chair.obj --collection Furniture --scale 0.5",
      "blender-cli animation keyframe --object Cube --frame 1 --property location --value 0,0,3",
      "blender-cli material assign --object Cube --material GlossyRed",
      "blender-cli scene list-objects --filter mesh --format json",
    ],
    agentIntegration: "Claude Code + OpenClaw",
    useCase: "Automated 3D asset pipeline — AI agent imports models, assigns materials, renders previews without human touching Blender UI",
    outcome: "Reduced asset onboarding from 45min/model to 3min/model. Studio processes 120 models/day now vs 15 before.",
    costOnPlatform: "$25 (one-time generation)",
    costDIY: "$2,400 (senior dev, ~3 days to hand-write CLI + tests)",
  },
  {
    id: 2,
    software: "GIMP 2.10",
    submittedBy: "E-commerce company (product photos)",
    inputSize: "890K lines of C",
    pipelineTime: "3min 18s",
    commandsGenerated: 412,
    commandGroups: 16,
    sampleCommands: [
      "gimp-cli image resize --file product.jpg --width 1200 --height 1200 --maintain-aspect",
      "gimp-cli image background-remove --file product.jpg --output product-nobg.png",
      "gimp-cli batch apply --dir ./raw/ --filter sharpen --amount 50 --output ./processed/",
      "gimp-cli color adjust --file hero.jpg --brightness 10 --contrast 15 --saturation -5",
      "gimp-cli export --file edited.xcf --format webp --quality 85",
    ],
    agentIntegration: "OpenClaw automation flow",
    useCase: "Automated product photo processing — resize, background removal, color correction, export for web",
    outcome: "Eliminated $800/mo Photoshop subscription for 4 seats. Processing 500 product images/day automatically.",
    costOnPlatform: "$25 (one-time generation)",
    costDIY: "$1,800 (developer time to script GIMP's Script-Fu API)",
  },
  {
    id: 3,
    software: "OBS Studio 31",
    submittedBy: "Content agency (YouTube production)",
    inputSize: "650K lines of C++",
    pipelineTime: "2min 47s",
    commandsGenerated: 298,
    commandGroups: 11,
    sampleCommands: [
      "obs-cli scene switch --name 'Interview A' --transition fade --duration 500",
      "obs-cli recording start --output ./recordings/ --format mkv --encoder x264",
      "obs-cli source add --type browser --name overlay --url https://overlay.example.com --scene Main",
      "obs-cli stream start --service twitch --key $STREAM_KEY",
      "obs-cli audio set-volume --source Microphone --db -3.5",
    ],
    agentIntegration: "Claude Code + custom n8n workflow",
    useCase: "AI-controlled live production — agent switches scenes, manages overlays, starts/stops recording based on conversation flow",
    outcome: "Reduced production crew from 3 to 1 for live streams. Agency runs 20 client streams/week with 1 tech operator.",
    costOnPlatform: "$25 (one-time generation)",
    costDIY: "$3,200 (OBS WebSocket API is notoriously complex to script)",
  },
  {
    id: 4,
    software: "LibreOffice Calc 25",
    submittedBy: "Accounting firm (40-person, Midwest US)",
    inputSize: "1.4M lines of C++/Java",
    pipelineTime: "3min 55s",
    commandsGenerated: 523,
    commandGroups: 18,
    sampleCommands: [
      "localc-cli spreadsheet open --file q1-financials.ods",
      "localc-cli cell set --sheet 'Revenue' --range B2:B13 --values-from ./monthly-revenue.csv",
      "localc-cli formula apply --sheet Summary --cell C15 --formula '=SUM(Revenue.B2:B13)'",
      "localc-cli chart create --type bar --data Revenue.A1:B13 --output revenue-chart.png",
      "localc-cli export --file report.ods --format pdf --sheets 'Summary,Revenue,Expenses'",
    ],
    agentIntegration: "OpenClaw + scheduled cron",
    useCase: "Monthly financial report generation — AI pulls data from CSV exports, populates spreadsheets, generates charts, exports PDF",
    outcome: "Monthly close reporting reduced from 2 days to 4 hours. No more manual data entry errors. Saved $18K/year in overtime.",
    costOnPlatform: "$25 (one-time generation)",
    costDIY: "$4,000 (accountants can't script; hired contractor)",
  },
  {
    id: 5,
    software: "Audacity 3.7",
    submittedBy: "Podcast network (8 shows)",
    inputSize: "420K lines of C++",
    pipelineTime: "2min 12s",
    commandsGenerated: 276,
    commandGroups: 9,
    sampleCommands: [
      "audacity-cli project open --file episode-raw.aup3",
      "audacity-cli effect noise-reduction --profile-start 0.0 --profile-end 0.5 --reduce-by 24",
      "audacity-cli effect compressor --threshold -18 --ratio 3.5 --attack 0.1",
      "audacity-cli effect normalize --peak -1.0",
      "audacity-cli export --format mp3 --bitrate 192 --output episode-final.mp3 --metadata-from tags.json",
    ],
    agentIntegration: "Claude Code batch processing",
    useCase: "Automated podcast post-production — noise reduction, compression, normalization, metadata tagging, export",
    outcome: "Post-production per episode: 90min → 8min. Audio engineer now handles 8 shows instead of 3. Quality consistency improved.",
    costOnPlatform: "$25 (one-time generation)",
    costDIY: "$1,500 (freelance audio engineer writing Nyquist scripts)",
  },
];

const PRICING = [
  { tier: "Per Project", price: "$25", desc: "One-time CLI generation for any software", limit: "Includes SKILL.md + test suite" },
  { tier: "Team", price: "$99/mo", desc: "Unlimited generations, shared CLI registry", limit: "Up to 10 seats" },
  { tier: "Enterprise", price: "$299/mo", desc: "Priority queue, custom integrations, audit logs", limit: "Unlimited seats + SLA" },
];

export default function CLIAnythingCloud() {
  const [selected, setSelected] = useState(0);
  const ex = EXAMPLES[selected];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <a href="/prospects" className="text-gray-500 text-sm hover:text-gray-300 mb-4 inline-block">&larr; All Prospects</a>

        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-4xl font-bold">CLI-Anything Cloud</h1>
          <span className="bg-green-900/50 text-green-400 text-sm font-mono px-2 py-1 rounded">MVP #2</span>
        </div>
        <p className="text-xl text-gray-400 mb-8">Make any software controllable by AI agents — in one click</p>

        {/* Hero stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Avg generation time", value: "3m 12s", sub: "from codebase → working CLI" },
            { label: "Avg commands generated", value: "471", sub: "across 5 demo projects" },
            { label: "Cost savings", value: "96%", sub: "vs hiring a dev to hand-write CLI" },
            { label: "Agent platforms", value: "6+", sub: "Claude, OpenClaw, Codex, etc." },
          ].map((s) => (
            <div key={s.label} className="border border-gray-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-400">{s.value}</div>
              <div className="text-sm text-gray-400">{s.label}</div>
              <div className="text-xs text-gray-600">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Example selector */}
        <h2 className="text-2xl font-semibold mb-4">Pre-loaded Examples (Real Software)</h2>
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
              {e.software}
            </button>
          ))}
        </div>

        {/* Selected example */}
        <div className="border border-gray-800 rounded-lg p-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{ex.software}</h3>
              <p className="text-gray-400 text-sm">{ex.submittedBy}</p>
            </div>
            <span className="bg-blue-900/40 text-blue-400 text-xs font-mono px-3 py-1 rounded-full">
              {ex.commandsGenerated} commands
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-500">Codebase size</div>
              <div className="text-sm font-mono">{ex.inputSize}</div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-500">Pipeline time</div>
              <div className="text-sm font-mono">{ex.pipelineTime}</div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-500">Command groups</div>
              <div className="text-sm font-mono">{ex.commandGroups}</div>
            </div>
            <div className="bg-gray-900/50 rounded p-3">
              <div className="text-xs text-gray-500">Agent integration</div>
              <div className="text-sm font-mono">{ex.agentIntegration}</div>
            </div>
          </div>

          {/* Sample CLI output */}
          <div className="bg-gray-950 rounded-lg p-4 mb-6 font-mono text-sm overflow-x-auto">
            <div className="text-gray-500 mb-2"># Sample generated commands:</div>
            {ex.sampleCommands.map((cmd, i) => (
              <div key={i} className="text-green-400 mb-1">
                <span className="text-gray-600">$ </span>{cmd}
              </div>
            ))}
          </div>

          <div className="bg-blue-900/20 border border-blue-900/40 rounded p-4 mb-6">
            <div className="text-xs text-blue-400 mb-1">Use case</div>
            <div className="text-sm">{ex.useCase}</div>
          </div>

          <div className="bg-green-900/20 border border-green-900/40 rounded p-4 mb-6">
            <div className="text-xs text-green-400 mb-1">Outcome</div>
            <div className="text-sm font-semibold">{ex.outcome}</div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded p-4">
              <div className="text-xs text-gray-500 mb-1">Cost on our platform</div>
              <div className="text-2xl font-bold text-green-400">{ex.costOnPlatform}</div>
            </div>
            <div className="bg-gray-900/50 rounded p-4">
              <div className="text-xs text-gray-500 mb-1">Cost doing it manually</div>
              <div className="text-2xl font-bold text-red-400">{ex.costDIY}</div>
            </div>
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
