import { jsxs, jsx } from "react/jsx-runtime";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { u as useServerFn, s as adminUpdateOrderStatus, t as adminDeleteOrder, v as adminListOrders } from "./donmac.functions-CukCaMJG.js";
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { s as supabase } from "./client-CIJIW76X.js";
import { I as Input } from "./input-BR2iTU4N.js";
import { L as Label } from "./label-BQVcCpGK.js";
import { B as Button } from "./button-Dbehd1zP.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Ccayn0jf.js";
import { G as GHS } from "./format-Dvz2fdZm.js";
import { S as StatusBadge } from "./router-Si19vHi8.js";
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
import "@supabase/supabase-js";
import "@radix-ui/react-label";
import "class-variance-authority";
import "@radix-ui/react-slot";
import "@radix-ui/react-select";
import "@radix-ui/react-tooltip";
import "clsx";
import "tailwind-merge";
import "./client.server-D5ro3rAQ.js";
function todayStr() {
  const d = /* @__PURE__ */ new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function AdminOrdersPage() {
  const qc = useQueryClient();
  const updateFn = useServerFn(adminUpdateOrderStatus);
  const deleteFn = useServerFn(adminDeleteOrder);
  const listFn = useServerFn(adminListOrders);
  const [phone, setPhone] = useState("");
  const [from, setFrom] = useState(todayStr());
  const [to, setTo] = useState(todayStr());
  const [pkg, setPkg] = useState("all");
  const [status, setStatus] = useState("all");
  useEffect(() => {
    const t = setInterval(() => {
      const s = todayStr();
      setFrom((f) => f === to && f !== s ? s : f);
      setTo((v) => v !== s && v === from ? s : v);
    }, 6e4);
    return () => clearInterval(t);
  }, [to]);
  const {
    data: pkgs
  } = useQuery({
    queryKey: ["pkgs-list"],
    queryFn: async () => (await supabase.from("packages").select("id, label")).data ?? []
  });
  const {
    data: allOrders,
    isLoading
  } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => listFn(),
    refetchInterval: 1e4
  });
  const orders = useMemo(() => {
    let list = allOrders ?? [];
    if (phone) list = list.filter((o) => (o.phone ?? "").includes(phone));
    if (from) {
      const d = (/* @__PURE__ */ new Date(from + "T00:00:00")).getTime();
      list = list.filter((o) => new Date(o.created_at).getTime() >= d);
    }
    if (to) {
      const d = (/* @__PURE__ */ new Date(to + "T23:59:59")).getTime();
      list = list.filter((o) => new Date(o.created_at).getTime() <= d);
    }
    if (pkg !== "all") list = list.filter((o) => o.package_id === pkg);
    if (status !== "all") list = list.filter((o) => o.status === status);
    return list;
  }, [allOrders, phone, from, to, pkg, status]);
  const {
    data: settings
  } = useQuery({
    queryKey: ["app-settings"],
    queryFn: async () => (await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle()).data
  });
  useEffect(() => {
    if (!settings?.auto_deliver_enabled) return;
    const t = setInterval(async () => {
      const cutoff = new Date(Date.now() - settings.auto_deliver_minutes * 6e4).toISOString();
      const {
        data: pendings
      } = await supabase.from("orders").select("id, created_at, status").lte("created_at", cutoff).in("status", ["pending", "processing"]);
      for (const o of pendings ?? []) {
        await updateFn({
          data: {
            orderId: o.id,
            status: "delivered"
          }
        }).catch(() => {
        });
      }
      qc.invalidateQueries({
        queryKey: ["admin-orders"]
      });
    }, 3e4);
    return () => clearInterval(t);
  }, [settings, updateFn, qc]);
  async function setStatusFor(id, s) {
    try {
      await updateFn({
        data: {
          orderId: id,
          status: s
        }
      });
      toast.success("Updated");
      qc.invalidateQueries({
        queryKey: ["admin-orders"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  }
  async function del(id, ref) {
    if (!confirm(`Delete order ${ref}? This cannot be undone.`)) return;
    try {
      await deleteFn({
        data: {
          orderId: id
        }
      });
      toast.success("Order deleted");
      qc.invalidateQueries({
        queryKey: ["admin-orders"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Phone" }),
        /* @__PURE__ */ jsx(Input, { value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "024…" })
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
        /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Package" }),
        /* @__PURE__ */ jsxs(Select, { value: pkg, onValueChange: setPkg, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All packages" }),
            (pkgs ?? []).map((p) => /* @__PURE__ */ jsx(SelectItem, { value: p.id, children: p.label }, p.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Status" }),
        /* @__PURE__ */ jsxs(Select, { value: status, onValueChange: setStatus, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "pending", children: "Pending" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "processing", children: "Processing" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "delivered", children: "Delivered" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "failed", children: "Failed" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-2xl border bg-card overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-muted text-xs uppercase text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Ref" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Network" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Package" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Phone" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "User" }),
        /* @__PURE__ */ jsx("th", { className: "text-right p-3", children: "Amount" }),
        /* @__PURE__ */ jsx("th", { className: "text-right p-3", children: "Profit" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Date" }),
        /* @__PURE__ */ jsx("th", { className: "p-3", children: "Action" }),
        /* @__PURE__ */ jsx("th", { className: "p-3" })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        isLoading && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 11, className: "p-8 text-center text-muted-foreground", children: "Loading…" }) }),
        !isLoading && orders.map((o) => /* @__PURE__ */ jsxs("tr", { className: "border-t", children: [
          /* @__PURE__ */ jsx("td", { className: "p-3 font-mono text-xs", children: o.ref }),
          /* @__PURE__ */ jsx("td", { className: "p-3 uppercase", children: o.network }),
          /* @__PURE__ */ jsx("td", { className: "p-3", children: o.packages?.label }),
          /* @__PURE__ */ jsx("td", { className: "p-3 font-mono", children: o.phone }),
          /* @__PURE__ */ jsx("td", { className: "p-3 text-xs", children: o.profile?.email ?? "—" }),
          /* @__PURE__ */ jsx("td", { className: "p-3 text-right font-semibold", children: GHS(o.amount) }),
          /* @__PURE__ */ jsx("td", { className: "p-3 text-right font-semibold text-success", children: GHS(o.profit ?? 0) }),
          /* @__PURE__ */ jsx("td", { className: "p-3", children: /* @__PURE__ */ jsx(StatusBadge, { status: o.status }) }),
          /* @__PURE__ */ jsx("td", { className: "p-3 whitespace-nowrap", children: format(new Date(o.created_at), "dd MMM, HH:mm") }),
          /* @__PURE__ */ jsx("td", { className: "p-3", children: /* @__PURE__ */ jsxs(Select, { value: o.status, onValueChange: (v) => setStatusFor(o.id, v), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "h-8 w-32", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "pending", children: "Pending" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "processing", children: "Processing" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "delivered", children: "Delivered" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "failed", children: "Failed" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "p-3", children: /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => del(o.id, o.ref), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" }) }) })
        ] }, o.id)),
        !isLoading && orders.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 11, className: "p-8 text-center text-muted-foreground", children: "No orders match these filters" }) })
      ] })
    ] }) }) })
  ] });
}
export {
  AdminOrdersPage as component
};
