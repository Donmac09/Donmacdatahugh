import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { placeOrders } from "@/lib/api/donmac.functions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MAIN_BRAND } from "@/lib/brand";
import { useCart } from "@/lib/cart";
import { GHS } from "@/lib/format";
import {
  LayoutDashboard, Wallet, Package, ArrowDownUp, Store, User, ShieldCheck,
  LogOut, Menu, X, ShoppingCart, MessageCircle, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function useMe() {
  return useQuery({ 
    queryKey: ["me"], 
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;
        
        const [{ data: profile, error: profileError }, { data: roles, error: rolesError }, { data: reseller, error: resellerError }] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", session.user.id).single(),
          supabase.from("user_roles").select("role").eq("user_id", session.user.id),
          supabase.from("resellers").select("id, store_name, slug, whatsapp, welcome_message").eq("user_id", session.user.id).maybeSingle(),
        ]);
        
        if (profileError) throw profileError;
        if (rolesError) throw rolesError;
        if (resellerError) throw resellerError;
        
        const roleNames = (roles ?? [])
          .map((item) => String(item.role ?? "").trim().toLowerCase())
          .filter(Boolean);
        const hasAdmin = roleNames.includes("admin");
        const hasReseller = roleNames.includes("reseller");

        return {
          profile,
          role: hasAdmin ? "admin" : hasReseller ? "reseller" : roleNames[0] ?? "customer",
          roles: roleNames,
          reseller: reseller ? {
            id: reseller.id,
            store_name: reseller.store_name,
            store_slug: reseller.slug,
            whatsapp: reseller.whatsapp,
            welcome_message: reseller.welcome_message,
          } : null
        };
      } catch (e) {
        console.error("useMe error:", e);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function AppShell({ children, brand }: { children: ReactNode; brand?: { name: string; whatsapp: string } }) {
  const { data: me, refetch } = useMe();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const cart = useCart();

  const userRole = me?.role || String(me?.profile?.role ?? "").trim().toLowerCase();
  const isAdmin = me?.role === "admin" || (me?.roles?.includes("admin") ?? false) || userRole === "admin";
  const isReseller = me?.role === "reseller" || (me?.roles?.includes("reseller") ?? false) || isAdmin || !!me?.reseller;
  
  const linkedBrand = me?.reseller
    ? { name: me.reseller.store_name, whatsapp: me.reseller.whatsapp }
    : null;
  const displayBrand = brand ?? linkedBrand ?? { name: MAIN_BRAND.name, whatsapp: MAIN_BRAND.whatsapp };

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/topups", label: "Top ups", icon: Wallet },
    { to: "/orders", label: "Orders", icon: Package },
    { to: "/transactions", label: "Transactions", icon: ArrowDownUp },
    ...(isReseller ? [{ to: "/mystore", label: "My Store", icon: Store }] : []),
    { to: "/profile", label: "Profile", icon: User },
    ...(isAdmin ? [{ to: "/admin/analytics", label: "Admin", icon: ShieldCheck }] : []),
  ];

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  // Refresh me data when component mounts
  useEffect(() => {
    refetch();
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground">
        <BrandBlock brand={displayBrand} />
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((n) => (
            <NavItem key={n.to} {...n} active={pathname.startsWith(n.to)} />
          ))}
        </nav>
        <div className="p-3">
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />
            <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: "spring", damping: 25 }} className="md:hidden fixed inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground z-50 flex flex-col">
              <BrandBlock brand={displayBrand} />
              <nav className="flex-1 px-3 py-4 space-y-1">
                {nav.map((n) => (
                  <NavItem key={n.to} {...n} active={pathname.startsWith(n.to)} onClick={() => setOpen(false)} />
                ))}
              </nav>
              <div className="p-3">
                <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent">
                  <LogOut className="size-4" /> Sign out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
          <div className="flex items-center justify-between px-4 h-14">
            <button onClick={() => setOpen(true)} className="p-2 -ml-2"><Menu className="size-5" /></button>
            <div className="font-bold text-sm" style={{ fontFamily: "Space Grotesk" }}>{displayBrand.name}</div>
            <div className="w-8" />
          </div>
        </header>
        <main className="flex-1 px-4 md:px-8 py-5 md:py-8 max-w-7xl w-full mx-auto pb-28">
          {children}
        </main>
      </div>

      {/* Floating WhatsApp (left) */}
      <a
        href={`https://wa.me/233${displayBrand.whatsapp.replace(/^0/, "")}`}
        target="_blank" rel="noreferrer"
        className="fixed bottom-5 left-5 z-40 size-14 rounded-full bg-success grid place-items-center shadow-lg hover:scale-105 transition"
        aria-label="WhatsApp"
      >
        <MessageCircle className="size-7 text-white" />
      </a>

      {/* Floating Cart (right) */}
      <CartFab onCheckout={() => navigate({ to: "/dashboard" })} />
    </div>
  );
}

function BrandBlock({ brand }: { brand: { name: string } }) {
  return (
    <div className="p-5 border-b border-sidebar-border">
      <div className="flex items-center gap-2">
        <div className="size-9 rounded-xl bg-gradient-mtn grid place-items-center text-mtn-foreground font-black">
          {brand.name[0]}
        </div>
        <div className="font-bold leading-tight text-sm" style={{ fontFamily: "Space Grotesk" }}>
          {brand.name}
        </div>
      </div>
    </div>
  );
}

function NavItem({ to, label, icon: Icon, active, onClick }: any) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
        active ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      }`}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

function CartFab({ onCheckout }: { onCheckout?: () => void }) {
  const [open, setOpen] = useState(false);
  const cart = useCart();
  const { data: me } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [hydrated, setHydrated] = useState(false);
  const total = cart.items.reduce((s, i) => s + i.amount, 0);
  const balance = Number(me?.profile?.balance ?? 0);
  const placeFn = useServerFn(placeOrders);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    useCart.persist.rehydrate();
    setHydrated(true);
  }, []);

  async function checkout() {
    if (cart.items.length === 0) return;
    setLoading(true);
    try {
      const res = await placeFn({ data: { items: cart.items.map((i) => ({ packageId: i.packageId, phone: i.phone })) } });
      cart.clear();
      setOpen(false);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["me"] }),
        qc.invalidateQueries({ queryKey: ["orders"] }),
        qc.invalidateQueries({ queryKey: ["transactions"] }),
        qc.invalidateQueries({ queryKey: ["admin-orders"] }),
      ]);
      toast.success(`${res.count} order(s) placed!`);
      navigate({ to: "/orders" });
    } catch (e: any) {
      toast.error(e.message);
    } finally { setLoading(false); }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 h-14 px-5 rounded-full bg-gradient-mtn text-mtn-foreground shadow-mtn font-bold flex items-center gap-2 hover:scale-105 transition"
        aria-label="Cart"
      >
        <ShoppingCart className="size-5" />
        {hydrated && cart.items.length > 0 ? (
          <span className="text-sm">{cart.items.length} • {GHS(total)}</span>
        ) : <span className="text-sm">Cart</span>}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => setOpen(false)} />
            <motion.div initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} transition={{ type: "spring", damping: 25 }} className="fixed bottom-0 inset-x-0 z-50 bg-card rounded-t-3xl p-5 max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg" style={{ fontFamily: "Space Grotesk" }}>Your cart</h3>
                <button onClick={() => setOpen(false)}><X className="size-5" /></button>
              </div>
              {!hydrated || cart.items.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Cart is empty.</p>
              ) : (
                <div className="space-y-3">
                  {cart.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted">
                      <div>
                        <div className="font-semibold text-sm">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.phone}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-bold">{GHS(item.amount)}</div>
                        <button onClick={() => cart.remove(idx)} className="text-destructive text-xs">Remove</button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="font-bold">{GHS(total)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Wallet balance</span><span className={balance >= total ? "text-success font-semibold" : "text-destructive font-semibold"}>{GHS(balance)}</span></div>
                  </div>
                  <Button disabled={loading || balance < total} onClick={checkout} className="w-full bg-gradient-mtn text-mtn-foreground shadow-mtn">
                    {loading ? (
                      <span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Placing order…</span>
                    ) : balance < total ? "Insufficient balance" : "Proceed to pay"}
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}