import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPage });

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setSent(true);
    toast.success("Check your email for the reset link");
  }
  return (
    <div className="min-h-screen bg-gradient-dark grid place-items-center px-4">
      <div className="w-full max-w-sm bg-card rounded-2xl p-6 shadow-card">
        <Link to="/login" className="inline-flex items-center gap-1 text-xs text-muted-foreground mb-4"><ArrowLeft className="size-3" />Back</Link>
        <h1 className="text-xl font-bold">Forgot password</h1>
        <p className="text-sm text-muted-foreground mb-4">We'll send a reset link to your email.</p>
        {sent ? (
          <p className="text-sm text-success">Email sent. Open the link from the same device.</p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-2"><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <Button disabled={loading} className="w-full bg-gradient-mtn text-mtn-foreground">{loading ? "Sending…" : "Send reset link"}</Button>
          </form>
        )}
      </div>
    </div>
  );
}
