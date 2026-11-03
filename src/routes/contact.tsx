import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Mail, MapPin, MessageCircle, Phone, Clock, Instagram, Facebook, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHero } from "@/components/Reveal";
import { images } from "@/lib/images";
import { site, whatsappLink } from "@/config/site";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Aura Unisex Salon" },
      { name: "description", content: "Call, WhatsApp or visit Aura Unisex Salon. Find our address, opening hours and send us a message." },
      { property: "og:title", content: "Contact Aura Unisex Salon" },
      { property: "og:description", content: "Get in touch — we'd love to hear from you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().regex(/^(\+?[0-9 ]{10,15})?$/, "Please enter a valid phone number"),
  subject: z.string().trim().min(2, "Please add a subject").max(150),
  message: z.string().trim().min(5, "Message is too short").max(2000),
});
type Form = z.infer<typeof schema>;

function Contact() {
  const [form, setForm] = useState<Form>({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      const errs: typeof errors = {};
      r.error.issues.forEach((i) => (errs[i.path[0] as keyof Form] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const { error } = await supabase.from("contact_submissions").insert({ ...r.data, phone: r.data.phone || null });
      if (error) throw error;
      setStatus("done");
    } catch {
      setStatus("idle");
      toast.error("Something went wrong. Please try again or WhatsApp us.");
    }
  };

  const field = (k: keyof Form, label: string, type = "text") => (
    <div>
      <Label htmlFor={k} className="text-xs uppercase tracking-[0.18em]">{label}</Label>
      <Input id={k} type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
        aria-invalid={!!errors[k]} className="mt-2 h-12 rounded-xl bg-card" />
      {errors[k] && <p className="mt-1 text-sm text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <>
      <PageHero eyebrow="Contact" title={<>Let's <em>talk.</em></>} intro="Questions, consultations or bespoke requests — we're here." image={images.interior} />
      <section className="container-luxe grid gap-16 py-20 md:py-28 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="eyebrow">Reach us</p>
          <h2 className="mt-4 text-4xl md:text-5xl">Visit the salon</h2>
          <ul className="mt-10 space-y-6">
            <li className="flex gap-4"><MapPin className="mt-1 size-5 shrink-0 text-sage" /><span>{site.address}</span></li>
            <li><a href={site.phoneHref} className="flex gap-4 hover:text-sage"><Phone className="size-5 text-sage" />{site.phone}</a></li>
            <li><a href={`mailto:${site.email}`} className="flex gap-4 hover:text-sage"><Mail className="size-5 text-sage" />{site.email}</a></li>
            <li className="flex gap-4"><Clock className="mt-1 size-5 shrink-0 text-sage" />
              <div>{site.hours.map((h) => <p key={h.days}>{h.days}: <span className="text-muted-foreground">{h.time}</span></p>)}</div>
            </li>
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="luxe" size="xl"><a href={whatsappLink()} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp us</a></Button>
            {[{ h: site.social.instagram, I: Instagram, l: "Instagram" }, { h: site.social.facebook, I: Facebook, l: "Facebook" }, { h: site.social.youtube, I: Youtube, l: "YouTube" }].map(({ h, I, l }) => (
              <a key={l} href={h} target="_blank" rel="noreferrer" aria-label={l} className="flex size-14 items-center justify-center rounded-full border border-border hover:bg-foreground hover:text-background"><I className="size-5" /></a>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-sand/60 p-8 md:p-12 lg:col-span-3">
          {status === "done" ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 className="size-14 text-sage" strokeWidth={1} />
              <h3 className="mt-6 text-4xl">Thank you, {form.name.split(" ")[0]}</h3>
              <p className="mt-3 max-w-sm text-muted-foreground">Your message has been received. Our team will get back to you shortly.</p>
              <Button variant="luxeOutline" size="xl" className="mt-8" onClick={() => { setForm({ name: "", email: "", phone: "", subject: "", message: "" }); setStatus("idle"); }}>Send another</Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-6 md:grid-cols-2">
              {field("name", "Name")}
              {field("email", "Email", "email")}
              {field("phone", "Phone (optional)", "tel")}
              {field("subject", "Subject")}
              <div className="md:col-span-2">
                <Label htmlFor="message" className="text-xs uppercase tracking-[0.18em]">Message</Label>
                <Textarea id="message" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  aria-invalid={!!errors.message} className="mt-2 rounded-xl bg-card" />
                {errors.message && <p className="mt-1 text-sm text-destructive">{errors.message}</p>}
              </div>
              <Button type="submit" variant="luxe" size="xl" disabled={status === "sending"} className="md:col-span-2">
                {status === "sending" ? "Sending…" : "Send Message"}
              </Button>
            </form>
          )}
        </div>
      </section>
      <section className="h-[420px] w-full">
        <iframe title="Salon location map" className="h-full w-full grayscale-[60%]" loading="lazy"
          src={`https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&output=embed`} />
      </section>
    </>
  );
}
