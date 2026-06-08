import { createFileRoute } from "@tanstack/react-router";
import { parseMomoSms } from "@/lib/sms-parser";
import { MAIN_BRAND } from "@/lib/brand";

// Public SMS webhook endpoint for forwarders to POST MTN MoMo SMS messages.
// Expected: header x-webhook-secret OR ?secret=...  Body: JSON { message, from? } or text body.

export const Route = createFileRoute("/api/public/sms-webhook")({
  server: {
    handlers: {
      GET: async () =>
        new Response(
          JSON.stringify({ ok: true, hint: "POST { message } with header x-webhook-secret" }),
          { headers: { "content-type": "application/json" } },
        ),
      POST: async ({ request }) => {
        const expected = process.env.SMS_WEBHOOK_SECRET;
        const provided =
          request.headers.get("x-webhook-secret") ||
          new URL(request.url).searchParams.get("secret") ||
          "";
        if (!expected || provided !== expected) {
          return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }

        const contentType = request.headers.get("content-type") || "";
        let message = "";
        let from: string | undefined;
        try {
          if (contentType.includes("application/json")) {
            const body = (await request.json()) as { message?: string; text?: string; body?: string; from?: string };
            message = body.message || body.text || body.body || "";
            from = body.from;
          } else if (contentType.includes("application/x-www-form-urlencoded")) {
            const form = await request.formData();
            message = String(form.get("message") || form.get("text") || form.get("body") || "");
            from = String(form.get("from") || "") || undefined;
          } else {
            message = await request.text();
          }
        } catch {
          message = await request.text().catch(() => "");
        }
        if (!message) {
          return new Response(JSON.stringify({ ok: false, error: "no message" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const parsed = parseMomoSms(message);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: adminProfile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", MAIN_BRAND.adminEmail)
          .maybeSingle();

        // Keep a visible record for admin review when parsing is incomplete
        if (!parsed.refCode || !parsed.amount) {
          if (adminProfile?.id) {
            await supabaseAdmin.from("topups").insert({
              user_id: adminProfile.id,
              ref_code: parsed.refCode ?? "UNMATCHED",
              transaction_id: parsed.transactionId ?? null,
              amount: parsed.amount ?? null,
              method: "MoMo",
              status: "pending",
              raw_message: message,
            });
          }
          return new Response(
            JSON.stringify({ ok: false, parsed, reason: "missing ref or amount" }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }

        // Find the ref code owner
        const { data: ref } = await supabaseAdmin
          .from("ref_codes")
          .select("*")
          .eq("code", parsed.refCode)
          .maybeSingle();

        if (!ref) {
          if (adminProfile?.id) {
            await supabaseAdmin.from("topups").insert({
              user_id: adminProfile.id,
              ref_code: parsed.refCode,
              transaction_id: parsed.transactionId ?? null,
              amount: parsed.amount,
              method: "MoMo",
              status: "pending",
              raw_message: message,
            });
          }
          return new Response(
            JSON.stringify({ ok: false, parsed, reason: "ref code not found" }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }

        // Idempotency: skip if transaction_id already credited
        if (parsed.transactionId) {
          const { data: existing } = await supabaseAdmin
            .from("topups")
            .select("id")
            .eq("transaction_id", parsed.transactionId)
            .eq("status", "credited")
            .maybeSingle();
          if (existing) {
            return new Response(JSON.stringify({ ok: true, alreadyCredited: true }), {
              headers: { "content-type": "application/json" },
            });
          }
        }

        // Credit wallet
        const { data: p } = await supabaseAdmin
          .from("profiles")
          .select("balance")
          .eq("id", ref.user_id)
          .maybeSingle();
        if (!p) {
          return new Response(JSON.stringify({ ok: false, reason: "user missing" }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        const newBal = Number(p.balance) + Number(parsed.amount);
        await supabaseAdmin.from("profiles").update({ balance: newBal }).eq("id", ref.user_id);
        await supabaseAdmin.from("topups").insert({
          user_id: ref.user_id,
          ref_code: parsed.refCode,
          transaction_id: parsed.transactionId,
          amount: parsed.amount,
          method: "MoMo",
          status: "credited",
          raw_message: message,
        });
        await supabaseAdmin.from("transactions").insert({
          user_id: ref.user_id,
          type: "credit",
          amount: parsed.amount,
          description: `MoMo top-up (${parsed.transactionId ?? parsed.refCode})`,
          status: "success",
        });
        await supabaseAdmin.from("ref_codes").update({ used: true }).eq("code", parsed.refCode);

        return new Response(
          JSON.stringify({ ok: true, credited: parsed.amount, userId: ref.user_id, from }),
          { headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
