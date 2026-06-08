import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { genRefCode } from "@/lib/format";

// === Profile helpers ===
export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roles }, { data: reseller }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("resellers").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    const { data: linkedReseller } = profile?.reseller_id
      ? await supabase
          .from("resellers")
          .select("id, store_name, slug, welcome_message, whatsapp")
          .eq("id", profile.reseller_id)
          .maybeSingle()
      : { data: null };

    return {
      profile,
      roles: roles?.map((r) => r.role) ?? [],
      reseller,
      linkedReseller,
    };
  });

// === Ref codes / topups ===
export const createRefCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d?: { forceRegenerate?: boolean }) =>
    z.object({ forceRegenerate: z.boolean().optional().default(false) }).parse(d ?? {}),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    if (!data.forceRegenerate) {
      const { data: existing } = await supabase
        .from("ref_codes")
        .select("code")
        .eq("user_id", userId)
        .eq("used", false)
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (existing?.code) return { code: existing.code };
    }

    const { error: retireError } = await supabase
      .from("ref_codes")
      .update({ used: true })
      .eq("user_id", userId)
      .eq("used", false);

    if (retireError) throw new Error(retireError.message);

    for (let i = 0; i < 6; i++) {
      const code = genRefCode();
      const { error } = await supabase.from("ref_codes").insert({ code, user_id: userId });
      if (!error) return { code };
    }
    throw new Error("Could not generate ref code, try again");
  });

export const claimByTransactionId = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { transactionId: string; amount: number }) =>
    z.object({ transactionId: z.string().min(4).max(64), amount: z.number().positive().max(100000) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    // create a pending topup; admin will mark credited or webhook will match
    const { error } = await supabase.from("topups").insert({
      user_id: userId,
      ref_code: "MANUAL",
      transaction_id: data.transactionId,
      amount: data.amount,
      status: "pending",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getPackagesForUser = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: profile }, { data: roles }, { data: packages }, { data: networkStatus }] = await Promise.all([
      supabase.from("profiles").select("reseller_id").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabaseAdmin.from("packages").select("*").eq("enabled", true).order("type").order("sort_order"),
      supabaseAdmin.from("network_status").select("*"),
    ]);

    const isReseller = roles?.some((r) => r.role === "reseller") ?? false;
    const resellerId = profile?.reseller_id ?? null;
    const ids = (packages ?? []).map((p) => p.id);

    let priceMap = new Map<string, number>();
    if (!isReseller && resellerId && ids.length) {
      const { data: resellerPrices } = await supabaseAdmin
        .from("reseller_prices")
        .select("package_id, price")
        .eq("reseller_id", resellerId)
        .in("package_id", ids);

      priceMap = new Map((resellerPrices ?? []).map((p) => [p.package_id, Number(p.price)]));
    }

    return {
      packages: (packages ?? []).map((p) => ({
        ...p,
        display_price: priceMap.get(p.id) ?? Number(p.cost_price),
      })),
      status: networkStatus ?? [],
    };
  });

// === Orders / cart checkout ===
export const placeOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { items: Array<{ packageId: string; phone: string }> }) =>
    z
      .object({
        items: z
          .array(
            z.object({
              packageId: z.string().uuid(),
              phone: z.string().min(7).max(20),
            }),
          )
          .min(1)
          .max(20),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (!profile) throw new Error("Profile not found");
    if (profile.blocked) throw new Error("Your account is blocked");

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const isReseller = roles?.some((r) => r.role === "reseller");

    const ids = data.items.map((i) => i.packageId);
    const { data: pkgs } = await supabaseAdmin.from("packages").select("*").in("id", ids);
    if (!pkgs || pkgs.length === 0) throw new Error("No packages found");

    // pricing: if reseller, charge their cost_price; if customer with reseller_id, charge reseller_prices; else cost_price
    let prices: Record<string, number> = {};
    if (isReseller || !profile.reseller_id) {
      pkgs.forEach((p) => (prices[p.id] = Number(p.cost_price)));
    } else {
      const { data: rp } = await supabaseAdmin
        .from("reseller_prices")
        .select("package_id, price")
        .eq("reseller_id", profile.reseller_id)
        .in("package_id", ids);
      const map = new Map((rp ?? []).map((r) => [r.package_id, Number(r.price)]));
      pkgs.forEach((p) => (prices[p.id] = map.get(p.id) ?? Number(p.cost_price)));
    }

    const total = data.items.reduce((s, it) => s + (prices[it.packageId] ?? 0), 0);
    const balance = Number(profile.balance ?? 0);
    if (balance < total) throw new Error("Insufficient wallet balance");

    // create orders (sequential refs DHM001…)
    const rows: any[] = [];
    for (const it of data.items) {
      const p = pkgs.find((x) => x.id === it.packageId)!;
      const { data: refRow } = await supabaseAdmin.rpc("next_order_ref");
      rows.push({
        ref: refRow as unknown as string,
        user_id: userId,
        reseller_id: profile.reseller_id,
        package_id: it.packageId,
        network: p.network,
        phone: it.phone,
        amount: prices[it.packageId],
        cost_price: Number(p.cost_price),
        status: "pending" as const,
      });
    }
    const { data: inserted, error: oerr } = await supabaseAdmin.from("orders").insert(rows).select();
    if (oerr) throw new Error(oerr.message);

    // debit wallet & log transactions
    const newBalance = balance - total;
    const { error: uerr } = await supabaseAdmin
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", userId);
    if (uerr) throw new Error(uerr.message);

    await supabaseAdmin.from("transactions").insert(
      inserted!.map((o) => ({
        user_id: userId,
        type: "debit" as const,
        description: `Order ${o.ref}`,
        amount: o.amount,
        status: "success" as const,
      })),
    );

    return { ok: true, count: inserted!.length, total, balance: newBalance };
  });

// === Reseller storefront ===
export const createMyStore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { storeName: string; welcomeMessage: string; whatsapp: string }) =>
    z
      .object({
        storeName: z.string().min(2).max(60),
        welcomeMessage: z.string().max(280).optional().default(""),
        whatsapp: z.string().min(7).max(20),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (!roles?.some((r) => r.role === "reseller")) throw new Error("Only resellers can create a store");

    const baseSlug = data.storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 32) || "store";
    let slug = baseSlug;
    for (let i = 0; i < 20; i++) {
      const { data: exists } = await supabaseAdmin.from("resellers").select("id").eq("slug", slug).maybeSingle();
      if (!exists) break;
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 5)}`;
    }
    const { data: row, error } = await supabase
      .from("resellers")
      .upsert(
        {
          user_id: userId,
          store_name: data.storeName,
          welcome_message: data.welcomeMessage,
          whatsapp: data.whatsapp,
          slug,
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateMyPrices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { prices: Array<{ packageId: string; price: number }> }) =>
    z
      .object({
        prices: z
          .array(z.object({ packageId: z.string().uuid(), price: z.number().min(0).max(100000) }))
          .min(1)
          .max(100),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: reseller } = await supabase.from("resellers").select("id").eq("user_id", userId).maybeSingle();
    if (!reseller) throw new Error("Create your store first");
    const rows = data.prices.map((p) => ({
      reseller_id: reseller.id,
      package_id: p.packageId,
      price: p.price,
    }));
    const { error } = await supabase.from("reseller_prices").upsert(rows, { onConflict: "reseller_id,package_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const requestWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { amount: number }) => z.object({ amount: z.number().min(30).max(100000) }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: reseller } = await supabase.from("resellers").select("id").eq("user_id", userId).maybeSingle();
    if (!reseller) throw new Error("Create your store first");
    const { error } = await supabase
      .from("withdrawals")
      .insert({ reseller_id: reseller.id, user_id: userId, amount: data.amount, status: "pending" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// === Admin ===
async function requireAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Admin only");
}

export const adminAdjustBalance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; delta: number; note: string }) =>
    z.object({ userId: z.string().uuid(), delta: z.number(), note: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: p } = await supabaseAdmin.from("profiles").select("balance").eq("id", data.userId).maybeSingle();
    if (!p) throw new Error("User not found");
    const newBal = Number(p.balance) + data.delta;
    if (newBal < 0) throw new Error("Insufficient balance");
    await supabaseAdmin.from("profiles").update({ balance: newBal }).eq("id", data.userId);
    await supabaseAdmin.from("transactions").insert({
      user_id: data.userId,
      type: data.delta >= 0 ? "credit" : "debit",
      amount: Math.abs(data.delta),
      description: `Admin ${data.delta >= 0 ? "credit" : "debit"}: ${data.note}`,
      status: "success",
    });
    return { ok: true, balance: newBal };
  });

export const adminSetBlocked = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; blocked: boolean }) =>
    z.object({ userId: z.string().uuid(), blocked: z.boolean() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("profiles").update({ blocked: data.blocked }).eq("id", data.userId);
    return { ok: true };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.auth.admin.deleteUser(data.userId);
    return { ok: true };
  });

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { orderId: string; status: "pending" | "processing" | "delivered" | "failed" }) =>
    z
      .object({
        orderId: z.string().uuid(),
        status: z.enum(["pending", "processing", "delivered", "failed"]),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin.from("orders").select("*").eq("id", data.orderId).maybeSingle();
    if (!order) throw new Error("Order not found");
    await supabaseAdmin.from("orders").update({ status: data.status }).eq("id", data.orderId);
    // refund on failed
    if (data.status === "failed" && order.status !== "failed") {
      const { data: p } = await supabaseAdmin.from("profiles").select("balance").eq("id", order.user_id).maybeSingle();
      if (p) {
        await supabaseAdmin
          .from("profiles")
          .update({ balance: Number(p.balance) + Number(order.amount) })
          .eq("id", order.user_id);
        await supabaseAdmin.from("transactions").insert({
          user_id: order.user_id,
          type: "credit",
          amount: order.amount,
          description: `Refund for failed order ${order.ref}`,
          status: "success",
        });
      }
    }
    return { ok: true };
  });

export const adminCreateReseller = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string; phone: string; password: string; fullName: string }) =>
    z
      .object({
        email: z.string().email(),
        phone: z.string().min(7).max(20),
        password: z.string().min(8).max(72),
        fullName: z.string().min(2).max(80),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: u, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName, phone: data.phone, role: "reseller" },
    });
    if (error) throw new Error(error.message);
    return { ok: true, userId: u.user?.id };
  });

export const adminTogglePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { packageId: string; enabled: boolean }) =>
    z.object({ packageId: z.string().uuid(), enabled: z.boolean() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("packages").update({ enabled: data.enabled }).eq("id", data.packageId);
    return { ok: true };
  });

export const adminToggleNetwork = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { type: "data" | "mins_data"; online: boolean }) =>
    z.object({ type: z.enum(["data", "mins_data"]), online: z.boolean() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("network_status")
      .update({ online: data.online })
      .eq("network", "mtn")
      .eq("type", data.type);
    return { ok: true };
  });

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { autoDeliverEnabled: boolean; autoDeliverMinutes: number }) =>
    z
      .object({
        autoDeliverEnabled: z.boolean(),
        autoDeliverMinutes: z.number().int().min(1).max(60),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("app_settings")
      .update({ auto_deliver_enabled: data.autoDeliverEnabled, auto_deliver_minutes: data.autoDeliverMinutes })
      .eq("id", 1);
    return { ok: true };
  });

export const adminUpdateWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "accepted" | "rejected" | "paid"; note?: string }) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["accepted", "rejected", "paid"]),
        note: z.string().max(200).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: w } = await supabaseAdmin.from("withdrawals").select("*").eq("id", data.id).maybeSingle();
    if (!w) throw new Error("Withdrawal not found");
    await supabaseAdmin
      .from("withdrawals")
      .update({ status: data.status, note: data.note ?? null })
      .eq("id", data.id);
    if (data.status === "paid") {
      // record a debit transaction (balance already represents earnings withheld by admin externally)
      await supabaseAdmin.from("transactions").insert({
        user_id: w.user_id,
        type: "debit",
        amount: w.amount,
        description: `Withdrawal paid`,
        status: "success",
      });
    }
    return { ok: true };
  });

export const adminDeleteOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { orderId: string }) => z.object({ orderId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("orders").delete().eq("id", data.orderId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteTopup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { topupId: string }) => z.object({ topupId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("topups").delete().eq("id", data.topupId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Admin: list verified (credited) top-ups with user profile
export const adminListTopups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: topups } = await supabaseAdmin
      .from("topups")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    const ids = Array.from(new Set((topups ?? []).map((t) => t.user_id)));
    const { data: profiles } = ids.length
      ? await supabaseAdmin.from("profiles").select("id, email, full_name, phone").in("id", ids)
      : { data: [] as any[] };
    const pmap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    return (topups ?? []).map((t: any) => ({
      ...t,
      network: "mtn",
      profile: pmap.get(t.user_id) ?? null,
    }));
  });

// Admin: list orders with user profile (todays date filter applied client-side)
export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("*, packages(label)")
      .order("created_at", { ascending: false })
      .limit(1000);
    const ids = Array.from(new Set((orders ?? []).map((o: any) => o.user_id)));
    const { data: profiles } = ids.length
      ? await supabaseAdmin.from("profiles").select("id, email, full_name, phone").in("id", ids)
      : { data: [] as any[] };
    const pmap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    return (orders ?? []).map((o: any) => ({
      ...o,
      profit: Number(o.amount) - Number(o.cost_price),
      profile: pmap.get(o.user_id) ?? null,
    }));
  });


// === Public storefront lookup ===
export const getStorefront = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(64) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: reseller } = await supabaseAdmin
      .from("resellers")
      .select("id, store_name, slug, welcome_message, whatsapp")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!reseller) return null;
    const [{ data: pkgs }, { data: prices }, { data: ns }] = await Promise.all([
      supabaseAdmin.from("packages").select("*").eq("enabled", true).order("type").order("sort_order"),
      supabaseAdmin.from("reseller_prices").select("package_id, price").eq("reseller_id", reseller.id),
      supabaseAdmin.from("network_status").select("*"),
    ]);
    const priceMap = new Map((prices ?? []).map((p) => [p.package_id, Number(p.price)]));
    const withPrices = (pkgs ?? []).map((p) => ({ ...p, price: priceMap.get(p.id) ?? Number(p.cost_price) }));
    return { reseller, packages: withPrices, networkStatus: ns ?? [] };
  });
