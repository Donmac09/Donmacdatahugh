import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { u as useServerFn, p as placeOrders } from "./donmac.functions-CukCaMJG.js";
import { toast } from "sonner";
import { s as supabase } from "./client-CIJIW76X.js";
import { M as MAIN_BRAND } from "./router-Si19vHi8.js";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { G as GHS } from "./format-Dvz2fdZm.js";
import { LayoutDashboard, Wallet, Package, ArrowDownUp, Store, User, ShieldCheck, LogOut, Menu, MessageCircle, ShoppingCart, X, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { B as Button } from "./button-Dbehd1zP.js";
const useCart = create()(
  persist(
    (set) => ({
      items: [],
      add: (i) => set((s) => ({ items: [...s.items, i] })),
      remove: (idx) => set((s) => ({ items: s.items.filter((_, n) => n !== idx) })),
      clear: () => set({ items: [] })
    }),
    {
      name: "dm-cart",
      skipHydration: true
    }
  )
);
function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;
        const [{ data: profile, error: profileError }, { data: roles, error: rolesError }, { data: reseller, error: resellerError }] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", session.user.id).single(),
          supabase.from("user_roles").select("role").eq("user_id", session.user.id),
          supabase.from("resellers").select("id, store_name, slug, whatsapp, welcome_message").eq("user_id", session.user.id).maybeSingle()
        ]);
        if (profileError) throw profileError;
        if (rolesError) throw rolesError;
        if (resellerError) throw resellerError;
        const roleNames = (roles ?? []).map((item) => String(item.role ?? "").trim().toLowerCase()).filter(Boolean);
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
            welcome_message: reseller.welcome_message
          } : null
        };
      } catch (e) {
        console.error("useMe error:", e);
        return null;
      }
    },
    staleTime: 5 * 60 * 1e3
  });
}
function AppShell({ children, brand }) {
  const { data: me, refetch } = useMe();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  useCart();
  const userRole = me?.role || String(me?.profile?.role ?? "").trim().toLowerCase();
  const isAdmin = me?.roles?.includes("admin") ?? userRole === "admin";
  const isReseller = (me?.roles?.includes("reseller") ?? false) || userRole === "reseller" || isAdmin || !!me?.reseller;
  const linkedBrand = me?.reseller ? { name: me.reseller.store_name, whatsapp: me.reseller.whatsapp } : null;
  const displayBrand = brand ?? linkedBrand ?? { name: MAIN_BRAND.name, whatsapp: MAIN_BRAND.whatsapp };
  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/topups", label: "Top ups", icon: Wallet },
    { to: "/orders", label: "Orders", icon: Package },
    { to: "/transactions", label: "Transactions", icon: ArrowDownUp },
    ...isReseller || isAdmin ? [{ to: "/mystore", label: "My Store", icon: Store }] : [],
    { to: "/profile", label: "Profile", icon: User },
    ...isAdmin ? [{ to: "/admin/analytics", label: "Admin", icon: ShieldCheck }] : []
  ];
  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }
  useEffect(() => {
    refetch();
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background flex", children: [
    /* @__PURE__ */ jsxs("aside", { className: "hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground", children: [
      /* @__PURE__ */ jsx(BrandBlock, { brand: displayBrand }),
      /* @__PURE__ */ jsx("nav", { className: "flex-1 px-3 py-4 space-y-1", children: nav.map((n) => /* @__PURE__ */ jsx(NavItem, { ...n, active: pathname.startsWith(n.to) }, n.to)) }),
      /* @__PURE__ */ jsx("div", { className: "p-3", children: /* @__PURE__ */ jsxs("button", { onClick: logout, className: "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent", children: [
        /* @__PURE__ */ jsx(LogOut, { className: "size-4" }),
        " Sign out"
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "md:hidden fixed inset-0 bg-black/60 z-40", onClick: () => setOpen(false) }),
      /* @__PURE__ */ jsxs(motion.aside, { initial: { x: -260 }, animate: { x: 0 }, exit: { x: -260 }, transition: { type: "spring", damping: 25 }, className: "md:hidden fixed inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground z-50 flex flex-col", children: [
        /* @__PURE__ */ jsx(BrandBlock, { brand: displayBrand }),
        /* @__PURE__ */ jsx("nav", { className: "flex-1 px-3 py-4 space-y-1", children: nav.map((n) => /* @__PURE__ */ jsx(NavItem, { ...n, active: pathname.startsWith(n.to), onClick: () => setOpen(false) }, n.to)) }),
        /* @__PURE__ */ jsx("div", { className: "p-3", children: /* @__PURE__ */ jsxs("button", { onClick: logout, className: "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent", children: [
          /* @__PURE__ */ jsx(LogOut, { className: "size-4" }),
          " Sign out"
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsx("header", { className: "md:hidden sticky top-0 z-30 bg-background/80 backdrop-blur border-b", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 h-14", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setOpen(true), className: "p-2 -ml-2", children: /* @__PURE__ */ jsx(Menu, { className: "size-5" }) }),
        /* @__PURE__ */ jsx("div", { className: "font-bold text-sm", style: { fontFamily: "Space Grotesk" }, children: displayBrand.name }),
        /* @__PURE__ */ jsx("div", { className: "w-8" })
      ] }) }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 px-4 md:px-8 py-5 md:py-8 max-w-7xl w-full mx-auto pb-28", children })
    ] }),
    /* @__PURE__ */ jsx(
      "a",
      {
        href: `https://wa.me/233${displayBrand.whatsapp.replace(/^0/, "")}`,
        target: "_blank",
        rel: "noreferrer",
        className: "fixed bottom-5 left-5 z-40 size-14 rounded-full bg-success grid place-items-center shadow-lg hover:scale-105 transition",
        "aria-label": "WhatsApp",
        children: /* @__PURE__ */ jsx(MessageCircle, { className: "size-7 text-white" })
      }
    ),
    /* @__PURE__ */ jsx(CartFab, { onCheckout: () => navigate({ to: "/dashboard" }) })
  ] });
}
function BrandBlock({ brand }) {
  return /* @__PURE__ */ jsx("div", { className: "p-5 border-b border-sidebar-border", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsx("div", { className: "size-9 rounded-xl bg-gradient-mtn grid place-items-center text-mtn-foreground font-black", children: brand.name[0] }),
    /* @__PURE__ */ jsx("div", { className: "font-bold leading-tight text-sm", style: { fontFamily: "Space Grotesk" }, children: brand.name })
  ] }) });
}
function NavItem({ to, label, icon: Icon, active, onClick }) {
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to,
      onClick,
      className: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`,
      children: [
        /* @__PURE__ */ jsx(Icon, { className: "size-4" }),
        label
      ]
    }
  );
}
function CartFab({ onCheckout }) {
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
        qc.invalidateQueries({ queryKey: ["admin-orders"] })
      ]);
      toast.success(`${res.count} order(s) placed!`);
      navigate({ to: "/orders" });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setOpen(true),
        className: "fixed bottom-5 right-5 z-40 h-14 px-5 rounded-full bg-gradient-mtn text-mtn-foreground shadow-mtn font-bold flex items-center gap-2 hover:scale-105 transition",
        "aria-label": "Cart",
        children: [
          /* @__PURE__ */ jsx(ShoppingCart, { className: "size-5" }),
          hydrated && cart.items.length > 0 ? /* @__PURE__ */ jsxs("span", { className: "text-sm", children: [
            cart.items.length,
            " • ",
            GHS(total)
          ] }) : /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Cart" })
        ]
      }
    ),
    /* @__PURE__ */ jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black/60 z-50", onClick: () => setOpen(false) }),
      /* @__PURE__ */ jsxs(motion.div, { initial: { y: 400 }, animate: { y: 0 }, exit: { y: 400 }, transition: { type: "spring", damping: 25 }, className: "fixed bottom-0 inset-x-0 z-50 bg-card rounded-t-3xl p-5 max-h-[80vh] overflow-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg", style: { fontFamily: "Space Grotesk" }, children: "Your cart" }),
          /* @__PURE__ */ jsx("button", { onClick: () => setOpen(false), children: /* @__PURE__ */ jsx(X, { className: "size-5" }) })
        ] }),
        !hydrated || cart.items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "Cart is empty." }) : /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          cart.items.map((item, idx) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-xl bg-muted", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm", children: item.label }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: item.phone })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "font-bold", children: GHS(item.amount) }),
              /* @__PURE__ */ jsx("button", { onClick: () => cart.remove(idx), className: "text-destructive text-xs", children: "Remove" })
            ] })
          ] }, idx)),
          /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Total" }),
              /* @__PURE__ */ jsx("span", { className: "font-bold", children: GHS(total) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Wallet balance" }),
              /* @__PURE__ */ jsx("span", { className: balance >= total ? "text-success font-semibold" : "text-destructive font-semibold", children: GHS(balance) })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { disabled: loading || balance < total, onClick: checkout, className: "w-full bg-gradient-mtn text-mtn-foreground shadow-mtn", children: loading ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }),
            " Placing order…"
          ] }) : balance < total ? "Insufficient balance" : "Proceed to pay" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  AppShell as A,
  useCart as a,
  useMe as u
};
