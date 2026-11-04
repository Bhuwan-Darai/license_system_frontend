import axios from "axios";

// The contact form is public, so it uses its own plain client: no cookies, no
// dashboard login redirects or toasts from the shared api instance.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:3030/api/v1";

export interface InquiryValues {
  name: string;
  phone: string;
  email: string;
  help_type: string;
  message: string;
}

export type InquiryErrorKey = "name" | "phone" | "email" | "help" | "message" | "markup";

const HELP_TYPES = ["registration", "practice", "trial", "institute", "other"];
const PHONE = /^\+?[0-9][0-9 -]{6,18}[0-9]$/;
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

/** Mirrors the server rules so mistakes are caught before sending. */
export function validateInquiry(v: InquiryValues): InquiryErrorKey[] {
  const errors: InquiryErrorKey[] = [];
  const name = v.name.trim();
  const message = v.message.trim();

  if (name.length < 2 || name.length > 100) errors.push("name");
  if (!PHONE.test(v.phone.trim())) errors.push("phone");
  if (v.email.trim() && (v.email.trim().length > 254 || !EMAIL.test(v.email.trim()))) errors.push("email");
  if (!HELP_TYPES.includes(v.help_type)) errors.push("help");
  if (message.length < 10 || message.length > 2000) errors.push("message");
  if (/[<>]/.test(`${v.name}${v.email}${v.message}`)) errors.push("markup");

  return errors;
}

export type InquiryResult = { ok: true } | { ok: false; tooMany: boolean };

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
const RECAPTCHA_ACTION = "contact";

/** Script URL for reCAPTCHA v3, or null when no site key is configured. */
export const recaptchaScriptSrc = RECAPTCHA_SITE_KEY
  ? `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
  : null;

interface Grecaptcha {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
}

/** Gets a one-time v3 token. Returns "" when reCAPTCHA is off or fails to load; the server decides. */
async function getRecaptchaToken(): Promise<string> {
  const grecaptcha = (window as unknown as { grecaptcha?: Grecaptcha }).grecaptcha;
  if (!RECAPTCHA_SITE_KEY || !grecaptcha) return "";
  try {
    await new Promise<void>((resolve) => grecaptcha.ready(resolve));
    return await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: RECAPTCHA_ACTION });
  } catch {
    return "";
  }
}

/** Sends the inquiry. `website` is the honeypot field and must stay empty for real visitors. */
export async function sendInquiry(v: InquiryValues, website: string): Promise<InquiryResult> {
  try {
    // tokens expire after 2 minutes and work once, so get a fresh one per send
    const recaptcha_token = await getRecaptchaToken();
    await axios.post(
      `${API_BASE_URL}/public/inquiries`,
      {
        name: v.name.trim(),
        phone: v.phone.trim(),
        email: v.email.trim(),
        help_type: v.help_type,
        message: v.message.trim(),
        website,
        recaptcha_token,
      },
      { timeout: 10000, withCredentials: false },
    );
    return { ok: true };
  } catch (e) {
    return { ok: false, tooMany: axios.isAxiosError(e) && e.response?.status === 429 };
  }
}
