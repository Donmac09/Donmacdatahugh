import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { AppShell, useMe } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { GHS } from "@/lib/format";
import { MAIN_BRAND } from "@/lib/brand";
import { useCart } from "@/lib/cart";
import { createRefCode, claimByTransactionId, getPackagesForUser } from "@/lib/api/donmac.functions";
import { Wallet, Copy, Plus, Hash, Signal, SignalZero, Zap, X, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: DashboardPage });

function DashboardPage() {
  const { data: me } = useMe();
  const packagesFn = useServerFn(getPackagesForUser);
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const greeting = (() => {
    const h = time.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const { data: pkgs } = useQuery({
    queryKey: ["packages"],
    queryFn: () => packagesFn(),
  });

  const dataPkgs = (pkgs?.packages ?? []).filter((p) => p.type === "data");
  const minsPkgs = (pkgs?.packages ?? []).filter((p) => p.type === "mins_data");
  const dataOnline = pkgs?.status.find((s) => s.type === "data")?.online ?? true;
  const minsOnline = pkgs?.status.find((s) => s.type === "mins_data")?.online ?? true;

  return (
    <AppShell>
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="rounded-3xl bg-gradient-dark text-white p-6 md:p-8 relative overflow-hidden shadow-card">
          <div className="absolute -top-12 -right-12 size-48 rounded-full bg-mtn/30 blur-2xl" />
          <div className="relative">
            <p className="text-white/60 text-xs uppercase tracking-wider">{greeting}</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1" style={{ fontFamily: "Space Grotesk" }}>
              {me?.profile?.full_name || me?.profile?.email}
            </h1>
            <p className="text-white/70 text-sm mt-1">
              {time.toLocaleString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              {" • "}
              {time.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Wallet + actions */}
      <div className="grid sm:grid-cols-2 gap-4 mt-5">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl bg-gradient-mtn text-mtn-foreground p-5 shadow-mtn relative overflow-hidden">
          <Wallet className="size-7 mb-2" />
          <p className="text-xs/none opacity-80 uppercase tracking-wider">Wallet balance</p>
          <p className="text-3xl font-black mt-1" style={{ fontFamily: "Space Grotesk" }}>{GHS(me?.profile?.balance ?? 0)}</p>
          <div className="flex gap-2 mt-4">
            <TopUpDialog />
            <ClaimDialog />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }} className="rounded-2xl bg-card border p-5 shadow-card">
          <div className="text-xs uppercase text-muted-foreground tracking-wider mb-2">Profile</div>
          <div className="font-semibold">{me?.profile?.full_name}</div>
          <div className="text-sm text-muted-foreground">{me?.profile?.email}</div>
          <div className="text-sm text-muted-foreground">{me?.profile?.phone}</div>
          <Link to="/profile" className="inline-block mt-3 text-xs underline">Edit profile</Link>
        </motion.div>
      </div>

      {/* Packages */}
      <PackagesSection title="MTN Mashup Data" icon="data" online={dataOnline} packages={dataPkgs} />
      <PackagesSection title="MTN Mashup Minutes + Data" icon="mins" online={minsOnline} packages={minsPkgs} />
    </AppShell>
  );
}

function TopUpDialog() {
  const fn = useServerFn(createRefCode);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function gen(forceRegenerate = false) {
    setLoading(true);
    try {
      const r = await fn({ data: { forceRegenerate } });
      setCode(r.code);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={(o) => {
      setOpen(o);
      if (!o) setCode(null);
      if (o && !code) void gen(false);
    }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="bg-mtn-foreground/10 text-mtn-foreground hover:bg-mtn-foreground/20"><Plus className="size-4 mr-1" />Top up</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Top up via MoMo</DialogTitle></DialogHeader>
        <div className="space-y-3 text-sm">
          <p>Send Mobile Money to:</p>
          <div className="rounded-xl bg-muted p-4 space-y-1">
            <Row label="Name" value={MAIN_BRAND.momoName} />
            <Row label="Number" value={MAIN_BRAND.momoNumber} copy />
          </div>
          <p>Generate a 6-character reference code and use it as the MoMo reference. Your wallet will be auto-credited.</p>
          {code ? (
            <div className="rounded-xl bg-gradient-mtn p-5 text-center">
              <p className="text-xs uppercase tracking-wider text-mtn-foreground/70">Your reference</p>
              <p className="text-4xl font-black text-mtn-foreground tracking-widest mt-1" style={{ fontFamily: "Space Grotesk" }}>{code}</p>
              <button onClick={() => { navigator.clipboard.writeText(code); toast.success("Copied"); }} className="mt-2 text-xs inline-flex items-center gap-1 text-mtn-foreground/80"><Copy className="size-3" /> Copy</button>
              <Button onClick={() => gen(true)} disabled={loading} variant="secondary" className="mt-3 bg-mtn-foreground/10 text-mtn-foreground hover:bg-mtn-foreground/20">
                {loading ? "Regenerating…" : "Regenerate code"}
              </Button>
            </div>
          ) : (
            <Button onClick={() => gen(false)} disabled={loading} className="w-full bg-gradient-mtn text-mtn-foreground">{loading ? "Generating…" : "Generate ref code"}</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ClaimDialog() {
  const fn = useServerFn(claimByTransactionId);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [tx, setTx] = useState("");
  const [amt, setAmt] = useState("");
  const mut = useMutation({
    mutationFn: () => fn({ data: { transactionId: tx.trim(), amount: parseFloat(amt) } }),
    onSuccess: () => { toast.success("Claim submitted for review"); setOpen(false); setTx(""); setAmt(""); qc.invalidateQueries({ queryKey: ["topups"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="secondary" className="bg-mtn-foreground/10 text-mtn-foreground hover:bg-mtn-foreground/20"><Hash className="size-4 mr-1" />Claim</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Claim with Transaction ID</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2"><Label>Transaction ID</Label><Input value={tx} onChange={(e) => setTx(e.target.value)} placeholder="e.g. 1234567890.1234.123456" /></div>
          <div className="space-y-2"><Label>Amount (¢)</Label><Input type="number" step="0.01" value={amt} onChange={(e) => setAmt(e.target.value)} /></div>
          <Button disabled={mut.isPending || !tx || !amt} onClick={() => mut.mutate()} className="w-full bg-gradient-mtn text-mtn-foreground">{mut.isPending ? "Submitting…" : "Submit claim"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-semibold flex items-center gap-2">
        {value}
        {copy && <button onClick={() => { navigator.clipboard.writeText(value); toast.success("Copied"); }}><Copy className="size-3" /></button>}
      </span>
    </div>
  );
}

function PackagesSection({ title, icon, online, packages }: { title: string; icon: "data" | "mins"; online: boolean; packages: any[] }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4 rounded-2xl bg-card border shadow-card hover:shadow-mtn transition group"
      >
        <span className="flex items-center gap-3">
          <span className="size-10 rounded-xl bg-gradient-mtn grid place-items-center text-mtn-foreground shadow-mtn">
            <Zap className="size-5" />
          </span>
          <span className="text-left">
            <span className="block font-bold" style={{ fontFamily: "Space Grotesk" }}>{title}</span>
            <span className="block text-xs text-muted-foreground">{packages.length} packages • Tap to {open ? "hide" : "view"}</span>
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full inline-flex items-center gap-1 ${online ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
            {online ? <Signal className="size-3" /> : <SignalZero className="size-3" />} {online ? "Online" : "Offline"}
          </span>
          <motion.span animate={{ rotate: open ? 180 : 0 }}><ChevronDown className="size-5 text-muted-foreground" /></motion.span>
        </span>
      </button>
      <AnimatePresenceSection open={open}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
          {packages.map((p, idx) => (
            <PackageCard key={p.id} pkg={p} delay={idx * 0.03} disabled={!online} />
          ))}
        </div>
      </AnimatePresenceSection>
    </section>
  );
}

function AnimatePresenceSection({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
      transition={{ duration: 0.25 }}
      style={{ overflow: "hidden" }}
    >
      {children}
    </motion.div>
  );
}

function PackageCard({ pkg, delay, disabled }: { pkg: any; delay: number; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
        <motion.button
        whileHover={{ y: -3 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="text-left p-4 rounded-2xl bg-gradient-mtn text-mtn-foreground shadow-mtn disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
      >
        <div className="absolute -top-6 -right-6 size-20 rounded-full bg-mtn-foreground/10" />
        <div className="text-xs/none uppercase tracking-wider opacity-70">MTN</div>
        <div className="font-black text-lg mt-1" style={{ fontFamily: "Space Grotesk" }}>{pkg.label}</div>
        <div className="mt-2 text-2xl font-black">{GHS(pkg.display_price ?? pkg.cost_price)}</div>
        <div className="text-[10px] opacity-70 mt-1">Non-expiry</div>
      </motion.button>
      <BuyDialog open={open} setOpen={setOpen} pkg={pkg} />
    </>
  );
}

export function BuyDialog({ open, setOpen, pkg, price }: { open: boolean; setOpen: (v: boolean) => void; pkg: any; price?: number }) {
  const [phone, setPhone] = useState("");
  const cart = useCart();
  const amt = price ?? Number(pkg.display_price ?? pkg.cost_price);
  function addToCart() {
    if (!/^0\d{9}$/.test(phone)) return toast.error("Enter a valid Ghana number (e.g. 024xxxxxxx)");
    cart.add({ packageId: pkg.id, label: pkg.label, amount: amt, costPrice: Number(pkg.cost_price), phone });
    toast.success("Added to cart");
    setOpen(false); setPhone("");
  }
  function cancel() {
    setOpen(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader><DialogTitle>{pkg.label}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="rounded-xl bg-muted p-4 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Price</span><span className="font-bold">{GHS(amt)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Validity</span><span className="font-bold">Non-expiry</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Network</span><span className="font-bold uppercase">{pkg.network}</span></div>
          </div>
          <div className="space-y-2">
            <Label>Recipient phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" maxLength={10} placeholder="0241234567" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={cancel}><X className="size-4 mr-1" />Cancel</Button>
            <Button onClick={addToCart} className="bg-gradient-mtn text-mtn-foreground">Add to cart</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
