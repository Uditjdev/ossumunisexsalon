import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube, MessageCircle } from "lucide-react";
import { site, whatsappLink } from "@/config/site";
import { Logo } from "./Header";

export function Footer() {
  return (
    <footer className="bg-charcoal text-ivory">
      <div className="container-luxe grid gap-12 py-20 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-ivory/60">
            A sanctuary for hair, beauty and grooming — crafted around you, finished with care.
          </p>
          <div className="mt-6 flex gap-3">
            {[
              { href: site.social.instagram, Icon: Instagram, label: "Instagram" },
              { href: site.social.facebook, Icon: Facebook, label: "Facebook" },
              { href: site.social.youtube, Icon: Youtube, label: "YouTube" },
              { href: whatsappLink(), Icon: MessageCircle, label: "WhatsApp" },
            ].map(({ href, Icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                className="flex size-10 items-center justify-center rounded-full border border-ivory/20 transition hover:bg-ivory hover:text-charcoal">
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow text-champagne">Explore</p>
          <ul className="mt-6 space-y-3 text-sm text-ivory/70">
            <li><Link to="/" className="hover:text-ivory">Home</Link></li>
            <li><Link to="/services" className="hover:text-ivory">Services</Link></li>
            <li><Link to="/about" className="hover:text-ivory">About Us</Link></li>
            <li><Link to="/gallery" className="hover:text-ivory">Gallery</Link></li>
            <li><Link to="/contact" className="hover:text-ivory">Contact</Link></li>
            <li><Link to="/book" className="hover:text-ivory">Book Appointment</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-champagne">Visit</p>
          <ul className="mt-6 space-y-4 text-sm text-ivory/70">
            <li className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0" />{site.address}</li>
            <li><a href={site.phoneHref} className="flex gap-3 hover:text-ivory"><Phone className="size-4" />{site.phone}</a></li>
            <li><a href={`mailto:${site.email}`} className="flex gap-3 hover:text-ivory"><Mail className="size-4" />{site.email}</a></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-champagne">Opening Hours</p>
          <ul className="mt-6 space-y-4 text-sm">
            {site.hours.map((h) => (
              <li key={h.days} className="flex justify-between gap-4 border-b border-ivory/10 pb-3">
                <span className="text-ivory/70">{h.days}</span>
                <span>{h.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="container-luxe flex flex-col justify-between gap-2 py-6 text-xs text-ivory/40 md:flex-row">
          <p>© {new Date().getFullYear()} {site.fullName}. All rights reserved.</p>
          <p>Crafted with care in Mumbai.</p>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppFloat() {
  return (
    <a href={whatsappLink()} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-whatsapp text-ivory shadow-luxe transition hover:scale-110">
      <MessageCircle className="size-6" />
    </a>
  );
}
