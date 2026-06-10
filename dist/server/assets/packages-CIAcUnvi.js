import { jsx, jsxs } from "react/jsx-runtime";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { u as useServerFn, o as adminTogglePackage, q as adminToggleNetwork } from "./donmac.functions-CukCaMJG.js";
import { s as supabase } from "./client-CIJIW76X.js";
import { S as Switch } from "./switch-SU1ygW4H.js";
import { G as GHS } from "./format-Dvz2fdZm.js";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import "react";
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
function PkgPage() {
  const qc = useQueryClient();
  const togglePkg = useServerFn(adminTogglePackage);
  const toggleNet = useServerFn(adminToggleNetwork);
  const {
    data,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => {
      const [packagesRes, statusRes] = await Promise.all([supabase.from("packages").select("*").order("display_order"), supabase.from("network_status").select("*")]);
      console.log("Packages:", packagesRes.data?.length);
      console.log("Network status:", statusRes.data);
      return {
        packages: packagesRes.data ?? [],
        status: statusRes.data ?? []
      };
    }
  });
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 text-center", children: "Loading packages..." });
  }
  const allPackages = data?.packages ?? [];
  const statusMap = new Map(data?.status?.map((s) => [`${s.network}:${s.type}`, s.online]) || []);
  const categories = [{
    title: "MTN Mashup Data",
    packages: allPackages.filter((p) => p.name?.includes("MTN Mashup") && p.type === "data" && !p.name?.includes("mins")),
    statusKey: "mtn:data",
    network: "mtn",
    type: "data"
  }, {
    title: "MTN Mashup Minutes + Data",
    packages: allPackages.filter((p) => p.type === "mins_data"),
    statusKey: "mtn:mins_data",
    network: "mtn",
    type: "mins_data"
  }, {
    title: "MTN Standard",
    packages: allPackages.filter((p) => p.network === "MTN" && !p.name?.includes("Mashup") && p.type === "data"),
    statusKey: "mtn:data",
    network: "mtn",
    type: "data"
  }, {
    title: "Telecel",
    packages: allPackages.filter((p) => p.network === "Telecel"),
    statusKey: "telecel:data",
    network: "telecel",
    type: "data"
  }, {
    title: "Airteltigo Premium",
    packages: allPackages.filter((p) => p.name?.includes("Airteltigo Premium")),
    statusKey: "airteltigo:data",
    network: "airteltigo",
    type: "data"
  }, {
    title: "Airteltigo Big Time",
    packages: allPackages.filter((p) => p.name?.includes("Airteltigo Big Time")),
    statusKey: "airteltigo:data",
    network: "airteltigo",
    type: "data"
  }, {
    title: "Airtime",
    packages: allPackages.filter((p) => p.type === "airtime"),
    statusKey: "airtime:data",
    network: "airtime",
    type: "data"
  }];
  const handleToggleNetwork = async (network, type, online) => {
    try {
      await toggleNet({
        data: {
          network,
          type,
          online
        }
      });
      toast.success(`Network is now ${online ? "Online" : "Offline"}`);
      await refetch();
      qc.invalidateQueries({
        queryKey: ["admin-packages"]
      });
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleTogglePackage = async (packageId, enabled) => {
    try {
      await togglePkg({
        data: {
          packageId,
          enabled
        }
      });
      toast.success(`Package ${enabled ? "Enabled" : "Disabled"}`);
      await refetch();
      qc.invalidateQueries({
        queryKey: ["admin-packages"]
      });
    } catch (error) {
      toast.error(error.message);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border bg-card p-5", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold mb-4", children: "Network Online/Offline Toggles" }),
      /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4", children: categories.map((cat) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm", children: cat.title }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: statusMap.get(cat.statusKey) ? "Online — orders accepted" : "Offline — disabled" })
        ] }),
        /* @__PURE__ */ jsx(Switch, { checked: statusMap.get(cat.statusKey) ?? true, onCheckedChange: (v) => handleToggleNetwork(cat.network, cat.type, v) })
      ] }, cat.statusKey)) })
    ] }),
    categories.map((cat) => {
      if (cat.packages.length === 0) return null;
      return /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-muted px-4 py-2", children: /* @__PURE__ */ jsxs("h3", { className: "font-semibold", children: [
          cat.title,
          " (",
          cat.packages.length,
          " packages)"
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-muted/50 text-xs uppercase text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Package" }),
            /* @__PURE__ */ jsx("th", { className: "text-left p-3", children: "Network" }),
            /* @__PURE__ */ jsx("th", { className: "text-right p-3", children: "Price (₵)" }),
            /* @__PURE__ */ jsx("th", { className: "p-3 text-center", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "p-3 text-center", children: "Toggle" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: cat.packages.map((p) => /* @__PURE__ */ jsxs("tr", { className: "border-t", children: [
            /* @__PURE__ */ jsx("td", { className: "p-3 font-semibold", children: p.name }),
            /* @__PURE__ */ jsx("td", { className: "p-3 text-xs", children: p.network }),
            /* @__PURE__ */ jsx("td", { className: "p-3 text-right", children: GHS(p.cost_price) }),
            /* @__PURE__ */ jsx("td", { className: "p-3 text-center", children: /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${p.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`, children: [
              p.enabled ? /* @__PURE__ */ jsx(CheckCircle, { className: "size-3" }) : /* @__PURE__ */ jsx(XCircle, { className: "size-3" }),
              p.enabled ? "Enabled" : "Disabled"
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "p-3 text-center", children: /* @__PURE__ */ jsx(Switch, { checked: p.enabled, onCheckedChange: (v) => handleTogglePackage(p.id, v) }) })
          ] }, p.id)) })
        ] }) })
      ] }, cat.title);
    })
  ] });
}
export {
  PkgPage as component
};
