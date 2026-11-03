import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHero } from "@/components/Reveal";
import { ServiceCard } from "@/components/Cards";
import { images } from "@/lib/images";
import { CATEGORIES, servicesQuery } from "@/lib/salon-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services & Prices — Aura Unisex Salon" },
      { name: "description", content: "Hair, skin, men's grooming and bridal makeup services with prices in ₹ and durations. Book any service online." },
      { property: "og:title", content: "Services & Prices — Aura Unisex Salon" },
      { property: "og:description", content: "Explore our full menu of hair, beauty, grooming and bridal services." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const [cat, setCat] = useState<string>("All");
  const { data, isLoading, error } = useQuery(servicesQuery);
  const list = (data ?? []).filter((s) => cat === "All" || s.category === cat);

  return (
    <>
      <PageHero eyebrow="The Menu" title={<>Services, <em>refined.</em></>} intro="Every ritual begins with consultation and ends with confidence." image={images["hair-styling"]} />
      <section className="container-luxe py-16 md:py-24">
        <div className="sticky top-[76px] z-30 -mx-5 mb-12 flex gap-2 overflow-x-auto bg-background/90 px-5 py-4 backdrop-blur md:mx-0 md:px-0" role="tablist" aria-label="Service categories">
          {["All", ...CATEGORIES].map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)}
              className={cn("whitespace-nowrap rounded-full border px-5 py-2.5 text-xs uppercase tracking-[0.18em] transition",
                cat === c ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground")}>
              {c}
            </button>
          ))}
        </div>
        {error && <p className="text-destructive">We couldn't load services. Please refresh the page.</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[420px] animate-pulse rounded-2xl bg-muted" />)}
          {list.map((s) => <ServiceCard key={s.id} service={s} />)}
        </div>
        {!isLoading && !error && list.length === 0 && <p className="py-20 text-center text-muted-foreground">No services in this category yet.</p>}
      </section>
    </>
  );
}
