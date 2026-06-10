import { jsxs, jsx } from "react/jsx-runtime";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { u as useServerFn, n as adminCreateReseller } from "./donmac.functions-CukCaMJG.js";
import { useState } from "react";
import { s as supabase } from "./client-CIJIW76X.js";
import { B as Button } from "./button-Dbehd1zP.js";
import { I as Input } from "./input-BR2iTU4N.js";
import { L as Label } from "./label-BQVcCpGK.js";
import { D as Dialog, a as DialogTrigger, b as DialogContent, c as DialogHeader, d as DialogTitle } from "./dialog-LbBwVmLq.js";
import { toast } from "sonner";
import { Plus, ExternalLink } from "lucide-react";
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
import "@radix-ui/react-label";
import "@radix-ui/react-dialog";
function RPage() {
  const qc = useQueryClient();
  const fn = useServerFn(adminCreateReseller);
  const {
    data
  } = useQuery({
    queryKey: ["admin-resellers"],
    queryFn: async () => {
      const [{
        data: resellers
      }, {
        data: orders
      }] = await Promise.all([supabase.from("resellers").select("*, profiles(email, phone, balance, blocked)").order("created_at", {
        ascending: false
      }), supabase.from("orders").select("reseller_id, amount, cost_price, status")]);
      const profitMap = /* @__PURE__ */ new Map();
      for (const order of orders ?? []) {
        if (!order.reseller_id || order.status !== "delivered") continue;
        const current = profitMap.get(order.reseller_id) ?? 0;
        profitMap.set(order.reseller_id, current + (Number(order.amount) - Number(order.cost_price)));
      }
      return (resellers ?? []).map((r) => ({
        ...r,
        profit: profitMap.get(r.id) ?? 0
      }));
    }
  });
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  async function create() {
    try {
      await fn({
        data: {
          email,
          phone,
          fullName,
          password
        }
      });
      toast.success("Reseller created. They can now log in and create their store.");
      setOpen(false);
      setEmail("");
      setPhone("");
      setFullName("");
      setPassword("");
      qc.invalidateQueries({
        queryKey: ["admin-resellers"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "flex justify-end mb-4", children: /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { className: "bg-gradient-mtn text-mtn-foreground", children: [
        /* @__PURE__ */ jsx(Plus, { className: "size-4 mr-1" }),
        "Add reseller"
      ] }) }),
      /* @__PURE__ */ jsxs(DialogContent, { children: [
        /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Create reseller" }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Full name" }),
            /* @__PURE__ */ jsx(Input, { value: fullName, onChange: (e) => setFullName(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Email" }),
            /* @__PURE__ */ jsx(Input, { type: "email", value: email, onChange: (e) => setEmail(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Phone" }),
            /* @__PURE__ */ jsx(Input, { value: phone, onChange: (e) => setPhone(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Password" }),
            /* @__PURE__ */ jsx(Input, { type: "password", value: password, onChange: (e) => setPassword(e.target.value) })
          ] }),
          /* @__PURE__ */ jsx(Button, { onClick: create, className: "w-full bg-gradient-mtn text-mtn-foreground", children: "Create" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "rounded-2xl border bg-card overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-muted text-xs uppercase text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Store" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Email" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Phone" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "WhatsApp" }),
        /* @__PURE__ */ jsx("th", { className: "text-right p-3", children: "Profit" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Slug" }),
        /* @__PURE__ */ jsx("th", { className: "p-3" })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        (data ?? []).map((r) => /* @__PURE__ */ jsxs("tr", { className: "border-t", children: [
          /* @__PURE__ */ jsx("td", { className: "p-3 font-semibold", children: r.store_name }),
          /* @__PURE__ */ jsx("td", { className: "p-3", children: r.profiles?.email }),
          /* @__PURE__ */ jsx("td", { className: "p-3", children: r.profiles?.phone }),
          /* @__PURE__ */ jsx("td", { className: "p-3", children: r.whatsapp }),
          /* @__PURE__ */ jsxs("td", { className: "p-3 text-right font-semibold", children: [
            "¢",
            Number(r.profit ?? 0).toFixed(2)
          ] }),
          /* @__PURE__ */ jsxs("td", { className: "p-3 font-mono text-xs", children: [
            "/s/",
            r.slug
          ] }),
          /* @__PURE__ */ jsx("td", { className: "p-3", children: /* @__PURE__ */ jsxs("a", { href: `/s/${r.slug}`, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1 text-xs underline", children: [
            /* @__PURE__ */ jsx(ExternalLink, { className: "size-3" }),
            "Open"
          ] }) })
        ] }, r.id)),
        (data ?? []).length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 7, className: "p-8 text-center text-muted-foreground", children: "No resellers yet" }) })
      ] })
    ] }) }) })
  ] });
}
export {
  RPage as component
};
