import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { GHS } from "@/lib/format";
import { StatusBadge } from "./topups";

export const Route = createFileRoute("/_authenticated/orders")({ component: OrdersPage });

function OrdersPage() {
  const { data } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, packages(label, type)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "Space Grotesk" }}>Orders</h1>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-3">Ref</th><th className="text-left p-3">Network</th><th className="text-left p-3">Package</th>
                <th className="text-left p-3">Phone</th><th className="text-right p-3">Amount</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((o: any) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{o.ref}</td>
                  <td className="p-3 uppercase">{o.network}</td>
                  <td className="p-3">{o.packages?.label}</td>
                  <td className="p-3 font-mono">{o.phone}</td>
                  <td className="p-3 text-right font-semibold">{GHS(o.amount)}</td>
                  <td className="p-3"><StatusBadge status={o.status} /></td>
                  <td className="p-3 whitespace-nowrap text-muted-foreground">{format(new Date(o.created_at), "dd MMM, HH:mm")}</td>
                </tr>
              ))}
              {(data ?? []).length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
