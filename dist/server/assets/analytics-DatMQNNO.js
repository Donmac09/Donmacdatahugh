import { jsxs, jsx } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { s as supabase } from "./client-CIJIW76X.js";
import { G as GHS } from "./format-Dvz2fdZm.js";
import { Users, Wallet, Package, TrendingUp } from "lucide-react";
import "@supabase/supabase-js";
function AnalyticsPage() {
  const {
    data
  } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [u, o, tx, wd] = await Promise.all([supabase.from("profiles").select("id, balance"), supabase.from("orders").select("amount, status, created_at"), supabase.from("transactions").select("amount, type"), supabase.from("withdrawals").select("amount, status")]);
      return {
        users: u.data?.length ?? 0,
        totalBalance: (u.data ?? []).reduce((s, p) => s + Number(p.balance), 0),
        orders: o.data?.length ?? 0,
        revenue: (o.data ?? []).filter((x) => x.status === "delivered").reduce((s, x) => s + Number(x.amount), 0),
        pending: (o.data ?? []).filter((x) => x.status === "pending").length,
        topups: (tx.data ?? []).filter((x) => x.type === "credit").reduce((s, x) => s + Number(x.amount), 0),
        withdrawPending: (wd.data ?? []).filter((x) => x.status === "pending").reduce((s, x) => s + Number(x.amount), 0)
      };
    }
  });
  return /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
    /* @__PURE__ */ jsx(Card, { icon: Users, label: "Users", value: data?.users ?? 0 }),
    /* @__PURE__ */ jsx(Card, { icon: Wallet, label: "Wallet liability", value: GHS(data?.totalBalance ?? 0) }),
    /* @__PURE__ */ jsx(Card, { icon: Package, label: "Orders", value: data?.orders ?? 0, sub: `${data?.pending ?? 0} pending` }),
    /* @__PURE__ */ jsx(Card, { icon: TrendingUp, label: "Revenue (delivered)", value: GHS(data?.revenue ?? 0) }),
    /* @__PURE__ */ jsx(Card, { icon: Wallet, label: "Total credits", value: GHS(data?.topups ?? 0) }),
    /* @__PURE__ */ jsx(Card, { icon: Wallet, label: "Pending withdrawals", value: GHS(data?.withdrawPending ?? 0) })
  ] });
}
function Card({
  icon: Icon,
  label,
  value,
  sub
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border bg-card p-5", children: [
    /* @__PURE__ */ jsx(Icon, { className: "size-5 text-mtn mb-2" }),
    /* @__PURE__ */ jsx("div", { className: "text-xs uppercase text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold mt-1", style: {
      fontFamily: "Space Grotesk"
    }, children: value }),
    sub && /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mt-1", children: sub })
  ] });
}
export {
  AnalyticsPage as component
};
