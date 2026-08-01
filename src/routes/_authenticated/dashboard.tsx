import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Warehouse, Route as RouteIcon, Boxes } from "lucide-react";
import { AppShell, StatusTag } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { useFleetRealtime } from "@/hooks/use-fleet-realtime";
import { fetchLogs, fetchTrucks, formatIST, type Truck } from "@/lib/fleet";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Control Tower | FuelFlow Pro" },
      {
        name: "description",
        content:
          "Live fleet control tower: total trucks, trucks currently at the yard, trucks on road, and the latest gate activity log.",
      },
      { property: "og:title", content: "Control Tower | FuelFlow Pro" },
      {
        property: "og:description",
        content: "Live IN/OUT status board for your entire truck fleet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Kpi({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Boxes;
  tone: "navy" | "in" | "out";
}) {
  const toneClass =
    tone === "in"
      ? "bg-status-in text-primary-foreground"
      : tone === "out"
        ? "bg-status-out text-primary-foreground"
        : "bg-navy text-navy-foreground";
  return (
    <div className="panel flex items-center gap-4 p-5">
      <span className={`grid size-11 shrink-0 place-items-center rounded-md ${toneClass}`}>
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-3xl font-extrabold tabular-nums text-foreground">{value}</p>
      </div>
    </div>
  );
}

function TruckCard({ truck }: { truck: Truck }) {
  return (
    <div className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-base font-bold tracking-wide text-foreground">
            {truck.vehicle_number}
          </p>
          <p className="text-sm text-muted-foreground">{truck.driver_name || "No driver set"}</p>
        </div>
        <StatusTag status={truck.status} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {truck.capacity ? `${truck.capacity} · ` : ""}Updated {formatIST(truck.updated_at)}
      </p>
    </div>
  );
}

function Dashboard() {
  useFleetRealtime();
  const [query, setQuery] = useState("");

  const trucksQuery = useQuery({ queryKey: ["trucks"], queryFn: fetchTrucks });
  const logsQuery = useQuery({ queryKey: ["truck_logs"], queryFn: () => fetchLogs(25) });

  const trucks = useMemo(() => trucksQuery.data ?? [], [trucksQuery.data]);
  const filtered = useMemo(() => {
    const q = query.replace(/[\s-]/g, "").toUpperCase();
    if (!q) return trucks;
    return trucks.filter(
      (t) =>
        t.vehicle_number.replace(/[\s-]/g, "").toUpperCase().includes(q) ||
        (t.driver_name ?? "").toUpperCase().includes(query.toUpperCase()),
    );
  }, [trucks, query]);

  const inTrucks = filtered.filter((t) => t.status === "IN");
  const outTrucks = filtered.filter((t) => t.status === "OUT");
  const plateById = new Map(trucks.map((t) => [t.id, t.vehicle_number]));
  const driverById = new Map(trucks.map((t) => [t.id, t.driver_name]));

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Control Tower</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live fleet presence across your godown and yard.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9 font-mono"
            placeholder="MH-12-AB-1234"
            value={query}
            maxLength={20}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Kpi label="Total trucks" value={trucks.length} icon={Boxes} tone="navy" />
        <Kpi
          label="Currently IN (yard)"
          value={trucks.filter((t) => t.status === "IN").length}
          icon={Warehouse}
          tone="in"
        />
        <Kpi
          label="Currently OUT (road)"
          value={trucks.filter((t) => t.status === "OUT").length}
          icon={RouteIcon}
          tone="out"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
            <span className="size-2 rounded-full bg-status-in" /> Trucks IN · {inTrucks.length}
          </h2>
          <div className="space-y-3">
            {inTrucks.map((t) => (
              <TruckCard key={t.id} truck={t} />
            ))}
            {inTrucks.length === 0 && (
              <p className="panel p-6 text-sm text-muted-foreground">No trucks at the yard.</p>
            )}
          </div>
        </section>
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
            <span className="size-2 rounded-full bg-status-out" /> Trucks OUT · {outTrucks.length}
          </h2>
          <div className="space-y-3">
            {outTrucks.map((t) => (
              <TruckCard key={t.id} truck={t} />
            ))}
            {outTrucks.length === 0 && (
              <p className="panel p-6 text-sm text-muted-foreground">No trucks on the road.</p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
          Recent activity log
        </h2>
        <div className="panel overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Truck no.</th>
                <th className="px-4 py-3 font-semibold">Driver</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Note</th>
                <th className="px-4 py-3 font-semibold">Timestamp (IST)</th>
              </tr>
            </thead>
            <tbody>
              {(logsQuery.data ?? []).map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono font-semibold">
                    {plateById.get(log.vehicle_id) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {driverById.get(log.vehicle_id) || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusTag status={log.action} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{log.location_note || "—"}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {formatIST(log.created_at)}
                  </td>
                </tr>
              ))}
              {(logsQuery.data ?? []).length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                    No gate activity recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
