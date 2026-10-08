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

/** Sends the inquiry. `website` is the honeypot field and must stay empty for real visitors. */
export async function sendInquiry(v: InquiryValues, website: string): Promise<InquiryResult> {
  try {
    await axios.post(
      `${API_BASE_URL}/public/inquiries`,
      {
        name: v.name.trim(),
        phone: v.phone.trim(),
        email: v.email.trim(),
        help_type: v.help_type,
        message: v.message.trim(),
        website,
      },
      { timeout: 10000, withCredentials: false },
    );
    return { ok: true };
  } catch (e) {
    return { ok: false, tooMany: axios.isAxiosError(e) && e.response?.status === 429 };
  }
}
