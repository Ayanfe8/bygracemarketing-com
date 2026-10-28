import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function StarterShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory text-ink font-sans">
      <header className="border-b border-stone">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-serif text-xl tracking-tight text-ink">
            Done For You by Grace
          </Link>
          <Link
            to="/"
            className="text-sm text-charcoal underline-offset-4 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-ink"
          >
            Back to DFY
          </Link>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-20 border-t border-stone">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-charcoal sm:flex-row sm:justify-between">
          <p>Written by Grace Olubunmi Arungbemi · Done For You by Grace</p>
          <p className="flex gap-4">
            <Link to="/privacy" className="hover:text-ink hover:underline">Privacy notice</Link>
            <a href="https://bygracemarketing.com" className="hover:text-ink hover:underline">bygracemarketing.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

/** Typographic 6x9 cover mockup — illustrative, not the actual PDF cover. */
export function BookCover({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <div
      className="relative aspect-[6/9] w-full max-w-[220px] bg-ink p-3 sm:p-5 text-ivory shadow-[0_18px_40px_-18px_var(--ink)]"
      role="img"
      aria-label={`Cover illustration: ${title}`}
    >
      <div className="absolute inset-y-0 left-0 w-2 bg-charcoal/40" aria-hidden />
      <div className="flex h-full flex-col justify-between border border-ivory/25 p-3 sm:p-4">
        <p className="text-[10px] uppercase tracking-[0.22em] text-stone">{kicker}</p>
        <div>
          <p className="font-serif text-base leading-tight sm:text-2xl">{title}</p>
          <div className="my-3 h-px w-10 bg-stone" />
          <p className="text-[10px] leading-snug text-stone sm:text-[11px]">{sub}</p>
        </div>
        <p className="text-[10px] tracking-wide text-stone">Done For You by Grace</p>
      </div>
    </div>
  );
}
