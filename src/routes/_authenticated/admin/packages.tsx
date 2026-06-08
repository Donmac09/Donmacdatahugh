import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { adminTogglePackage, adminToggleNetwork } from "@/lib/api/donmac.functions";
import { GHS } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/packages")({ component: PkgPage });

function PkgPage() {
  const qc = useQueryClient();
  const togglePkg = useServerFn(adminTogglePackage);
  const toggleNet = useServerFn(adminToggleNetwork);
  const { data } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => {
      const [{ data: packages }, { data: ns }] = await Promise.all([
        supabase.from("packages").select("*").order("type").order("sort_order"),
        supabase.from("network_status").select("*"),
      ]);
      return { packages: packages ?? [], status: ns ?? [] };
    },
  });
  const dataOnline = data?.status.find((s) => s.type === "data")?.online ?? true;
  const minsOnline = data?.status.find((s) => s.type === "mins_data")?.online ?? true;
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-5 grid sm:grid-cols-2 gap-4">
        <NetRow label="MTN Mashup Data" value={dataOnline} onChange={async (v) => { await toggleNet({ data: { type: "data", online: v } }); qc.invalidateQueries({ queryKey: ["admin-packages"] }); }} />
        <NetRow label="MTN Mashup Mins + Data" value={minsOnline} onChange={async (v) => { await toggleNet({ data: { type: "mins_data", online: v } }); qc.invalidateQueries({ queryKey: ["admin-packages"] }); }} />
      </div>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground"><tr><th className="text-left p-3">Label</th><th className="text-left p-3">Type</th><th className="text-right p-3">Cost</th><th className="p-3">Enabled</th></tr></thead>
            <tbody>
              {(data?.packages ?? []).map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 font-semibold">{p.label}</td>
                  <td className="p-3 text-xs">{p.type === "data" ? "Data" : "Mins + Data"}</td>
                  <td className="p-3 text-right">{GHS(p.cost_price)}</td>
                  <td className="p-3"><div className="flex justify-end"><Switch checked={p.enabled} onCheckedChange={async (v) => { await togglePkg({ data: { packageId: p.id, enabled: v } }); toast.success(v ? "Enabled" : "Disabled"); qc.invalidateQueries({ queryKey: ["admin-packages"] }); }} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NetRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{value ? "Online — orders accepted" : "Offline — disabled"}</div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
