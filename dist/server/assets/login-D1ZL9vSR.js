import { jsx, jsxs } from "react/jsx-runtime";
import { useParams, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { s as supabase } from "./client-CIJIW76X.js";
import { B as Button } from "./button-Dbehd1zP.js";
import { I as Input } from "./input-BR2iTU4N.js";
import { L as Label } from "./label-BQVcCpGK.js";
import { toast } from "sonner";
import { EyeOff, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { u as useServerFn, e as getStorefront } from "./donmac.functions-CukCaMJG.js";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./router-Si19vHi8.js";
import "@radix-ui/react-tooltip";
import "clsx";
import "tailwind-merge";
import "zod";
import "./client.server-D5ro3rAQ.js";
import "@radix-ui/react-label";
import "./server-Dcl151ZB.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
function SLogin() {
  const {
    slug
  } = useParams({
    from: "/s/$slug/login"
  });
  const nav = useNavigate();
  const fn = useServerFn(getStorefront);
  const {
    data: store
  } = useQuery({
    queryKey: ["storefront", slug],
    queryFn: () => fn({
      data: {
        slug
      }
    })
  });
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({
      data
    }) => {
      if (data.session) nav({
        to: "/dashboard"
      });
    });
  }, [nav]);
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password: pw
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome!");
    nav({
      to: "/dashboard"
    });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-dark grid place-items-center px-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-5 text-white", children: [
      /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", style: {
        fontFamily: "Space Grotesk"
      }, children: store?.reseller.store_name ?? "…" }),
      /* @__PURE__ */ jsx("div", { className: "text-sm text-white/60", children: "Sign in" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "bg-card rounded-2xl p-6 space-y-3 shadow-card", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "Email" }),
        /* @__PURE__ */ jsx(Input, { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "Password" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Input, { type: show ? "text" : "password", required: true, value: pw, onChange: (e) => setPw(e.target.value) }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShow((s) => !s), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground", children: show ? /* @__PURE__ */ jsx(EyeOff, { className: "size-4" }) : /* @__PURE__ */ jsx(Eye, { className: "size-4" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
        /* @__PURE__ */ jsx(Link, { to: "/s/$slug/register", params: {
          slug
        }, className: "underline", children: "Create account" }),
        /* @__PURE__ */ jsx(Link, { to: "/forgot-password", className: "text-muted-foreground underline", children: "Forgot?" })
      ] }),
      /* @__PURE__ */ jsx(Button, { disabled: loading, className: "w-full bg-gradient-mtn text-mtn-foreground", children: loading ? "Signing in…" : "Sign in" })
    ] })
  ] }) });
}
export {
  SLogin as component
};
