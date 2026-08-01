import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFleetRealtime() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("fleet-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "trucks" }, () => {
        queryClient.invalidateQueries({ queryKey: ["trucks"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "truck_logs" }, () => {
        queryClient.invalidateQueries({ queryKey: ["truck_logs"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
