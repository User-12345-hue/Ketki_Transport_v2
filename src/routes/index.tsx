import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Truck, ArrowRight, Radio, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FuelFlow Pro — Live Truck IN/OUT Fleet Tracker" },
      {
        name: "description",
        content:
          "FuelFlow Pro helps Indian transport owners track truck arrivals at the godown and dispatches on trip, live, with a one-tap gate register.",
      },
      { property: "og:title", content: "FuelFlow Pro — Live Truck IN/OUT Fleet Tracker" },
      {
        property: "og:description",
        content: "One-tap gate marking and a live control tower for your truck fleet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-navy text-navy-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-md bg-primary">
            <Truck className="size-5 text-primary-foreground" />
          </span>
          <span className="text-xl font-extrabold tracking-tight">FuelFlow Pro</span>
        </div>
        <Button asChild>
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Phase 1 · Fleet presence
        </p>
        <h1 className="mt-4 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Every truck. IN at the yard or OUT on the road.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-navy-foreground/70">
          A strict IN/OUT register for Indian transport owners. Your gatekeeper taps once, and your
          control tower updates instantly — no calls, no registers, no guesswork.
        </p>
        <div className="mt-10">
          <Button asChild size="lg">
            <Link to="/auth">
              Open the control tower <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-20 grid gap-px overflow-hidden rounded-lg border border-sidebar-border bg-sidebar-border sm:grid-cols-3">
          {[
            {
              icon: Radio,
              title: "Live presence",
              body: "Total, currently IN and currently OUT counts refresh the moment a truck moves.",
            },
            {
              icon: ClipboardList,
              title: "Permanent log",
              body: "Every gate action is stamped with driver, direction, note and IST timestamp.",
            },
            {
              icon: Truck,
              title: "Plate-first search",
              body: "Find MH-12-AB-1234 instantly across the whole yard and road list.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-navy p-8">
              <f.icon className="size-5 text-primary" />
              <h2 className="mt-4 text-base font-bold">{f.title}</h2>
              <p className="mt-2 text-sm text-navy-foreground/60">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
