import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { AppShell, useMe } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: () => { /* role checked in component */ },
  component: AdminLayout,
});

function AdminLayout() {
  const { data: me } = useMe();
  if (me && !(me.roles?.includes("admin") ?? false)) {
    throw redirect({ to: "/dashboard" });
  }
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tabs = [
    { to: "/admin/analytics", label: "Analytics" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/orders", label: "Orders" },
    { to: "/admin/topups", label: "Verified Topups" },
    { to: "/admin/withdrawals", label: "Withdrawals" },
    { to: "/admin/resellers", label: "Resellers" },
    { to: "/admin/packages", label: "Packages" },
    { to: "/admin/settings", label: "Settings" },
  ];
  return (
    <AppShell>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map((t) => (
          <Link key={t.to} to={t.to} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold ${pathname === t.to ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{t.label}</Link>
        ))}
      </div>
      <Outlet />
    </AppShell>
  );
}
