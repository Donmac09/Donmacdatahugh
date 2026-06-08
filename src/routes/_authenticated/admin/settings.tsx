import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { adminUpdateSettings } from "@/lib/api/donmac.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: SettingsPage });

const MINUTE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30];

function SettingsPage() {
  const qc = useQueryClient();
  const fn = useServerFn(adminUpdateSettings);
  const { data } = useQuery({ queryKey: ["settings"], queryFn: async () => (await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle()).data });
  const [enabled, setEnabled] = useState(false);
  const [mins, setMins] = useState(5);
  useEffect(() => { if (data) { setEnabled(data.auto_deliver_enabled); setMins(data.auto_deliver_minutes); } }, [data]);

  async function save() {
    try { await fn({ data: { autoDeliverEnabled: enabled, autoDeliverMinutes: mins } }); toast.success("Saved"); qc.invalidateQueries({ queryKey: ["settings"] }); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="max-w-xl space-y-5">
      <div className="rounded-2xl border bg-card p-5 space-y-4">
        <h2 className="font-semibold">Auto-deliver orders</h2>
        <p className="text-sm text-muted-foreground">When enabled, orders that have been pending for longer than the chosen time will be automatically marked as delivered.</p>
        <div className="flex items-center justify-between">
          <Label htmlFor="auto">Enabled</Label>
          <Switch id="auto" checked={enabled} onCheckedChange={setEnabled} />
        </div>
        <div className="space-y-2">
          <Label>Wait time (minutes)</Label>
          <Select value={String(mins)} onValueChange={(v) => setMins(parseInt(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {MINUTE_OPTIONS.map((m) => <SelectItem key={m} value={String(m)}>{m} min</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={save} className="bg-gradient-mtn text-mtn-foreground">Save</Button>
      </div>

      <div className="rounded-2xl border bg-card p-5 space-y-2">
        <h2 className="font-semibold">SMS Webhook</h2>
        <p className="text-sm text-muted-foreground">Configure your SMS forwarder to POST messages to:</p>
        <code className="block bg-muted p-3 rounded text-xs break-all">{typeof window !== "undefined" ? `${window.location.origin}/api/public/sms-webhook` : "/api/public/sms-webhook"}</code>
        <p className="text-xs text-muted-foreground">Send header <code>x-webhook-secret: donmac-mashup-data</code> with body <code>{"{ \"message\": \"<full SMS body>\" }"}</code>.</p>
      </div>
    </div>
  );
}
