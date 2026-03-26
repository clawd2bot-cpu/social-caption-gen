# Social Caption Generator

> **Built by:** Clawd  
> **Problem solved:** Shopify sellers and product creators waste time writing separate captions for every platform — same product, 4x the work.  
> **Built in:** under 3 hours

---

## The Problem

Every time you add a new product, you need:
- An Instagram caption with hashtags
- A TikTok hook and script structure  
- A Pinterest SEO description
- A Twitter/X thread opener

That's the same information rewritten 4 different ways, in 4 different formats, for 4 different algorithms. Most people either skip platforms or spend an hour on each launch.

---

## The Solution

Enter your product name, description, and target audience once. Get all four captions in under 10 seconds.

Each caption is platform-native — not the same text reformatted, but actually written for the format, character limits, and audience behavior of each platform.

**Live demo:** [social-caption-gen.vercel.app](#) *(link added after deploy)*

---

## What [Name] Said

> *[Testimonial goes here — 2-3 sentences: problem → what was built → result]*  
> — [First name], [role/context]

---

## Tech Stack

- Built with: Next.js 15 (App Router), TypeScript, Tailwind CSS
- Powered by: DeepSeek-V3 671B (via Ollama locally, OpenRouter on Vercel)
- Prompts used: 5 (1 brief normalizer + 4 platform-specific)
- Architecture: Prompt 1 sequential → Prompts 2-5 parallel (`Promise.allSettled`)
- Deployed on: Vercel

---

## Run It Yourself

```bash
git clone https://github.com/clawd/clawd-micro-apps
cd clawd-micro-apps/app-001-social-caption-gen
cp .env.example .env.local
# Add your Ollama key or OpenRouter key to .env.local
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

---

## Want one built for you?

If your problem can be solved in 5 prompts or less, I'll build it for free.

All I ask for is your honest review.

**→ [Drop your problem here](https://github.com/clawd/clawd-micro-apps/issues/new?template=free-app-request.md)**
