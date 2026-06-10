import { jsxs, jsx } from "react/jsx-runtime";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { u as useServerFn, k as adminListTopups, l as adminDeleteTopup } from "./donmac.functions-CukCaMJG.js";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { I as Input } from "./input-BR2iTU4N.js";
import { L as Label } from "./label-BQVcCpGK.js";
import { B as Button } from "./button-Dbehd1zP.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Ccayn0jf.js";
import { G as GHS } from "./format-Dvz2fdZm.js";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import "./router-Si19vHi8.js";
import "@radix-ui/react-tooltip";
import "clsx";
import "tailwind-merge";
import "./client-CIJIW76X.js";
import "@supabase/supabase-js";
import "class-variance-authority";
import "./client.server-D5ro3rAQ.js";
import "@radix-ui/react-label";
import "@radix-ui/react-slot";
import "@radix-ui/react-select";
function todayStr() {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function AdminTopupsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListTopups);
  const delFn = useServerFn(adminDeleteTopup);
  const [tx, setTx] = useState("");
  const [from, setFrom] = useState(todayStr());
  const [to, setTo] = useState(todayStr());
  const [status, setStatus] = useState("all");
  const {
    data: all,
    isLoading
  } = useQuery({
    queryKey: ["admin-topups"],
    queryFn: () => listFn(),
    refetchInterval: 1e4
  });
  const rows = useMemo(() => {
    let list = all ?? [];
    if (tx) list = list.filter((t) => (t.transaction_id ?? "").toLowerCase().includes(tx.toLowerCase()));
    if (from) {
      const d = (/* @__PURE__ */ new Date(from + "T00:00:00")).getTime();
      list = list.filter((t) => new Date(t.created_at).getTime() >= d);
    }
    if (to) {
      const d = (/* @__PURE__ */ new Date(to + "T23:59:59")).getTime();
      list = list.filter((t) => new Date(t.created_at).getTime() <= d);
    }
    if (status === "claimed") list = list.filter((t) => t.status === "credited");
    if (status === "unclaimed") list = list.filter((t) => t.status !== "credited");
    return list;
  }, [all, tx, from, to, status]);
  async function del(id) {
    if (!confirm("Delete this top-up record?")) return;
    try {
      await delFn({
        data: {
          topupId: id
        }
      });
      toast.success("Deleted");
      qc.invalidateQueries({
        queryKey: ["admin-topups"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Transaction ID" }),
        /* @__PURE__ */ jsx(Input, { value: tx, onChange: (e) => setTx(e.target.value), placeholder: "search…" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "From" }),
        /* @__PURE__ */ jsx(Input, { type: "date", value: from, onChange: (e) => setFrom(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "To" }),
        /* @__PURE__ */ jsx(Input, { type: "date", value: to, onChange: (e) => setTo(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Status" }),
        /* @__PURE__ */ jsxs(Select, { value: status, onValueChange: setStatus, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "claimed", children: "Claimed" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "unclaimed", children: "Unclaimed" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-2xl border bg-card overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-muted text-xs uppercase text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Transaction ID" }),
        /* @__PURE__ */ jsx("th", { className: "text-right p-3", children: "Amount" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Network" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Claimed by" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Date & time" }),
        /* @__PURE__ */ jsx("th", { className: "p-3" })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        isLoading && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 7, className: "p-8 text-center text-muted-foreground", children: "Loading…" }) }),
        !isLoading && rows.map((t) => {
          const claimed = t.status === "credited";
          return /* @__PURE__ */ jsxs("tr", { className: "border-t", children: [
            /* @__PURE__ */ jsx("td", { className: "p-3 font-mono text-xs", children: t.transaction_id ?? "—" }),
            /* @__PURE__ */ jsx("td", { className: "p-3 text-right font-semibold", children: GHS(t.amount) }),
            /* @__PURE__ */ jsx("td", { className: "p-3 uppercase", children: t.network ?? "MTN" }),
            /* @__PURE__ */ jsx("td", { className: "p-3", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded-full text-xs font-semibold ${claimed ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`, children: claimed ? "Claimed" : "Unclaimed" }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3 text-xs", children: claimed ? t.profile?.email ?? "—" : "—" }),
            /* @__PURE__ */ jsx("td", { className: "p-3 whitespace-nowrap", children: format(new Date(t.created_at), "dd MMM yyyy, HH:mm") }),
            /* @__PURE__ */ jsx("td", { className: "p-3", children: /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => del(t.id), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" }) }) })
          ] }, t.id);
        }),
        !isLoading && rows.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 7, className: "p-8 text-center text-muted-foreground", children: "No top-ups match these filters" }) })
      ] })
    ] }) }) })
  ] });
}
export {
  AdminTopupsPage as component
};
