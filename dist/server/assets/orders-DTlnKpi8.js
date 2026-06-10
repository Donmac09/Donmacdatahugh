import { jsxs, jsx } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { A as AppShell } from "./app-shell-Bv0Nrqf5.js";
import { s as supabase } from "./client-CIJIW76X.js";
import { G as GHS } from "./format-Dvz2fdZm.js";
import { S as StatusBadge } from "./router-Si19vHi8.js";
import "@tanstack/react-router";
import "react";
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
import "@radix-ui/react-tooltip";
import "clsx";
import "tailwind-merge";
import "./client.server-D5ro3rAQ.js";
function OrdersPage() {
  const {
    data
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const {
        data: data2
      } = await supabase.from("orders").select("*, packages(label, type)").order("created_at", {
        ascending: false
      });
      return data2 ?? [];
    }
  });
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-4", style: {
      fontFamily: "Space Grotesk"
    }, children: "Orders" }),
    /* @__PURE__ */ jsx("div", { className: "rounded-2xl border bg-card overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-muted text-xs uppercase text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Ref" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Network" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Package" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Phone" }),
        /* @__PURE__ */ jsx("th", { className: "text-right p-3", children: "Amount" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Date" })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        (data ?? []).map((o) => /* @__PURE__ */ jsxs("tr", { className: "border-t", children: [
          /* @__PURE__ */ jsx("td", { className: "p-3 font-mono text-xs", children: o.ref }),
          /* @__PURE__ */ jsx("td", { className: "p-3 uppercase", children: o.network }),
          /* @__PURE__ */ jsx("td", { className: "p-3", children: o.packages?.label }),
          /* @__PURE__ */ jsx("td", { className: "p-3 font-mono", children: o.phone }),
          /* @__PURE__ */ jsx("td", { className: "p-3 text-right font-semibold", children: GHS(o.amount) }),
          /* @__PURE__ */ jsx("td", { className: "p-3", children: /* @__PURE__ */ jsx(StatusBadge, { status: o.status }) }),
          /* @__PURE__ */ jsx("td", { className: "p-3 whitespace-nowrap text-muted-foreground", children: format(new Date(o.created_at), "dd MMM, HH:mm") })
        ] }, o.id)),
        (data ?? []).length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 7, className: "p-8 text-center text-muted-foreground", children: "No orders yet" }) })
      ] })
    ] }) }) })
  ] });
}
export {
  OrdersPage as component
};
