#!/usr/bin/env node
/**
 * Substack scraper — fetches a public post and extracts title, author, and body.
 *
 * Usage:
 *   node scripts/substack-scraper.js <post-url>
 *
 * Dependencies: none (uses the built-in fetch + a tiny HTML parser).
 */

const TIMEOUT_MS = 15_000;
const USER_AGENT =
  'Mozilla/5.0 (compatible; substack-scraper/1.0; +https://github.com/clawd2bot-cpu/social-caption-gen)';

async function fetchHtml(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      signal: controller.signal,
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function stripTags(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function firstMatch(html, regex) {
  const m = html.match(regex);
  return m ? m[1] : null;
}

function extractMeta(html, property) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i',
  );
  return firstMatch(html, re);
}

function extractJsonLd(html) {
  const blocks = [
    ...html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];
  for (const [, raw] of blocks) {
    try {
      const data = JSON.parse(raw.trim());
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item && (item['@type'] === 'NewsArticle' || item['@type'] === 'Article')) {
          return item;
        }
      }
    } catch {
      // ignore malformed JSON-LD blocks
    }
  }
  return null;
}

function extractBody(html) {
  const article = firstMatch(html, /<div[^>]+class=["'][^"']*available-content[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i);
  if (article) return stripTags(article);
  const fallback = firstMatch(html, /<article[^>]*>([\s\S]*?)<\/article>/i);
  return fallback ? stripTags(fallback) : '';
}

export async function scrapeSubstackPost(url) {
  const html = await fetchHtml(url);
  const jsonLd = extractJsonLd(html) ?? {};

  const title =
    jsonLd.headline ??
    extractMeta(html, 'og:title') ??
    firstMatch(html, /<title>([^<]+)<\/title>/i) ??
    '';

  const author =
    (jsonLd.author && (jsonLd.author.name ?? jsonLd.author[0]?.name)) ??
    extractMeta(html, 'author') ??
    '';

  const publishedAt = jsonLd.datePublished ?? extractMeta(html, 'article:published_time') ?? '';
  const description = extractMeta(html, 'og:description') ?? '';
  const body = extractBody(html);

  return {
    url,
    title: decodeEntities(title).trim(),
    author: decodeEntities(String(author)).trim(),
    publishedAt,
    description: decodeEntities(description).trim(),
    body,
    wordCount: body ? body.split(/\s+/).length : 0,
  };
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node scripts/substack-scraper.js <post-url>');
    process.exit(1);
  }
  const post = await scrapeSubstackPost(url);
  process.stdout.write(JSON.stringify(post, null, 2) + '\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
