import * as React from "react";
import { useRouter, isRedirect } from "@tanstack/react-router";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, a as createServerFn } from "./server-Dcl151ZB.js";
import { z } from "zod";
function useServerFn(serverFn) {
  const router = useRouter();
  return React.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router.stores.location.get();
        return router.navigate(router.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
createServerFn({
  method: "GET"
}).handler(createSsrRpc("0cb3748c2ade8f683af8b2a9b68e3a861a72da87545147a91bd4329d1f1bb2e7"));
const createRefCode = createServerFn({
  method: "POST"
}).validator(z.object({
  forceRegenerate: z.boolean().optional()
})).handler(createSsrRpc("8af2ef7783f4c418d27ae548a13cee21e7ca307885c0c4fbc7b0a909d76caacc"));
const claimByTransactionId = createServerFn({
  method: "POST"
}).validator(z.object({
  transactionId: z.string(),
  amount: z.number()
})).handler(createSsrRpc("5f135f64c8ecaa4cb856483fa16d1f448c07315eef67c8d635d02eb457266430"));
const getPackagesForUser = createServerFn({
  method: "GET"
}).handler(createSsrRpc("7b384b105faa7828169260227ceca5433f4502a49af26eef768ffea7367179ae"));
const adminTogglePackage = createServerFn({
  method: "POST"
}).validator(z.object({
  packageId: z.string(),
  enabled: z.boolean()
})).handler(createSsrRpc("9e9ca494cc813b6378e54c4c2a81fb9c2345e48154fb08f956ab5223e013a930"));
const adminToggleNetwork = createServerFn({
  method: "POST"
}).validator(z.object({
  network: z.string(),
  type: z.string(),
  online: z.boolean()
})).handler(createSsrRpc("79a9cfe2bbe74800862390936153b7cb988acd9b38a986b088db0ea63dafce1c"));
const placeOrders = createServerFn({
  method: "POST"
}).validator(z.object({
  items: z.array(z.object({
    packageId: z.number(),
    phone: z.string()
  }))
})).handler(createSsrRpc("c1b60f0b30d227627e5439ae34edcb74790ab7a63486fe8136829d0e2e1f85ee"));
const adminUpdateOrderStatus = createServerFn({
  method: "POST"
}).validator(z.object({
  orderId: z.number(),
  status: z.enum(["pending", "processing", "delivered", "failed"])
})).handler(createSsrRpc("c7eaa016e50d2c39d14ddead59d04679c676814129faa3b9c96425560a255b72"));
const adminDeleteOrder = createServerFn({
  method: "POST"
}).validator(z.object({
  orderId: z.number()
})).handler(createSsrRpc("8a3853c53dadf0161209f5106e01348e4bf474c5fb7d42335111cdacba6aff46"));
const adminListOrders = createServerFn({
  method: "GET"
}).handler(createSsrRpc("03812c977964331c61e050b6e9d2a65a48dc3f7f0af824e26e8abd4d810556c0"));
createServerFn({
  method: "GET"
}).handler(createSsrRpc("da2da50f61178c07321d2e2340f594222fa867c3794be4ac6fec9213c210695b"));
const adminAdjustBalance = createServerFn({
  method: "POST"
}).validator(z.object({
  userId: z.string(),
  delta: z.number(),
  note: z.string().optional()
})).handler(createSsrRpc("27f250e51a8233c2d7ea549af3c31c9308a5e2322810c950560c2b59fa95c49f"));
createServerFn({
  method: "POST"
}).validator(z.object({
  userId: z.string(),
  block: z.boolean()
})).handler(createSsrRpc("7796846c2c0fda9c9814957bf6ea132ad7fa4c8a762552f0569ab3ea36f4bfb6"));
const adminSetBlocked = createServerFn({
  method: "POST"
}).validator(z.object({
  userId: z.string(),
  blocked: z.boolean()
})).handler(createSsrRpc("5c7e89e68050db79914e687d42ca4a4e824688ca14e66ced095c154b8c3aae0c"));
const adminDeleteUser = createServerFn({
  method: "POST"
}).validator(z.object({
  userId: z.string()
})).handler(createSsrRpc("06d6c63eaa1bb7173b26e4aaf4df7e7f6492cd06e2116dd3efb2dfe9dd796428"));
const adminCreateReseller = createServerFn({
  method: "POST"
}).validator(z.object({
  email: z.string().email(),
  phone: z.string(),
  fullName: z.string().optional(),
  password: z.string().min(6)
})).handler(createSsrRpc("5b669f72dc8737292c6bbd76bcc3d860b24852834c853dcc94b2850c0d613f9c"));
const requestWithdrawal = createServerFn({
  method: "POST"
}).validator(z.object({
  amount: z.number()
})).handler(createSsrRpc("8b9c21273595f583cde2e5550d5170be350b762386c6ad6545b045daf2ea827d"));
createServerFn({
  method: "GET"
}).handler(createSsrRpc("e71b4a49028ca2ab104e79bdef20db164036352570d1c241bf0b69c18985bf17"));
const adminUpdateWithdrawal = createServerFn({
  method: "POST"
}).validator(z.object({
  withdrawalId: z.number(),
  status: z.enum(["pending", "approved", "rejected", "paid"])
})).handler(createSsrRpc("b84aa7ae8ee0d402ec5a390551cf9838007d53c7dc5390e8d329ca73f914f944"));
const createMyStore = createServerFn({
  method: "POST"
}).validator(z.object({
  storeName: z.string(),
  welcomeMessage: z.string(),
  whatsapp: z.string()
})).handler(createSsrRpc("d1c4271beece0185eeb523d2c5bf2dcaf38da90eedad571b8ee31096cccd0352"));
const updateMyPrices = createServerFn({
  method: "POST"
}).validator(z.object({
  prices: z.array(z.object({
    packageId: z.string(),
    price: z.number()
  }))
})).handler(createSsrRpc("bcd3db22adbc28eac7a21b3908bcfa7077b74c06fe75dd78c679b75a7685a076"));
const getStorefront = createServerFn({
  method: "GET"
}).validator(z.object({
  slug: z.string()
})).handler(createSsrRpc("72242dce9fbeb7807c6cb6ee7cc11a94c65ea5f8f3922de2ea741d15e6f4b1a4"));
const adminListTopups = createServerFn({
  method: "GET"
}).handler(createSsrRpc("208a532e5436fcd5dbe9d9ad921289d21a8e49ed7cc344acb92c1c6f157e28da"));
const adminDeleteTopup = createServerFn({
  method: "POST"
}).validator(z.object({
  topupId: z.string()
})).handler(createSsrRpc("70c4489ab53bbac68504d2afbdc68cd15374669c2cf2e8812ed51c6f9fb1ceed"));
const adminUpdateSettings = createServerFn({
  method: "POST"
}).validator(z.object({
  key: z.string(),
  value: z.boolean()
})).handler(createSsrRpc("465cd6343db45907a6b7083e08b0b871d5ba77546d03f635c0c74956d9929627"));
createServerFn({
  method: "GET"
}).handler(createSsrRpc("dcb0dbced1c06bb73a18ef26c2a2a3a4607beba4a208a539033d91c6004d844d"));
export {
  updateMyPrices as a,
  createRefCode as b,
  createMyStore as c,
  claimByTransactionId as d,
  getStorefront as e,
  adminUpdateWithdrawal as f,
  getPackagesForUser as g,
  adminAdjustBalance as h,
  adminSetBlocked as i,
  adminDeleteUser as j,
  adminListTopups as k,
  adminDeleteTopup as l,
  adminUpdateSettings as m,
  adminCreateReseller as n,
  adminTogglePackage as o,
  placeOrders as p,
  adminToggleNetwork as q,
  requestWithdrawal as r,
  adminUpdateOrderStatus as s,
  adminDeleteOrder as t,
  useServerFn as u,
  adminListOrders as v
};
