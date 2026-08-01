import { supabase } from "@/integrations/supabase/client";

export type TruckStatus = "IN" | "OUT";

export type Truck = {
  id: string;
  owner_id: string;
  vehicle_number: string;
  driver_name: string | null;
  capacity: string | null;
  status: TruckStatus;
  created_at: string;
  updated_at: string;
};

export type TruckLog = {
  id: string;
  owner_id: string;
  vehicle_id: string;
  action: TruckStatus;
  location_note: string | null;
  created_at: string;
};

export async function fetchTrucks(): Promise<Truck[]> {
  const { data, error } = await supabase
    .from("trucks")
    .select("*")
    .order("vehicle_number", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Truck[];
}

export async function fetchLogs(limit = 25): Promise<TruckLog[]> {
  const { data, error } = await supabase
    .from("truck_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as TruckLog[];
}

export async function toggleTruckStatus(truck: Truck, action: TruckStatus, note?: string) {
  const { data: userData } = await supabase.auth.getUser();
  const ownerId = userData.user?.id;
  if (!ownerId) throw new Error("Not signed in");

  const { error: updateError } = await supabase
    .from("trucks")
    .update({ status: action })
    .eq("id", truck.id);
  if (updateError) throw updateError;

  const { error: logError } = await supabase.from("truck_logs").insert({
    owner_id: ownerId,
    vehicle_id: truck.id,
    action,
    location_note: note?.trim() ? note.trim() : null,
  });
  if (logError) throw logError;
}

export function formatIST(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
