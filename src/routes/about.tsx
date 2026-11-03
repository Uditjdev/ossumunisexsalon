import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero, Reveal, SectionHeading } from "@/components/Reveal";
import { StylistCard } from "@/components/Cards";
import { images } from "@/lib/images";
import { stylistsQuery } from "@/lib/salon-api";
import { BookingCTA } from "./index";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Aura Unisex Salon" },
      { name: "description", content: "Our story, philosophy and the expert team behind Aura Unisex Salon. Premium products and uncompromising hygiene." },
      { property: "og:title", content: "About Aura Unisex Salon" },
      { property: "og:description", content: "The story, philosophy and artists behind Aura." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const blocks = [
  { eyebrow: "Our Story", title: "Born from a love of craft", image: images.interior,
    text: "Aura began in 2012 as a four-chair studio with one belief: that a salon visit should feel like a return to yourself. Today, our team of eighteen artists welcomes thousands of guests each year — yet every appointment still begins with a conversation." },
  { eyebrow: "Our Philosophy", title: "Considered, never rushed", image: images["hair-spa"],
    text: "We believe great results come from patience. We take time to understand your hair, skin and lifestyle, then design a look that's easy to live with and beautiful to wear." },
  { eyebrow: "Our Mission", title: "Confidence, beautifully delivered", image: images.bridal,
    text: "To make world-class hair, beauty and grooming accessible, personal and joyful — for every gender, every age and every occasion." },
];

function About() {
  const { data: stylists } = useQuery(stylistsQuery);
  return (
    <>
      <PageHero eyebrow="About Aura" title={<>Beauty with <em>intention.</em></>} intro="A modern salon rooted in craft, care and quiet luxury." image={images.interior} />
      <section className="container-luxe space-y-24 py-24 md:space-y-36 md:py-36">
        {blocks.map((b, i) => (
          <div key={b.title} className="grid items-center gap-10 md:grid-cols-2 md:gap-20">
            <Reveal className={i % 2 ? "md:order-2" : ""}>
              <img src={b.image} alt={b.title} loading="lazy" width={1024} height={1280} className="aspect-[4/5] w-full rounded-2xl object-cover" />
            </Reveal>
            <Reveal delay={150}>
              <p className="eyebrow">{b.eyebrow}</p>
              <h2 className="mt-4 text-4xl leading-[1.05] md:text-6xl">{b.title}</h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{b.text}</p>
            </Reveal>
          </div>
        ))}
      </section>

      <section className="bg-charcoal py-24 text-ivory md:py-32">
        <div className="container-luxe grid gap-12 md:grid-cols-3">
          {[
            ["Expertise", "Our artists train annually in London, Milan and Mumbai, mastering the latest cutting, colour and skin techniques."],
            ["Premium Products", "We work exclusively with professional, cruelty-free brands — ammonia-free colour, sulphate-free care, dermatologist-tested skincare."],
            ["Hygiene Standards", "Hospital-grade sterilisation, single-use kits for every guest, and stations sanitised between every appointment."],
          ].map(([t, d]) => (
            <Reveal key={t}>
              <p className="font-serif text-5xl text-champagne">{t}</p>
              <p className="mt-5 leading-relaxed text-ivory/70">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-luxe py-24 md:py-32">
        <SectionHeading eyebrow="The Team" title={<>The hands behind <em>Aura</em></>} />
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stylists?.map((s) => <StylistCard key={s.id} stylist={s} />)}
        </div>
      </section>
      <BookingCTA />
    </>
  );
}
