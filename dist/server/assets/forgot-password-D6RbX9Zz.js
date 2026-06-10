import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { s as supabase } from "./client-CIJIW76X.js";
import { B as Button } from "./button-Dbehd1zP.js";
import { I as Input } from "./input-BR2iTU4N.js";
import { L as Label } from "./label-BQVcCpGK.js";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
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
function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setSent(true);
    toast.success("Check your email for the reset link");
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-dark grid place-items-center px-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm bg-card rounded-2xl p-6 shadow-card", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/login", className: "inline-flex items-center gap-1 text-xs text-muted-foreground mb-4", children: [
      /* @__PURE__ */ jsx(ArrowLeft, { className: "size-3" }),
      "Back"
    ] }),
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold", children: "Forgot password" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "We'll send a reset link to your email." }),
    sent ? /* @__PURE__ */ jsx("p", { className: "text-sm text-success", children: "Email sent. Open the link from the same device." }) : /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "Email" }),
        /* @__PURE__ */ jsx(Input, { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value) })
      ] }),
      /* @__PURE__ */ jsx(Button, { disabled: loading, className: "w-full bg-gradient-mtn text-mtn-foreground", children: loading ? "Sending…" : "Send reset link" })
    ] })
  ] }) });
}
export {
  ForgotPage as component
};
