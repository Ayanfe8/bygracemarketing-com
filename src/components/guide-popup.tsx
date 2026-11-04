import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, BookOpen } from "lucide-react";

const KEY = "dfy_guide_popup_dismissed_at";
const WEEK = 7 * 24 * 60 * 60 * 1000;

export function GuidePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const last = Number(localStorage.getItem(KEY) || 0);
    if (last && Date.now() - last < WEEK) return;
    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      setOpen(true);
      cleanup();
    };
    const timer = window.setTimeout(show, 8000);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= 0.5) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    }
    return cleanup;
  }, []);

  const dismiss = () => {
    localStorage.setItem(KEY, String(Date.now()));
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Read the DFY vs DWY guide"
      className="fixed z-50 inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500"
    >
      <div className="relative border-t sm:border border-border bg-card shadow-xl sm:rounded-2xl px-4 py-3 sm:p-5 flex sm:block items-center gap-3">
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-2 right-2 rounded-full p-1 text-muted-foreground hover:text-primary"
        >
          <X className="h-4 w-4" />
        </button>
        <BookOpen className="hidden sm:block h-6 w-6 text-gold" />
        <p className="text-sm text-foreground sm:mt-2 pr-6 flex-1">
          <span className="font-serif text-primary sm:text-lg">Done For You or Done With You?</span>{" "}
          <span className="hidden sm:inline text-muted-foreground">Read the 3-minute guide.</span>
        </p>
        <Link
          to="/dfy-vs-dwy"
          onClick={dismiss}
          className="shrink-0 mr-6 sm:mr-0 sm:mt-4 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs sm:text-sm font-medium text-primary-foreground hover:bg-navy-deep"
        >
          Read the guide
        </Link>
      </div>
    </div>
  );
}
