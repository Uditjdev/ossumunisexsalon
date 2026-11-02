import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Service = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration_minutes: number;
  image_key: string;
};
export type Stylist = {
  id: string;
  name: string;
  role: string;
  specialty: string;
  experience_years: number;
  image_key: string;
};

export const CATEGORIES = ["Hair", "Skin & Beauty", "Men's Grooming", "Bridal & Makeup"] as const;

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: async (): Promise<Service[]> => {
    const { data, error } = await supabase
      .from("services")
      .select("id, slug, name, category, description, price, duration_minutes, image_key")
      .order("sort_order");
    if (error) throw error;
    return data;
  },
  staleTime: 5 * 60_000,
});

export const stylistsQuery = queryOptions({
  queryKey: ["stylists"],
  queryFn: async (): Promise<Stylist[]> => {
    const { data, error } = await supabase
      .from("stylists")
      .select("id, name, role, specialty, experience_years, image_key")
      .order("sort_order");
    if (error) throw error;
    return data;
  },
  staleTime: 5 * 60_000,
});

export const settingsQuery = queryOptions({
  queryKey: ["salon_settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("salon_settings").select("*").eq("id", 1).single();
    if (error) throw error;
    return data;
  },
  staleTime: 5 * 60_000,
});

export const bookedSlotsQuery = (date: string) =>
  queryOptions({
    queryKey: ["booked", date],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_booked_slots", { _date: date });
      if (error) throw error;
      return data as { stylist_id: string; appointment_time: string }[];
    },
    staleTime: 0,
  });

/** Pure helper: which slot times are unavailable for the chosen stylist (or all stylists when "any"). */
export function unavailableSlots(opts: {
  slots: string[];
  booked: { stylist_id: string; appointment_time: string }[];
  stylistId: string | null;
  stylistIds: string[];
  isToday: boolean;
  nowMinutes: number;
}): Set<string> {
  const out = new Set<string>();
  for (const t of opts.slots) {
    const [h = 0, m = 0] = t.split(":").map(Number);
    if (opts.isToday && h * 60 + m <= opts.nowMinutes) {
      out.add(t);
      continue;
    }
    const takenBy = opts.booked.filter((b) => b.appointment_time === t).map((b) => b.stylist_id);
    if (opts.stylistId) {
      if (takenBy.includes(opts.stylistId)) out.add(t);
    } else if (opts.stylistIds.every((id) => takenBy.includes(id))) {
      out.add(t);
    }
  }
  return out;
}
