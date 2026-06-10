import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { u as useServerFn, f as adminUpdateWithdrawal } from "./donmac.functions-CukCaMJG.js";
import { s as supabase } from "./client-CIJIW76X.js";
import { B as Button } from "./button-Dbehd1zP.js";
import { G as GHS } from "./format-Dvz2fdZm.js";
import { toast } from "sonner";
import "react";
import "@tanstack/react-router";
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
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./router-Si19vHi8.js";
import "@radix-ui/react-tooltip";
import "clsx";
import "tailwind-merge";
import "./client.server-D5ro3rAQ.js";
function WPage() {
  const qc = useQueryClient();
  const fn = useServerFn(adminUpdateWithdrawal);
  const {
    data
  } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: async () => (await supabase.from("withdrawals").select("*, resellers(store_name), profiles(email, full_name)").order("created_at", {
      ascending: false
    })).data ?? []
  });
  async function setStatus(id, status) {
    try {
      await fn({
        data: {
          id,
          status
        }
      });
      toast.success("Updated");
      qc.invalidateQueries({
        queryKey: ["admin-withdrawals"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  }
  return /* @__PURE__ */ jsx("div", { className: "rounded-2xl border bg-card overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsx("thead", { className: "bg-muted text-xs uppercase text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Reseller" }),
      /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Email" }),
      /* @__PURE__ */ jsx("th", { className: "text-right p-3", children: "Amount" }),
      /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Status" }),
      /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Date" }),
      /* @__PURE__ */ jsx("th", { className: "p-3", children: "Actions" })
    ] }) }),
    /* @__PURE__ */ jsxs("tbody", { children: [
      (data ?? []).map((w) => /* @__PURE__ */ jsxs("tr", { className: "border-t", children: [
        /* @__PURE__ */ jsx("td", { className: "p-3", children: w.resellers?.store_name }),
        /* @__PURE__ */ jsx("td", { className: "p-3 text-xs", children: w.profiles?.email }),
        /* @__PURE__ */ jsx("td", { className: "p-3 text-right font-semibold", children: GHS(w.amount) }),
        /* @__PURE__ */ jsx("td", { className: "p-3 capitalize", children: w.status }),
        /* @__PURE__ */ jsx("td", { className: "p-3 whitespace-nowrap", children: new Date(w.created_at).toLocaleString() }),
        /* @__PURE__ */ jsx("td", { className: "p-3", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-1 justify-end flex-wrap", children: [
          w.status === "pending" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Button, { size: "sm", onClick: () => setStatus(w.id, "accepted"), children: "Accept" }),
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => setStatus(w.id, "rejected"), children: "Reject" })
          ] }),
          w.status === "accepted" && /* @__PURE__ */ jsx(Button, { size: "sm", className: "bg-success text-success-foreground", onClick: () => setStatus(w.id, "paid"), children: "Mark as paid" })
        ] }) })
      ] }, w.id)),
      (data ?? []).length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "p-8 text-center text-muted-foreground", children: "No withdrawal requests" }) })
    ] })
  ] }) }) });
}
export {
  WPage as component
};
