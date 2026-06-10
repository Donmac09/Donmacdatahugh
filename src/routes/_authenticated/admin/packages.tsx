import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { adminTogglePackage, adminToggleNetwork } from "@/lib/api/donmac.functions";
import { GHS } from "@/lib/format";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/packages")({ component: PkgPage });

function PkgPage() {
  const qc = useQueryClient();
  const togglePkg = useServerFn(adminTogglePackage);
  const toggleNet = useServerFn(adminToggleNetwork);
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => {
      const [packagesRes, statusRes] = await Promise.all([
        supabase.from("packages").select("*").order("display_order"),
        supabase.from("network_status").select("*")
      ]);
      
      console.log("Packages:", packagesRes.data?.length);
      console.log("Network status:", statusRes.data);
      
      return { 
        packages: packagesRes.data ?? [], 
        status: statusRes.data ?? [] 
      };
    },
  });
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading packages...</div>;
  }
  
  const allPackages = data?.packages ?? [];
  const statusMap = new Map(data?.status?.map((s) => [`${s.network}:${s.type}`, s.online]) || []);
  
  // Group packages
  const categories = [
    { 
      title: "MTN Mashup Data", 
      packages: allPackages.filter(p => p.name?.includes('MTN Mashup') && p.type === 'data' && !p.name?.includes('mins')),
      statusKey: "mtn:data",
      network: "mtn",
      type: "data"
    },
    { 
      title: "MTN Mashup Minutes + Data", 
      packages: allPackages.filter(p => p.type === 'mins_data'),
      statusKey: "mtn:mins_data",
      network: "mtn",
      type: "mins_data"
    },
    { 
      title: "MTN Standard", 
      packages: allPackages.filter(p => p.network === 'MTN' && !p.name?.includes('Mashup') && p.type === 'data'),
      statusKey: "mtn:data",
      network: "mtn",
      type: "data"
    },
    { 
      title: "Telecel", 
      packages: allPackages.filter(p => p.network === 'Telecel'),
      statusKey: "telecel:data",
      network: "telecel",
      type: "data"
    },
    { 
      title: "Airteltigo Premium", 
      packages: allPackages.filter(p => p.name?.includes('Airteltigo Premium')),
      statusKey: "airteltigo:data",
      network: "airteltigo",
      type: "data"
    },
    { 
      title: "Airteltigo Big Time", 
      packages: allPackages.filter(p => p.name?.includes('Airteltigo Big Time')),
      statusKey: "airteltigo:data",
      network: "airteltigo",
      type: "data"
    },
    { 
      title: "Airtime", 
      packages: allPackages.filter(p => p.type === 'airtime'),
      statusKey: "airtime:data",
      network: "airtime",
      type: "data"
    },
  ];
  
  const handleToggleNetwork = async (network: string, type: string, online: boolean) => {
    try {
      await toggleNet({ data: { network, type, online } });
      toast.success(`Network is now ${online ? "Online" : "Offline"}`);
      await refetch();
      qc.invalidateQueries({ queryKey: ["admin-packages"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  const handleTogglePackage = async (packageId: string, enabled: boolean) => {
    try {
      await togglePkg({ data: { packageId, enabled } });
      toast.success(`Package ${enabled ? "Enabled" : "Disabled"}`);
      await refetch();
      qc.invalidateQueries({ queryKey: ["admin-packages"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  return (
    <div className="space-y-5">
      {/* Network Toggles */}
      <div className="rounded-2xl border bg-card p-5">
        <h2 className="font-semibold mb-4">Network Online/Offline Toggles</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.statusKey} className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="font-semibold text-sm">{cat.title}</div>
                <div className="text-xs text-muted-foreground">
                  {statusMap.get(cat.statusKey) ? "Online — orders accepted" : "Offline — disabled"}
                </div>
              </div>
              <Switch 
                checked={statusMap.get(cat.statusKey) ?? true} 
                onCheckedChange={(v) => handleToggleNetwork(cat.network, cat.type, v)} 
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Package Tables */}
      {categories.map((cat) => {
        if (cat.packages.length === 0) return null;
        return (
          <div key={cat.title} className="rounded-2xl border bg-card overflow-hidden">
            <div className="bg-muted px-4 py-2">
              <h3 className="font-semibold">{cat.title} ({cat.packages.length} packages)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left p-3">Package</th>
                    <th className="text-left p-3">Network</th>
                    <th className="text-right p-3">Price (₵)</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Toggle</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.packages.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="p-3 font-semibold">{p.name}</td>
                      <td className="p-3 text-xs">{p.network}</td>
                      <td className="p-3 text-right">{GHS(p.cost_price)}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          p.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {p.enabled ? <CheckCircle className="size-3" /> : <XCircle className="size-3" />}
                          {p.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <Switch 
                          checked={p.enabled} 
                          onCheckedChange={(v) => handleTogglePackage(p.id, v)} 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}