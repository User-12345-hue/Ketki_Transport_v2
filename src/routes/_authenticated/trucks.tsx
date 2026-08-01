import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell, StatusTag } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useFleetRealtime } from "@/hooks/use-fleet-realtime";
import { fetchTrucks, formatIST } from "@/lib/fleet";

export const Route = createFileRoute("/_authenticated/trucks")({
  head: () => ({
    meta: [
      { title: "Truck Directory | FuelFlow Pro" },
      {
        name: "description",
        content:
          "Manage your truck directory: RTO number, assigned driver, capacity and current IN/OUT status.",
      },
      { property: "og:title", content: "Truck Directory | FuelFlow Pro" },
      {
        property: "og:description",
        content: "Your full fleet list with driver assignment and live status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrucksPage,
});

const truckSchema = z.object({
  vehicle_number: z
    .string()
    .trim()
    .nonempty({ message: "Vehicle number is required" })
    .max(20, { message: "Vehicle number is too long" }),
  driver_name: z.string().trim().max(80).optional(),
  capacity: z.string().trim().max(40).optional(),
});

function TrucksPage() {
  useFleetRealtime();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ vehicle_number: "", driver_name: "", capacity: "" });

  const trucksQuery = useQuery({ queryKey: ["trucks"], queryFn: fetchTrucks });

  const addTruck = useMutation({
    mutationFn: async () => {
      const parsed = truckSchema.parse(form);
      const { data: userData } = await supabase.auth.getUser();
      const ownerId = userData.user?.id;
      if (!ownerId) throw new Error("Not signed in");
      const { error } = await supabase.from("trucks").insert({
        owner_id: ownerId,
        vehicle_number: parsed.vehicle_number.toUpperCase(),
        driver_name: parsed.driver_name || null,
        capacity: parsed.capacity || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm({ vehicle_number: "", driver_name: "", capacity: "" });
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
      toast.success("Truck added to directory");
    },
    onError: (err) =>
      toast.error(
        err instanceof z.ZodError
          ? (err.issues[0]?.message ?? "Invalid input")
          : err instanceof Error
            ? err.message
            : "Could not add truck",
      ),
  });

  const removeTruck = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trucks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trucks"] });
      toast.success("Truck removed");
    },
    onError: () => toast.error("Could not remove truck"),
  });

  return (
    <AppShell>
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Truck Directory</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        RTO number, assigned driver and current presence.
      </p>

      <form
        className="panel mt-6 grid gap-4 p-5 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          addTruck.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="vehicle_number">Vehicle number</Label>
          <Input
            id="vehicle_number"
            className="font-mono uppercase"
            placeholder="UP-16-CD-5678"
            maxLength={20}
            value={form.vehicle_number}
            onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="driver_name">Driver</Label>
          <Input
            id="driver_name"
            placeholder="Ramesh Yadav"
            maxLength={80}
            value={form.driver_name}
            onChange={(e) => setForm({ ...form, driver_name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            placeholder="16 MT"
            maxLength={40}
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          />
        </div>
        <Button type="submit" disabled={addTruck.isPending}>
          <Plus className="size-4" /> Add truck
        </Button>
      </form>

      <div className="panel mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">RTO number</th>
              <th className="px-4 py-3 font-semibold">Driver</th>
              <th className="px-4 py-3 font-semibold">Capacity</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Last change</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(trucksQuery.data ?? []).map((truck) => (
              <tr key={truck.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono font-semibold">{truck.vehicle_number}</td>
                <td className="px-4 py-3">{truck.driver_name || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{truck.capacity || "—"}</td>
                <td className="px-4 py-3">
                  <StatusTag status={truck.status} />
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {formatIST(truck.updated_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${truck.vehicle_number}`}
                    onClick={() => removeTruck.mutate(truck.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {(trucksQuery.data ?? []).length === 0 && (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                  No trucks yet. Add your first vehicle above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
