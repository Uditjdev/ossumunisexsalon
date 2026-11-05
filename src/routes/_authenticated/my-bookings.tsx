import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatSlot, inr, whatsappLink } from "@/config/site";
import { salonClock } from "@/lib/booking-clock";

export const Route = createFileRoute("/_authenticated/my-bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — Aura Unisex Salon" },
      { name: "description", content: "See your upcoming and past appointments at Aura." },
      { property: "og:title", content: "My Bookings — Aura" },
      { property: "og:description", content: "See your upcoming and past appointments at Aura." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyBookings,
});

function MyBookings() {
  const { user } = Route.useRouteContext();
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["my-bookings", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, stylists(name)")
        .ilike("customer_email", user.email ?? "")
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const today = salonClock().date;
  const upcoming = data.filter((a) => a.appointment_date >= today && a.status !== "cancelled" && a.status !== "completed").reverse();
  const past = data.filter((a) => !upcoming.includes(a));

  const Card = ({ a }: { a: (typeof data)[number] }) => (
    <div className="flex flex-col gap-3 border border-border/60 p-5 md:flex-row md:items-center">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-serif text-2xl">{a.service_names.join(", ")}</span>
          <Badge variant={a.status === "cancelled" ? "destructive" : "secondary"} className="capitalize">{a.status}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {a.appointment_date} · {formatSlot(a.appointment_time.slice(0, 5))} · {a.stylists?.name ?? "Stylist"} · {inr(a.total_price)} · {a.reference}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {upcoming.includes(a) ? (
          <Button size="sm" variant="outline" asChild>
            <a href={whatsappLink(`Hello Aura, I'd like to reschedule or cancel my booking ${a.reference}.`)} target="_blank" rel="noreferrer">Reschedule / cancel</a>
          </Button>
        ) : (
          <Button size="sm" variant="luxe" asChild>
            <Link to="/book">Book again</Link>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <section className="container-luxe min-h-screen pb-20 pt-32">
      <p className="eyebrow">Your account</p>
      <h1 className="mt-3 font-serif text-5xl">My Bookings</h1>
      <p className="mt-3 text-sm text-muted-foreground">Bookings made with {user.email} appear here.</p>

      {isLoading && <p className="mt-10 text-muted-foreground">Loading…</p>}
      {error && <p className="mt-10 text-destructive">Could not load your bookings.</p>}
      {!isLoading && !error && data.length === 0 && (
        <div className="mt-10">
          <p className="text-muted-foreground">You have no bookings yet.</p>
          <Button className="mt-4" variant="luxe" asChild><Link to="/book">Book an appointment</Link></Button>
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <h2 className="mt-10 font-serif text-3xl">Upcoming</h2>
          <div className="mt-4 space-y-3">{upcoming.map((a) => <Card key={a.id} a={a} />)}</div>
        </>
      )}
      {past.length > 0 && (
        <>
          <h2 className="mt-10 font-serif text-3xl">History</h2>
          <div className="mt-4 space-y-3">{past.map((a) => <Card key={a.id} a={a} />)}</div>
        </>
      )}
    </section>
  );
}
