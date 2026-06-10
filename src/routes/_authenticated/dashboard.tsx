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
import { Wallet, Copy, Plus, Hash, Signal, SignalZero, Zap, X, ChevronDown, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: DashboardPage });

// Network phone number validation
const networkPrefixes = {
  'MTN': ['024', '054', '055', '059', '025', '053'],
  'Telecel': ['020', '050', '026'],
  'Airteltigo': ['027', '057'],
  'Airtime': 'all'
};

function validatePhoneNumber(phone: string, network: string): { valid: boolean; message?: string } {
  if (network === 'Airtime') return { valid: true };
  
  const prefix = phone.substring(0, 3);
  const validPrefixes = networkPrefixes[network as keyof typeof networkPrefixes] || [];
  
  if (validPrefixes.includes(prefix)) {
    return { valid: true };
  }
  
  const networkName = network === 'Airteltigo' ? 'Airteltigo' : network;
  return { 
    valid: false, 
    message: `This number is not a valid ${networkName} number. ${networkName} numbers start with: ${validPrefixes.join(', ')}` 
  };
}

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

  const { data: pkgs, isLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: () => packagesFn(),
  });

  // Group packages by category
  const allPackages = pkgs?.packages ?? [];
  
  const mtnMashupData = allPackages.filter(p => p.name?.includes('MTN Mashup') && p.type === 'data' && !p.name?.includes('mins'));
  const mtnMashupMinutes = allPackages.filter(p => p.type === 'minutes_data');
  const mtnStandard = allPackages.filter(p => p.network === 'MTN' && !p.name?.includes('Mashup') && p.type === 'data');
  const telecel = allPackages.filter(p => p.network === 'Telecel');
  const airteltigoPremium = allPackages.filter(p => p.name?.includes('Airteltigo Premium'));
  const airteltigoBigTime = allPackages.filter(p => p.name?.includes('Airteltigo Big Time'));
  const airtime = allPackages.filter(p => p.type === 'airtime');

  // Safely get status with default values
  const statusMap = new Map(pkgs?.status?.map((s) => [`${s.network}:${s.type}`, s.online]) || []);
  
  const mtnMashupDataOnline = statusMap.get('mtn:data') ?? true;
  const mtnMashupMinutesOnline = statusMap.get('mtn:mins_data') ?? true;
  const mtnStandardOnline = statusMap.get('mtn:data') ?? true;
  const telecelOnline = statusMap.get('telecel:data') ?? true;
  const airteltigoPremiumOnline = statusMap.get('airteltigo:data') ?? true;
  const airteltigoBigtimeOnline = statusMap.get('airteltigo:data') ?? true;
  const airtimeOnline = statusMap.get('airtime:data') ?? true;

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading packages...</div>
        </div>
      </AppShell>
    );
  }

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
          <div className="font-semibold">{me?.profile?.full_name || me?.profile?.email}</div>
          <div className="text-sm text-muted-foreground">{me?.profile?.email}</div>
          <div className="text-sm text-muted-foreground">{me?.profile?.phone}</div>
          <Link to="/profile" className="inline-block mt-3 text-xs underline">Edit profile</Link>
        </motion.div>
      </div>

      {/* All Package Sections */}
      {mtnMashupData.length > 0 && (
        <PackagesSection 
          title="MTN Mashup Data" 
          online={mtnMashupDataOnline} 
          packages={mtnMashupData}
          network="MTN"
          variant="mashup"
        />
      )}
      {mtnMashupMinutes.length > 0 && (
        <PackagesSection 
          title="MTN Mashup Minutes + Data" 
          online={mtnMashupMinutesOnline} 
          packages={mtnMashupMinutes}
          network="MTN"
          variant="mashup"
        />
      )}
      {mtnStandard.length > 0 && (
        <PackagesSection 
          title="MTN" 
          online={mtnStandardOnline} 
          packages={mtnStandard}
          network="MTN"
          variant="standard"
        />
      )}
      {telecel.length > 0 && (
        <PackagesSection 
          title="Telecel" 
          online={telecelOnline} 
          packages={telecel}
          network="Telecel"
          variant="telecel"
        />
      )}
      {airteltigoPremium.length > 0 && (
        <PackagesSection 
          title="Airteltigo Premium" 
          online={airteltigoPremiumOnline} 
          packages={airteltigoPremium}
          network="Airteltigo"
          variant="premium"
        />
      )}
      {airteltigoBigTime.length > 0 && (
        <PackagesSection 
          title="Airteltigo Big Time" 
          online={airteltigoBigtimeOnline} 
          packages={airteltigoBigTime}
          network="Airteltigo"
          variant="bigtime"
        />
      )}
      {airtime.length > 0 && (
        <PackagesSection 
          title="Airtime" 
          online={airtimeOnline} 
          packages={airtime}
          network="Airtime"
          variant="airtime"
        />
      )}
    </AppShell>
  );
}

function PackagesSection({ title, online, packages, network, variant }: { 
  title: string; 
  online: boolean; 
  packages: any[]; 
  network: string;
  variant: string;
}) {
  const [open, setOpen] = useState(false);
  
  if (packages.length === 0) return null;
  
  let gradientClass = "";
  let textColorClass = "text-white";
  
  if (network === "MTN") {
    gradientClass = variant === "mashup" ? "from-yellow-400 to-yellow-600" : "from-yellow-500 to-orange-500";
    textColorClass = "text-black";
  } else if (network === "Telecel") {
    gradientClass = "from-red-500 to-red-700";
    textColorClass = "text-white";
  } else if (network === "Airteltigo") {
    gradientClass = "from-red-600 to-blue-600";
    textColorClass = "text-white";
  } else if (network === "Airtime") {
    gradientClass = "from-purple-500 to-pink-500";
    textColorClass = "text-white";
  } else {
    gradientClass = "from-gray-500 to-gray-700";
    textColorClass = "text-white";
  }
  
  return (
    <section className="mt-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r ${gradientClass} ${textColorClass} shadow-lg hover:shadow-xl transition group`}
      >
        <span className="flex items-center gap-3">
          <span className="size-10 rounded-xl bg-white/20 backdrop-blur grid place-items-center">
            <Zap className="size-5" />
          </span>
          <span className="text-left">
            <span className="block font-bold" style={{ fontFamily: "Space Grotesk" }}>{title}</span>
            <span className="block text-xs opacity-80">{packages.length} packages • Tap to {open ? "hide" : "view"}</span>
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full inline-flex items-center gap-1 ${
            online ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}>
            {online ? <CheckCircle className="size-3" /> : <XCircle className="size-3" />} 
            {online ? "Online" : "Offline"}
          </span>
          <motion.span animate={{ rotate: open ? 180 : 0 }}><ChevronDown className="size-5" /></motion.span>
        </span>
      </button>
      <AnimatePresenceSection open={open}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
          {packages.map((p, idx) => (
            <PackageCard key={p.id} pkg={p} delay={idx * 0.03} disabled={!online} network={network} variant={variant} />
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

function PackageCard({ pkg, delay, disabled, network, variant }: { pkg: any; delay: number; disabled?: boolean; network: string; variant: string }) {
  const [open, setOpen] = useState(false);
  
  let gradientClass = "";
  let textColorClass = "text-white";
  let priceDisplay = "";
  
  if (network === "MTN") {
    gradientClass = variant === "mashup" ? "from-yellow-400 to-yellow-600" : "from-yellow-500 to-orange-500";
    textColorClass = "text-black";
    priceDisplay = `₵${pkg.display_price ?? pkg.cost_price}`;
  } else if (network === "Telecel") {
    gradientClass = "from-red-500 to-red-700";
    textColorClass = "text-white";
    priceDisplay = `₵${pkg.display_price ?? pkg.cost_price}`;
  } else if (network === "Airteltigo") {
    gradientClass = "from-red-600 to-blue-600";
    textColorClass = "text-white";
    priceDisplay = `₵${pkg.display_price ?? pkg.cost_price}`;
  } else if (network === "Airtime") {
    gradientClass = "from-purple-500 to-pink-500";
    textColorClass = "text-white";
    priceDisplay = `₵0.50 - ₵50`;
  } else {
    gradientClass = "from-gray-500 to-gray-700";
    textColorClass = "text-white";
    priceDisplay = `₵${pkg.display_price ?? pkg.cost_price}`;
  }
  
  return (
    <>
      <motion.button
        whileHover={{ y: -3 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={`text-left p-4 rounded-2xl bg-gradient-to-br ${gradientClass} ${textColorClass} shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden w-full`}
      >
        <div className="absolute -top-6 -right-6 size-20 rounded-full bg-white/10" />
        <div className="text-xs/none uppercase tracking-wider opacity-80">{network === "Airtime" ? "Airtime" : network}</div>
        <div className="font-black text-lg mt-1" style={{ fontFamily: "Space Grotesk" }}>{pkg.label || pkg.name}</div>
        {pkg.size_gb && <div className="text-sm opacity-80">{pkg.size_gb} GB</div>}
        {pkg.minutes && <div className="text-sm opacity-80">{pkg.minutes} mins + {pkg.data_mb}MB</div>}
        {network === "Airtime" && <div className="text-sm opacity-80">Enter custom amount</div>}
        <div className="mt-2 text-2xl font-black">{priceDisplay}</div>
        <div className="text-[10px] opacity-70 mt-1">Non-expiry</div>
      </motion.button>
      <BuyDialog open={open} setOpen={setOpen} pkg={pkg} network={network} />
    </>
  );
}

function BuyDialog({ open, setOpen, pkg, price, network }: { open: boolean; setOpen: (v: boolean) => void; pkg: any; price?: number; network?: string }) {
  const [phone, setPhone] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const cart = useCart();
  const isAirtime = network === "Airtime" || pkg.type === "airtime";
  const pkgNetwork = pkg.network || (network === "Airtime" ? "Airtime" : "MTN");
  
  const amt = isAirtime 
    ? parseFloat(customAmount) 
    : (price ?? Number(pkg.display_price ?? pkg.cost_price));
  
  function handlePhoneChange(value: string) {
    setPhone(value);
    setPhoneError("");
    
    if (value.length === 10 && /^0\d{9}$/.test(value)) {
      const validation = validatePhoneNumber(value, pkgNetwork);
      if (!validation.valid) {
        setPhoneError(validation.message || "Invalid number for this network");
      }
    }
  }
  
  function addToCart() {
    if (!/^0\d{9}$/.test(phone)) return toast.error("Enter a valid Ghana number (e.g. 024xxxxxxx)");
    
    const validation = validatePhoneNumber(phone, pkgNetwork);
    if (!validation.valid) {
      return toast.error(validation.message);
    }
    
    if (isAirtime && (amt < 0.5 || amt > 50)) return toast.error("Airtime amount must be between ₵0.50 and ₵50");
    if (isNaN(amt) || amt <= 0) return toast.error("Please enter a valid amount");
    
    cart.add({ 
      packageId: pkg.id, 
      label: pkg.label || pkg.name, 
      amount: amt, 
      costPrice: Number(pkg.cost_price) || amt, 
      phone 
    });
    toast.success("Added to cart");
    setOpen(false); 
    setPhone("");
    setCustomAmount("");
    setPhoneError("");
  }
  
  function cancel() {
    setOpen(false);
    setCustomAmount("");
    setPhoneError("");
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{pkg.label || pkg.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl bg-muted p-4 space-y-2 text-sm">
            {isAirtime ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Range</span>
                <span className="font-bold">₵0.50 - ₵50</span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-bold">{GHS(amt)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Validity</span>
              <span className="font-bold">Non-expiry</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network</span>
              <span className="font-bold uppercase">{pkgNetwork}</span>
            </div>
          </div>
          
          {isAirtime && (
            <div className="space-y-2">
              <Label>Enter Amount (₵0.50 - ₵50)</Label>
              <Input 
                type="number" 
                step="0.5" 
                min="0.5" 
                max="50"
                value={customAmount} 
                onChange={(e) => setCustomAmount(e.target.value)} 
                placeholder="e.g., 10.00"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Recipient phone number</Label>
            <Input 
              value={phone} 
              onChange={(e) => handlePhoneChange(e.target.value)} 
              inputMode="numeric" 
              maxLength={10} 
              placeholder="0241234567"
              className={phoneError ? "border-red-500" : ""}
            />
            {phoneError && <p className="text-xs text-red-500">{phoneError}</p>}
            <p className="text-xs text-muted-foreground">
              {!isAirtime && pkgNetwork === "MTN" && "Valid MTN prefixes: 024, 054, 055, 059, 025, 053"}
              {!isAirtime && pkgNetwork === "Telecel" && "Valid Telecel prefixes: 020, 050, 026"}
              {!isAirtime && pkgNetwork === "Airteltigo" && "Valid Airteltigo prefixes: 027, 057"}
              {isAirtime && "Airtime works for all networks"}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" onClick={cancel}>
              <X className="size-4 mr-1" /> Cancel
            </Button>
            <Button 
              onClick={addToCart} 
              disabled={isAirtime && (!customAmount || amt < 0.5 || amt > 50) || !!phoneError || !phone}
              className="bg-gradient-mtn text-mtn-foreground"
            >
              Add to cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
      toast.success("Reference code generated!");
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
        <Button size="sm" variant="secondary" className="bg-mtn-foreground/10 text-mtn-foreground hover:bg-mtn-foreground/20">
          <Plus className="size-4 mr-1" />Top up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Top up via Mobile Money</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p>Send Mobile Money to:</p>
          <div className="rounded-xl bg-muted p-4 space-y-2">
            <Row label="Name" value={MAIN_BRAND.momoName} />
            <Row label="Number" value={MAIN_BRAND.momoNumber} copy />
          </div>
          <p>Generate a 6-character reference code and use it as the MoMo reference. Your wallet will be auto-credited.</p>
          {code ? (
            <div className="rounded-xl bg-gradient-mtn p-5 text-center">
              <p className="text-xs uppercase tracking-wider text-mtn-foreground/70">Your reference code</p>
              <p className="text-3xl font-black text-mtn-foreground tracking-widest mt-1 font-mono" style={{ fontFamily: "Space Grotesk" }}>{code}</p>
              <button onClick={() => { navigator.clipboard.writeText(code); toast.success("Copied!"); }} className="mt-2 text-xs inline-flex items-center gap-1 text-mtn-foreground/80">
                <Copy className="size-3" /> Copy code
              </button>
              <Button onClick={() => gen(true)} disabled={loading} variant="secondary" size="sm" className="mt-3 bg-mtn-foreground/10 text-mtn-foreground hover:bg-mtn-foreground/20">
                {loading ? "Generating..." : "Generate new code"}
              </Button>
            </div>
          ) : (
            <Button onClick={() => gen(false)} disabled={loading} className="w-full bg-gradient-mtn text-mtn-foreground">
              {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              {loading ? "Generating..." : "Generate reference code"}
            </Button>
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
    onSuccess: () => { 
      toast.success("Claim submitted for review"); 
      setOpen(false); 
      setTx(""); 
      setAmt(""); 
      qc.invalidateQueries({ queryKey: ["topups"] }); 
    },
    onError: (e: any) => toast.error(e.message),
  });
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="bg-mtn-foreground/10 text-mtn-foreground hover:bg-mtn-foreground/20">
          <Hash className="size-4 mr-1" />Claim
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Claim with Transaction ID</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Transaction ID</Label>
            <Input value={tx} onChange={(e) => setTx(e.target.value)} placeholder="e.g. 1234567890.1234.123456" />
          </div>
          <div className="space-y-2">
            <Label>Amount (₵)</Label>
            <Input type="number" step="0.01" value={amt} onChange={(e) => setAmt(e.target.value)} placeholder="0.00" />
          </div>
          <Button disabled={mut.isPending || !tx || !amt} onClick={() => mut.mutate()} className="w-full bg-gradient-mtn text-mtn-foreground">
            {mut.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
            {mut.isPending ? "Submitting..." : "Submit claim"}
          </Button>
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