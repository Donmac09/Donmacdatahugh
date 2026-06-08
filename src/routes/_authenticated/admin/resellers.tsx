import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { adminCreateReseller } from "@/lib/api/donmac.functions";
import { toast } from "sonner";
import { Plus, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/resellers")({ component: RPage });

function RPage() {
  const qc = useQueryClient();
  const fn = useServerFn(adminCreateReseller);
  const { data } = useQuery({
    queryKey: ["admin-resellers"],
    queryFn: async () => {
      const [{ data: resellers }, { data: orders }] = await Promise.all([
        supabase.from("resellers").select("*, profiles(email, phone, balance, blocked)").order("created_at", { ascending: false }),
        supabase.from("orders").select("reseller_id, amount, cost_price, status"),
      ]);

      const profitMap = new Map<string, number>();
      for (const order of orders ?? []) {
        if (!order.reseller_id || order.status !== "delivered") continue;
        const current = profitMap.get(order.reseller_id) ?? 0;
        profitMap.set(order.reseller_id, current + (Number(order.amount) - Number(order.cost_price)));
      }

      return (resellers ?? []).map((r: any) => ({
        ...r,
        profit: profitMap.get(r.id) ?? 0,
      }));
    },
  });
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  async function create() {
    try {
      await fn({ data: { email, phone, fullName, password } });
      toast.success("Reseller created. They can now log in and create their store.");
      setOpen(false); setEmail(""); setPhone(""); setFullName(""); setPassword("");
      qc.invalidateQueries({ queryKey: ["admin-resellers"] });
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-mtn text-mtn-foreground"><Plus className="size-4 mr-1" />Add reseller</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create reseller</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-2"><Label>Full name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button onClick={create} className="w-full bg-gradient-mtn text-mtn-foreground">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground"><tr><th className="text-left p-3">Store</th><th className="text-left p-3">Email</th><th className="text-left p-3">Phone</th><th className="text-left p-3">WhatsApp</th><th className="text-right p-3">Profit</th><th className="text-left p-3">Slug</th><th className="p-3"></th></tr></thead>
            <tbody>
              {(data ?? []).map((r: any) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3 font-semibold">{r.store_name}</td>
                  <td className="p-3">{r.profiles?.email}</td>
                  <td className="p-3">{r.profiles?.phone}</td>
                  <td className="p-3">{r.whatsapp}</td>
                  <td className="p-3 text-right font-semibold">¢{Number(r.profit ?? 0).toFixed(2)}</td>
                  <td className="p-3 font-mono text-xs">/s/{r.slug}</td>
                  <td className="p-3"><a href={`/s/${r.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs underline"><ExternalLink className="size-3" />Open</a></td>
                </tr>
              ))}
              {(data ?? []).length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No resellers yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
