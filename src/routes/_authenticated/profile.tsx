import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AppShell, useMe } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({ component: ProfilePage });

function ProfilePage() {
  const { data: me, refetch } = useMe();
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
      const { error } = await supabase.from("profiles").update({ full_name: name, phone }).eq("id", me!.profile!.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profile updated"); refetch(); },
    onError: (e: any) => toast.error(e.message),
  });
  const pwMut = useMutation({
    mutationFn: async () => {
      if (pw !== pw2) throw new Error("Passwords don't match");
      if (pw.length < 8) throw new Error("Min 8 characters");
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Password updated"); setPw(""); setPw2(""); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "Space Grotesk" }}>Profile</h1>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-2xl border bg-card p-5 space-y-3">
          <h2 className="font-semibold">Details</h2>
          <div className="space-y-2"><Label>Email</Label><Input value={me?.profile?.email ?? ""} disabled /></div>
          <div className="space-y-2"><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending} className="bg-gradient-mtn text-mtn-foreground">{saveMut.isPending ? "Saving…" : "Save changes"}</Button>
        </div>
        <div className="rounded-2xl border bg-card p-5 space-y-3">
          <h2 className="font-semibold">Update password</h2>
          <div className="space-y-2"><Label>New password</Label>
            <div className="relative">
              <Input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
            </div>
          </div>
          <div className="space-y-2"><Label>Confirm</Label><Input type={show ? "text" : "password"} value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
          <Button onClick={() => pwMut.mutate()} disabled={pwMut.isPending || !pw} className="bg-gradient-mtn text-mtn-foreground">{pwMut.isPending ? "Updating…" : "Update password"}</Button>
        </div>
      </div>
    </AppShell>
  );
}
