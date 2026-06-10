import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/me/")({
  loader: async ({ request }) => {
    // Get the session from the request headers
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const token = authHeader.replace("Bearer ", "");
    
    // Get the user from Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Get the profile and roles
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", user.id).single(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", user.id)
    ]);
    
    const roleNames = (roles ?? []).map((item) => item.role);
    const hasAdmin = roleNames.includes("admin");
    const hasReseller = roleNames.includes("reseller");

    return new Response(JSON.stringify({
      id: user.id,
      email: user.email,
      profile: profile,
      role: hasAdmin ? "admin" : hasReseller ? "reseller" : roleNames[0] ?? "customer",
      roles: roleNames
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
});