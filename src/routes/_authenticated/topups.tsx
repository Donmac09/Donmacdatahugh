import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { GHS } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/topups")({ component: TopupsPage });

function TopupsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data } = useQuery({
    queryKey: ["topups", from, to],
    queryFn: async () => {
      let q = supabase.from("topups").select("*").order("created_at", { ascending: false });
      if (from) q = q.gte("created_at", new Date(from).toISOString());
      if (to) q = q.lte("created_at", new Date(to + "T23:59:59").toISOString());
      const { data } = await q;
      return data ?? [];
    },
  });
  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "Space Grotesk" }}>Top ups</h1>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="space-y-1"><Label className="text-xs">From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="space-y-1"><Label className="text-xs">To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
      </div>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr><th className="text-left p-3">Date</th><th className="text-left p-3">Txn ID</th><th className="text-left p-3">Method</th><th className="text-right p-3">Amount</th><th className="text-left p-3">Status</th></tr>
            </thead>
            <tbody>
              {(data ?? []).map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3 whitespace-nowrap">{format(new Date(t.created_at), "dd MMM yy, HH:mm")}</td>
                  <td className="p-3 font-mono text-xs">{t.transaction_id ?? t.ref_code}</td>
                  <td className="p-3">{t.method}</td>
                  <td className="p-3 text-right font-semibold">{GHS(t.amount ?? 0)}</td>
                  <td className="p-3"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
              {(data ?? []).length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No top-ups yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    credited: "bg-success/15 text-success", success: "bg-success/15 text-success",
    pending: "bg-warning/30 text-warning-foreground", processing: "bg-info/20 text-info",
    delivered: "bg-success/15 text-success",
    failed: "bg-destructive/15 text-destructive", rejected: "bg-destructive/15 text-destructive",
    paid: "bg-success/15 text-success", accepted: "bg-success/15 text-success",
  };
  return <Badge variant="outline" className={`${map[status] ?? ""} border-0 capitalize`}>{status}</Badge>;
}
export { StatusBadge };
