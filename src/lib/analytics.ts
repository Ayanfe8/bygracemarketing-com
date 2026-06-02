// Lightweight Google Analytics 4 helper.
// Set VITE_GA_MEASUREMENT_ID (e.g. "G-XXXXXXXXXX") in your env to enable.
// Without an ID, all calls are safe no-ops.

export const GA_MEASUREMENT_ID =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) ?? "";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  name: string,
  params: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", name, params);
  } catch {
    /* swallow */
  }
}

export function trackPageView(path: string): void {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID) return;
  try {
    window.gtag?.("config", GA_MEASUREMENT_ID, { page_path: path });
  } catch {
    /* swallow */
  }
}
