import { createFileRoute, Outlet, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getStorefront } from "@/lib/api/donmac.functions";

export const Route = createFileRoute("/s/$slug")({ component: StorefrontLayout });

function StorefrontLayout() {
  return <Outlet />;
}
