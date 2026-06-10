import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { s as supabase } from "./client-CIJIW76X.js";
import { B as Button } from "./button-Dbehd1zP.js";
import { I as Input } from "./input-BR2iTU4N.js";
import { L as Label } from "./label-BQVcCpGK.js";
import { toast } from "sonner";
import { EyeOff, Eye } from "lucide-react";
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
function ResetPage() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({
      data
    }) => {
      if (data.session) setReady(true);
    });
    return () => sub.data.subscription.unsubscribe();
  }, []);
  async function submit(e) {
    e.preventDefault();
    if (pw !== pw2) return toast.error("Passwords don't match");
    if (pw.length < 8) return toast.error("Min 8 characters");
    setLoading(true);
    const {
      error
    } = await supabase.auth.updateUser({
      password: pw
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    nav({
      to: "/dashboard"
    });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-dark grid place-items-center px-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm bg-card rounded-2xl p-6 shadow-card", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold mb-1", children: "Reset password" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4", children: ready ? "Choose a new password." : "Verifying link…" }),
    ready && /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "New password" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Input, { type: show ? "text" : "password", required: true, value: pw, onChange: (e) => setPw(e.target.value) }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShow((s) => !s), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground", children: show ? /* @__PURE__ */ jsx(EyeOff, { className: "size-4" }) : /* @__PURE__ */ jsx(Eye, { className: "size-4" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "Confirm" }),
        /* @__PURE__ */ jsx(Input, { type: show ? "text" : "password", required: true, value: pw2, onChange: (e) => setPw2(e.target.value) })
      ] }),
      /* @__PURE__ */ jsx(Button, { disabled: loading, className: "w-full bg-gradient-mtn text-mtn-foreground", children: loading ? "Saving…" : "Update password" })
    ] })
  ] }) });
}
export {
  ResetPage as component
};
