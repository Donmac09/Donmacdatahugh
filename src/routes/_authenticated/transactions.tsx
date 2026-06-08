import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { GHS } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "./topups";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/transactions")({ component: TxPage });

function TxPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data } = useQuery({
    queryKey: ["transactions", from, to],
    queryFn: async () => {
      let q = supabase.from("transactions").select("*").order("created_at", { ascending: false });
      if (from) q = q.gte("created_at", new Date(from).toISOString());
      if (to) q = q.lte("created_at", new Date(to + "T23:59:59").toISOString());
      const { data } = await q;
      return data ?? [];
    },
  });
  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "Space Grotesk" }}>Transactions</h1>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="space-y-1"><Label className="text-xs">From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="space-y-1"><Label className="text-xs">To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
      </div>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr><th className="text-left p-3">Date</th><th className="text-left p-3">Type</th><th className="text-left p-3">Description</th><th className="text-right p-3">Amount</th><th className="text-left p-3">Status</th></tr>
            </thead>
            <tbody>
              {(data ?? []).map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3 whitespace-nowrap">{format(new Date(t.created_at), "dd MMM yy, HH:mm")}</td>
                  <td className="p-3 capitalize"><span className="inline-flex items-center gap-1">{t.type === "credit" ? <ArrowDownLeft className="size-3 text-success" /> : <ArrowUpRight className="size-3 text-destructive" />}{t.type}</span></td>
                  <td className="p-3">{t.description}</td>
                  <td className={`p-3 text-right font-bold ${t.type === "credit" ? "text-success" : "text-destructive"}`}>{t.type === "credit" ? "+" : "-"}{GHS(t.amount)}</td>
                  <td className="p-3"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
              {(data ?? []).length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No transactions yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
