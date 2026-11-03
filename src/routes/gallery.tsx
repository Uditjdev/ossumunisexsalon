import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { PageHero } from "@/components/Reveal";
import { images } from "@/lib/images";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Aura Unisex Salon" },
      { name: "description", content: "Hair transformations, colour, men's grooming, bridal looks and our salon interiors." },
      { property: "og:title", content: "Gallery — Aura Unisex Salon" },
      { property: "og:description", content: "A look inside Aura: transformations, bridal looks and our salon." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Gallery,
});

const items = [
  { src: images["hair-color"], cat: "Hair Coloring", title: "Honey balayage", tall: true },
  { src: images["hair-styling"], cat: "Hair Styling", title: "Glass-finish blow dry" },
  { src: images.mens, cat: "Men's Grooming", title: "Sculpted beard", tall: true },
  { src: images.bridal, cat: "Bridal Makeup", title: "Champagne bride" },
  { src: images.interior, cat: "Salon Interiors", title: "The styling floor", tall: true },
  { src: images["hair-spa"], cat: "Hair Transformations", title: "Restorative spa" },
  { src: images.facial, cat: "Hair Transformations", title: "Radiance ritual" },
  { src: images.hero, cat: "Salon Interiors", title: "Golden hour at Aura" },
  { src: images["stylist-3"], cat: "Hair Coloring", title: "Auburn waves" },
];
const cats = ["All", "Hair Transformations", "Hair Styling", "Hair Coloring", "Men's Grooming", "Bridal Makeup", "Salon Interiors"];

function Gallery() {
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const list = items.filter((i) => cat === "All" || i.cat === cat);

  useEffect(() => {
    if (open === null) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((o) => (o === null ? o : (o + 1) % list.length));
      if (e.key === "ArrowLeft") setOpen((o) => (o === null ? o : (o - 1 + list.length) % list.length));
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [open, list.length]);

  return (
    <>
      <PageHero eyebrow="Gallery" title={<>Our work, <em>in frame.</em></>} intro="Transformations, rituals and the spaces where they happen." image={images.bridal} />
      <section className="container-luxe py-16 md:py-24">
        <div className="mb-12 flex gap-2 overflow-x-auto pb-2" role="tablist">
          {cats.map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)}
              className={cn("whitespace-nowrap rounded-full border px-5 py-2.5 text-xs uppercase tracking-[0.18em] transition",
                cat === c ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground")}>
              {c}
            </button>
          ))}
        </div>
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {list.map((it, i) => (
            <button key={it.title} onClick={() => setOpen(i)} className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl text-left">
              <img src={it.src} alt={it.title} loading="lazy" width={1024} height={1280}
                className={cn("img-zoom w-full object-cover group-hover:scale-105", it.tall ? "aspect-[3/4]" : "aspect-square")} />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-charcoal/70 to-transparent p-6 opacity-0 transition group-hover:opacity-100">
                <div className="text-ivory"><p className="text-xs uppercase tracking-[0.2em] text-champagne">{it.cat}</p><p className="font-serif text-2xl">{it.title}</p></div>
              </div>
            </button>
          ))}
        </div>
        {list.length === 0 && <p className="py-20 text-center text-muted-foreground">No images in this category yet.</p>}
      </section>

      {open !== null && list[open] && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/95 p-4 animate-in fade-in" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
          <button className="absolute right-5 top-5 text-ivory" aria-label="Close" onClick={() => setOpen(null)}><X className="size-8" /></button>
          <button className="absolute left-3 text-ivory md:left-8" aria-label="Previous"
            onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + list.length) % list.length); }}><ChevronLeft className="size-10" /></button>
          <figure onClick={(e) => e.stopPropagation()} className="max-h-full">
            <img src={list[open].src} alt={list[open].title} className="max-h-[80vh] rounded-xl object-contain" />
            <figcaption className="mt-4 text-center font-serif text-2xl text-ivory">{list[open].title}</figcaption>
          </figure>
          <button className="absolute right-3 text-ivory md:right-8" aria-label="Next"
            onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % list.length); }}><ChevronRight className="size-10" /></button>
        </div>
      )}
    </>
  );
}
