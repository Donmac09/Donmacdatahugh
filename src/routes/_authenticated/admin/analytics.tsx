import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GHS } from "@/lib/format";
import { Users, Package, Wallet, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const { data } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [u, o, tx, wd] = await Promise.all([
        supabase.from("profiles").select("id, balance"),
        supabase.from("orders").select("amount, status, created_at"),
        supabase.from("transactions").select("amount, type"),
        supabase.from("withdrawals").select("amount, status"),
      ]);
      return {
        users: u.data?.length ?? 0,
        totalBalance: (u.data ?? []).reduce((s, p) => s + Number(p.balance), 0),
        orders: o.data?.length ?? 0,
        revenue: (o.data ?? []).filter((x) => x.status === "delivered").reduce((s, x) => s + Number(x.amount), 0),
        pending: (o.data ?? []).filter((x) => x.status === "pending").length,
        topups: (tx.data ?? []).filter((x) => x.type === "credit").reduce((s, x) => s + Number(x.amount), 0),
        withdrawPending: (wd.data ?? []).filter((x) => x.status === "pending").reduce((s, x) => s + Number(x.amount), 0),
      };
    },
  });
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card icon={Users} label="Users" value={data?.users ?? 0} />
      <Card icon={Wallet} label="Wallet liability" value={GHS(data?.totalBalance ?? 0)} />
      <Card icon={Package} label="Orders" value={data?.orders ?? 0} sub={`${data?.pending ?? 0} pending`} />
      <Card icon={TrendingUp} label="Revenue (delivered)" value={GHS(data?.revenue ?? 0)} />
      <Card icon={Wallet} label="Total credits" value={GHS(data?.topups ?? 0)} />
      <Card icon={Wallet} label="Pending withdrawals" value={GHS(data?.withdrawPending ?? 0)} />
    </div>
  );
}

function Card({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <Icon className="size-5 text-mtn mb-2" />
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1" style={{ fontFamily: "Space Grotesk" }}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}
