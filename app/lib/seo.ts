// Shared SEO helpers for the public website (server side only).

export const SITE_NAME = "Likhit Yatra";

// Set NEXT_PUBLIC_SITE_URL to the real domain; the Vercel URL is only a fallback.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://license-system-frontend.vercel.app"
).replace(/\/+$/, "");

export const DEFAULT_OG_IMAGE = "/license-card.png.jpg";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:3030/api/v1";

/** Plain-text summary for meta descriptions: no tags, collapsed spaces, cut at a word. */
export function toDescription(html: string, max = 160): string {
  const text = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;|&gt;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 40))}…`;
}

/** JSON for a <script type="application/ld+json"> tag; "<" is escaped so content cannot close the tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\u003c");
}
