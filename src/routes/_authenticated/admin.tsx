import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatSlot, inr } from "@/config/site";
import type { Database } from "@/integrations/supabase/types";

type Status = Database["public"]["Enums"]["appointment_status"];
const STATUSES: Status[] = ["pending", "confirmed", "completed", "cancelled"];

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

  const rows = data.filter(
    (a) =>
      (filter === "all" || a.status === filter) &&
      (!q || `${a.customer_name} ${a.customer_phone} ${a.reference}`.toLowerCase().includes(q.toLowerCase())),
  );
  const count = (s: Status) => data.filter((a) => a.status === s).length;

  return (
    <section className="container-luxe min-h-screen pb-20 pt-32">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-3 font-serif text-5xl">Appointments</h1>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {STATUSES.map((s) => (
          <div key={s} className="border border-border/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{s}</p>
            <p className="mt-1 font-serif text-3xl">{count(s)}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
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
