import { jsxs, jsx } from "react/jsx-runtime";
import { redirect, useRouterState, Link, Outlet } from "@tanstack/react-router";
import { u as useMe, A as AppShell } from "./app-shell-Bv0Nrqf5.js";
import "react";
import "@tanstack/react-query";
import "./donmac.functions-CukCaMJG.js";
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
import "sonner";
import "./client-CIJIW76X.js";
import "@supabase/supabase-js";
import "./router-Si19vHi8.js";
import "@radix-ui/react-tooltip";
import "clsx";
import "tailwind-merge";
import "class-variance-authority";
import "./client.server-D5ro3rAQ.js";
import "zustand";
import "zustand/middleware";
import "./format-Dvz2fdZm.js";
import "lucide-react";
import "framer-motion";
import "./button-Dbehd1zP.js";
import "@radix-ui/react-slot";
function AdminLayout() {
  const {
    data: me
  } = useMe();
  if (me && !(me.roles?.includes("admin") ?? false)) {
    throw redirect({
      to: "/dashboard"
    });
  }
  const pathname = useRouterState({
    select: (s) => s.location.pathname
  });
  const tabs = [{
    to: "/admin/analytics",
    label: "Analytics"
  }, {
    to: "/admin/users",
    label: "Users"
  }, {
    to: "/admin/orders",
    label: "Orders"
  }, {
    to: "/admin/topups",
    label: "Verified Topups"
  }, {
    to: "/admin/withdrawals",
    label: "Withdrawals"
  }, {
    to: "/admin/resellers",
    label: "Resellers"
  }, {
    to: "/admin/packages",
    label: "Packages"
  }, {
    to: "/admin/settings",
    label: "Settings"
  }];
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx("div", { className: "flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 md:mx-0 md:px-0", children: tabs.map((t) => /* @__PURE__ */ jsx(Link, { to: t.to, className: `whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold ${pathname === t.to ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`, children: t.label }, t.to)) }),
    /* @__PURE__ */ jsx(Outlet, {})
  ] });
}
export {
  AdminLayout as component
};
