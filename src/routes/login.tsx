import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Zap } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) =>
    z.object({ redirect: z.string().optional() }).parse(s),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: (redirect as any) || "/dashboard" });
    });
  }, [navigate, redirect]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);

    // If this user is a customer of a reseller, route them to that storefront dashboard
    const uid = data.user!.id;
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("reseller_id").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    const roleNames = (roles ?? [])
      .map((item) => String(item.role ?? "").trim().toLowerCase())
      .filter(Boolean);
    const isCustomerOnly = roleNames.length > 0 && roleNames.every((r) => r === "customer");
    if (isCustomerOnly && profile?.reseller_id) {
      const { data: r } = await supabase.from("resellers").select("slug").eq("id", profile.reseller_id).maybeSingle();
      if (r?.slug) {
        toast.success("Welcome back!");
        navigate({ to: "/s/$slug", params: { slug: r.slug } });
        return;
      }
    }
    toast.success("Welcome back!");
    navigate({ to: (redirect as any) || "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-gradient-dark grid place-items-center px-4 py-10 relative overflow-hidden">
      <motion.div
        className="absolute -top-32 -right-32 size-96 rounded-full bg-mtn/30 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-mtn shadow-mtn mb-3">
            <Zap className="size-7 text-mtn-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>
            Donmac Data Hub
          </h1>
          <p className="text-sm text-white/60 mt-1">Sign in to continue</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-card rounded-2xl p-6 shadow-card space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pw">Password</Label>
            <div className="relative">
              <Input id="pw" type={showPw ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground underline">Forgot password?</Link>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-mtn text-mtn-foreground hover:opacity-90 shadow-mtn">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-xs text-center text-muted-foreground pt-2">
            New here? Registration is via your reseller's storefront link.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
