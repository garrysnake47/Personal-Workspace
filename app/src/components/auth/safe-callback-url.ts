/**
 * Only same-origin, path-relative redirect targets are accepted. Anything else
 * (absolute URL, protocol-relative `//evil.com`, backslash trickery) falls back
 * to Work Logs — otherwise `?callbackUrl=` is an open redirect.
 */
export function safeCallbackUrl(raw: string | undefined, fallback = "/work-logs"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}
