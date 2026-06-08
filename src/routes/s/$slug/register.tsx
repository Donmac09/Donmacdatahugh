import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getStorefront } from "@/lib/api/donmac.functions";

export const Route = createFileRoute("/s/$slug/register")({ component: SRegister });

function SRegister() {
  const { slug } = useParams({ from: "/s/$slug/register" });
  const nav = useNavigate();
  const fn = useServerFn(getStorefront);
  const { data: store } = useQuery({ queryKey: ["storefront", slug], queryFn: () => fn({ data: { slug } }) });
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!store) return toast.error("Storefront not loaded");
    if (pw.length < 8) return toast.error("Password min 8 characters");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password: pw,
      options: { data: { full_name: fullName, phone, reseller_id: store.reseller.id } },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome!"); nav({ to: "/dashboard" });
  }
  return (
    <div className="min-h-screen bg-gradient-dark grid place-items-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-5 text-white">
          <div className="text-2xl font-bold" style={{ fontFamily: "Space Grotesk" }}>{store?.reseller.store_name ?? "…"}</div>
          <div className="text-sm text-white/60">Create your account</div>
        </div>
        <form onSubmit={submit} className="bg-card rounded-2xl p-6 space-y-3 shadow-card">
          <div className="space-y-2"><Label>Full name</Label><Input required value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="024xxxxxxx" /></div>
          <div className="space-y-2"><Label>Password</Label>
            <div className="relative">
              <Input type={show ? "text" : "password"} required value={pw} onChange={(e) => setPw(e.target.value)} />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
            </div>
          </div>
          <Button disabled={loading} className="w-full bg-gradient-mtn text-mtn-foreground">{loading ? "Creating…" : "Create account"}</Button>
          <p className="text-xs text-center"><Link to="/s/$slug/login" params={{ slug }} className="underline">Already have an account?</Link></p>
        </form>
      </div>
    </div>
  );
}
