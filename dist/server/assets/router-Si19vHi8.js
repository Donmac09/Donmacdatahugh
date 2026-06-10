import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useEffect } from "react";
import { Toaster as Toaster$1 } from "sonner";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { s as supabase } from "./client-CIJIW76X.js";
import { z } from "zod";
import { cva } from "class-variance-authority";
import { supabaseAdmin } from "./client.server-D5ro3rAQ.js";
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const TooltipProvider = TooltipPrimitive.Provider;
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
const appCss = "/assets/styles-BRWsybvm.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("a", { href: "/", className: "mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90", children: "Go home" })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  const router2 = useRouter();
  useEffect(() => {
  }, [error]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-foreground", children: "Something went wrong" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: error.message }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => {
          router2.invalidate();
          reset();
        },
        className: "mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
        children: "Try again"
      }
    )
  ] }) });
}
const Route$r = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
      { title: "Donmac Data Hub – Fast MTN Data Bundles" },
      { name: "description", content: "Buy MTN Mashup Data & Minutes bundles instantly. Best prices, instant delivery." },
      { property: "og:title", content: "Donmac Data Hub – Fast MTN Data Bundles" },
      { property: "og:description", content: "Buy MTN Mashup Data & Minutes bundles instantly. Best prices, instant delivery." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Donmac Data Hub – Fast MTN Data Bundles" },
      { name: "twitter:description", content: "Buy MTN Mashup Data & Minutes bundles instantly. Best prices, instant delivery." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/zYsHqNzUsUSyFEl7mMwL0AV2lJ93/social-images/social-1780785957133-file_000000002718722f8fab7108a46715da.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/zYsHqNzUsUSyFEl7mMwL0AV2lJ93/social-images/social-1780785957133-file_000000002718722f8fab7108a46715da.webp" },
      { name: "twitter:card", content: "summary_large_image" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { style: { fontFamily: "Inter, system-ui, sans-serif" }, children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function AuthListener() {
  const router2 = useRouter();
  const { queryClient } = Route$r.useRouteContext();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router2.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router2, queryClient]);
  return null;
}
function RootComponent() {
  const { queryClient } = Route$r.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxs(TooltipProvider, { children: [
    /* @__PURE__ */ jsx(AuthListener, {}),
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Toaster, { position: "top-center", richColors: true })
  ] }) });
}
const $$splitComponentImporter$m = () => import("./reset-password-By9kSB0F.js");
const Route$q = createFileRoute("/reset-password")({
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./login-CaXRtJv2.js");
const Route$p = createFileRoute("/login")({
  ssr: false,
  validateSearch: (s) => z.object({
    redirect: z.string().optional()
  }).parse(s),
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./forgot-password-D6RbX9Zz.js");
const Route$o = createFileRoute("/forgot-password")({
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./route-BFsOu0JM.js");
const Route$n = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({
    location
  }) => {
    const {
      data,
      error
    } = await supabase.auth.getUser();
    if (error || !data.user) {
      const redirectPath = `${location.pathname}${location.searchStr ?? ""}${location.hash ?? ""}`;
      throw redirect({
        to: "/login",
        search: {
          redirect: redirectPath
        }
      });
    }
    return {
      user: data.user
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const Route$m = createFileRoute("/")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  }
});
const $$splitComponentImporter$i = () => import("./transactions-B9020TR_.js");
const Route$l = createFileRoute("/_authenticated/transactions")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
const $$splitComponentImporter$h = () => import("./topups-DS5dw88_.js");
const Route$k = createFileRoute("/_authenticated/topups")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
function StatusBadge({
  status
}) {
  const map = {
    credited: "bg-success/15 text-success",
    success: "bg-success/15 text-success",
    pending: "bg-warning/30 text-warning-foreground",
    processing: "bg-info/20 text-info",
    delivered: "bg-success/15 text-success",
    failed: "bg-destructive/15 text-destructive",
    rejected: "bg-destructive/15 text-destructive",
    paid: "bg-success/15 text-success",
    accepted: "bg-success/15 text-success"
  };
  return /* @__PURE__ */ jsx(Badge, { variant: "outline", className: `${map[status] ?? ""} border-0 capitalize`, children: status });
}
const $$splitComponentImporter$g = () => import("./profile-Dv16mDBq.js");
const Route$j = createFileRoute("/_authenticated/profile")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./orders-DTlnKpi8.js");
const Route$i = createFileRoute("/_authenticated/orders")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./mystore-CoI33Wkk.js");
const Route$h = createFileRoute("/_authenticated/mystore")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./dashboard-xXKlYOwB.js");
const Route$g = createFileRoute("/_authenticated/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./route-FPQLwqSA.js");
const Route$f = createFileRoute("/s/$slug")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./route-BsgpUFop.js");
const Route$e = createFileRoute("/_authenticated/admin")({
  beforeLoad: () => {
  },
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./index-DxTlwNhf.js");
const Route$d = createFileRoute("/s/$slug/")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const Route$c = createFileRoute("/api/me/")({
  loader: async ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", user.id).single(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", user.id)
    ]);
    const roleNames = (roles ?? []).map((item) => item.role);
    const hasAdmin = roleNames.includes("admin");
    const hasReseller = roleNames.includes("reseller");
    return new Response(JSON.stringify({
      id: user.id,
      email: user.email,
      profile,
      role: hasAdmin ? "admin" : hasReseller ? "reseller" : roleNames[0] ?? "customer",
      roles: roleNames
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
});
const Route$b = createFileRoute("/_authenticated/admin/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/analytics" });
  }
});
const $$splitComponentImporter$9 = () => import("./register-DyLmm42n.js");
const Route$a = createFileRoute("/s/$slug/register")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./login-D1ZL9vSR.js");
const Route$9 = createFileRoute("/s/$slug/login")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
function parseMomoSms(msg) {
  const text = msg.replace(/\s+/g, " ").trim();
  const out = { network: "mtn" };
  const amountMatch = text.match(/(?:GHS|GH₵|₵|GH\.?C|cedis?)\s*([0-9]+(?:[.,][0-9]{1,2})?)/i) ?? text.match(/\b([0-9]+(?:[.,][0-9]{1,2})?)\s*(?:GHS|cedis?)/i) ?? text.match(/Amount[:\s]+([0-9]+(?:[.,][0-9]{1,2})?)/i);
  if (amountMatch) out.amount = parseFloat(amountMatch[1].replace(",", "."));
  const txMatch = text.match(/Transaction\s*ID[:\s]*([A-Za-z0-9.]{6,})/i) ?? text.match(/\bTxn?\s*ID[:\s]*([A-Za-z0-9.]{6,})/i) ?? text.match(/\bFinancial\s*Trans(?:action)?\s*Id[:\s]*([A-Za-z0-9.]{6,})/i) ?? text.match(/\bRef(?:erence)?[:\s]*([A-Za-z0-9.]{6,})/i);
  if (txMatch) out.transactionId = txMatch[1];
  const refMatches = text.match(/\b[A-Z2-9]{6}\b/g);
  if (refMatches && refMatches.length) {
    out.refCode = refMatches.find((r) => r !== out.transactionId) ?? refMatches[0];
  }
  return out;
}
const MAIN_BRAND = {
  name: "Donmac Data Hub",
  whatsapp: "0549358359",
  momoName: "Osei Michael",
  momoNumber: "0549358359",
  adminEmail: "donmacdatahub@gmail.com"
};
const Route$8 = createFileRoute("/api/public/sms-webhook")({
  server: {
    handlers: {
      GET: async () => new Response(
        JSON.stringify({ ok: true, hint: "POST { message } with header x-webhook-secret" }),
        { headers: { "content-type": "application/json" } }
      ),
      POST: async ({ request }) => {
        const expected = process.env.SMS_WEBHOOK_SECRET;
        const provided = request.headers.get("x-webhook-secret") || new URL(request.url).searchParams.get("secret") || "";
        if (!expected || provided !== expected) {
          return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" }
          });
        }
        const contentType = request.headers.get("content-type") || "";
        let message = "";
        let from;
        try {
          if (contentType.includes("application/json")) {
            const body = await request.json();
            message = body.message || body.text || body.body || "";
            from = body.from;
          } else if (contentType.includes("application/x-www-form-urlencoded")) {
            const form = await request.formData();
            message = String(form.get("message") || form.get("text") || form.get("body") || "");
            from = String(form.get("from") || "") || void 0;
          } else {
            message = await request.text();
          }
        } catch {
          message = await request.text().catch(() => "");
        }
        if (!message) {
          return new Response(JSON.stringify({ ok: false, error: "no message" }), {
            status: 400,
            headers: { "content-type": "application/json" }
          });
        }
        const parsed = parseMomoSms(message);
        const { supabaseAdmin: supabaseAdmin2 } = await import("./client.server-D5ro3rAQ.js");
        const { data: adminProfile } = await supabaseAdmin2.from("profiles").select("id").eq("email", MAIN_BRAND.adminEmail).maybeSingle();
        if (!parsed.refCode || !parsed.amount) {
          if (adminProfile?.id) {
            await supabaseAdmin2.from("topups").insert({
              user_id: adminProfile.id,
              ref_code: parsed.refCode ?? "UNMATCHED",
              transaction_id: parsed.transactionId ?? null,
              amount: parsed.amount ?? null,
              method: "MoMo",
              status: "pending",
              raw_message: message
            });
          }
          return new Response(
            JSON.stringify({ ok: false, parsed, reason: "missing ref or amount" }),
            { status: 200, headers: { "content-type": "application/json" } }
          );
        }
        const { data: ref } = await supabaseAdmin2.from("ref_codes").select("*").eq("code", parsed.refCode).maybeSingle();
        if (!ref) {
          if (adminProfile?.id) {
            await supabaseAdmin2.from("topups").insert({
              user_id: adminProfile.id,
              ref_code: parsed.refCode,
              transaction_id: parsed.transactionId ?? null,
              amount: parsed.amount,
              method: "MoMo",
              status: "pending",
              raw_message: message
            });
          }
          return new Response(
            JSON.stringify({ ok: false, parsed, reason: "ref code not found" }),
            { status: 200, headers: { "content-type": "application/json" } }
          );
        }
        if (parsed.transactionId) {
          const { data: existing } = await supabaseAdmin2.from("topups").select("id").eq("transaction_id", parsed.transactionId).eq("status", "credited").maybeSingle();
          if (existing) {
            return new Response(JSON.stringify({ ok: true, alreadyCredited: true }), {
              headers: { "content-type": "application/json" }
            });
          }
        }
        const { data: p } = await supabaseAdmin2.from("profiles").select("balance").eq("id", ref.user_id).maybeSingle();
        if (!p) {
          return new Response(JSON.stringify({ ok: false, reason: "user missing" }), {
            status: 200,
            headers: { "content-type": "application/json" }
          });
        }
        const newBal = Number(p.balance) + Number(parsed.amount);
        await supabaseAdmin2.from("profiles").update({ balance: newBal }).eq("id", ref.user_id);
        await supabaseAdmin2.from("topups").insert({
          user_id: ref.user_id,
          ref_code: parsed.refCode,
          transaction_id: parsed.transactionId,
          amount: parsed.amount,
          method: "MoMo",
          status: "credited",
          raw_message: message
        });
        await supabaseAdmin2.from("transactions").insert({
          user_id: ref.user_id,
          type: "credit",
          amount: parsed.amount,
          description: `MoMo top-up (${parsed.transactionId ?? parsed.refCode})`,
          status: "success"
        });
        await supabaseAdmin2.from("ref_codes").update({ used: true }).eq("code", parsed.refCode);
        return new Response(
          JSON.stringify({ ok: true, credited: parsed.amount, userId: ref.user_id, from }),
          { headers: { "content-type": "application/json" } }
        );
      }
    }
  }
});
const $$splitComponentImporter$7 = () => import("./withdrawals-BebucfmJ.js");
const Route$7 = createFileRoute("/_authenticated/admin/withdrawals")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./users-Cr0ut8z6.js");
const Route$6 = createFileRoute("/_authenticated/admin/users")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./topups-DYzc48uI.js");
const Route$5 = createFileRoute("/_authenticated/admin/topups")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./settings-ByZgbFLg.js");
const Route$4 = createFileRoute("/_authenticated/admin/settings")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./resellers-DBhlTRXZ.js");
const Route$3 = createFileRoute("/_authenticated/admin/resellers")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./packages-CIAcUnvi.js");
const Route$2 = createFileRoute("/_authenticated/admin/packages")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./orders-BwBuhu_f.js");
const Route$1 = createFileRoute("/_authenticated/admin/orders")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./analytics-DatMQNNO.js");
const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const ResetPasswordRoute = Route$q.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$r
});
const LoginRoute = Route$p.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$r
});
const ForgotPasswordRoute = Route$o.update({
  id: "/forgot-password",
  path: "/forgot-password",
  getParentRoute: () => Route$r
});
const AuthenticatedRouteRoute = Route$n.update({
  id: "/_authenticated",
  getParentRoute: () => Route$r
});
const IndexRoute = Route$m.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$r
});
const AuthenticatedTransactionsRoute = Route$l.update({
  id: "/transactions",
  path: "/transactions",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedTopupsRoute = Route$k.update({
  id: "/topups",
  path: "/topups",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedProfileRoute = Route$j.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedOrdersRoute = Route$i.update({
  id: "/orders",
  path: "/orders",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedMystoreRoute = Route$h.update({
  id: "/mystore",
  path: "/mystore",
  getParentRoute: () => AuthenticatedRouteRoute
});
const AuthenticatedDashboardRoute = Route$g.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AuthenticatedRouteRoute
});
const SSlugRouteRoute = Route$f.update({
  id: "/s/$slug",
  path: "/s/$slug",
  getParentRoute: () => Route$r
});
const AuthenticatedAdminRouteRoute = Route$e.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => AuthenticatedRouteRoute
});
const SSlugIndexRoute = Route$d.update({
  id: "/",
  path: "/",
  getParentRoute: () => SSlugRouteRoute
});
const ApiMeIndexRoute = Route$c.update({
  id: "/api/me/",
  path: "/api/me/",
  getParentRoute: () => Route$r
});
const AuthenticatedAdminIndexRoute = Route$b.update({
  id: "/",
  path: "/",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const SSlugRegisterRoute = Route$a.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => SSlugRouteRoute
});
const SSlugLoginRoute = Route$9.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => SSlugRouteRoute
});
const ApiPublicSmsWebhookRoute = Route$8.update({
  id: "/api/public/sms-webhook",
  path: "/api/public/sms-webhook",
  getParentRoute: () => Route$r
});
const AuthenticatedAdminWithdrawalsRoute = Route$7.update({
  id: "/withdrawals",
  path: "/withdrawals",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedAdminUsersRoute = Route$6.update({
  id: "/users",
  path: "/users",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedAdminTopupsRoute = Route$5.update({
  id: "/topups",
  path: "/topups",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedAdminSettingsRoute = Route$4.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedAdminResellersRoute = Route$3.update({
  id: "/resellers",
  path: "/resellers",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedAdminPackagesRoute = Route$2.update({
  id: "/packages",
  path: "/packages",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedAdminOrdersRoute = Route$1.update({
  id: "/orders",
  path: "/orders",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedAdminAnalyticsRoute = Route.update({
  id: "/analytics",
  path: "/analytics",
  getParentRoute: () => AuthenticatedAdminRouteRoute
});
const AuthenticatedAdminRouteRouteChildren = {
  AuthenticatedAdminAnalyticsRoute,
  AuthenticatedAdminOrdersRoute,
  AuthenticatedAdminPackagesRoute,
  AuthenticatedAdminResellersRoute,
  AuthenticatedAdminSettingsRoute,
  AuthenticatedAdminTopupsRoute,
  AuthenticatedAdminUsersRoute,
  AuthenticatedAdminWithdrawalsRoute,
  AuthenticatedAdminIndexRoute
};
const AuthenticatedAdminRouteRouteWithChildren = AuthenticatedAdminRouteRoute._addFileChildren(
  AuthenticatedAdminRouteRouteChildren
);
const AuthenticatedRouteRouteChildren = {
  AuthenticatedAdminRouteRoute: AuthenticatedAdminRouteRouteWithChildren,
  AuthenticatedDashboardRoute,
  AuthenticatedMystoreRoute,
  AuthenticatedOrdersRoute,
  AuthenticatedProfileRoute,
  AuthenticatedTopupsRoute,
  AuthenticatedTransactionsRoute
};
const AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
const SSlugRouteRouteChildren = {
  SSlugLoginRoute,
  SSlugRegisterRoute,
  SSlugIndexRoute
};
const SSlugRouteRouteWithChildren = SSlugRouteRoute._addFileChildren(
  SSlugRouteRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
  ForgotPasswordRoute,
  LoginRoute,
  ResetPasswordRoute,
  SSlugRouteRoute: SSlugRouteRouteWithChildren,
  ApiPublicSmsWebhookRoute,
  ApiMeIndexRoute
};
const routeTree = Route$r._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Badge as B,
  MAIN_BRAND as M,
  StatusBadge as S,
  cn as c,
  router as r
};
