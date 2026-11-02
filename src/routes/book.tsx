import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Check, CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { bookedSlotsQuery, servicesQuery, settingsQuery, stylistsQuery, unavailableSlots } from "@/lib/salon-api";
import { formatDuration, formatSlot, inr, whatsappLink } from "@/config/site";
import { img } from "@/lib/images";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>): { service?: string } => ({
    service: typeof s.service === "string" ? s.service : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Book an Appointment — Aura Unisex Salon" },
      { name: "description", content: "Choose your services, stylist, date and time and book your Aura appointment online." },
      { property: "og:title", content: "Book an Appointment — Aura Unisex Salon" },
      { property: "og:description", content: "Book your salon appointment online in under a minute." },
    ],
  }),
  component: Book,
});

const STEPS = ["Services", "Stylist", "Date", "Time", "Details", "Summary"];
const details = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z.string().trim().regex(/^\+?[0-9 ]{10,15}$/, "Enter a valid mobile number"),
  email: z.string().trim().email("Enter a valid email").max(255),
  notes: z.string().max(1000),
});
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function Book() {
  const { service } = Route.useSearch();
  const services = useQuery(servicesQuery);
  const stylists = useQuery(stylistsQuery);
  const settings = useQuery(settingsQuery);
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<string[]>([]);
  const [stylist, setStylist] = useState<string | null | undefined>(undefined);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ reference: string; stylist_name: string } | null>(null);

  useEffect(() => {
    const s = services.data?.find((x) => x.slug === service);
    if (s) setSel((p) => (p.includes(s.id) ? p : [...p, s.id]));
  }, [service, services.data]);

  const chosen = (services.data ?? []).filter((s) => sel.includes(s.id));
  const total = chosen.reduce((a, s) => a + s.price, 0);
  const dur = chosen.reduce((a, s) => a + s.duration_minutes, 0);
  const dateStr = date ? iso(date) : "";
  const booked = useQuery({ ...bookedSlotsQuery(dateStr), enabled: !!date });
  const slots = settings.data?.slot_times ?? [];
  const now = new Date();
  const blocked = useMemo(
    () => unavailableSlots({ slots, booked: booked.data ?? [], stylistId: stylist ?? null, stylistIds: (stylists.data ?? []).map((s) => s.id),
      isToday: dateStr === iso(now), nowMinutes: now.getHours() * 60 + now.getMinutes() }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slots, booked.data, stylist, stylists.data, dateStr],
  );
  const stylistName = stylist ? stylists.data?.find((s) => s.id === stylist)?.name : "Any Available Stylist";

  const canNext = [sel.length > 0, stylist !== undefined, !!date, !!time && !blocked.has(time), true, true][step];
  const next = () => {
    if (step === 4) {
      const r = details.safeParse(form);
      if (!r.success) { const e: Record<string, string> = {}; r.error.issues.forEach((i) => (e[String(i.path[0])] = i.message)); setErrors(e); return; }
      setErrors({});
    }
    setStep((s) => s + 1);
  };

  const confirm = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("book_appointment", {
      _service_ids: sel, _stylist_id: stylist ?? (null as unknown as string), _date: dateStr, _time: time!,
      _name: form.name, _phone: form.phone, _email: form.email, _notes: form.notes,
    });
    setBusy(false);
    if (error) {
      if (error.message.includes("SLOT_TAKEN")) { toast.error("Sorry, that slot was just booked. Please pick another time."); booked.refetch(); setTime(null); setStep(3); }
      else toast.error(error.message || "Booking failed. Please try again.");
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    setDone({ reference: row.reference, stylist_name: row.stylist_name });
    window.scrollTo({ top: 0 });
  };

  if (done) {
    const msg = `Hello Aura, I've booked ${chosen.map((s) => s.name).join(", ")} on ${date?.toDateString()} at ${formatSlot(time!)}. Ref: ${done.reference}`;
    return (
      <section className="container-luxe max-w-2xl pb-24 pt-36 text-center">
        <CheckCircle2 className="mx-auto size-16 text-sage" strokeWidth={1} />
        <p className="eyebrow mt-6">Booking received</p>
        <h1 className="mt-3 text-5xl md:text-6xl">See you soon, {form.name.split(" ")[0]}</h1>
        <p className="mt-4 text-muted-foreground">Reference <strong className="text-foreground">{done.reference}</strong></p>
        <Summary rows={[["Services", chosen.map((s) => s.name).join(", ")], ["Stylist", done.stylist_name], ["Date", date!.toDateString()], ["Time", formatSlot(time!)], ["Duration", formatDuration(dur)], ["Total", inr(total)]]} />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild variant="luxe" size="xl"><a href={whatsappLink(msg)} target="_blank" rel="noreferrer"><MessageCircle /> Confirm on WhatsApp</a></Button>
          <Button asChild variant="luxeOutline" size="xl"><Link to="/">Back to home</Link></Button>
        </div>
      </section>
    );
  }

  return (
    <section className="container-luxe pb-24 pt-32">
      <p className="eyebrow">Book an appointment</p>
      <h1 className="mt-3 text-5xl md:text-6xl">{STEPS[step]}</h1>
      <ol className="mt-8 flex gap-2" aria-label="Progress">
        {STEPS.map((s, i) => <li key={s} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-sage" : "bg-border")} aria-current={i === step} />)}
      </ol>
      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {(services.isLoading || stylists.isLoading) && <p className="text-muted-foreground">Loading…</p>}
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {services.data?.map((s) => {
                const on = sel.includes(s.id);
                return (
                  <button key={s.id} onClick={() => setSel(on ? sel.filter((x) => x !== s.id) : [...sel, s.id])}
                    className={cn("flex items-center gap-4 rounded-xl border p-4 text-left transition", on ? "border-sage bg-accent" : "border-border bg-card hover:border-foreground")}>
                    <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border", on && "border-sage bg-sage text-ivory")}>{on && <Check className="size-3" />}</span>
                    <span className="flex-1"><span className="block font-medium">{s.name}</span><span className="text-xs text-muted-foreground">{s.category} · {formatDuration(s.duration_minutes)}</span></span>
                    <span className="font-serif text-xl">{inr(s.price)}</span>
                  </button>
                );
              })}
            </div>
          )}
          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <button onClick={() => setStylist(null)} className={cn("rounded-2xl border p-6 text-left", stylist === null ? "border-sage bg-accent" : "border-border bg-card")}>
                <p className="font-serif text-2xl">Any Available Stylist</p><p className="mt-2 text-sm text-muted-foreground">We'll match you with the first free expert.</p>
              </button>
              {stylists.data?.map((s) => (
                <button key={s.id} onClick={() => setStylist(s.id)} className={cn("overflow-hidden rounded-2xl border text-left", stylist === s.id ? "border-sage ring-2 ring-sage" : "border-border")}>
                  <img src={img(s.image_key)} alt={s.name} className="aspect-square w-full object-cover" loading="lazy" />
                  <div className="p-4"><p className="font-serif text-xl">{s.name}</p><p className="text-xs text-muted-foreground">{s.specialty}</p></div>
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="inline-block rounded-2xl border bg-card p-4">
              <Calendar mode="single" selected={date} onSelect={(d) => { setDate(d); setTime(null); }}
                disabled={(d) => { const t = new Date(); t.setHours(0, 0, 0, 0); const max = new Date(t); max.setDate(max.getDate() + (settings.data?.booking_window_days ?? 60));
                  return d < t || d > max || (settings.data?.closed_weekdays ?? []).includes(d.getDay()); }} />
            </div>
          )}
          {step === 3 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {booked.isLoading && <p className="col-span-full text-muted-foreground">Checking availability…</p>}
              {slots.map((t) => {
                const off = blocked.has(t);
                return (
                  <button key={t} disabled={off} onClick={() => setTime(t)}
                    className={cn("h-14 rounded-xl border text-sm transition", off ? "cursor-not-allowed border-border text-muted-foreground line-through opacity-50" : time === t ? "border-sage bg-sage text-ivory" : "border-border bg-card hover:border-foreground")}>
                    {formatSlot(t)}
                  </button>
                );
              })}
              {!booked.isLoading && slots.every((t) => blocked.has(t)) && <p className="col-span-full text-muted-foreground">No slots left this day — please choose another date.</p>}
            </div>
          )}
          {step === 4 && (
            <div className="grid gap-5 md:grid-cols-2">
              {([["name", "Full Name", "text"], ["phone", "Mobile Number", "tel"], ["email", "Email Address", "email"]] as const).map(([k, l, t]) => (
                <div key={k}>
                  <label htmlFor={k} className="text-xs uppercase tracking-[0.18em]">{l}</label>
                  <Input id={k} type={t} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="mt-2 h-12 rounded-xl bg-card" aria-invalid={!!errors[k]} />
                  {errors[k] && <p className="mt-1 text-sm text-destructive">{errors[k]}</p>}
                </div>
              ))}
              <div className="md:col-span-2">
                <label htmlFor="notes" className="text-xs uppercase tracking-[0.18em]">Special Requests / Notes</label>
                <Textarea id="notes" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-2 rounded-xl bg-card" />
              </div>
            </div>
          )}
          {step === 5 && (
            <Summary rows={[["Services", chosen.map((s) => s.name).join(", ")], ["Stylist", stylistName ?? ""], ["Date", date?.toDateString() ?? ""], ["Time", time ? formatSlot(time) : ""], ["Duration", formatDuration(dur)], ["Total", inr(total)], ["Name", form.name], ["Mobile", form.phone], ["Email", form.email], ...(form.notes ? [["Notes", form.notes] as [string, string]] : [])]} />
          )}
          <div className="mt-10 flex gap-3">
            {step > 0 && <Button variant="luxeOutline" size="xl" onClick={() => setStep(step - 1)}>Back</Button>}
            {step < 5 ? <Button variant="luxe" size="xl" disabled={!canNext} onClick={next}>Continue</Button>
              : <Button variant="luxe" size="xl" disabled={busy} onClick={confirm}>{busy ? "Confirming…" : "Confirm Appointment"}</Button>}
          </div>
        </div>
        <aside className="h-fit rounded-2xl bg-sand/60 p-6 lg:sticky lg:top-28">
          <p className="eyebrow">Your selection</p>
          {chosen.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No services selected yet.</p> : (
            <ul className="mt-4 space-y-2 text-sm">{chosen.map((s) => <li key={s.id} className="flex justify-between"><span>{s.name}</span><span>{inr(s.price)}</span></li>)}</ul>
          )}
          <div className="mt-6 flex justify-between border-t border-border pt-4"><span>{formatDuration(dur) || "—"}</span><span className="font-serif text-2xl">{inr(total)}</span></div>
        </aside>
      </div>
    </section>
  );
}

function Summary({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="mt-8 divide-y divide-border rounded-2xl border bg-card text-left">
      {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-6 p-4"><dt className="text-muted-foreground">{k}</dt><dd className="text-right">{v}</dd></div>)}
    </dl>
  );
}
