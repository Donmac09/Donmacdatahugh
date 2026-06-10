import { jsxs, jsx } from "react/jsx-runtime";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { u as useServerFn, m as adminUpdateSettings } from "./donmac.functions-CukCaMJG.js";
import { useState, useEffect } from "react";
import { s as supabase } from "./client-CIJIW76X.js";
import { S as Switch } from "./switch-SU1ygW4H.js";
import { L as Label } from "./label-BQVcCpGK.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Ccayn0jf.js";
import { B as Button } from "./button-Dbehd1zP.js";
import { toast } from "sonner";
import "@tanstack/react-router";
import "./server-Dcl151ZB.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "zod";
import "@supabase/supabase-js";
import "@radix-ui/react-switch";
import "./router-Si19vHi8.js";
import "@radix-ui/react-tooltip";
import "clsx";
import "tailwind-merge";
import "class-variance-authority";
import "./client.server-D5ro3rAQ.js";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "lucide-react";
import "@radix-ui/react-slot";
const MINUTE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30];
function SettingsPage() {
  const qc = useQueryClient();
  const fn = useServerFn(adminUpdateSettings);
  const {
    data
  } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle()).data
  });
  const [enabled, setEnabled] = useState(false);
  const [mins, setMins] = useState(5);
  useEffect(() => {
    if (data) {
      setEnabled(data.auto_deliver_enabled);
      setMins(data.auto_deliver_minutes);
    }
  }, [data]);
  async function save() {
    try {
      await fn({
        data: {
          autoDeliverEnabled: enabled,
          autoDeliverMinutes: mins
        }
      });
      toast.success("Saved");
      qc.invalidateQueries({
        queryKey: ["settings"]
      });
    } catch (e) {
      toast.error(e.message);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-w-xl space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border bg-card p-5 space-y-4", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Auto-deliver orders" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "When enabled, orders that have been pending for longer than the chosen time will be automatically marked as delivered." }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "auto", children: "Enabled" }),
        /* @__PURE__ */ jsx(Switch, { id: "auto", checked: enabled, onCheckedChange: setEnabled })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "Wait time (minutes)" }),
        /* @__PURE__ */ jsxs(Select, { value: String(mins), onValueChange: (v) => setMins(parseInt(v)), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsx(SelectContent, { children: MINUTE_OPTIONS.map((m) => /* @__PURE__ */ jsxs(SelectItem, { value: String(m), children: [
            m,
            " min"
          ] }, m)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Button, { onClick: save, className: "bg-gradient-mtn text-mtn-foreground", children: "Save" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border bg-card p-5 space-y-2", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "SMS Webhook" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Configure your SMS forwarder to POST messages to:" }),
      /* @__PURE__ */ jsx("code", { className: "block bg-muted p-3 rounded text-xs break-all", children: typeof window !== "undefined" ? `${window.location.origin}/api/public/sms-webhook` : "/api/public/sms-webhook" }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Send header ",
        /* @__PURE__ */ jsx("code", { children: "x-webhook-secret: donmac-mashup-data" }),
        " with body ",
        /* @__PURE__ */ jsx("code", { children: '{ "message": "<full SMS body>" }' }),
        "."
      ] })
    ] })
  ] });
}
export {
  SettingsPage as component
};
