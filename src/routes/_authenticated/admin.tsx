import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatSlot, inr, site } from "@/config/site";
import { salonClock } from "@/lib/booking-clock";
import type { Database } from "@/integrations/supabase/types";

type Status = Database["public"]["Enums"]["appointment_status"];
const STATUSES: Status[] = ["pending", "confirmed", "completed", "cancelled"];
type Range = "today" | "tomorrow" | "upcoming" | "all";
const RANGES: [Range, string][] = [["today", "Today"], ["tomorrow", "Tomorrow"], ["upcoming", "Upcoming"], ["all", "All dates"]];

function reminderLink(a: { customer_name: string; customer_phone: string; service_names: string[]; appointment_date: string; appointment_time: string; stylists: { name: string } | null }) {
  let digits = a.customer_phone.replace(/\D/g, "");
  if (digits.length === 10) digits = "91" + digits;
  const text = `Hello ${a.customer_name}, your appointment at ${site.name} for ${a.service_names.join(", ")} is confirmed for ${a.appointment_date} at ${formatSlot(a.appointment_time.slice(0, 5))}${a.stylists?.name ? ` with ${a.stylists.name}` : ""}. See you soon!`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Appointments Dashboard — Aura Unisex Salon" },
      { name: "description", content: "Private salon appointment management." },
      { property: "og:title", content: "Appointments Dashboard — Aura" },
      { property: "og:description", content: "Private salon appointment management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.rpc("has_role", { _user_id: context.user.id, _role: "admin" });
    if (!data) throw redirect({ to: "/" });
  },
  component: AdminPage,
});

function AdminPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Status | "all">("all");
  const [q, setQ] = useState("");
  const [range, setRange] = useState<Range>("upcoming");
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, stylists(name)")
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  async function setStatus(id: string, status: Status) {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) { toast.error("Could not update: " + error.message); return; }
    toast.success(`Marked ${status}`);
    qc.invalidateQueries({ queryKey: ["admin-appointments"] });
  }

  const today = salonClock().date;
  const tomorrow = salonClock(new Date(Date.now() + 86400000)).date;
  const inRange = (d: string) =>
    range === "all" || (range === "today" ? d === today : range === "tomorrow" ? d === tomorrow : d >= today);
  const todays = data.filter((a) => a.appointment_date === today && a.status !== "cancelled");
  const todayRevenue = todays.reduce((s, a) => s + a.total_price, 0);
  const pending = data.filter((a) => a.status === "pending").length;
  const completedRevenue = data.filter((a) => a.status === "completed").reduce((s, a) => s + a.total_price, 0);

  const rows = data.filter(
    (a) =>
      inRange(a.appointment_date) &&
      (filter === "all" || a.status === filter) &&
      (!q || `${a.customer_name} ${a.customer_phone} ${a.reference}`.toLowerCase().includes(q.toLowerCase())),
  );
  const count = (s: Status) => data.filter((a) => a.status === s).length;

  return (
    <section className="container-luxe min-h-screen pb-20 pt-32">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-3 font-serif text-5xl">Appointments</h1>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Today's bookings", String(todays.length)],
          ["Today's expected", inr(todayRevenue)],
          ["Pending actions", String(pending)],
          ["Completed revenue", inr(completedRevenue)],
        ].map(([label, value]) => (
          <div key={label} className="border border-border/60 bg-secondary/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
            <p className="mt-1 font-serif text-3xl">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {STATUSES.map((s) => `${s}: ${count(s)}`).join(" · ")}
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {RANGES.map(([key, label]) => (
          <Button key={key} size="sm" variant={range === key ? "luxe" : "outline"} onClick={() => setRange(key)}>
            {label}
          </Button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-2">
          {(["all", ...STATUSES] as const).map((s) => (
            <Button key={s} size="sm" variant={filter === s ? "luxe" : "outline"} onClick={() => setFilter(s)} className="capitalize">
              {s}
            </Button>
          ))}
        </div>
        <Input placeholder="Search name, phone or reference" value={q} onChange={(e) => setQ(e.target.value)} className="md:ml-auto md:max-w-xs" />
      </div>

      {isLoading && <p className="mt-10 text-muted-foreground">Loading…</p>}
      {error && <p className="mt-10 text-destructive">Could not load appointments.</p>}
      {!isLoading && rows.length === 0 && <p className="mt-10 text-muted-foreground">No appointments found.</p>}

      <div className="mt-6 space-y-3">
        {rows.map((a) => (
          <div key={a.id} className="flex flex-col gap-4 border border-border/60 p-5 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-serif text-2xl">{a.customer_name}</span>
                <Badge variant={a.status === "cancelled" ? "destructive" : "secondary"} className="capitalize">{a.status}</Badge>
                <span className="text-xs text-muted-foreground">{a.reference}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {a.appointment_date} · {formatSlot(a.appointment_time.slice(0, 5))} · {a.stylists?.name ?? "Stylist"} · {inr(a.total_price)}
              </p>
              <p className="mt-1 text-sm">{a.service_names.join(", ")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                <a href={`tel:${a.customer_phone}`} className="underline">{a.customer_phone}</a> · {a.customer_email}
              </p>
              {a.notes && <p className="mt-1 text-sm italic text-muted-foreground">“{a.notes}”</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <a href={reminderLink(a)} target="_blank" rel="noreferrer">WhatsApp reminder</a>
              </Button>
              {a.status !== "confirmed" && a.status !== "completed" && <Button size="sm" variant="luxe" onClick={() => setStatus(a.id, "confirmed")}>Confirm</Button>}
              {a.status !== "completed" && a.status !== "cancelled" && <Button size="sm" variant="outline" onClick={() => setStatus(a.id, "completed")}>Complete</Button>}
              {a.status !== "cancelled" && <Button size="sm" variant="outline" onClick={() => setStatus(a.id, "cancelled")}>Cancel</Button>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
