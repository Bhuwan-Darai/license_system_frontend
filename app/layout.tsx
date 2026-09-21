import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import Providers from "./utils/providers";
import axios from "axios";
import { themeInitScript } from "./context/ThemeContext";
import {
  DEFAULT_LOCALE,
  dictionaries,
  hasLocale,
  LOCALE_COOKIE,
  type Locale,
} from "./i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
});

// The language lives in a cookie so the server can render the right language
// on first paint (no English -> Nepali flash) and set <html lang> correctly.
async function getLocale(): Promise<Locale> {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  return hasLocale(saved) ? saved : DEFAULT_LOCALE;
}

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = dictionaries[await getLocale()];
  return {
    title: meta.title,
    description: meta.description,
    // Served from public/ — app/favicon.ico must not exist or it shadows this
    icons: { icon: "/favicon.ico", shortcut: "/favicon.ico" },
    manifest: "/manifest.json",
  };
}

// axios.defaults.baseURL = "http://127.0.0.1:3000";
axios.defaults.withCredentials = true;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLocale();

  return (
    // suppressHydrationWarning: the init script below may add `dark` to <html> before hydration
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers initialLang={lang}>{children}</Providers>
      </body>
    </html>
  );
}
