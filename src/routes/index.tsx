import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, Leaf, Sparkles, ShieldCheck, Heart, Quote, Star, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/Reveal";
import { FeatureServiceCard, StylistCard } from "@/components/Cards";
import { images } from "@/lib/images";
import { stylistsQuery } from "@/lib/salon-api";
import { site } from "@/config/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aura Unisex Salon — Your Beauty. Your Style. Your Confidence." },
      { name: "description", content: "Luxury unisex salon offering hair styling, colour, spa, facials, bridal makeup and men's grooming. Book online in minutes." },
      { property: "og:title", content: "Aura Unisex Salon — Luxury Hair, Beauty & Grooming" },
      { property: "og:description", content: "Exceptional hair, beauty and grooming services designed around you." },
    ],
  }),
  component: Home,
});

const featured = [
  { title: "Hair Styling", text: "Consultation-led cuts and signature blow-dries.", price: 1200, image: images["hair-styling"], slug: "haircut-styling" },
  { title: "Hair Color", text: "Dimensional colour with ammonia-free formulas.", price: 3500, image: images["hair-color"], slug: "hair-coloring" },
  { title: "Hair Spa", text: "Deep-nourishing ritual with steam and massage.", price: 1800, image: images["hair-spa"], slug: "hair-spa" },
  { title: "Facial & Skin", text: "Hydrating facials for luminous, glowing skin.", price: 2500, image: images.facial, slug: "facial" },
  { title: "Bridal Makeup", text: "Flawless HD looks for your most important day.", price: 25000, image: images.bridal, slug: "bridal-makeup" },
  { title: "Men's Grooming", text: "Sharp cuts, sculpted beards, hot towel finish.", price: 700, image: images.mens, slug: "mens-haircut" },
];

const reasons = [
  { Icon: Award, title: "Experienced Professionals", text: "Internationally trained artists with a decade of craft." },
  { Icon: Leaf, title: "Premium Products", text: "Only salon-grade, cruelty-free professional brands." },
  { Icon: Sparkles, title: "Personalized Consultation", text: "Every service begins with understanding you." },
  { Icon: ShieldCheck, title: "Hygienic Environment", text: "Sterilised tools and single-use essentials, always." },
  { Icon: Heart, title: "Relaxing Experience", text: "A calm sanctuary designed for slow, mindful care." },
];

const testimonials = [
  { name: "Priya S.", text: "The balayage Meera did is the best colour I've ever had. The whole experience felt like a retreat.", service: "Highlights & Balayage" },
  { name: "Arjun M.", text: "Finally a salon that understands men's grooming. Rohan's fade and beard work is precise every single time.", service: "Men's Grooming" },
  { name: "Sneha R.", text: "Kabir made me feel so beautiful on my wedding day. The makeup lasted through every ritual.", service: "Bridal Makeup" },
];

function Home() {
  const { data: stylists } = useQuery(stylistsQuery);
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden">
        <img src={images.hero} alt="Stylist at work in the Aura salon" className="absolute inset-0 h-full w-full object-cover" width={1920} height={1088} />
        <div className="hero-overlay absolute inset-0" />
        <div className="container-luxe relative pt-24">
          <p className="eyebrow animate-in fade-in slide-in-from-bottom-4 text-champagne duration-1000">{site.tagline}</p>
          <h1 className="mt-6 max-w-4xl text-6xl leading-[0.92] text-ivory animate-in fade-in slide-in-from-bottom-6 duration-1000 md:text-8xl lg:text-[8.5rem]">
            Your Beauty. <em className="text-champagne">Your Style.</em> Your Confidence.
          </h1>
          <p className="mt-8 max-w-lg text-lg text-ivory/80 animate-in fade-in duration-1000">
            Experience exceptional hair, beauty and grooming services designed around you.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild variant="champagne" size="xl"><Link to="/book">Book Appointment</Link></Button>
            <Button asChild variant="luxeLight" size="xl"><Link to="/services">Explore Services</Link></Button>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="container-luxe grid items-center gap-12 py-24 md:py-36 lg:grid-cols-12">
        <Reveal className="relative lg:col-span-6">
          <img src={images.interior} alt="Aura salon interior" loading="lazy" width={1024} height={1280} className="aspect-[4/5] w-full rounded-2xl object-cover md:w-4/5" />
          <img src={images["hair-color"]} alt="Glossy balayage" loading="lazy" width={1024} height={1280}
            className="absolute -bottom-10 right-0 hidden aspect-[3/4] w-2/5 rounded-2xl border-8 border-background object-cover shadow-soft md:block" />
        </Reveal>
        <Reveal className="lg:col-span-5 lg:col-start-8" delay={150}>
          <p className="eyebrow">Welcome to {site.fullName}</p>
          <h2 className="mt-4 text-4xl leading-[1.05] md:text-6xl">A sanctuary for <em>modern</em> beauty.</h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Since 2012, Aura has been a quiet haven for those who value craft. Our artists blend international technique
            with an intimate understanding of Indian hair and skin — creating looks that feel effortlessly, unmistakably you.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
            {[["12+", "Years"], ["25k", "Happy clients"], ["18", "Expert artists"]].map(([n, l]) => (
              <div key={l}><p className="font-serif text-4xl">{n}</p><p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{l}</p></div>
            ))}
          </div>
          <Button asChild variant="luxeOutline" size="xl" className="mt-10"><Link to="/about">Our Story</Link></Button>
        </Reveal>
      </section>

      {/* Featured services */}
      <section className="bg-sand/60 py-24 md:py-32">
        <div className="container-luxe">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <SectionHeading eyebrow="Signature Services" title={<>Crafted rituals,<br /><em>tailored to you.</em></>} />
            <Button asChild variant="luxeOutline" size="xl"><Link to="/services">View all services</Link></Button>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 120}><FeatureServiceCard {...f} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="container-luxe py-24 md:py-32">
        <SectionHeading center eyebrow="Why Aura" title={<>The art of <em>exceptional</em> care</>} />
        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
          {reasons.map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 80} className="bg-background p-8 transition-colors hover:bg-card">
              <Icon className="size-6 text-sage" strokeWidth={1.25} />
              <h3 className="mt-6 text-2xl leading-tight">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Offers */}
      <section className="container-luxe pb-24 md:pb-32">
        <div className="grid overflow-hidden rounded-3xl bg-charcoal text-ivory lg:grid-cols-2">
          <img src={images["hair-spa"]} alt="Hair spa ritual" loading="lazy" width={1024} height={1280} className="h-72 w-full object-cover lg:h-full" />
          <div className="p-10 md:p-16">
            <p className="eyebrow text-champagne">Special Offers</p>
            <h2 className="mt-4 text-4xl leading-tight md:text-5xl">This season at Aura</h2>
            <ul className="mt-10 space-y-6">
              {[
                ["20% off", "Hair Spa + Blow Dry, every weekday before 2 PM"],
                ["Free trial", "Complimentary bridal trial with every bridal booking"],
                ["₹999", "Men's haircut + beard styling + head massage combo"],
              ].map(([a, b]) => (
                <li key={a} className="flex items-baseline gap-6 border-b border-ivory/10 pb-6">
                  <span className="min-w-28 font-serif text-3xl text-champagne">{a}</span>
                  <span className="text-ivory/75">{b}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="champagne" size="xl" className="mt-10"><Link to="/book">Claim an offer</Link></Button>
          </div>
        </div>
      </section>

      {/* Stylists */}
      <section className="bg-sand/60 py-24 md:py-32">
        <div className="container-luxe">
          <SectionHeading eyebrow="Meet the Artists" title={<>Our expert <em>stylists</em></>} intro="A collective of specialists — each a master of their craft." />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stylists
              ? stylists.map((s, i) => <Reveal key={s.id} delay={i * 100}><StylistCard stylist={s} /></Reveal>)
              : Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />)}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-luxe py-24 md:py-32">
        <SectionHeading center eyebrow="Kind Words" title={<>Loved by our <em>clients</em></>} />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 120} className="flex flex-col rounded-2xl bg-card p-8 shadow-soft">
              <Quote className="size-8 text-champagne" strokeWidth={1} />
              <p className="mt-6 flex-1 font-serif text-2xl leading-snug">"{t.text}"</p>
              <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                <div><p className="font-medium">{t.name}</p><p className="text-xs text-muted-foreground">{t.service}</p></div>
                <div className="flex gap-0.5 text-champagne">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="size-3.5 fill-current" />)}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Insta gallery */}
      <section className="pb-24 md:pb-32">
        <div className="container-luxe mb-10 flex items-end justify-between">
          <div><p className="eyebrow">@aurasalon</p><h2 className="mt-3 text-4xl md:text-5xl">Follow the glow</h2></div>
          <Link to="/gallery" className="text-xs uppercase tracking-[0.2em] underline underline-offset-8">Full gallery</Link>
        </div>
        <div className="grid grid-cols-3 gap-1 md:grid-cols-6">
          {["hair-color", "mens", "bridal", "hair-styling", "facial", "interior"].map((k) => (
            <a key={k} href={site.social.instagram} target="_blank" rel="noreferrer" className="group relative aspect-square overflow-hidden" aria-label="View on Instagram">
              <img src={images[k]} alt="" loading="lazy" width={1024} height={1280} className="img-zoom h-full w-full object-cover group-hover:scale-110" />
              <div className="absolute inset-0 flex items-center justify-center bg-charcoal/0 transition group-hover:bg-charcoal/40">
                <Instagram className="size-6 text-ivory opacity-0 transition group-hover:opacity-100" />
              </div>
            </a>
          ))}
        </div>
      </section>

      <BookingCTA />
    </>
  );
}

export function BookingCTA() {
  return (
    <section className="container-luxe pb-24 md:pb-32">
      <Reveal className="rounded-3xl bg-sage px-8 py-16 text-center text-ivory md:py-24">
        <p className="eyebrow text-champagne">Reserve your moment</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-5xl leading-[1] md:text-7xl">Ready for your <em>transformation?</em></h2>
        <p className="mx-auto mt-6 max-w-md text-ivory/80">Choose your service, stylist and time — it takes less than a minute.</p>
        <Button asChild variant="champagne" size="xl" className="mt-10"><Link to="/book">Book Appointment</Link></Button>
      </Reveal>
    </section>
  );
}
