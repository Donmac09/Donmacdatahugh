import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { adminUpdateWithdrawal } from "@/lib/api/donmac.functions";
import { GHS } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/withdrawals")({ component: WPage });

function WPage() {
  const qc = useQueryClient();
  const fn = useServerFn(adminUpdateWithdrawal);
  const { data } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: async () => (await supabase.from("withdrawals").select("*, resellers(store_name), profiles(email, full_name)").order("created_at", { ascending: false })).data ?? [],
  });
  async function setStatus(id: string, status: any) {
    try { await fn({ data: { id, status } }); toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-withdrawals"] }); }
    catch (e: any) { toast.error(e.message); }
  }
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase text-muted-foreground"><tr><th className="text-left p-3">Reseller</th><th className="text-left p-3">Email</th><th className="text-right p-3">Amount</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {(data ?? []).map((w: any) => (
              <tr key={w.id} className="border-t">
                <td className="p-3">{w.resellers?.store_name}</td>
                <td className="p-3 text-xs">{w.profiles?.email}</td>
                <td className="p-3 text-right font-semibold">{GHS(w.amount)}</td>
                <td className="p-3 capitalize">{w.status}</td>
                <td className="p-3 whitespace-nowrap">{new Date(w.created_at).toLocaleString()}</td>
                <td className="p-3">
                  <div className="flex gap-1 justify-end flex-wrap">
                    {w.status === "pending" && <>
                      <Button size="sm" onClick={() => setStatus(w.id, "accepted")}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => setStatus(w.id, "rejected")}>Reject</Button>
                    </>}
                    {w.status === "accepted" && <Button size="sm" className="bg-success text-success-foreground" onClick={() => setStatus(w.id, "paid")}>Mark as paid</Button>}
                  </div>
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No withdrawal requests</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
