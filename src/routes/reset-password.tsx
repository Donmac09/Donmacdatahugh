import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/reset-password")({ component: ResetPage });

function ResetPage() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase puts tokens in URL hash; supabase-js handles automatically.
    const sub = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== pw2) return toast.error("Passwords don't match");
    if (pw.length < 8) return toast.error("Min 8 characters");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    nav({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-gradient-dark grid place-items-center px-4">
      <div className="w-full max-w-sm bg-card rounded-2xl p-6 shadow-card">
        <h1 className="text-xl font-bold mb-1">Reset password</h1>
        <p className="text-sm text-muted-foreground mb-4">{ready ? "Choose a new password." : "Verifying link…"}</p>
        {ready && (
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-2">
              <Label>New password</Label>
              <div className="relative">
                <Input type={show ? "text" : "password"} required value={pw} onChange={(e) => setPw(e.target.value)} />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
              </div>
            </div>
            <div className="space-y-2"><Label>Confirm</Label><Input type={show ? "text" : "password"} required value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
            <Button disabled={loading} className="w-full bg-gradient-mtn text-mtn-foreground">{loading ? "Saving…" : "Update password"}</Button>
          </form>
        )}
      </div>
    </div>
  );
}
