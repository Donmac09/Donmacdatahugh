import { T as TSS_SERVER_FUNCTION, a as createServerFn } from "./server-Dcl151ZB.js";
import { supabaseAdmin } from "./client.server-D5ro3rAQ.js";
import { z } from "zod";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@supabase/supabase-js";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
function getUserFromContext(context) {
  return context?.user?.id || context?.session?.user?.id;
}
const getMe_createServerFn_handler = createServerRpc({
  id: "0cb3748c2ade8f683af8b2a9b68e3a861a72da87545147a91bd4329d1f1bb2e7",
  name: "getMe",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => getMe.__executeServer(opts));
const getMe = createServerFn({
  method: "GET"
}).handler(getMe_createServerFn_handler, async ({
  context
}) => {
  const userId = getUserFromContext(context);
  if (!userId) return null;
  const [{
    data: profile
  }, {
    data: roles
  }, {
    data: reseller
  }] = await Promise.all([supabaseAdmin.from("profiles").select("*").eq("id", userId).single(), supabaseAdmin.from("user_roles").select("role").eq("user_id", userId), supabaseAdmin.from("resellers").select("id, store_name, slug, whatsapp, welcome_message").eq("user_id", userId).maybeSingle()]);
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
      welcome_message: reseller.welcome_message
    } : null
  };
});
const createRefCode_createServerFn_handler = createServerRpc({
  id: "8af2ef7783f4c418d27ae548a13cee21e7ca307885c0c4fbc7b0a909d76caacc",
  name: "createRefCode",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => createRefCode.__executeServer(opts));
const createRefCode = createServerFn({
  method: "POST"
}).validator(z.object({
  forceRegenerate: z.boolean().optional()
})).handler(createRefCode_createServerFn_handler, async ({
  context
}) => {
  const userId = getUserFromContext(context);
  if (!userId) throw new Error("Not authenticated - Please login");
  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
    let code2 = "";
    for (let i = 0; i < 6; i++) {
      code2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code2;
  };
  let code = generateCode();
  let exists = true;
  while (exists) {
    const {
      data: existing
    } = await supabaseAdmin.from("ref_codes").select("code").eq("code", code).maybeSingle();
    exists = !!existing;
    if (exists) code = generateCode();
  }
  await supabaseAdmin.from("ref_codes").upsert({
    user_id: userId,
    code,
    used: false,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("user_id", userId);
  return {
    code
  };
});
const claimByTransactionId_createServerFn_handler = createServerRpc({
  id: "5f135f64c8ecaa4cb856483fa16d1f448c07315eef67c8d635d02eb457266430",
  name: "claimByTransactionId",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => claimByTransactionId.__executeServer(opts));
const claimByTransactionId = createServerFn({
  method: "POST"
}).validator(z.object({
  transactionId: z.string(),
  amount: z.number()
})).handler(claimByTransactionId_createServerFn_handler, async ({
  data,
  context
}) => {
  const userId = getUserFromContext(context);
  if (!userId) throw new Error("Not authenticated");
  await supabaseAdmin.from("topups").insert({
    user_id: userId,
    transaction_id: data.transactionId,
    amount: data.amount,
    method: "MoMo",
    status: "pending"
  });
  return {
    success: true
  };
});
const getPackagesForUser_createServerFn_handler = createServerRpc({
  id: "7b384b105faa7828169260227ceca5433f4502a49af26eef768ffea7367179ae",
  name: "getPackagesForUser",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => getPackagesForUser.__executeServer(opts));
const getPackagesForUser = createServerFn({
  method: "GET"
}).handler(getPackagesForUser_createServerFn_handler, async () => {
  const [packages, status] = await Promise.all([supabaseAdmin.from("packages").select("*").order("display_order"), supabaseAdmin.from("network_status").select("*")]);
  return {
    packages: packages.data ?? [],
    status: status.data ?? []
  };
});
const adminTogglePackage_createServerFn_handler = createServerRpc({
  id: "9e9ca494cc813b6378e54c4c2a81fb9c2345e48154fb08f956ab5223e013a930",
  name: "adminTogglePackage",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => adminTogglePackage.__executeServer(opts));
const adminTogglePackage = createServerFn({
  method: "POST"
}).validator(z.object({
  packageId: z.string(),
  enabled: z.boolean()
})).handler(adminTogglePackage_createServerFn_handler, async ({
  data
}) => {
  await supabaseAdmin.from("packages").update({
    enabled: data.enabled
  }).eq("id", data.packageId);
  return {
    success: true
  };
});
const adminToggleNetwork_createServerFn_handler = createServerRpc({
  id: "79a9cfe2bbe74800862390936153b7cb988acd9b38a986b088db0ea63dafce1c",
  name: "adminToggleNetwork",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => adminToggleNetwork.__executeServer(opts));
const adminToggleNetwork = createServerFn({
  method: "POST"
}).validator(z.object({
  network: z.string(),
  type: z.string(),
  online: z.boolean()
})).handler(adminToggleNetwork_createServerFn_handler, async ({
  data
}) => {
  await supabaseAdmin.from("network_status").upsert({
    network: data.network,
    type: data.type,
    online: data.online
  }, {
    onConflict: ["network", "type"]
  });
  return {
    success: true
  };
});
const placeOrders_createServerFn_handler = createServerRpc({
  id: "c1b60f0b30d227627e5439ae34edcb74790ab7a63486fe8136829d0e2e1f85ee",
  name: "placeOrders",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => placeOrders.__executeServer(opts));
const placeOrders = createServerFn({
  method: "POST"
}).validator(z.object({
  items: z.array(z.object({
    packageId: z.number(),
    phone: z.string()
  }))
})).handler(placeOrders_createServerFn_handler, async ({
  data,
  context
}) => {
  const userId = getUserFromContext(context);
  if (!userId) throw new Error("Not authenticated");
  const {
    data: profile
  } = await supabaseAdmin.from("profiles").select("balance").eq("id", userId).single();
  let totalAmount = 0;
  const orderItems = [];
  for (const item of data.items) {
    const {
      data: pkg
    } = await supabaseAdmin.from("packages").select("name, cost_price").eq("id", item.packageId).single();
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
  await supabaseAdmin.from("profiles").update({
    balance: newBalance
  }).eq("id", userId);
  await supabaseAdmin.from("transactions").insert({
    user_id: userId,
    type: "debit",
    amount: totalAmount,
    description: `Order placed for ${orderItems.length} item(s)`,
    status: "completed"
  });
  return {
    count: orderItems.length,
    total: totalAmount
  };
});
const adminUpdateOrderStatus_createServerFn_handler = createServerRpc({
  id: "c7eaa016e50d2c39d14ddead59d04679c676814129faa3b9c96425560a255b72",
  name: "adminUpdateOrderStatus",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => adminUpdateOrderStatus.__executeServer(opts));
const adminUpdateOrderStatus = createServerFn({
  method: "POST"
}).validator(z.object({
  orderId: z.number(),
  status: z.enum(["pending", "processing", "delivered", "failed"])
})).handler(adminUpdateOrderStatus_createServerFn_handler, async ({
  data
}) => {
  await supabaseAdmin.from("orders").update({
    status: data.status,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.orderId);
  return {
    success: true
  };
});
const adminDeleteOrder_createServerFn_handler = createServerRpc({
  id: "8a3853c53dadf0161209f5106e01348e4bf474c5fb7d42335111cdacba6aff46",
  name: "adminDeleteOrder",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => adminDeleteOrder.__executeServer(opts));
const adminDeleteOrder = createServerFn({
  method: "POST"
}).validator(z.object({
  orderId: z.number()
})).handler(adminDeleteOrder_createServerFn_handler, async ({
  data
}) => {
  await supabaseAdmin.from("orders").delete().eq("id", data.orderId);
  return {
    success: true
  };
});
const adminListOrders_createServerFn_handler = createServerRpc({
  id: "03812c977964331c61e050b6e9d2a65a48dc3f7f0af824e26e8abd4d810556c0",
  name: "adminListOrders",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => adminListOrders.__executeServer(opts));
const adminListOrders = createServerFn({
  method: "GET"
}).handler(adminListOrders_createServerFn_handler, async () => {
  const {
    data: orders
  } = await supabaseAdmin.from("orders").select("*, profiles:user_id(email, phone)").order("created_at", {
    ascending: false
  });
  return orders || [];
});
const adminGetUsers_createServerFn_handler = createServerRpc({
  id: "da2da50f61178c07321d2e2340f594222fa867c3794be4ac6fec9213c210695b",
  name: "adminGetUsers",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => adminGetUsers.__executeServer(opts));
const adminGetUsers = createServerFn({
  method: "GET"
}).handler(adminGetUsers_createServerFn_handler, async () => {
  const {
    data: users
  } = await supabaseAdmin.from("profiles").select("*").order("created_at", {
    ascending: false
  });
  return users || [];
});
const adminAdjustBalance_createServerFn_handler = createServerRpc({
  id: "27f250e51a8233c2d7ea549af3c31c9308a5e2322810c950560c2b59fa95c49f",
  name: "adminAdjustBalance",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => adminAdjustBalance.__executeServer(opts));
const adminAdjustBalance = createServerFn({
  method: "POST"
}).validator(z.object({
  userId: z.string(),
  delta: z.number(),
  note: z.string().optional()
})).handler(adminAdjustBalance_createServerFn_handler, async ({
  data
}) => {
  const {
    data: profile
  } = await supabaseAdmin.from("profiles").select("balance").eq("id", data.userId).single();
  const isCredit = data.delta >= 0;
  const amount = Math.abs(data.delta);
  const type = isCredit ? "credit" : "debit";
  const description = data.note || (isCredit ? "credit" : "debit");
  const newBalance = isCredit ? (profile.balance || 0) + amount : (profile.balance || 0) - amount;
  await supabaseAdmin.from("profiles").update({
    balance: newBalance
  }).eq("id", data.userId);
  await supabaseAdmin.from("transactions").insert({
    user_id: data.userId,
    type,
    amount,
    description,
    status: "completed"
  });
  return {
    success: true,
    newBalance
  };
});
const adminBlockUser_createServerFn_handler = createServerRpc({
  id: "7796846c2c0fda9c9814957bf6ea132ad7fa4c8a762552f0569ab3ea36f4bfb6",
  name: "adminBlockUser",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => adminBlockUser.__executeServer(opts));
const adminBlockUser = createServerFn({
  method: "POST"
}).validator(z.object({
  userId: z.string(),
  block: z.boolean()
})).handler(adminBlockUser_createServerFn_handler, async ({
  data
}) => {
  await supabaseAdmin.from("profiles").update({
    is_blocked: data.block
  }).eq("id", data.userId);
  return {
    success: true
  };
});
const adminSetBlocked_createServerFn_handler = createServerRpc({
  id: "5c7e89e68050db79914e687d42ca4a4e824688ca14e66ced095c154b8c3aae0c",
  name: "adminSetBlocked",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => adminSetBlocked.__executeServer(opts));
const adminSetBlocked = createServerFn({
  method: "POST"
}).validator(z.object({
  userId: z.string(),
  blocked: z.boolean()
})).handler(adminSetBlocked_createServerFn_handler, async ({
  data
}) => {
  await supabaseAdmin.from("profiles").update({
    is_blocked: data.blocked
  }).eq("id", data.userId);
  return {
    success: true
  };
});
const adminDeleteUser_createServerFn_handler = createServerRpc({
  id: "06d6c63eaa1bb7173b26e4aaf4df7e7f6492cd06e2116dd3efb2dfe9dd796428",
  name: "adminDeleteUser",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => adminDeleteUser.__executeServer(opts));
const adminDeleteUser = createServerFn({
  method: "POST"
}).validator(z.object({
  userId: z.string()
})).handler(adminDeleteUser_createServerFn_handler, async ({
  data
}) => {
  await supabaseAdmin.from("profiles").delete().eq("id", data.userId);
  return {
    success: true
  };
});
const adminCreateReseller_createServerFn_handler = createServerRpc({
  id: "5b669f72dc8737292c6bbd76bcc3d860b24852834c853dcc94b2850c0d613f9c",
  name: "adminCreateReseller",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => adminCreateReseller.__executeServer(opts));
const adminCreateReseller = createServerFn({
  method: "POST"
}).validator(z.object({
  email: z.string().email(),
  phone: z.string(),
  fullName: z.string().optional(),
  password: z.string().min(6)
})).handler(adminCreateReseller_createServerFn_handler, async ({
  data
}) => {
  const slug = data.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const storeName = (data.fullName || data.email.split("@")[0]) + "'s Store";
  const {
    data: existing
  } = await supabaseAdmin.from("profiles").select("id").eq("email", data.email).maybeSingle();
  if (existing) {
    throw new Error("User with this email already exists");
  }
  const {
    data: user,
    error: authError
  } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: data.fullName || data.email.split("@")[0],
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
  await supabaseAdmin.from("profiles").update({
    store_name: storeName,
    store_slug: slug,
    store_whatsapp: data.phone
  }).eq("id", user.id);
  return {
    success: true
  };
});
const requestWithdrawal_createServerFn_handler = createServerRpc({
  id: "8b9c21273595f583cde2e5550d5170be350b762386c6ad6545b045daf2ea827d",
  name: "requestWithdrawal",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => requestWithdrawal.__executeServer(opts));
const requestWithdrawal = createServerFn({
  method: "POST"
}).validator(z.object({
  amount: z.number()
})).handler(requestWithdrawal_createServerFn_handler, async ({
  data,
  context
}) => {
  const userId = getUserFromContext(context);
  if (!userId) throw new Error("Not authenticated");
  if (data.amount < 30) throw new Error("Minimum withdrawal amount is ₵30");
  await supabaseAdmin.from("withdrawals").insert({
    reseller_id: userId,
    amount: data.amount,
    status: "pending"
  });
  return {
    success: true
  };
});
const adminGetWithdrawals_createServerFn_handler = createServerRpc({
  id: "e71b4a49028ca2ab104e79bdef20db164036352570d1c241bf0b69c18985bf17",
  name: "adminGetWithdrawals",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => adminGetWithdrawals.__executeServer(opts));
const adminGetWithdrawals = createServerFn({
  method: "GET"
}).handler(adminGetWithdrawals_createServerFn_handler, async () => {
  const {
    data: withdrawals
  } = await supabaseAdmin.from("withdrawals").select("*, profiles:reseller_id(email, store_name)").order("created_at", {
    ascending: false
  });
  return withdrawals || [];
});
const adminUpdateWithdrawal_createServerFn_handler = createServerRpc({
  id: "b84aa7ae8ee0d402ec5a390551cf9838007d53c7dc5390e8d329ca73f914f944",
  name: "adminUpdateWithdrawal",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => adminUpdateWithdrawal.__executeServer(opts));
const adminUpdateWithdrawal = createServerFn({
  method: "POST"
}).validator(z.object({
  withdrawalId: z.number(),
  status: z.enum(["pending", "approved", "rejected", "paid"])
})).handler(adminUpdateWithdrawal_createServerFn_handler, async ({
  data
}) => {
  await supabaseAdmin.from("withdrawals").update({
    status: data.status,
    processed_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.withdrawalId);
  return {
    success: true
  };
});
const createMyStore_createServerFn_handler = createServerRpc({
  id: "d1c4271beece0185eeb523d2c5bf2dcaf38da90eedad571b8ee31096cccd0352",
  name: "createMyStore",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => createMyStore.__executeServer(opts));
const createMyStore = createServerFn({
  method: "POST"
}).validator(z.object({
  storeName: z.string(),
  welcomeMessage: z.string(),
  whatsapp: z.string()
})).handler(createMyStore_createServerFn_handler, async ({
  data,
  context
}) => {
  const userId = getUserFromContext(context);
  if (!userId) throw new Error("Not authenticated");
  const slug = data.storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  await supabaseAdmin.from("profiles").update({
    store_name: data.storeName,
    store_slug: slug,
    store_welcome_message: data.welcomeMessage,
    store_whatsapp: data.whatsapp,
    role: "reseller"
  }).eq("id", userId);
  return {
    slug
  };
});
const updateMyPrices_createServerFn_handler = createServerRpc({
  id: "bcd3db22adbc28eac7a21b3908bcfa7077b74c06fe75dd78c679b75a7685a076",
  name: "updateMyPrices",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => updateMyPrices.__executeServer(opts));
const updateMyPrices = createServerFn({
  method: "POST"
}).validator(z.object({
  prices: z.array(z.object({
    packageId: z.string(),
    price: z.number()
  }))
})).handler(updateMyPrices_createServerFn_handler, async ({
  data,
  context
}) => {
  const userId = getUserFromContext(context);
  if (!userId) throw new Error("Not authenticated");
  for (const price of data.prices) {
    await supabaseAdmin.from("reseller_prices").upsert({
      reseller_id: userId,
      package_id: parseInt(price.packageId),
      price: price.price
    });
  }
  return {
    success: true
  };
});
const getStorefront_createServerFn_handler = createServerRpc({
  id: "72242dce9fbeb7807c6cb6ee7cc11a94c65ea5f8f3922de2ea741d15e6f4b1a4",
  name: "getStorefront",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => getStorefront.__executeServer(opts));
const getStorefront = createServerFn({
  method: "GET"
}).validator(z.object({
  slug: z.string()
})).handler(getStorefront_createServerFn_handler, async ({
  data
}) => {
  const {
    data: store
  } = await supabaseAdmin.from("profiles").select("id, store_name, store_welcome_message, store_whatsapp, email, phone").eq("store_slug", data.slug).single();
  if (!store) throw new Error("Store not found");
  const [{
    data: packages
  }, {
    data: prices
  }, {
    data: networkStatus
  }] = await Promise.all([supabaseAdmin.from("packages").select("*").eq("enabled", true).order("display_order"), supabaseAdmin.from("reseller_prices").select("package_id, price").eq("reseller_id", store.id), supabaseAdmin.from("network_status").select("*")]);
  const priceMap = new Map(prices?.map((p) => [p.package_id, p.price]) || []);
  const packagesWithPrices = packages?.map((pkg) => ({
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
const adminListTopups_createServerFn_handler = createServerRpc({
  id: "208a532e5436fcd5dbe9d9ad921289d21a8e49ed7cc344acb92c1c6f157e28da",
  name: "adminListTopups",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => adminListTopups.__executeServer(opts));
const adminListTopups = createServerFn({
  method: "GET"
}).handler(adminListTopups_createServerFn_handler, async () => {
  const {
    data: topups
  } = await supabaseAdmin.from("topups").select("*, profiles:user_id(email)").order("created_at", {
    ascending: false
  });
  return topups || [];
});
const adminDeleteTopup_createServerFn_handler = createServerRpc({
  id: "70c4489ab53bbac68504d2afbdc68cd15374669c2cf2e8812ed51c6f9fb1ceed",
  name: "adminDeleteTopup",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => adminDeleteTopup.__executeServer(opts));
const adminDeleteTopup = createServerFn({
  method: "POST"
}).validator(z.object({
  topupId: z.string()
})).handler(adminDeleteTopup_createServerFn_handler, async ({
  data
}) => {
  await supabaseAdmin.from("topups").delete().eq("id", data.topupId);
  return {
    success: true
  };
});
const adminUpdateSettings_createServerFn_handler = createServerRpc({
  id: "465cd6343db45907a6b7083e08b0b871d5ba77546d03f635c0c74956d9929627",
  name: "adminUpdateSettings",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => adminUpdateSettings.__executeServer(opts));
const adminUpdateSettings = createServerFn({
  method: "POST"
}).validator(z.object({
  key: z.string(),
  value: z.boolean()
})).handler(adminUpdateSettings_createServerFn_handler, async ({
  data
}) => {
  await supabaseAdmin.from("system_settings").upsert({
    key: data.key,
    value: data.value,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  return {
    success: true
  };
});
const getSystemSettings_createServerFn_handler = createServerRpc({
  id: "dcb0dbced1c06bb73a18ef26c2a2a3a4607beba4a208a539033d91c6004d844d",
  name: "getSystemSettings",
  filename: "src/lib/api/donmac.functions.ts"
}, (opts) => getSystemSettings.__executeServer(opts));
const getSystemSettings = createServerFn({
  method: "GET"
}).handler(getSystemSettings_createServerFn_handler, async () => {
  const {
    data: settings
  } = await supabaseAdmin.from("system_settings").select("*");
  return settings || [];
});
export {
  adminAdjustBalance_createServerFn_handler,
  adminBlockUser_createServerFn_handler,
  adminCreateReseller_createServerFn_handler,
  adminDeleteOrder_createServerFn_handler,
  adminDeleteTopup_createServerFn_handler,
  adminDeleteUser_createServerFn_handler,
  adminGetUsers_createServerFn_handler,
  adminGetWithdrawals_createServerFn_handler,
  adminListOrders_createServerFn_handler,
  adminListTopups_createServerFn_handler,
  adminSetBlocked_createServerFn_handler,
  adminToggleNetwork_createServerFn_handler,
  adminTogglePackage_createServerFn_handler,
  adminUpdateOrderStatus_createServerFn_handler,
  adminUpdateSettings_createServerFn_handler,
  adminUpdateWithdrawal_createServerFn_handler,
  claimByTransactionId_createServerFn_handler,
  createMyStore_createServerFn_handler,
  createRefCode_createServerFn_handler,
  getMe_createServerFn_handler,
  getPackagesForUser_createServerFn_handler,
  getStorefront_createServerFn_handler,
  getSystemSettings_createServerFn_handler,
  placeOrders_createServerFn_handler,
  requestWithdrawal_createServerFn_handler,
  updateMyPrices_createServerFn_handler
};
