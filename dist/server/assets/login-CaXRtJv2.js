import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { s as supabase } from "./client-CIJIW76X.js";
import { B as Button } from "./button-Dbehd1zP.js";
import { I as Input } from "./input-BR2iTU4N.js";
import { L as Label } from "./label-BQVcCpGK.js";
import { toast } from "sonner";
import { Zap, EyeOff, Eye } from "lucide-react";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./router-Si19vHi8.js";
import "@tanstack/react-query";
import "@radix-ui/react-tooltip";
import "clsx";
import "tailwind-merge";
import "zod";
import "./client.server-D5ro3rAQ.js";
import "@radix-ui/react-label";
function LoginPage() {
  const navigate = useNavigate();
  const {
    redirect
  } = useSearch({
    from: "/login"
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({
      data
    }) => {
      if (data.session) navigate({
        to: redirect || "/dashboard"
      });
    });
  }, [navigate, redirect]);
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    const {
      data,
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    const uid = data.user.id;
    const [{
      data: profile
    }, {
      data: roles
    }] = await Promise.all([supabase.from("profiles").select("reseller_id").eq("id", uid).maybeSingle(), supabase.from("user_roles").select("role").eq("user_id", uid)]);
    const roleNames = (roles ?? []).map((item) => String(item.role ?? "").trim().toLowerCase()).filter(Boolean);
    const isCustomerOnly = roleNames.length > 0 && roleNames.every((r) => r === "customer");
    if (isCustomerOnly && profile?.reseller_id) {
      const {
        data: r
      } = await supabase.from("resellers").select("slug").eq("id", profile.reseller_id).maybeSingle();
      if (r?.slug) {
        toast.success("Welcome back!");
        navigate({
          to: "/s/$slug",
          params: {
            slug: r.slug
          }
        });
        return;
      }
    }
    toast.success("Welcome back!");
    navigate({
      to: redirect || "/dashboard"
    });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-dark grid place-items-center px-4 py-10 relative overflow-hidden", children: [
    /* @__PURE__ */ jsx(motion.div, { className: "absolute -top-32 -right-32 size-96 rounded-full bg-mtn/30 blur-3xl", animate: {
      scale: [1, 1.15, 1]
    }, transition: {
      duration: 6,
      repeat: Infinity
    } }),
    /* @__PURE__ */ jsxs(motion.div, { initial: {
      opacity: 0,
      y: 20
    }, animate: {
      opacity: 1,
      y: 0
    }, className: "w-full max-w-sm relative", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-mtn shadow-mtn mb-3", children: /* @__PURE__ */ jsx(Zap, { className: "size-7 text-mtn-foreground" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white", style: {
          fontFamily: "Space Grotesk"
        }, children: "Donmac Data Hub" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-1", children: "Sign in to continue" })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleLogin, className: "bg-card rounded-2xl p-6 shadow-card space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
          /* @__PURE__ */ jsx(Input, { id: "email", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "pw", children: "Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Input, { id: "pw", type: showPw ? "text" : "password", required: true, value: password, onChange: (e) => setPassword(e.target.value) }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowPw((s) => !s), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground", children: showPw ? /* @__PURE__ */ jsx(EyeOff, { className: "size-4" }) : /* @__PURE__ */ jsx(Eye, { className: "size-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end", children: /* @__PURE__ */ jsx(Link, { to: "/forgot-password", className: "text-xs text-muted-foreground hover:text-foreground underline", children: "Forgot password?" }) }),
        /* @__PURE__ */ jsx(Button, { type: "submit", disabled: loading, className: "w-full bg-gradient-mtn text-mtn-foreground hover:opacity-90 shadow-mtn", children: loading ? "Signing in…" : "Sign in" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-center text-muted-foreground pt-2", children: "New here? Registration is via your reseller's storefront link." })
      ] })
    ] })
  ] });
}
export {
  LoginPage as component
};
