import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { A as AppShell } from "./app-shell-Bv0Nrqf5.js";
import { s as supabase } from "./client-CIJIW76X.js";
import { G as GHS } from "./format-Dvz2fdZm.js";
import { I as Input } from "./input-BR2iTU4N.js";
import { L as Label } from "./label-BQVcCpGK.js";
import { B as Badge } from "./router-Si19vHi8.js";
import "@tanstack/react-router";
import "./donmac.functions-CukCaMJG.js";
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
import "sonner";
import "zustand";
import "zustand/middleware";
import "lucide-react";
import "framer-motion";
import "./button-Dbehd1zP.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@supabase/supabase-js";
import "@radix-ui/react-label";
import "@radix-ui/react-tooltip";
import "clsx";
import "tailwind-merge";
import "./client.server-D5ro3rAQ.js";
function TopupsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const {
    data
  } = useQuery({
    queryKey: ["topups", from, to],
    queryFn: async () => {
      let q = supabase.from("topups").select("*").order("created_at", {
        ascending: false
      });
      if (from) q = q.gte("created_at", new Date(from).toISOString());
      if (to) q = q.lte("created_at", (/* @__PURE__ */ new Date(to + "T23:59:59")).toISOString());
      const {
        data: data2
      } = await q;
      return data2 ?? [];
    }
  });
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-4", style: {
      fontFamily: "Space Grotesk"
    }, children: "Top ups" }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "From" }),
        /* @__PURE__ */ jsx(Input, { type: "date", value: from, onChange: (e) => setFrom(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "To" }),
        /* @__PURE__ */ jsx(Input, { type: "date", value: to, onChange: (e) => setTo(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-2xl border bg-card overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-muted text-xs uppercase text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Date" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Txn ID" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Method" }),
        /* @__PURE__ */ jsx("th", { className: "text-right p-3", children: "Amount" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Status" })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        (data ?? []).map((t) => /* @__PURE__ */ jsxs("tr", { className: "border-t", children: [
          /* @__PURE__ */ jsx("td", { className: "p-3 whitespace-nowrap", children: format(new Date(t.created_at), "dd MMM yy, HH:mm") }),
          /* @__PURE__ */ jsx("td", { className: "p-3 font-mono text-xs", children: t.transaction_id ?? t.ref_code }),
          /* @__PURE__ */ jsx("td", { className: "p-3", children: t.method }),
          /* @__PURE__ */ jsx("td", { className: "p-3 text-right font-semibold", children: GHS(t.amount ?? 0) }),
          /* @__PURE__ */ jsx("td", { className: "p-3", children: /* @__PURE__ */ jsx(StatusBadge, { status: t.status }) })
        ] }, t.id)),
        (data ?? []).length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 5, className: "p-8 text-center text-muted-foreground", children: "No top-ups yet" }) })
      ] })
    ] }) }) })
  ] });
}
function StatusBadge({
  status
}) {
  const map = {
    credited: "bg-success/15 text-success",
    success: "bg-success/15 text-success",
    pending: "bg-warning/30 text-warning-foreground",
    processing: "bg-info/20 text-info",
    delivered: "bg-success/15 text-success",
    failed: "bg-destructive/15 text-destructive",
    rejected: "bg-destructive/15 text-destructive",
    paid: "bg-success/15 text-success",
    accepted: "bg-success/15 text-success"
  };
  return /* @__PURE__ */ jsx(Badge, { variant: "outline", className: `${map[status] ?? ""} border-0 capitalize`, children: status });
}
export {
  StatusBadge,
  TopupsPage as component
};
