import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

// Helper to get user from context
function getUserFromContext(context: any) {
  return context?.user?.id || context?.session?.user?.id;
}

// ============== AUTH & USER FUNCTIONS ==============

export const getMe = createServerFn({ method: "GET" })
  .handler(async ({ context }) => {
    const userId = getUserFromContext(context);
    if (!userId) return null;
    
    const [{ data: profile }, { data: roles }, { data: reseller }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", userId).single(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", userId),
      supabaseAdmin.from("resellers").select("id, store_name, slug, whatsapp, welcome_message").eq("user_id", userId).maybeSingle(),
    ]);
    
    if (!profile) return null;

    const roleNames = (roles ?? []).map((item) => item.role);
    const hasAdmin = roleNames.includes("admin");
    const hasReseller = roleNames.includes("reseller");

    return {
      profile,
      role: hasAdmin ? "admin" : hasReseller ? "reseller" : roleNames[0] ?? "customer",
      roles: roleNames,
      reseller: reseller ? {
        id: reseller.id,
        store_name: reseller.store_name,
        store_slug: reseller.slug,
        whatsapp: reseller.whatsapp,
        welcome_message: reseller.welcome_message,
      } : null
    };
  });

export const createRefCode = createServerFn({ method: "POST" })
  .validator(z.object({
    forceRegenerate: z.boolean().optional()
  }))
  .handler(async ({ context }) => {
    const userId = getUserFromContext(context);
    if (!userId) throw new Error("Not authenticated - Please login");
    
    const generateCode = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };
    
    let code = generateCode();
    let exists = true;
    
    while (exists) {
      const { data: existing } = await supabaseAdmin
        .from("ref_codes")
        .select("code")
        .eq("code", code)
        .maybeSingle();
      exists = !!existing;
      if (exists) code = generateCode();
    }
    
    await supabaseAdmin
      .from("ref_codes")
      .upsert({ 
        user_id: userId, 
        code: code, 
        used: false,
        created_at: new Date().toISOString()
      })
      .eq("user_id", userId);
    
    return { code };
  });

export const claimByTransactionId = createServerFn({ method: "POST" })
  .validator(z.object({
    transactionId: z.string(),
    amount: z.number()
  }))
  .handler(async ({ data, context }) => {
    const userId = getUserFromContext(context);
    if (!userId) throw new Error("Not authenticated");
    
    await supabaseAdmin
      .from("topups")
      .insert({
        user_id: userId,
        transaction_id: data.transactionId,
        amount: data.amount,
        method: "MoMo",
        status: "pending"
      });
    
    return { success: true };
  });

// ============== PACKAGE FUNCTIONS ==============

export const getPackagesForUser = createServerFn({ method: "GET" })
  .handler(async () => {
    const [packages, status] = await Promise.all([
      supabaseAdmin.from("packages").select("*").order("display_order"),
      supabaseAdmin.from("network_status").select("*")
    ]);
    
    return { 
      packages: packages.data ?? [], 
      status: status.data ?? [] 
    };
  });

export const adminTogglePackage = createServerFn({ method: "POST" })
  .validator(z.object({
    packageId: z.string(),
    enabled: z.boolean()
  }))
  .handler(async ({ data }) => {
    await supabaseAdmin
      .from("packages")
      .update({ enabled: data.enabled })
      .eq("id", data.packageId);
    return { success: true };
  });

export const adminToggleNetwork = createServerFn({ method: "POST" })
  .validator(z.object({
    network: z.string(),
    type: z.string(),
    online: z.boolean()
  }))
  .handler(async ({ data }) => {
    await supabaseAdmin
      .from("network_status")
      .upsert(
        { network: data.network, type: data.type, online: data.online },
        { onConflict: ["network", "type"] }
      );
    return { success: true };
  });

// ============== ORDER FUNCTIONS ==============

export const placeOrders = createServerFn({ method: "POST" })
  .validator(z.object({
    items: z.array(z.object({
      packageId: z.number(),
      phone: z.string()
    }))
  }))
  .handler(async ({ data, context }) => {
    const userId = getUserFromContext(context);
    if (!userId) throw new Error("Not authenticated");
    
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("balance")
      .eq("id", userId)
      .single();
    
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of data.items) {
      const { data: pkg } = await supabaseAdmin
        .from("packages")
        .select("name, cost_price")
        .eq("id", item.packageId)
        .single();
      
      totalAmount += pkg.cost_price;
      orderItems.push({
        package_id: item.packageId,
        package_name: pkg.name,
        phone_number: item.phone,
        amount: pkg.cost_price,
        cost_price: pkg.cost_price
      });
    }
    
    if (profile.balance < totalAmount) {
      throw new Error(`Insufficient balance. Need ₵${totalAmount}, have ₵${profile.balance}`);
    }
    
    for (const item of orderItems) {
      await supabaseAdmin.from("orders").insert({
        user_id: userId,
        package_id: item.package_id,
        package_name: item.package_name,
        phone_number: item.phone_number,
        amount: item.amount,
        cost_price: item.cost_price,
        status: "pending"
      });
    }
    
    const newBalance = profile.balance - totalAmount;
    await supabaseAdmin.from("profiles").update({ balance: newBalance }).eq("id", userId);
    
    await supabaseAdmin.from("transactions").insert({
      user_id: userId,
      type: "debit",
      amount: totalAmount,
      description: `Order placed for ${orderItems.length} item(s)`,
      status: "completed"
    });
    
    return { count: orderItems.length, total: totalAmount };
  });

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .validator(z.object({
    orderId: z.number(),
    status: z.enum(['pending', 'processing', 'delivered', 'failed'])
  }))
  .handler(async ({ data }) => {
    await supabaseAdmin
      .from("orders")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.orderId);
    return { success: true };
  });

export const adminDeleteOrder = createServerFn({ method: "POST" })
  .validator(z.object({
    orderId: z.number()
  }))
  .handler(async ({ data }) => {
    await supabaseAdmin
      .from("orders")
      .delete()
      .eq("id", data.orderId);
    return { success: true };
  });

export const adminListOrders = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("*, profiles:user_id(email, phone)")
      .order("created_at", { ascending: false });
    return orders || [];
  });

// ============== USER MANAGEMENT FUNCTIONS ==============

export const adminGetUsers = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: users } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    return users || [];
  });

export const adminAdjustBalance = createServerFn({ method: "POST" })
  .validator(z.object({
    userId: z.string(),
    delta: z.number(),
    note: z.string().optional()
  }))
  .handler(async ({ data }) => {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("balance")
      .eq("id", data.userId)
      .single();
    
    const isCredit = data.delta >= 0;
    const amount = Math.abs(data.delta);
    const type = isCredit ? 'credit' : 'debit';
    const description = data.note || (isCredit ? 'credit' : 'debit');
    
    const newBalance = isCredit
      ? (profile.balance || 0) + amount
      : (profile.balance || 0) - amount;
    
    await supabaseAdmin
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", data.userId);
    
    await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: data.userId,
        type,
        amount,
        description,
        status: "completed"
      });
    
    return { success: true, newBalance };
  });

export const adminBlockUser = createServerFn({ method: "POST" })
  .validator(z.object({
    userId: z.string(),
    block: z.boolean()
  }))
  .handler(async ({ data }) => {
    await supabaseAdmin
      .from("profiles")
      .update({ is_blocked: data.block })
      .eq("id", data.userId);
    return { success: true };
  });

export const adminSetBlocked = createServerFn({ method: "POST" })
  .validator(z.object({
    userId: z.string(),
    blocked: z.boolean()
  }))
  .handler(async ({ data }) => {
    await supabaseAdmin
      .from("profiles")
      .update({ is_blocked: data.blocked })
      .eq("id", data.userId);
    return { success: true };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .validator(z.object({
    userId: z.string()
  }))
  .handler(async ({ data }) => {
    await supabaseAdmin.from("profiles").delete().eq("id", data.userId);
    return { success: true };
  });

export const adminCreateReseller = createServerFn({ method: "POST" })
  .validator(z.object({
    email: z.string().email(),
    phone: z.string(),
    fullName: z.string().optional(),
    password: z.string().min(6)
  }))
  .handler(async ({ data }) => {
    const slug = data.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const storeName = (data.fullName || data.email.split('@')[0]) + "'s Store";
    
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", data.email)
      .maybeSingle();
    
    if (existing) {
      throw new Error("User with this email already exists");
    }
    
    const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.fullName || data.email.split('@')[0],
        phone: data.phone,
        role: "reseller"
      }
    });

    if (authError || !user) {
      throw new Error(authError?.message || "Unable to create reseller account");
    }

    await supabaseAdmin.from("resellers").insert({
      user_id: user.id,
      store_name: storeName,
      slug,
      whatsapp: data.phone
    });

    await supabaseAdmin
      .from("profiles")
      .update({
        store_name: storeName,
        store_slug: slug,
        store_whatsapp: data.phone
      })
      .eq("id", user.id);
    
    return { success: true };
  });

// ============== WITHDRAWAL FUNCTIONS ==============

export const requestWithdrawal = createServerFn({ method: "POST" })
  .validator(z.object({
    amount: z.number()
  }))
  .handler(async ({ data, context }) => {
    const userId = getUserFromContext(context);
    if (!userId) throw new Error("Not authenticated");
    if (data.amount < 30) throw new Error("Minimum withdrawal amount is ₵30");
    
    await supabaseAdmin.from("withdrawals").insert({
      reseller_id: userId,
      amount: data.amount,
      status: "pending"
    });
    
    return { success: true };
  });

export const adminGetWithdrawals = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: withdrawals } = await supabaseAdmin
      .from("withdrawals")
      .select("*, profiles:reseller_id(email, store_name)")
      .order("created_at", { ascending: false });
    return withdrawals || [];
  });

export const adminUpdateWithdrawal = createServerFn({ method: "POST" })
  .validator(z.object({
    withdrawalId: z.number(),
    status: z.enum(['pending', 'approved', 'rejected', 'paid'])
  }))
  .handler(async ({ data }) => {
    await supabaseAdmin
      .from("withdrawals")
      .update({ status: data.status, processed_at: new Date().toISOString() })
      .eq("id", data.withdrawalId);
    return { success: true };
  });

// ============== STORE FUNCTIONS ==============

export const createMyStore = createServerFn({ method: "POST" })
  .validator(z.object({
    storeName: z.string(),
    welcomeMessage: z.string(),
    whatsapp: z.string()
  }))
  .handler(async ({ data, context }) => {
    const userId = getUserFromContext(context);
    if (!userId) throw new Error("Not authenticated");
    
    const slug = data.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    await supabaseAdmin
      .from("profiles")
      .update({
        store_name: data.storeName,
        store_slug: slug,
        store_welcome_message: data.welcomeMessage,
        store_whatsapp: data.whatsapp,
        role: "reseller"
      })
      .eq("id", userId);
    
    return { slug };
  });

export const updateMyPrices = createServerFn({ method: "POST" })
  .validator(z.object({
    prices: z.array(z.object({
      packageId: z.string(),
      price: z.number()
    }))
  }))
  .handler(async ({ data, context }) => {
    const userId = getUserFromContext(context);
    if (!userId) throw new Error("Not authenticated");
    
    for (const price of data.prices) {
      await supabaseAdmin
        .from("reseller_prices")
        .upsert({
          reseller_id: userId,
          package_id: parseInt(price.packageId),
          price: price.price
        });
    }
    
    return { success: true };
  });

export const getStorefront = createServerFn({ method: "GET" })
  .validator(z.object({
    slug: z.string()
  }))
  .handler(async ({ data }) => {
    const { data: store } = await supabaseAdmin
      .from("profiles")
      .select("id, store_name, store_welcome_message, store_whatsapp, email, phone")
      .eq("store_slug", data.slug)
      .single();
    
    if (!store) throw new Error("Store not found");
    
    const [{ data: packages }, { data: prices }, { data: networkStatus }] = await Promise.all([
      supabaseAdmin.from("packages").select("*").eq("enabled", true).order("display_order"),
      supabaseAdmin.from("reseller_prices").select("package_id, price").eq("reseller_id", store.id),
      supabaseAdmin.from("network_status").select("*")
    ]);
    
    const priceMap = new Map(prices?.map(p => [p.package_id, p.price]) || []);
    
    const packagesWithPrices = packages?.map(pkg => ({
      ...pkg,
      price: priceMap.get(pkg.id) || pkg.cost_price
    })) || [];
    
    return {
      reseller: {
        id: store.id,
        store_name: store.store_name,
        welcome_message: store.store_welcome_message,
        whatsapp: store.store_whatsapp,
        email: store.email,
        phone: store.phone,
        store_slug: data.slug
      },
      packages: packagesWithPrices,
      networkStatus: networkStatus ?? []
    };
  });

// ============== TOPUP FUNCTIONS ==============

export const adminListTopups = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: topups } = await supabaseAdmin
      .from("topups")
      .select("*, profiles:user_id(email)")
      .order("created_at", { ascending: false });
    return topups || [];
  });

export const adminDeleteTopup = createServerFn({ method: "POST" })
  .validator(z.object({
    topupId: z.string()
  }))
  .handler(async ({ data }) => {
    await supabaseAdmin
      .from("topups")
      .delete()
      .eq("id", data.topupId);
    return { success: true };
  });

// ============== SETTINGS FUNCTIONS ==============

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .validator(z.object({
    key: z.string(),
    value: z.boolean()
  }))
  .handler(async ({ data }) => {
    await supabaseAdmin
      .from("system_settings")
      .upsert({ key: data.key, value: data.value, updated_at: new Date().toISOString() });
    return { success: true };
  });

export const getSystemSettings = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: settings } = await supabaseAdmin.from("system_settings").select("*");
    return settings || [];
  });