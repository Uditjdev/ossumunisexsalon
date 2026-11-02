import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About Us" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className={cn("flex flex-col leading-none", light ? "text-ivory" : "text-foreground")} aria-label={site.fullName}>
      <span className="font-serif text-3xl tracking-[0.2em]">{site.name.toUpperCase()}</span>
      <span className="mt-1 text-[0.55rem] uppercase tracking-[0.45em] opacity-70">Unisex Salon</span>
    </Link>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const overHero = !scrolled && pathname !== "/book" && !open;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        overHero ? "bg-transparent py-6" : "border-b border-border/60 bg-background/90 py-4 backdrop-blur-md",
      )}
    >
      <div className="container-luxe flex items-center justify-between">
        <Logo light={overHero} />
        <nav className="hidden items-center gap-10 lg:flex" aria-label="Main">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className={cn(
                "text-xs uppercase tracking-[0.22em] transition-opacity hover:opacity-100",
                overHero ? "text-ivory/80" : "text-foreground/70",
              )}
              activeProps={{ className: "!opacity-100 underline underline-offset-8 decoration-champagne" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant={overHero ? "champagne" : "luxe"} size="lg" className="hidden sm:inline-flex">
            <Link to="/book">Book Appointment</Link>
          </Button>
          <button
            className={cn("p-2 lg:hidden", overHero ? "text-ivory" : "text-foreground")}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="container-luxe animate-in fade-in slide-in-from-top-2 lg:hidden">
          <nav className="flex flex-col gap-1 py-6" aria-label="Mobile">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="border-b border-border/60 py-4 font-serif text-3xl">
                {n.label}
              </Link>
            ))}
            <Button asChild variant="luxe" size="xl" className="mt-6">
              <Link to="/book">Book Appointment</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
