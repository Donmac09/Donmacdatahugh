import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GHS } from "@/lib/format";
import { adminUpdateOrderStatus, adminDeleteOrder, adminListOrders } from "@/lib/api/donmac.functions";
import { StatusBadge } from "../topups";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/orders")({ component: AdminOrdersPage });

function todayStr() {
  const d = new Date();
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
  const [pkg, setPkg] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  // Keep "today" rolling as the day changes (page open across midnight)
  useEffect(() => {
    const t = setInterval(() => {
      const s = todayStr();
      setFrom((f) => (f === to && f !== s ? s : f));
      setTo((v) => (v !== s && v === from ? s : v));
    }, 60_000);
    return () => clearInterval(t);
  }, [to]);

  const { data: pkgs } = useQuery({
    queryKey: ["pkgs-list"],
    queryFn: async () => (await supabase.from("packages").select("id, label")).data ?? [],
  });

  const { data: allOrders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => listFn(),
    refetchInterval: 10_000,
  });

  const orders = useMemo(() => {
    let list = allOrders ?? [];
    if (phone) list = list.filter((o: any) => (o.phone ?? "").includes(phone));
    if (from) {
      const d = new Date(from + "T00:00:00").getTime();
      list = list.filter((o: any) => new Date(o.created_at).getTime() >= d);
    }
    if (to) {
      const d = new Date(to + "T23:59:59").getTime();
      list = list.filter((o: any) => new Date(o.created_at).getTime() <= d);
    }
    if (pkg !== "all") list = list.filter((o: any) => o.package_id === pkg);
    if (status !== "all") list = list.filter((o: any) => o.status === status);
    return list;
  }, [allOrders, phone, from, to, pkg, status]);

  // Auto-deliver
  const { data: settings } = useQuery({
    queryKey: ["app-settings"],
    queryFn: async () =>
      (await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle()).data,
  });
  useEffect(() => {
    if (!settings?.auto_deliver_enabled) return;
    const t = setInterval(async () => {
      const cutoff = new Date(Date.now() - settings.auto_deliver_minutes * 60_000).toISOString();
      const { data: pendings } = await supabase
        .from("orders")
        .select("id, created_at, status")
        .lte("created_at", cutoff)
        .in("status", ["pending", "processing"]);
      for (const o of pendings ?? []) {
        await updateFn({ data: { orderId: o.id, status: "delivered" } }).catch(() => {});
      }
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    }, 30_000);
    return () => clearInterval(t);
  }, [settings, updateFn, qc]);

  async function setStatusFor(id: string, s: any) {
    try {
      await updateFn({ data: { orderId: id, status: s } });
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function del(id: string, ref: string) {
    if (!confirm(`Delete order ${ref}? This cannot be undone.`)) return;
    try {
      await deleteFn({ data: { orderId: id } });
      toast.success("Order deleted");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <div><Label className="text-xs">Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="024…" /></div>
        <div><Label className="text-xs">From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><Label className="text-xs">To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div><Label className="text-xs">Package</Label>
          <Select value={pkg} onValueChange={setPkg}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All packages</SelectItem>
              {(pkgs ?? []).map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div><Label className="text-xs">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground"><tr>
              <th className="text-left p-3">Ref</th><th className="text-left p-3">Network</th><th className="text-left p-3">Package</th>
              <th className="text-left p-3">Phone</th><th className="text-left p-3">User</th><th className="text-right p-3">Amount</th>
              <th className="text-right p-3">Profit</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th><th className="p-3">Action</th><th className="p-3"></th>
            </tr></thead>
            <tbody>
              {isLoading && <tr><td colSpan={11} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && orders.map((o: any) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{o.ref}</td>
                  <td className="p-3 uppercase">{o.network}</td>
                  <td className="p-3">{o.packages?.label}</td>
                  <td className="p-3 font-mono">{o.phone}</td>
                  <td className="p-3 text-xs">{o.profile?.email ?? "—"}</td>
                  <td className="p-3 text-right font-semibold">{GHS(o.amount)}</td>
                  <td className="p-3 text-right font-semibold text-success">{GHS(o.profit ?? 0)}</td>
                  <td className="p-3"><StatusBadge status={o.status} /></td>
                  <td className="p-3 whitespace-nowrap">{format(new Date(o.created_at), "dd MMM, HH:mm")}</td>
                  <td className="p-3">
                    <Select value={o.status} onValueChange={(v) => setStatusFor(o.id, v)}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3">
                    <Button size="icon" variant="ghost" onClick={() => del(o.id, o.ref)} className="text-destructive hover:text-destructive">
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {!isLoading && orders.length === 0 && (
                <tr><td colSpan={11} className="p-8 text-center text-muted-foreground">No orders match these filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
