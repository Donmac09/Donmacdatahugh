import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { u as useServerFn, g as getPackagesForUser, b as createRefCode, d as claimByTransactionId } from "./donmac.functions-CukCaMJG.js";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { u as useMe, A as AppShell, a as useCart } from "./app-shell-Bv0Nrqf5.js";
import { B as Button } from "./button-Dbehd1zP.js";
import { I as Input } from "./input-BR2iTU4N.js";
import { D as Dialog, a as DialogTrigger, b as DialogContent, c as DialogHeader, d as DialogTitle } from "./dialog-LbBwVmLq.js";
import { L as Label } from "./label-BQVcCpGK.js";
import { G as GHS } from "./format-Dvz2fdZm.js";
import { M as MAIN_BRAND } from "./router-Si19vHi8.js";
import { Wallet, Plus, Copy, Loader2, Hash, Zap, CheckCircle, XCircle, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";
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
import "./client-CIJIW76X.js";
import "@supabase/supabase-js";
import "zustand";
import "zustand/middleware";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-dialog";
import "@radix-ui/react-label";
import "@radix-ui/react-tooltip";
import "clsx";
import "tailwind-merge";
import "./client.server-D5ro3rAQ.js";
const networkPrefixes = {
  "MTN": ["024", "054", "055", "059", "025", "053"],
  "Telecel": ["020", "050", "026"],
  "Airteltigo": ["027", "057"],
  "Airtime": "all"
};
function validatePhoneNumber(phone, network) {
  if (network === "Airtime") return {
    valid: true
  };
  const prefix = phone.substring(0, 3);
  const validPrefixes = networkPrefixes[network] || [];
  if (validPrefixes.includes(prefix)) {
    return {
      valid: true
    };
  }
  const networkName = network === "Airteltigo" ? "Airteltigo" : network;
  return {
    valid: false,
    message: `This number is not a valid ${networkName} number. ${networkName} numbers start with: ${validPrefixes.join(", ")}`
  };
}
function DashboardPage() {
  const {
    data: me
  } = useMe();
  const packagesFn = useServerFn(getPackagesForUser);
  const [time, setTime] = useState(/* @__PURE__ */ new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(/* @__PURE__ */ new Date()), 1e3);
    return () => clearInterval(t);
  }, []);
  const greeting = (() => {
    const h = time.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();
  const {
    data: pkgs,
    isLoading
  } = useQuery({
    queryKey: ["packages"],
    queryFn: () => packagesFn()
  });
  const allPackages = pkgs?.packages ?? [];
  const mtnMashupData = allPackages.filter((p) => p.name?.includes("MTN Mashup") && p.type === "data" && !p.name?.includes("mins"));
  const mtnMashupMinutes = allPackages.filter((p) => p.type === "minutes_data");
  const mtnStandard = allPackages.filter((p) => p.network === "MTN" && !p.name?.includes("Mashup") && p.type === "data");
  const telecel = allPackages.filter((p) => p.network === "Telecel");
  const airteltigoPremium = allPackages.filter((p) => p.name?.includes("Airteltigo Premium"));
  const airteltigoBigTime = allPackages.filter((p) => p.name?.includes("Airteltigo Big Time"));
  const airtime = allPackages.filter((p) => p.type === "airtime");
  const statusMap = new Map(pkgs?.status?.map((s) => [`${s.network}:${s.type}`, s.online]) || []);
  const mtnMashupDataOnline = statusMap.get("mtn:data") ?? true;
  const mtnMashupMinutesOnline = statusMap.get("mtn:mins_data") ?? true;
  const mtnStandardOnline = statusMap.get("mtn:data") ?? true;
  const telecelOnline = statusMap.get("telecel:data") ?? true;
  const airteltigoPremiumOnline = statusMap.get("airteltigo:data") ?? true;
  const airteltigoBigtimeOnline = statusMap.get("airteltigo:data") ?? true;
  const airtimeOnline = statusMap.get("airtime:data") ?? true;
  if (isLoading) {
    return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsx("div", { className: "text-center", children: "Loading packages..." }) }) });
  }
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(motion.section, { initial: {
      opacity: 0,
      y: 10
    }, animate: {
      opacity: 1,
      y: 0
    }, children: /* @__PURE__ */ jsxs("div", { className: "rounded-3xl bg-gradient-dark text-white p-6 md:p-8 relative overflow-hidden shadow-card", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -top-12 -right-12 size-48 rounded-full bg-mtn/30 blur-2xl" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("p", { className: "text-white/60 text-xs uppercase tracking-wider", children: greeting }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl md:text-3xl font-bold mt-1", style: {
          fontFamily: "Space Grotesk"
        }, children: me?.profile?.full_name || me?.profile?.email }),
        /* @__PURE__ */ jsxs("p", { className: "text-white/70 text-sm mt-1", children: [
          time.toLocaleString("en-GB", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
          }),
          " • ",
          time.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-4 mt-5", children: [
      /* @__PURE__ */ jsxs(motion.div, { initial: {
        opacity: 0,
        scale: 0.96
      }, animate: {
        opacity: 1,
        scale: 1
      }, className: "rounded-2xl bg-gradient-mtn text-mtn-foreground p-5 shadow-mtn relative overflow-hidden", children: [
        /* @__PURE__ */ jsx(Wallet, { className: "size-7 mb-2" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs/none opacity-80 uppercase tracking-wider", children: "Wallet balance" }),
        /* @__PURE__ */ jsx("p", { className: "text-3xl font-black mt-1", style: {
          fontFamily: "Space Grotesk"
        }, children: GHS(me?.profile?.balance ?? 0) }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-4", children: [
          /* @__PURE__ */ jsx(TopUpDialog, {}),
          /* @__PURE__ */ jsx(ClaimDialog, {})
        ] })
      ] }),
      /* @__PURE__ */ jsxs(motion.div, { initial: {
        opacity: 0,
        scale: 0.96
      }, animate: {
        opacity: 1,
        scale: 1
      }, transition: {
        delay: 0.05
      }, className: "rounded-2xl bg-card border p-5 shadow-card", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs uppercase text-muted-foreground tracking-wider mb-2", children: "Profile" }),
        /* @__PURE__ */ jsx("div", { className: "font-semibold", children: me?.profile?.full_name || me?.profile?.email }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: me?.profile?.email }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: me?.profile?.phone }),
        /* @__PURE__ */ jsx(Link, { to: "/profile", className: "inline-block mt-3 text-xs underline", children: "Edit profile" })
      ] })
    ] }),
    mtnMashupData.length > 0 && /* @__PURE__ */ jsx(PackagesSection, { title: "MTN Mashup Data", online: mtnMashupDataOnline, packages: mtnMashupData, network: "MTN", variant: "mashup" }),
    mtnMashupMinutes.length > 0 && /* @__PURE__ */ jsx(PackagesSection, { title: "MTN Mashup Minutes + Data", online: mtnMashupMinutesOnline, packages: mtnMashupMinutes, network: "MTN", variant: "mashup" }),
    mtnStandard.length > 0 && /* @__PURE__ */ jsx(PackagesSection, { title: "MTN", online: mtnStandardOnline, packages: mtnStandard, network: "MTN", variant: "standard" }),
    telecel.length > 0 && /* @__PURE__ */ jsx(PackagesSection, { title: "Telecel", online: telecelOnline, packages: telecel, network: "Telecel", variant: "telecel" }),
    airteltigoPremium.length > 0 && /* @__PURE__ */ jsx(PackagesSection, { title: "Airteltigo Premium", online: airteltigoPremiumOnline, packages: airteltigoPremium, network: "Airteltigo", variant: "premium" }),
    airteltigoBigTime.length > 0 && /* @__PURE__ */ jsx(PackagesSection, { title: "Airteltigo Big Time", online: airteltigoBigtimeOnline, packages: airteltigoBigTime, network: "Airteltigo", variant: "bigtime" }),
    airtime.length > 0 && /* @__PURE__ */ jsx(PackagesSection, { title: "Airtime", online: airtimeOnline, packages: airtime, network: "Airtime", variant: "airtime" })
  ] });
}
function PackagesSection({
  title,
  online,
  packages,
  network,
  variant
}) {
  const [open, setOpen] = useState(false);
  if (packages.length === 0) return null;
  let gradientClass = "";
  let textColorClass = "text-white";
  if (network === "MTN") {
    gradientClass = variant === "mashup" ? "from-yellow-400 to-yellow-600" : "from-yellow-500 to-orange-500";
    textColorClass = "text-black";
  } else if (network === "Telecel") {
    gradientClass = "from-red-500 to-red-700";
    textColorClass = "text-white";
  } else if (network === "Airteltigo") {
    gradientClass = "from-red-600 to-blue-600";
    textColorClass = "text-white";
  } else if (network === "Airtime") {
    gradientClass = "from-purple-500 to-pink-500";
    textColorClass = "text-white";
  } else {
    gradientClass = "from-gray-500 to-gray-700";
    textColorClass = "text-white";
  }
  return /* @__PURE__ */ jsxs("section", { className: "mt-6", children: [
    /* @__PURE__ */ jsxs("button", { onClick: () => setOpen((v) => !v), className: `w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r ${gradientClass} ${textColorClass} shadow-lg hover:shadow-xl transition group`, children: [
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "size-10 rounded-xl bg-white/20 backdrop-blur grid place-items-center", children: /* @__PURE__ */ jsx(Zap, { className: "size-5" }) }),
        /* @__PURE__ */ jsxs("span", { className: "text-left", children: [
          /* @__PURE__ */ jsx("span", { className: "block font-bold", style: {
            fontFamily: "Space Grotesk"
          }, children: title }),
          /* @__PURE__ */ jsxs("span", { className: "block text-xs opacity-80", children: [
            packages.length,
            " packages • Tap to ",
            open ? "hide" : "view"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("span", { className: `text-[10px] font-semibold px-2 py-1 rounded-full inline-flex items-center gap-1 ${online ? "bg-green-500 text-white" : "bg-red-500 text-white"}`, children: [
          online ? /* @__PURE__ */ jsx(CheckCircle, { className: "size-3" }) : /* @__PURE__ */ jsx(XCircle, { className: "size-3" }),
          online ? "Online" : "Offline"
        ] }),
        /* @__PURE__ */ jsx(motion.span, { animate: {
          rotate: open ? 180 : 0
        }, children: /* @__PURE__ */ jsx(ChevronDown, { className: "size-5" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AnimatePresenceSection, { open, children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3", children: packages.map((p, idx) => /* @__PURE__ */ jsx(PackageCard, { pkg: p, delay: idx * 0.03, disabled: !online, network, variant }, p.id)) }) })
  ] });
}
function AnimatePresenceSection({
  open,
  children
}) {
  return /* @__PURE__ */ jsx(motion.div, { initial: false, animate: {
    height: open ? "auto" : 0,
    opacity: open ? 1 : 0
  }, transition: {
    duration: 0.25
  }, style: {
    overflow: "hidden"
  }, children });
}
function PackageCard({
  pkg,
  delay,
  disabled,
  network,
  variant
}) {
  const [open, setOpen] = useState(false);
  let gradientClass = "";
  let textColorClass = "text-white";
  let priceDisplay = "";
  if (network === "MTN") {
    gradientClass = variant === "mashup" ? "from-yellow-400 to-yellow-600" : "from-yellow-500 to-orange-500";
    textColorClass = "text-black";
    priceDisplay = `₵${pkg.display_price ?? pkg.cost_price}`;
  } else if (network === "Telecel") {
    gradientClass = "from-red-500 to-red-700";
    textColorClass = "text-white";
    priceDisplay = `₵${pkg.display_price ?? pkg.cost_price}`;
  } else if (network === "Airteltigo") {
    gradientClass = "from-red-600 to-blue-600";
    textColorClass = "text-white";
    priceDisplay = `₵${pkg.display_price ?? pkg.cost_price}`;
  } else if (network === "Airtime") {
    gradientClass = "from-purple-500 to-pink-500";
    textColorClass = "text-white";
    priceDisplay = `₵0.50 - ₵50`;
  } else {
    gradientClass = "from-gray-500 to-gray-700";
    textColorClass = "text-white";
    priceDisplay = `₵${pkg.display_price ?? pkg.cost_price}`;
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(motion.button, { whileHover: {
      y: -3
    }, initial: {
      opacity: 0,
      y: 8
    }, animate: {
      opacity: 1,
      y: 0
    }, transition: {
      delay
    }, disabled, onClick: () => setOpen(true), className: `text-left p-4 rounded-2xl bg-gradient-to-br ${gradientClass} ${textColorClass} shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden w-full`, children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -top-6 -right-6 size-20 rounded-full bg-white/10" }),
      /* @__PURE__ */ jsx("div", { className: "text-xs/none uppercase tracking-wider opacity-80", children: network === "Airtime" ? "Airtime" : network }),
      /* @__PURE__ */ jsx("div", { className: "font-black text-lg mt-1", style: {
        fontFamily: "Space Grotesk"
      }, children: pkg.label || pkg.name }),
      pkg.size_gb && /* @__PURE__ */ jsxs("div", { className: "text-sm opacity-80", children: [
        pkg.size_gb,
        " GB"
      ] }),
      pkg.minutes && /* @__PURE__ */ jsxs("div", { className: "text-sm opacity-80", children: [
        pkg.minutes,
        " mins + ",
        pkg.data_mb,
        "MB"
      ] }),
      network === "Airtime" && /* @__PURE__ */ jsx("div", { className: "text-sm opacity-80", children: "Enter custom amount" }),
      /* @__PURE__ */ jsx("div", { className: "mt-2 text-2xl font-black", children: priceDisplay }),
      /* @__PURE__ */ jsx("div", { className: "text-[10px] opacity-70 mt-1", children: "Non-expiry" })
    ] }),
    /* @__PURE__ */ jsx(BuyDialog, { open, setOpen, pkg, network })
  ] });
}
function BuyDialog({
  open,
  setOpen,
  pkg,
  price,
  network
}) {
  const [phone, setPhone] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const cart = useCart();
  const isAirtime = network === "Airtime" || pkg.type === "airtime";
  const pkgNetwork = pkg.network || (network === "Airtime" ? "Airtime" : "MTN");
  const amt = isAirtime ? parseFloat(customAmount) : price ?? Number(pkg.display_price ?? pkg.cost_price);
  function handlePhoneChange(value) {
    setPhone(value);
    setPhoneError("");
    if (value.length === 10 && /^0\d{9}$/.test(value)) {
      const validation = validatePhoneNumber(value, pkgNetwork);
      if (!validation.valid) {
        setPhoneError(validation.message || "Invalid number for this network");
      }
    }
  }
  function addToCart() {
    if (!/^0\d{9}$/.test(phone)) return toast.error("Enter a valid Ghana number (e.g. 024xxxxxxx)");
    const validation = validatePhoneNumber(phone, pkgNetwork);
    if (!validation.valid) {
      return toast.error(validation.message);
    }
    if (isAirtime && (amt < 0.5 || amt > 50)) return toast.error("Airtime amount must be between ₵0.50 and ₵50");
    if (isNaN(amt) || amt <= 0) return toast.error("Please enter a valid amount");
    cart.add({
      packageId: pkg.id,
      label: pkg.label || pkg.name,
      amount: amt,
      costPrice: Number(pkg.cost_price) || amt,
      phone
    });
    toast.success("Added to cart");
    setOpen(false);
    setPhone("");
    setCustomAmount("");
    setPhoneError("");
  }
  function cancel() {
    setOpen(false);
    setCustomAmount("");
    setPhoneError("");
  }
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md", children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: pkg.label || pkg.name }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-muted p-4 space-y-2 text-sm", children: [
        isAirtime ? /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Price Range" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold", children: "₵0.50 - ₵50" })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Price" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold", children: GHS(amt) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Validity" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Non-expiry" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Network" }),
          /* @__PURE__ */ jsx("span", { className: "font-bold uppercase", children: pkgNetwork })
        ] })
      ] }),
      isAirtime && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "Enter Amount (₵0.50 - ₵50)" }),
        /* @__PURE__ */ jsx(Input, { type: "number", step: "0.5", min: "0.5", max: "50", value: customAmount, onChange: (e) => setCustomAmount(e.target.value), placeholder: "e.g., 10.00" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "Recipient phone number" }),
        /* @__PURE__ */ jsx(Input, { value: phone, onChange: (e) => handlePhoneChange(e.target.value), inputMode: "numeric", maxLength: 10, placeholder: "0241234567", className: phoneError ? "border-red-500" : "" }),
        phoneError && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-500", children: phoneError }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          !isAirtime && pkgNetwork === "MTN" && "Valid MTN prefixes: 024, 054, 055, 059, 025, 053",
          !isAirtime && pkgNetwork === "Telecel" && "Valid Telecel prefixes: 020, 050, 026",
          !isAirtime && pkgNetwork === "Airteltigo" && "Valid Airteltigo prefixes: 027, 057",
          isAirtime && "Airtime works for all networks"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 pt-2", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: cancel, children: [
          /* @__PURE__ */ jsx(X, { className: "size-4 mr-1" }),
          " Cancel"
        ] }),
        /* @__PURE__ */ jsx(Button, { onClick: addToCart, disabled: isAirtime && (!customAmount || amt < 0.5 || amt > 50) || !!phoneError || !phone, className: "bg-gradient-mtn text-mtn-foreground", children: "Add to cart" })
      ] })
    ] })
  ] }) });
}
function TopUpDialog() {
  const fn = useServerFn(createRefCode);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(false);
  async function gen(forceRegenerate = false) {
    setLoading(true);
    try {
      const r = await fn({
        data: {
          forceRegenerate
        }
      });
      setCode(r.code);
      toast.success("Reference code generated!");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: (o) => {
    setOpen(o);
    if (!o) setCode(null);
    if (o && !code) void gen(false);
  }, children: [
    /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", className: "bg-mtn-foreground/10 text-mtn-foreground hover:bg-mtn-foreground/20", children: [
      /* @__PURE__ */ jsx(Plus, { className: "size-4 mr-1" }),
      "Top up"
    ] }) }),
    /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Top up via Mobile Money" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-sm", children: [
        /* @__PURE__ */ jsx("p", { children: "Send Mobile Money to:" }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-muted p-4 space-y-2", children: [
          /* @__PURE__ */ jsx(Row, { label: "Name", value: MAIN_BRAND.momoName }),
          /* @__PURE__ */ jsx(Row, { label: "Number", value: MAIN_BRAND.momoNumber, copy: true })
        ] }),
        /* @__PURE__ */ jsx("p", { children: "Generate a 6-character reference code and use it as the MoMo reference. Your wallet will be auto-credited." }),
        code ? /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-gradient-mtn p-5 text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wider text-mtn-foreground/70", children: "Your reference code" }),
          /* @__PURE__ */ jsx("p", { className: "text-3xl font-black text-mtn-foreground tracking-widest mt-1 font-mono", style: {
            fontFamily: "Space Grotesk"
          }, children: code }),
          /* @__PURE__ */ jsxs("button", { onClick: () => {
            navigator.clipboard.writeText(code);
            toast.success("Copied!");
          }, className: "mt-2 text-xs inline-flex items-center gap-1 text-mtn-foreground/80", children: [
            /* @__PURE__ */ jsx(Copy, { className: "size-3" }),
            " Copy code"
          ] }),
          /* @__PURE__ */ jsx(Button, { onClick: () => gen(true), disabled: loading, variant: "secondary", size: "sm", className: "mt-3 bg-mtn-foreground/10 text-mtn-foreground hover:bg-mtn-foreground/20", children: loading ? "Generating..." : "Generate new code" })
        ] }) : /* @__PURE__ */ jsxs(Button, { onClick: () => gen(false), disabled: loading, className: "w-full bg-gradient-mtn text-mtn-foreground", children: [
          loading ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin mr-2" }) : null,
          loading ? "Generating..." : "Generate reference code"
        ] })
      ] })
    ] })
  ] });
}
function ClaimDialog() {
  const fn = useServerFn(claimByTransactionId);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [tx, setTx] = useState("");
  const [amt, setAmt] = useState("");
  const mut = useMutation({
    mutationFn: () => fn({
      data: {
        transactionId: tx.trim(),
        amount: parseFloat(amt)
      }
    }),
    onSuccess: () => {
      toast.success("Claim submitted for review");
      setOpen(false);
      setTx("");
      setAmt("");
      qc.invalidateQueries({
        queryKey: ["topups"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", className: "bg-mtn-foreground/10 text-mtn-foreground hover:bg-mtn-foreground/20", children: [
      /* @__PURE__ */ jsx(Hash, { className: "size-4 mr-1" }),
      "Claim"
    ] }) }),
    /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Claim with Transaction ID" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Transaction ID" }),
          /* @__PURE__ */ jsx(Input, { value: tx, onChange: (e) => setTx(e.target.value), placeholder: "e.g. 1234567890.1234.123456" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Amount (₵)" }),
          /* @__PURE__ */ jsx(Input, { type: "number", step: "0.01", value: amt, onChange: (e) => setAmt(e.target.value), placeholder: "0.00" })
        ] }),
        /* @__PURE__ */ jsxs(Button, { disabled: mut.isPending || !tx || !amt, onClick: () => mut.mutate(), className: "w-full bg-gradient-mtn text-mtn-foreground", children: [
          mut.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin mr-2" }) : null,
          mut.isPending ? "Submitting..." : "Submit claim"
        ] })
      ] })
    ] })
  ] });
}
function Row({
  label,
  value,
  copy
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs", children: label }),
    /* @__PURE__ */ jsxs("span", { className: "font-semibold flex items-center gap-2", children: [
      value,
      copy && /* @__PURE__ */ jsx("button", { onClick: () => {
        navigator.clipboard.writeText(value);
        toast.success("Copied");
      }, children: /* @__PURE__ */ jsx(Copy, { className: "size-3" }) })
    ] })
  ] });
}
export {
  DashboardPage as component
};
