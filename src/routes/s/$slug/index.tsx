import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { getStorefront } from "@/lib/api/donmac.functions";
import { supabase } from "@/integrations/supabase/client";
import { GHS } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { MessageCircle, Zap, LogIn, UserPlus } from "lucide-react";

export const Route = createFileRoute("/s/$slug/")({ component: StorefrontHome });

function StorefrontHome() {
  const { slug } = useParams({ from: "/s/$slug/" });
  const fn = useServerFn(getStorefront);
  const { data } = useQuery({ queryKey: ["storefront", slug], queryFn: () => fn({ data: { slug } }) });
  const [user, setUser] = useState<any>(null);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUser(data.user)); }, []);

  if (!data) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading storefront…</div>;

  const dataPkgs = data.packages.filter((p) => p.type === "data");
  const minsPkgs = data.packages.filter((p) => p.type === "mins_data");
  const dataOnline = data.networkStatus.find((s) => s.type === "data")?.online ?? true;
  const minsOnline = data.networkStatus.find((s) => s.type === "mins_data")?.online ?? true;
  const wa = data.reseller.whatsapp;

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="bg-gradient-dark text-white">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-xl bg-gradient-mtn grid place-items-center text-mtn-foreground font-black">{data.reseller.store_name[0]}</div>
            <div className="font-bold" style={{ fontFamily: "Space Grotesk" }}>{data.reseller.store_name}</div>
          </div>
          <div className="flex gap-2">
            {user ? (
              <Link to="/dashboard"><Button size="sm" variant="secondary">Dashboard</Button></Link>
            ) : (
              <>
                <Link to="/s/$slug/login" params={{ slug }}><Button size="sm" variant="secondary"><LogIn className="size-4 mr-1" />Login</Button></Link>
                <Link to="/s/$slug/register" params={{ slug }}><Button size="sm" className="bg-gradient-mtn text-mtn-foreground"><UserPlus className="size-4 mr-1" />Register</Button></Link>
              </>
            )}
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 pb-10">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-black text-balance" style={{ fontFamily: "Space Grotesk" }}>
            Instant MTN data, <span className="text-mtn">fair prices.</span>
          </motion.h1>
          {data.reseller.welcome_message && <p className="mt-3 text-white/80 max-w-xl">{data.reseller.welcome_message}</p>}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        <Section title="MTN Mashup Data" online={dataOnline} packages={dataPkgs} />
        <Section title="MTN Mashup Minutes + Data" online={minsOnline} packages={minsPkgs} />
      </main>

      <a href={`https://wa.me/233${wa.replace(/^0/, "")}`} target="_blank" rel="noreferrer" className="fixed bottom-5 left-5 z-40 size-14 rounded-full bg-success grid place-items-center shadow-lg">
        <MessageCircle className="size-7 text-white" />
      </a>
    </div>
  );
}

function Section({ title, online, packages }: { title: string; online: boolean; packages: any[] }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-lg flex items-center gap-2" style={{ fontFamily: "Space Grotesk" }}><Zap className="size-5 text-mtn" />{title}</h2>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${online ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{online ? "Online" : "Offline"}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {packages.map((p, idx) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="rounded-2xl bg-gradient-mtn text-mtn-foreground p-4 shadow-mtn">
            <div className="text-xs uppercase opacity-70">MTN</div>
            <div className="font-black text-lg mt-1" style={{ fontFamily: "Space Grotesk" }}>{p.label}</div>
            <div className="text-2xl font-black mt-2">{GHS(p.price)}</div>
            <div className="text-[10px] opacity-70 mt-1">Non-expiry • Login to buy</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
