import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Truck, LayoutDashboard, ArrowLeftRight, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useEffect, useState, type ReactNode } from "react";

const nav = [
  { to: "/dashboard", label: "Control Tower", icon: LayoutDashboard },
  { to: "/trucks", label: "Truck Directory", icon: Truck },
  { to: "/entry-exit", label: "Gate Entry / Exit", icon: ArrowLeftRight },
] as const;

function ISTClock() {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-sm tabular-nums text-navy-foreground/80">{now} IST</span>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-md bg-primary">
              <Truck className="size-4 text-primary-foreground" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">FuelFlow Pro</span>
          </Link>
          <nav className="flex flex-1 flex-wrap items-center gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.to
                    ? "bg-primary text-primary-foreground"
                    : "text-navy-foreground/70 hover:bg-sidebar-accent hover:text-navy-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <ISTClock />
          <button
            onClick={signOut}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-sidebar-border px-3 py-2 text-sm font-medium text-navy-foreground/80 transition-colors hover:bg-sidebar-accent"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">{children}</main>
    </div>
  );
}

export function StatusTag({ status }: { status: "IN" | "OUT" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide",
        status === "IN" ? "tag-in" : "tag-out",
      )}
    >
      {status === "IN" ? "AT YARD" : "ON ROAD"}
    </span>
  );
}
