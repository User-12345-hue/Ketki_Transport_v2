import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { AppShell, StatusTag } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFleetRealtime } from "@/hooks/use-fleet-realtime";
import { fetchTrucks, formatIST, toggleTruckStatus, type Truck } from "@/lib/fleet";

export const Route = createFileRoute("/_authenticated/entry-exit")({
  head: () => ({
    meta: [
      { title: "Gate Entry & Exit | FuelFlow Pro" },
      {
        name: "description",
        content:
          "Gatekeeper screen to mark a truck IN on arrival at the godown or OUT on dispatch, with an optional trip note.",
      },
      { property: "og:title", content: "Gate Entry & Exit | FuelFlow Pro" },
      {
        property: "og:description",
        content: "One-tap Mark IN and Mark OUT with automatic IST timestamps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EntryExitPage,
});

function GateRow({ truck, note }: { truck: Truck; note: string }) {
  const queryClient = useQueryClient();
  const mark = useMutation({
    mutationFn: (action: "IN" | "OUT") => toggleTruckStatus(truck, action, note),
    onSuccess: (_d, action) => {
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
      queryClient.invalidateQueries({ queryKey: ["truck_logs"] });
      toast.success(`${truck.vehicle_number} marked ${action}`);
    },
    onError: () => toast.error("Could not update status"),
  });

  return (
    <div className="panel flex flex-wrap items-center justify-between gap-4 p-4">
      <div>
        <p className="font-mono text-base font-bold tracking-wide text-foreground">
          {truck.vehicle_number}
        </p>
        <p className="text-sm text-muted-foreground">
          {truck.driver_name || "No driver set"} · since {formatIST(truck.updated_at)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <StatusTag status={truck.status} />
        <Button
          size="sm"
          disabled={truck.status === "IN" || mark.isPending}
          onClick={() => mark.mutate("IN")}
        >
          <LogIn className="size-4" /> Mark IN
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={truck.status === "OUT" || mark.isPending}
          onClick={() => mark.mutate("OUT")}
        >
          <LogOut className="size-4" /> Mark OUT
        </Button>
      </div>
    </div>
  );
}

function EntryExitPage() {
  useFleetRealtime();
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const trucksQuery = useQuery({ queryKey: ["trucks"], queryFn: fetchTrucks });

  const filtered = useMemo(() => {
    const trucks = trucksQuery.data ?? [];
    const q = query.replace(/[\s-]/g, "").toUpperCase();
    if (!q) return trucks;
    return trucks.filter((t) => t.vehicle_number.replace(/[\s-]/g, "").toUpperCase().includes(q));
  }, [trucksQuery.data, query]);

  return (
    <AppShell>
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Gate Entry & Exit</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Find the truck, add an optional note, and tap once. The timestamp is recorded automatically.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9 font-mono"
            placeholder="Search MH-12-AB-1234"
            maxLength={20}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Input
          placeholder="Note (e.g. Left for Mumbai / Arrived from Pune)"
          maxLength={120}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="mt-6 space-y-3">
        {filtered.map((truck) => (
          <GateRow key={truck.id} truck={truck} note={note} />
        ))}
        {filtered.length === 0 && (
          <p className="panel p-6 text-sm text-muted-foreground">
            No matching truck. Add vehicles from the Truck Directory.
          </p>
        )}
      </div>
    </AppShell>
  );
}
