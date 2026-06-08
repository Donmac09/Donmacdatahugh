import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GHS } from "@/lib/format";
import { adminListTopups, adminDeleteTopup } from "@/lib/api/donmac.functions";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/topups")({ component: AdminTopupsPage });

function todayStr() {
  const d = new Date();
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

  const { data: all, isLoading } = useQuery({
    queryKey: ["admin-topups"],
    queryFn: () => listFn(),
    refetchInterval: 10_000,
  });

  const rows = useMemo(() => {
    let list = all ?? [];
    if (tx) list = list.filter((t: any) => (t.transaction_id ?? "").toLowerCase().includes(tx.toLowerCase()));
    if (from) {
      const d = new Date(from + "T00:00:00").getTime();
      list = list.filter((t: any) => new Date(t.created_at).getTime() >= d);
    }
    if (to) {
      const d = new Date(to + "T23:59:59").getTime();
      list = list.filter((t: any) => new Date(t.created_at).getTime() <= d);
    }
    if (status === "claimed") list = list.filter((t: any) => t.status === "credited");
    if (status === "unclaimed") list = list.filter((t: any) => t.status !== "credited");
    return list;
  }, [all, tx, from, to, status]);

  async function del(id: string) {
    if (!confirm("Delete this top-up record?")) return;
    try {
      await delFn({ data: { topupId: id } });
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-topups"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div><Label className="text-xs">Transaction ID</Label><Input value={tx} onChange={(e) => setTx(e.target.value)} placeholder="search…" /></div>
        <div><Label className="text-xs">From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><Label className="text-xs">To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div><Label className="text-xs">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="claimed">Claimed</SelectItem>
              <SelectItem value="unclaimed">Unclaimed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground"><tr>
              <th className="text-left p-3">Transaction ID</th>
              <th className="text-right p-3">Amount</th>
              <th className="text-left p-3">Network</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Claimed by</th>
              <th className="text-left p-3">Date &amp; time</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && rows.map((t: any) => {
                const claimed = t.status === "credited";
                return (
                  <tr key={t.id} className="border-t">
                    <td className="p-3 font-mono text-xs">{t.transaction_id ?? "—"}</td>
                    <td className="p-3 text-right font-semibold">{GHS(t.amount)}</td>
                    <td className="p-3 uppercase">{t.network ?? "MTN"}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${claimed ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                        {claimed ? "Claimed" : "Unclaimed"}
                      </span>
                    </td>
                    <td className="p-3 text-xs">{claimed ? (t.profile?.email ?? "—") : "—"}</td>
                    <td className="p-3 whitespace-nowrap">{format(new Date(t.created_at), "dd MMM yyyy, HH:mm")}</td>
                    <td className="p-3">
                      <Button size="icon" variant="ghost" onClick={() => del(t.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && rows.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No top-ups match these filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
