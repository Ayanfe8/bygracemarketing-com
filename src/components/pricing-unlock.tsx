import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from "react";
import { Download, Lock, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STORAGE_KEY = "dfy-rate-card-unlocked";

export const rateCards = [
  { file: "DFY-by-Grace_Rate-Card_Comparison.pdf", label: "Full Comparison Rate Card" },
  { file: "DFY-by-Grace_Rate-Card_Starter.pdf", label: "Starter Support — ₦150,000/mo" },
  { file: "DFY-by-Grace_Rate-Card_Growth.pdf", label: "Growth Support — ₦350,000/mo" },
  { file: "DFY-by-Grace_Rate-Card_Premium.pdf", label: "Premium Support — ₦650,000/mo" },
];

type UnlockCtx = {
  unlocked: boolean;
  openGate: (source?: string) => void;
};

const UnlockContext = createContext<UnlockCtx>({ unlocked: false, openGate: () => {} });

export const usePricingUnlock = () => useContext(UnlockContext);

export function PricingUnlockProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<string>("pricing");
  const [submitting, setSubmitting] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1") {
      setUnlocked(true);
    }
  }, []);

  const openGate = useCallback((src?: string) => {
    if (src) setSource(src);
    if (unlocked) {
      setJustUnlocked(true);
      setOpen(true);
    } else {
      setJustUnlocked(false);
      setOpen(true);
    }
  }, [unlocked]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const business = String(data.get("business") ?? "").trim() || null;

    if (!name || !email) return;

    setSubmitting(true);
    const { error } = await supabase.from("pricing_leads").insert({
      name,
      email,
      business,
      source,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Couldn't unlock. Please check your details and try again.");
      return;
    }

    localStorage.setItem(STORAGE_KEY, "1");
    setUnlocked(true);
    setJustUnlocked(true);
    toast.success("Rate card unlocked. Pricing is now visible.");
  };

  return (
    <UnlockContext.Provider value={{ unlocked, openGate }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          {!unlocked || !justUnlocked ? null : null}
          {unlocked ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-primary flex items-center gap-2">
                  <Check className="h-5 w-5 text-gold" /> Your rate cards
                </DialogTitle>
                <DialogDescription>
                  Download any of the flyers below to share or review offline.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 mt-2">
                {rateCards.map((rc) => (
                  <a
                    key={rc.file}
                    href={`/rate-cards/${rc.file}`}
                    download
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-gold transition-colors group"
                  >
                    <span className="text-sm text-primary font-medium">{rc.label}</span>
                    <Download className="h-4 w-4 text-muted-foreground group-hover:text-gold" />
                  </a>
                ))}
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-primary flex items-center gap-2">
                  <Lock className="h-5 w-5 text-gold" /> Unlock the rate card
                </DialogTitle>
                <DialogDescription>
                  Enter your details to view pricing and download the full rate card PDFs.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4 mt-2">
                <label className="block">
                  <span className="text-xs uppercase tracking-widest text-primary font-medium">
                    Your name <span className="text-gold">*</span>
                  </span>
                  <input
                    name="name"
                    required
                    maxLength={120}
                    type="text"
                    placeholder="Jane Doe"
                    className="input-base mt-2"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-widest text-primary font-medium">
                    Work email <span className="text-gold">*</span>
                  </span>
                  <input
                    name="email"
                    required
                    maxLength={255}
                    type="email"
                    placeholder="jane@business.com"
                    className="input-base mt-2"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-widest text-primary font-medium">
                    Business name
                  </span>
                  <input
                    name="business"
                    maxLength={200}
                    type="text"
                    placeholder="Acme Co."
                    className="input-base mt-2"
                  />
                </label>
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-navy-deep text-primary-foreground rounded-full h-11"
                >
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Unlocking…</>
                  ) : (
                    <>Send me the rate card</>
                  )}
                </Button>
                <p className="text-[11px] text-center text-muted-foreground">
                  We'll never share your details. Unsubscribe any time.
                </p>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </UnlockContext.Provider>
  );
}
