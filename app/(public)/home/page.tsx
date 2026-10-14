import type { Metadata } from "next";
import Home from "@/app/components/LandingPage/Home";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, jsonLd } from "@/app/lib/seo";

// Title and description come from the root layout (translated); this adds the
// canonical address and the page's own social card.
export const metadata: Metadata = {
  alternates: { canonical: "/home" },
  openGraph: { url: "/home", images: [{ url: DEFAULT_OG_IMAGE }] },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    areaServed: "NP",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/home`,
    inLanguage: ["ne", "en"],
  },
];

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <Home />
    </>
  );
}
