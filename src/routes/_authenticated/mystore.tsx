import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell, useMe } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { GHS } from "@/lib/format";
import { createMyStore, updateMyPrices, requestWithdrawal } from "@/lib/api/donmac.functions";
import { toast } from "sonner";
import { Copy, ExternalLink, Wallet, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/mystore")({ component: MyStorePage });

function MyStorePage() {
  const { data: me, refetch } = useMe();
  if (me && !me.roles.includes("reseller")) {
    throw redirect({ to: "/dashboard" });
  }
  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "Space Grotesk" }}>My Store</h1>
      {!me?.reseller ? <CreateStoreForm onCreated={refetch} /> : <StoreDashboard reseller={me.reseller} />}
    </AppShell>
  );
}

function CreateStoreForm({ onCreated }: { onCreated: () => void }) {
  const fn = useServerFn(createMyStore);
  const [storeName, setStoreName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const mut = useMutation({
    mutationFn: () => fn({ data: { storeName, welcomeMessage, whatsapp } }),
    onSuccess: () => { toast.success("Store created!"); onCreated(); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <div className="max-w-lg rounded-2xl border bg-card p-6 space-y-3">
      <h2 className="font-semibold">Create your storefront</h2>
      <p className="text-sm text-muted-foreground">Fill in your details. We'll create a shareable storefront link for you.</p>
      <div className="space-y-2"><Label>Store name</Label><Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Your Data Hub" /></div>
      <div className="space-y-2"><Label>Welcome message</Label><Textarea value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} placeholder="Welcome to our store…" /></div>
      <div className="space-y-2"><Label>WhatsApp number</Label><Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="024xxxxxxx" /></div>
      <Button disabled={mut.isPending || !storeName || !whatsapp} onClick={() => mut.mutate()} className="bg-gradient-mtn text-mtn-foreground">{mut.isPending ? "Creating…" : "Create store"}</Button>
    </div>
  );
}

function StoreDashboard({ reseller }: { reseller: any }) {
  const qc = useQueryClient();
  const updatePrices = useServerFn(updateMyPrices);
  const withdrawFn = useServerFn(requestWithdrawal);

  const { data: pkgs } = useQuery({
    queryKey: ["packages-and-prices", reseller.id],
    queryFn: async () => {
      const [{ data: packages }, { data: prices }] = await Promise.all([
        supabase.from("packages").select("*").order("type").order("sort_order"),
        supabase.from("reseller_prices").select("*").eq("reseller_id", reseller.id),
      ]);
      const map = new Map((prices ?? []).map((p) => [p.package_id, Number(p.price)]));
      return (packages ?? []).map((p) => ({ ...p, price: map.get(p.id) ?? Number(p.cost_price) }));
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["reseller-orders", reseller.id],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("amount, cost_price, status").eq("reseller_id", reseller.id);
      return data ?? [];
    },
  });

  const { data: withdrawals } = useQuery({
    queryKey: ["my-withdrawals"],
    queryFn: async () => {
      const { data } = await supabase.from("withdrawals").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const profit = useMemo(() => {
    return (orders ?? [])
      .filter((o) => o.status === "delivered")
      .reduce((s, o) => s + (Number(o.amount) - Number(o.cost_price)), 0);
  }, [orders]);

  const totalPaid = (withdrawals ?? []).filter((w) => w.status === "paid").reduce((s, w) => s + Number(w.amount), 0);
  const pendingWithdrawals = (withdrawals ?? []).filter((w) => w.status === "pending" || w.status === "accepted").reduce((s, w) => s + Number(w.amount), 0);
  const availableProfit = Math.max(0, profit - totalPaid - pendingWithdrawals);

  const [editing, setEditing] = useState<Record<string, string>>({});
  const dirty = Object.keys(editing).length > 0;

  const saveMut = useMutation({
    mutationFn: () => updatePrices({
      data: { prices: Object.entries(editing).map(([packageId, v]) => ({ packageId, price: parseFloat(v) || 0 })) }
    }),
    onSuccess: () => { toast.success("Prices saved"); setEditing({}); qc.invalidateQueries({ queryKey: ["packages-and-prices"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const [wAmt, setWAmt] = useState("");
  const wMut = useMutation({
    mutationFn: () => withdrawFn({ data: { amount: parseFloat(wAmt) } }),
    onSuccess: () => { toast.success("Withdrawal requested"); setWAmt(""); qc.invalidateQueries({ queryKey: ["my-withdrawals"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const storeUrl = typeof window !== "undefined" ? `${window.location.origin}/s/${reseller.slug}` : `/s/${reseller.slug}`;

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-gradient-mtn text-mtn-foreground p-5 shadow-mtn">
          <TrendingUp className="size-6 mb-2" />
          <div className="text-xs uppercase opacity-80">Total profit (delivered)</div>
          <div className="text-2xl font-black mt-1">{GHS(profit)}</div>
          <div className="text-xs opacity-70 mt-1">Available: {GHS(availableProfit)}</div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-xs uppercase text-muted-foreground mb-1">Store link</div>
          <div className="font-mono text-xs break-all">{storeUrl}</div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(storeUrl); toast.success("Copied"); }}><Copy className="size-3 mr-1" />Copy</Button>
            <Button size="sm" variant="outline" asChild><a href={storeUrl} target="_blank" rel="noreferrer"><ExternalLink className="size-3 mr-1" />Open</a></Button>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <Wallet className="size-6 mb-2" />
          <div className="text-xs uppercase text-muted-foreground">Withdraw (min ¢30)</div>
          <div className="flex gap-2 mt-2">
            <Input type="number" value={wAmt} onChange={(e) => setWAmt(e.target.value)} placeholder="30" />
            <Button disabled={wMut.isPending || !wAmt || parseFloat(wAmt) < 30 || parseFloat(wAmt) > availableProfit} onClick={() => wMut.mutate()}>Request</Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">My prices</h2>
          {dirty && <Button size="sm" onClick={() => saveMut.mutate()} disabled={saveMut.isPending} className="bg-gradient-mtn text-mtn-foreground">{saveMut.isPending ? "Saving…" : "Save changes"}</Button>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground"><tr><th className="text-left p-2">Package</th><th className="text-right p-2">Cost</th><th className="text-right p-2">My price</th><th className="text-right p-2">Profit/unit</th></tr></thead>
            <tbody>
              {(pkgs ?? []).map((p: any) => {
                const cur = editing[p.id] ?? String(p.price);
                const profitU = (parseFloat(cur) || 0) - Number(p.cost_price);
                return (
                  <tr key={p.id} className="border-t">
                    <td className="p-2">{p.label} <span className="text-xs text-muted-foreground">({p.type === "data" ? "Data" : "Mins+Data"})</span></td>
                    <td className="p-2 text-right text-muted-foreground">{GHS(p.cost_price)}</td>
                    <td className="p-2 text-right"><Input className="w-24 ml-auto text-right" type="number" step="0.01" value={cur} onChange={(e) => setEditing({ ...editing, [p.id]: e.target.value })} /></td>
                    <td className={`p-2 text-right font-semibold ${profitU >= 0 ? "text-success" : "text-destructive"}`}>{GHS(profitU)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <h2 className="font-semibold mb-3">Withdrawal history</h2>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground"><tr><th className="text-left p-2">Date</th><th className="text-right p-2">Amount</th><th className="text-left p-2">Status</th></tr></thead>
          <tbody>
            {(withdrawals ?? []).map((w) => (
              <tr key={w.id} className="border-t">
                <td className="p-2">{new Date(w.created_at).toLocaleString()}</td>
                <td className="p-2 text-right font-semibold">{GHS(w.amount)}</td>
                <td className="p-2 capitalize">{w.status}</td>
              </tr>
            ))}
            {(withdrawals ?? []).length === 0 && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">No withdrawals yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
