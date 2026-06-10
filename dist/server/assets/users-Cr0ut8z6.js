import { jsxs, jsx } from "react/jsx-runtime";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { u as useServerFn, h as adminAdjustBalance, i as adminSetBlocked, j as adminDeleteUser } from "./donmac.functions-CukCaMJG.js";
import { useState } from "react";
import { s as supabase } from "./client-CIJIW76X.js";
import { B as Button } from "./button-Dbehd1zP.js";
import { I as Input } from "./input-BR2iTU4N.js";
import { L as Label } from "./label-BQVcCpGK.js";
import { D as Dialog, a as DialogTrigger, b as DialogContent, c as DialogHeader, d as DialogTitle } from "./dialog-LbBwVmLq.js";
import { G as GHS } from "./format-Dvz2fdZm.js";
import { toast } from "sonner";
import { CircleCheck, Ban, Trash2, Wallet } from "lucide-react";
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
function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const {
    data
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [{
        data: profiles
      }, {
        data: roles
      }, {
        data: resellers
      }] = await Promise.all([supabase.from("profiles").select("*").order("created_at", {
        ascending: false
      }), supabase.from("user_roles").select("*"), supabase.from("resellers").select("id, store_name")]);
      const roleMap = /* @__PURE__ */ new Map();
      (roles ?? []).forEach((r) => {
        if (!roleMap.has(r.user_id)) roleMap.set(r.user_id, []);
        roleMap.get(r.user_id).push(r.role);
      });
      const resMap = new Map((resellers ?? []).map((r) => [r.id, r.store_name]));
      return (profiles ?? []).map((p) => ({
        ...p,
        roles: roleMap.get(p.id) ?? [],
        reseller_name: p.reseller_id ? resMap.get(p.reseller_id) : null
      }));
    }
  });
  const filtered = (data ?? []).filter((u) => !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search));
  const adjustFn = useServerFn(adminAdjustBalance);
  const blockFn = useServerFn(adminSetBlocked);
  const deleteFn = useServerFn(adminDeleteUser);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Input, { placeholder: "Search by email, name, phone…", value: search, onChange: (e) => setSearch(e.target.value), className: "mb-4 max-w-md" }),
    /* @__PURE__ */ jsx("div", { className: "rounded-2xl border bg-card overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-muted text-xs uppercase text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Name" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Email" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Phone" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Roles" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Reseller" }),
        /* @__PURE__ */ jsx("th", { className: "text-right p-3", children: "Balance" }),
        /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "p-3", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: filtered.map((u) => /* @__PURE__ */ jsxs("tr", { className: "border-t", children: [
        /* @__PURE__ */ jsx("td", { className: "p-3", children: u.full_name ?? "—" }),
        /* @__PURE__ */ jsx("td", { className: "p-3", children: u.email }),
        /* @__PURE__ */ jsx("td", { className: "p-3", children: u.phone ?? "—" }),
        /* @__PURE__ */ jsx("td", { className: "p-3", children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: u.roles.map((r) => /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-muted", children: r }, r)) }) }),
        /* @__PURE__ */ jsx("td", { className: "p-3 text-xs text-muted-foreground", children: u.reseller_name ?? "—" }),
        /* @__PURE__ */ jsx("td", { className: "p-3 text-right font-semibold", children: GHS(u.balance) }),
        /* @__PURE__ */ jsx("td", { className: "p-3", children: u.blocked ? /* @__PURE__ */ jsx("span", { className: "text-destructive font-semibold", children: "Blocked" }) : /* @__PURE__ */ jsx("span", { className: "text-success", children: "Active" }) }),
        /* @__PURE__ */ jsx("td", { className: "p-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 justify-end", children: [
          /* @__PURE__ */ jsx(AdjustDialog, { userId: u.id, onDone: () => qc.invalidateQueries({
            queryKey: ["admin-users"]
          }), fn: adjustFn }),
          /* @__PURE__ */ jsx(Button, { size: "icon", variant: "outline", onClick: async () => {
            await blockFn({
              data: {
                userId: u.id,
                blocked: !u.blocked
              }
            });
            toast.success(u.blocked ? "Unblocked" : "Blocked");
            qc.invalidateQueries({
              queryKey: ["admin-users"]
            });
          }, children: u.blocked ? /* @__PURE__ */ jsx(CircleCheck, { className: "size-4" }) : /* @__PURE__ */ jsx(Ban, { className: "size-4" }) }),
          /* @__PURE__ */ jsx(Button, { size: "icon", variant: "outline", onClick: async () => {
            if (!confirm("Delete this user permanently?")) return;
            await deleteFn({
              data: {
                userId: u.id
              }
            });
            toast.success("Deleted");
            qc.invalidateQueries({
              queryKey: ["admin-users"]
            });
          }, children: /* @__PURE__ */ jsx(Trash2, { className: "size-4 text-destructive" }) })
        ] }) })
      ] }, u.id)) })
    ] }) }) })
  ] });
}
function AdjustDialog({
  userId,
  fn,
  onDone
}) {
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState("credit");
  return /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { size: "icon", variant: "outline", children: /* @__PURE__ */ jsx(Wallet, { className: "size-4" }) }) }),
    /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Adjust balance" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: type === "credit" ? "default" : "outline", onClick: () => setType("credit"), children: "Credit" }),
          /* @__PURE__ */ jsx(Button, { variant: type === "debit" ? "default" : "outline", onClick: () => setType("debit"), children: "Debit" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Amount" }),
          /* @__PURE__ */ jsx(Input, { type: "number", step: "0.01", value: delta, onChange: (e) => setDelta(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Note" }),
          /* @__PURE__ */ jsx(Input, { value: note, onChange: (e) => setNote(e.target.value) })
        ] }),
        /* @__PURE__ */ jsx(Button, { onClick: async () => {
          const amt = parseFloat(delta) || 0;
          const signed = type === "credit" ? amt : -amt;
          try {
            await fn({
              data: {
                userId,
                delta: signed,
                note: note || (type === "credit" ? "credit" : "debit")
              }
            });
            toast.success("Done");
            setOpen(false);
            onDone();
          } catch (e) {
            toast.error(e.message);
          }
        }, className: "w-full bg-gradient-mtn text-mtn-foreground", children: "Apply" })
      ] })
    ] })
  ] });
}
export {
  UsersPage as component
};
