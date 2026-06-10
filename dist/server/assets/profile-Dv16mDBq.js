import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { u as useMe, A as AppShell } from "./app-shell-Bv0Nrqf5.js";
import { B as Button } from "./button-Dbehd1zP.js";
import { I as Input } from "./input-BR2iTU4N.js";
import { L as Label } from "./label-BQVcCpGK.js";
import { s as supabase } from "./client-CIJIW76X.js";
import { toast } from "sonner";
import { EyeOff, Eye } from "lucide-react";
import "@tanstack/react-router";
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
import "./router-Si19vHi8.js";
import "@radix-ui/react-tooltip";
import "clsx";
import "tailwind-merge";
import "class-variance-authority";
import "./client.server-D5ro3rAQ.js";
import "@supabase/supabase-js";
import "zustand";
import "zustand/middleware";
import "./format-Dvz2fdZm.js";
import "framer-motion";
import "@radix-ui/react-slot";
import "@radix-ui/react-label";
function ProfilePage() {
  const {
    data: me,
    refetch
  } = useMe();
  const [name, setName] = useState(me?.profile?.full_name ?? "");
  const [phone, setPhone] = useState(me?.profile?.phone ?? "");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  useEffect(() => {
    setName(me?.profile?.full_name ?? "");
    setPhone(me?.profile?.phone ?? "");
  }, [me?.profile?.full_name, me?.profile?.phone]);
  const saveMut = useMutation({
    mutationFn: async () => {
      const {
        error
      } = await supabase.from("profiles").update({
        full_name: name,
        phone
      }).eq("id", me.profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      refetch();
    },
    onError: (e) => toast.error(e.message)
  });
  const pwMut = useMutation({
    mutationFn: async () => {
      if (pw !== pw2) throw new Error("Passwords don't match");
      if (pw.length < 8) throw new Error("Min 8 characters");
      const {
        error
      } = await supabase.auth.updateUser({
        password: pw
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Password updated");
      setPw("");
      setPw2("");
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-4", style: {
      fontFamily: "Space Grotesk"
    }, children: "Profile" }),
    /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border bg-card p-5 space-y-3", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Details" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Email" }),
          /* @__PURE__ */ jsx(Input, { value: me?.profile?.email ?? "", disabled: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Full name" }),
          /* @__PURE__ */ jsx(Input, { value: name, onChange: (e) => setName(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Phone" }),
          /* @__PURE__ */ jsx(Input, { value: phone, onChange: (e) => setPhone(e.target.value) })
        ] }),
        /* @__PURE__ */ jsx(Button, { onClick: () => saveMut.mutate(), disabled: saveMut.isPending, className: "bg-gradient-mtn text-mtn-foreground", children: saveMut.isPending ? "Saving…" : "Save changes" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border bg-card p-5 space-y-3", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Update password" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "New password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Input, { type: show ? "text" : "password", value: pw, onChange: (e) => setPw(e.target.value) }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShow((s) => !s), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground", children: show ? /* @__PURE__ */ jsx(EyeOff, { className: "size-4" }) : /* @__PURE__ */ jsx(Eye, { className: "size-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Confirm" }),
          /* @__PURE__ */ jsx(Input, { type: show ? "text" : "password", value: pw2, onChange: (e) => setPw2(e.target.value) })
        ] }),
        /* @__PURE__ */ jsx(Button, { onClick: () => pwMut.mutate(), disabled: pwMut.isPending || !pw, className: "bg-gradient-mtn text-mtn-foreground", children: pwMut.isPending ? "Updating…" : "Update password" })
      ] })
    ] })
  ] });
}
export {
  ProfilePage as component
};
