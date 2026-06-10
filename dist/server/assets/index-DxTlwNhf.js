import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { u as useServerFn, e as getStorefront } from "./donmac.functions-CukCaMJG.js";
import { s as supabase } from "./client-CIJIW76X.js";
import { G as GHS } from "./format-Dvz2fdZm.js";
import { B as Button } from "./button-Dbehd1zP.js";
import { LogIn, UserPlus, MessageCircle, Zap } from "lucide-react";
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
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./router-Si19vHi8.js";
import "sonner";
import "@radix-ui/react-tooltip";
import "clsx";
import "tailwind-merge";
import "./client.server-D5ro3rAQ.js";
function StorefrontHome() {
  const {
    slug
  } = useParams({
    from: "/s/$slug/"
  });
  const fn = useServerFn(getStorefront);
  const {
    data
  } = useQuery({
    queryKey: ["storefront", slug],
    queryFn: () => fn({
      data: {
        slug
      }
    })
  });
  const [user, setUser] = useState(null);
  useEffect(() => {
    supabase.auth.getUser().then(({
      data: data2
    }) => setUser(data2.user));
  }, []);
  if (!data) return /* @__PURE__ */ jsx("div", { className: "min-h-screen grid place-items-center text-muted-foreground", children: "Loading storefront…" });
  const dataPkgs = data.packages.filter((p) => p.type === "data");
  const minsPkgs = data.packages.filter((p) => p.type === "mins_data");
  const status = data.networkStatus ?? [];
  const dataOnline = status.find((s) => s.network === "mtn" && s.type === "data")?.online ?? true;
  const minsOnline = status.find((s) => s.network === "mtn" && s.type === "mins_data")?.online ?? true;
  const wa = data.reseller?.whatsapp ?? "";
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background pb-28", children: [
    /* @__PURE__ */ jsxs("header", { className: "bg-gradient-dark text-white", children: [
      /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-4 py-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "size-10 rounded-xl bg-gradient-mtn grid place-items-center text-mtn-foreground font-black", children: data.reseller.store_name[0] }),
          /* @__PURE__ */ jsx("div", { className: "font-bold", style: {
            fontFamily: "Space Grotesk"
          }, children: data.reseller.store_name })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: user ? /* @__PURE__ */ jsx(Link, { to: "/dashboard", children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "secondary", children: "Dashboard" }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Link, { to: "/s/$slug/login", params: {
            slug
          }, children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", children: [
            /* @__PURE__ */ jsx(LogIn, { className: "size-4 mr-1" }),
            "Login"
          ] }) }),
          /* @__PURE__ */ jsx(Link, { to: "/s/$slug/register", params: {
            slug
          }, children: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "bg-gradient-mtn text-mtn-foreground", children: [
            /* @__PURE__ */ jsx(UserPlus, { className: "size-4 mr-1" }),
            "Register"
          ] }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto px-4 pb-10", children: [
        /* @__PURE__ */ jsxs(motion.h1, { initial: {
          opacity: 0,
          y: 10
        }, animate: {
          opacity: 1,
          y: 0
        }, className: "text-3xl md:text-5xl font-black text-balance", style: {
          fontFamily: "Space Grotesk"
        }, children: [
          "Instant MTN data, ",
          /* @__PURE__ */ jsx("span", { className: "text-mtn", children: "fair prices." })
        ] }),
        data.reseller.welcome_message && /* @__PURE__ */ jsx("p", { className: "mt-3 text-white/80 max-w-xl", children: data.reseller.welcome_message })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-5xl mx-auto px-4 py-6 space-y-8", children: [
      /* @__PURE__ */ jsx(Section, { title: "MTN Mashup Data", online: dataOnline, packages: dataPkgs }),
      /* @__PURE__ */ jsx(Section, { title: "MTN Mashup Minutes + Data", online: minsOnline, packages: minsPkgs })
    ] }),
    /* @__PURE__ */ jsx("a", { href: `https://wa.me/233${wa.replace(/^0/, "")}`, target: "_blank", rel: "noreferrer", className: "fixed bottom-5 left-5 z-40 size-14 rounded-full bg-success grid place-items-center shadow-lg", children: /* @__PURE__ */ jsx(MessageCircle, { className: "size-7 text-white" }) })
  ] });
}
function Section({
  title,
  online,
  packages
}) {
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxs("h2", { className: "font-bold text-lg flex items-center gap-2", style: {
        fontFamily: "Space Grotesk"
      }, children: [
        /* @__PURE__ */ jsx(Zap, { className: "size-5 text-mtn" }),
        title
      ] }),
      /* @__PURE__ */ jsx("span", { className: `text-xs font-semibold px-2 py-1 rounded-full ${online ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`, children: online ? "Online" : "Offline" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: packages.map((p, idx) => /* @__PURE__ */ jsxs(motion.div, { initial: {
      opacity: 0,
      y: 8
    }, animate: {
      opacity: 1,
      y: 0
    }, transition: {
      delay: idx * 0.03
    }, className: "rounded-2xl bg-gradient-mtn text-mtn-foreground p-4 shadow-mtn", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs uppercase opacity-70", children: "MTN" }),
      /* @__PURE__ */ jsx("div", { className: "font-black text-lg mt-1", style: {
        fontFamily: "Space Grotesk"
      }, children: p.label }),
      /* @__PURE__ */ jsx("div", { className: "text-2xl font-black mt-2", children: GHS(p.price) }),
      /* @__PURE__ */ jsx("div", { className: "text-[10px] opacity-70 mt-1", children: "Non-expiry • Login to buy" })
    ] }, p.id)) })
  ] });
}
export {
  StorefrontHome as component
};
