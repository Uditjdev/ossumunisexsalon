import { Link } from "@tanstack/react-router";
import { Clock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration, inr } from "@/config/site";
import { img } from "@/lib/images";
import type { Service, Stylist } from "@/lib/salon-api";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-soft">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={img(service.image_key)} alt={service.name} loading="lazy" width={1024} height={1280}
          className="img-zoom h-full w-full object-cover group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em]">
          {service.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-2xl leading-tight">{service.name}</h3>
          <p className="whitespace-nowrap font-serif text-2xl text-sage">{inr(service.price)}</p>
        </div>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
        <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
          <span className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <Clock className="size-3.5" /> {formatDuration(service.duration_minutes)}
          </span>
          <Button asChild variant="luxeOutline" size="sm" className="h-10 px-5">
            <Link to="/book" search={{ service: service.slug }}>Book Now</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function FeatureServiceCard({ title, text, price, image, slug }: { title: string; text: string; price: number; image: string; slug: string }) {
  return (
    <Link to="/book" search={{ service: slug }} className="group relative block aspect-[3/4] overflow-hidden rounded-2xl">
      <img src={image} alt={title} loading="lazy" width={1024} height={1280} className="img-zoom h-full w-full object-cover group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
        <p className="text-xs uppercase tracking-[0.22em] text-champagne">From {inr(price)}</p>
        <h3 className="mt-2 flex items-center justify-between text-3xl">
          {title}
          <ArrowUpRight className="size-5 transition group-hover:rotate-45" />
        </h3>
        <p className="mt-2 max-h-0 overflow-hidden text-sm text-ivory/80 transition-all duration-700 group-hover:max-h-20">{text}</p>
      </div>
    </Link>
  );
}

export function StylistCard({ stylist }: { stylist: Stylist }) {
  return (
    <article className="group">
      <div className="aspect-[4/5] overflow-hidden rounded-2xl">
        <img src={img(stylist.image_key)} alt={stylist.name} loading="lazy" width={768} height={960}
          className="img-zoom h-full w-full object-cover grayscale-[30%] group-hover:scale-105 group-hover:grayscale-0" />
      </div>
      <h3 className="mt-5 text-2xl">{stylist.name}</h3>
      <p className="eyebrow mt-1">{stylist.role}</p>
      <p className="mt-2 text-sm text-muted-foreground">{stylist.specialty} · {stylist.experience_years} yrs</p>
    </article>
  );
}
