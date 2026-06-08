import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GHS } from "@/lib/format";
import { adminAdjustBalance, adminSetBlocked, adminDeleteUser } from "@/lib/api/donmac.functions";
import { toast } from "sonner";
import { Ban, CircleCheck, Trash2, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({ component: UsersPage });

function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const { data } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [{ data: profiles }, { data: roles }, { data: resellers }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
        supabase.from("resellers").select("id, store_name"),
      ]);
      const roleMap = new Map<string, string[]>();
      (roles ?? []).forEach((r) => {
        if (!roleMap.has(r.user_id)) roleMap.set(r.user_id, []);
        roleMap.get(r.user_id)!.push(r.role);
      });
      const resMap = new Map((resellers ?? []).map((r) => [r.id, r.store_name]));
      return (profiles ?? []).map((p) => ({ ...p, roles: roleMap.get(p.id) ?? [], reseller_name: p.reseller_id ? resMap.get(p.reseller_id) : null }));
    },
  });

  const filtered = (data ?? []).filter((u) =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search),
  );

  const adjustFn = useServerFn(adminAdjustBalance);
  const blockFn = useServerFn(adminSetBlocked);
  const deleteFn = useServerFn(adminDeleteUser);

  return (
    <div>
      <Input placeholder="Search by email, name, phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4 max-w-md" />
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground"><tr>
              <th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Roles</th><th className="text-left p-3">Reseller</th><th className="text-right p-3">Balance</th><th className="text-left p-3">Status</th><th className="p-3">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.full_name ?? "—"}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.phone ?? "—"}</td>
                  <td className="p-3"><div className="flex flex-wrap gap-1">{u.roles.map((r: string) => <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-muted">{r}</span>)}</div></td>
                  <td className="p-3 text-xs text-muted-foreground">{u.reseller_name ?? "—"}</td>
                  <td className="p-3 text-right font-semibold">{GHS(u.balance)}</td>
                  <td className="p-3">{u.blocked ? <span className="text-destructive font-semibold">Blocked</span> : <span className="text-success">Active</span>}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 justify-end">
                      <AdjustDialog userId={u.id} onDone={() => qc.invalidateQueries({ queryKey: ["admin-users"] })} fn={adjustFn} />
                      <Button size="icon" variant="outline" onClick={async () => { await blockFn({ data: { userId: u.id, blocked: !u.blocked } }); toast.success(u.blocked ? "Unblocked" : "Blocked"); qc.invalidateQueries({ queryKey: ["admin-users"] }); }}>{u.blocked ? <CircleCheck className="size-4" /> : <Ban className="size-4" />}</Button>
                      <Button size="icon" variant="outline" onClick={async () => { if (!confirm("Delete this user permanently?")) return; await deleteFn({ data: { userId: u.id } }); toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-users"] }); }}><Trash2 className="size-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdjustDialog({ userId, fn, onDone }: any) {
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<"credit" | "debit">("credit");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="icon" variant="outline"><Wallet className="size-4" /></Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Adjust balance</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2"><Button variant={type === "credit" ? "default" : "outline"} onClick={() => setType("credit")}>Credit</Button><Button variant={type === "debit" ? "default" : "outline"} onClick={() => setType("debit")}>Debit</Button></div>
          <div className="space-y-2"><Label>Amount</Label><Input type="number" step="0.01" value={delta} onChange={(e) => setDelta(e.target.value)} /></div>
          <div className="space-y-2"><Label>Note</Label><Input value={note} onChange={(e) => setNote(e.target.value)} /></div>
          <Button onClick={async () => {
            const amt = parseFloat(delta) || 0;
            const signed = type === "credit" ? amt : -amt;
            try { await fn({ data: { userId, delta: signed, note: note || (type === "credit" ? "credit" : "debit") } }); toast.success("Done"); setOpen(false); onDone(); }
            catch (e: any) { toast.error(e.message); }
          }} className="w-full bg-gradient-mtn text-mtn-foreground">Apply</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
