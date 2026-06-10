import { jsx, jsxs } from "react/jsx-runtime";
import { redirect } from "@tanstack/react-router";
import * as React from "react";
import { useState, useMemo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { u as useServerFn, c as createMyStore, a as updateMyPrices, r as requestWithdrawal } from "./donmac.functions-CukCaMJG.js";
import { u as useMe, A as AppShell } from "./app-shell-Bv0Nrqf5.js";
import { B as Button } from "./button-Dbehd1zP.js";
import { I as Input } from "./input-BR2iTU4N.js";
import { L as Label } from "./label-BQVcCpGK.js";
import { c as cn } from "./router-Si19vHi8.js";
import { s as supabase } from "./client-CIJIW76X.js";
import { G as GHS } from "./format-Dvz2fdZm.js";
import { toast } from "sonner";
import { Copy, ExternalLink, Wallet } from "lucide-react";
import "./server-Dcl151ZB.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "zod";
import "zustand";
import "zustand/middleware";
import "framer-motion";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-tooltip";
import "clsx";
import "tailwind-merge";
import "./client.server-D5ro3rAQ.js";
import "@supabase/supabase-js";
const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
function MyStorePage() {
  const {
    data: me,
    refetch
  } = useMe();
  const hasStore = me?.profile?.store_name || me?.reseller?.store_name;
  const isResellerOrAdmin = me?.role === "reseller" || me?.role === "admin";
  if (me && !isResellerOrAdmin) {
    throw redirect({
      to: "/dashboard"
    });
  }
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-4", style: {
      fontFamily: "Space Grotesk"
    }, children: "My Store" }),
    !hasStore ? /* @__PURE__ */ jsx(CreateStoreForm, { onCreated: refetch }) : /* @__PURE__ */ jsx(StoreDashboard, {})
  ] });
}
function CreateStoreForm({
  onCreated
}) {
  const fn = useServerFn(createMyStore);
  const [storeName, setStoreName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const mut = useMutation({
    mutationFn: () => fn({
      data: {
        storeName,
        welcomeMessage,
        whatsapp
      }
    }),
    onSuccess: () => {
      toast.success("Store created!");
      onCreated();
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxs("div", { className: "max-w-lg rounded-2xl border bg-card p-6 space-y-3", children: [
    /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Create your storefront" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Fill in your details. We'll create a shareable storefront link for you." }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { children: "Store name" }),
      /* @__PURE__ */ jsx(Input, { value: storeName, onChange: (e) => setStoreName(e.target.value), placeholder: "Your Data Hub" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { children: "Welcome message" }),
      /* @__PURE__ */ jsx(Textarea, { value: welcomeMessage, onChange: (e) => setWelcomeMessage(e.target.value), placeholder: "Welcome to our store…" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { children: "WhatsApp number" }),
      /* @__PURE__ */ jsx(Input, { value: whatsapp, onChange: (e) => setWhatsapp(e.target.value), placeholder: "024xxxxxxx" })
    ] }),
    /* @__PURE__ */ jsx(Button, { disabled: mut.isPending || !storeName || !whatsapp, onClick: () => mut.mutate(), className: "w-full bg-gradient-mtn text-mtn-foreground", children: mut.isPending ? "Creating…" : "Create store" })
  ] });
}
function StoreDashboard() {
  const qc = useQueryClient();
  const updatePrices = useServerFn(updateMyPrices);
  const withdrawFn = useServerFn(requestWithdrawal);
  const {
    data: me
  } = useMe();
  const resellerId = me?.profile?.id;
  const storeSlug = me?.profile?.store_slug || me?.reseller?.store_slug;
  const {
    data: pkgs
  } = useQuery({
    queryKey: ["packages-and-prices", resellerId],
    queryFn: async () => {
      if (!resellerId) return [];
      const [{
        data: packages
      }, {
        data: prices
      }] = await Promise.all([supabase.from("packages").select("*").order("display_order"), supabase.from("reseller_prices").select("*").eq("reseller_id", resellerId)]);
      const map = new Map((prices ?? []).map((p) => [p.package_id, Number(p.price)]));
      return (packages ?? []).map((p) => ({
        ...p,
        price: map.get(p.id) ?? Number(p.cost_price)
      }));
    },
    enabled: !!resellerId
  });
  const {
    data: orders
  } = useQuery({
    queryKey: ["reseller-orders", resellerId],
    queryFn: async () => {
      if (!resellerId) return [];
      const {
        data
      } = await supabase.from("orders").select("amount, cost_price, status").eq("reseller_id", resellerId);
      return data ?? [];
    },
    enabled: !!resellerId
  });
  const {
    data: withdrawals
  } = useQuery({
    queryKey: ["my-withdrawals"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("withdrawals").select("*").order("created_at", {
        ascending: false
      });
      return data ?? [];
    }
  });
  const profit = useMemo(() => {
    return (orders ?? []).filter((o) => o.status === "delivered").reduce((s, o) => s + (Number(o.amount) - Number(o.cost_price)), 0);
  }, [orders]);
  const totalPaid = (withdrawals ?? []).filter((w) => w.status === "paid").reduce((s, w) => s + Number(w.amount), 0);
  const pendingWithdrawals = (withdrawals ?? []).filter((w) => w.status === "pending" || w.status === "accepted").reduce((s, w) => s + Number(w.amount), 0);
  const availableProfit = Math.max(0, profit - totalPaid - pendingWithdrawals);
  const [editing, setEditing] = useState({});
  const dirty = Object.keys(editing).length > 0;
  const saveMut = useMutation({
    mutationFn: () => updatePrices({
      data: {
        prices: Object.entries(editing).map(([packageId, v]) => ({
          packageId,
          price: parseFloat(v) || 0
        }))
      }
    }),
    onSuccess: () => {
      toast.success("Prices saved");
      setEditing({});
      qc.invalidateQueries({
        queryKey: ["packages-and-prices"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const [wAmt, setWAmt] = useState("");
  const wMut = useMutation({
    mutationFn: () => withdrawFn({
      data: {
        amount: parseFloat(wAmt)
      }
    }),
    onSuccess: () => {
      toast.success("Withdrawal requested");
      setWAmt("");
      qc.invalidateQueries({
        queryKey: ["my-withdrawals"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const storeUrl = typeof window !== "undefined" ? `${window.location.origin}/s/${storeSlug || "donmac-data-hub"}` : `/s/${storeSlug || "donmac-data-hub"}`;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border bg-card p-5", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs uppercase text-muted-foreground mb-1", children: "Store link" }),
        /* @__PURE__ */ jsx("div", { className: "font-mono text-xs break-all", children: storeUrl }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-3", children: [
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
            navigator.clipboard.writeText(storeUrl);
            toast.success("Copied");
          }, children: [
            /* @__PURE__ */ jsx(Copy, { className: "size-3 mr-1" }),
            "Copy"
          ] }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", asChild: true, children: /* @__PURE__ */ jsxs("a", { href: storeUrl, target: "_blank", rel: "noreferrer", children: [
            /* @__PURE__ */ jsx(ExternalLink, { className: "size-3 mr-1" }),
            "Open"
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border bg-card p-5", children: [
        /* @__PURE__ */ jsx(Wallet, { className: "size-6 mb-2" }),
        /* @__PURE__ */ jsx("div", { className: "text-xs uppercase text-muted-foreground", children: "Withdraw (min GH¢30)" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-2", children: [
          /* @__PURE__ */ jsx(Input, { type: "number", value: wAmt, onChange: (e) => setWAmt(e.target.value), placeholder: "30" }),
          /* @__PURE__ */ jsx(Button, { disabled: wMut.isPending || !wAmt || parseFloat(wAmt) < 30 || parseFloat(wAmt) > availableProfit, onClick: () => wMut.mutate(), children: "Request" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-2", children: [
          "Available for withdrawal: ",
          GHS(availableProfit)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border bg-card p-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "My prices" }),
        dirty && /* @__PURE__ */ jsx(Button, { size: "sm", onClick: () => saveMut.mutate(), disabled: saveMut.isPending, className: "bg-gradient-mtn text-mtn-foreground", children: saveMut.isPending ? "Saving…" : "Save changes" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "text-xs uppercase text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "text-left p-2", children: "Package" }),
          /* @__PURE__ */ jsx("th", { className: "text-right p-2", children: "Network" }),
          /* @__PURE__ */ jsx("th", { className: "text-right p-2", children: "Cost (₵)" }),
          /* @__PURE__ */ jsx("th", { className: "text-right p-2", children: "My price (₵)" }),
          /* @__PURE__ */ jsx("th", { className: "text-right p-2", children: "Profit/unit (₵)" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: (pkgs ?? []).map((p) => {
          const cur = editing[p.id] ?? String(p.price);
          const profitU = (parseFloat(cur) || 0) - Number(p.cost_price);
          return /* @__PURE__ */ jsxs("tr", { className: "border-t", children: [
            /* @__PURE__ */ jsxs("td", { className: "p-2 font-medium", children: [
              p.name,
              " ",
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "(",
                p.network || "MTN",
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "p-2 text-right", children: p.network || "MTN" }),
            /* @__PURE__ */ jsx("td", { className: "p-2 text-right text-muted-foreground", children: p.cost_price }),
            /* @__PURE__ */ jsx("td", { className: "p-2 text-right", children: /* @__PURE__ */ jsx(Input, { className: "w-24 ml-auto text-right", type: "number", step: "0.01", value: cur, onChange: (e) => setEditing({
              ...editing,
              [p.id]: e.target.value
            }) }) }),
            /* @__PURE__ */ jsx("td", { className: `p-2 text-right font-semibold ${profitU >= 0 ? "text-green-600" : "text-red-600"}`, children: profitU.toFixed(2) })
          ] }, p.id);
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border bg-card p-5", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold mb-3", children: "Withdrawal history" }),
      /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "text-xs uppercase text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "text-left p-2", children: "Date" }),
          /* @__PURE__ */ jsx("th", { className: "text-right p-2", children: "Amount (₵)" }),
          /* @__PURE__ */ jsx("th", { className: "text-left p-2", children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          (withdrawals ?? []).map((w) => /* @__PURE__ */ jsxs("tr", { className: "border-t", children: [
            /* @__PURE__ */ jsx("td", { className: "p-2", children: new Date(w.created_at).toLocaleString() }),
            /* @__PURE__ */ jsx("td", { className: "p-2 text-right font-semibold", children: w.amount }),
            /* @__PURE__ */ jsx("td", { className: "p-2 capitalize", children: w.status })
          ] }, w.id)),
          (withdrawals ?? []).length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 3, className: "p-6 text-center text-muted-foreground", children: "No withdrawals yet" }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  MyStorePage as component
};
