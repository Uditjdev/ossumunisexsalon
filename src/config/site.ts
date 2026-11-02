// Edit brand & business details here — used across the whole website.
export const site = {
  name: "Aura",
  fullName: "Aura Unisex Salon",
  tagline: "Hair · Beauty · Grooming",
  phone: "+91 98765 43210",
  phoneHref: "tel:+919876543210",
  whatsapp: "919876543210", // digits only, with country code
  email: "hello@aurasalon.in",
  address: "12, Linking Road, Bandra West, Mumbai, Maharashtra 400050",
  mapQuery: "Linking Road, Bandra West, Mumbai",
  hours: [
    { days: "Monday – Friday", time: "10:00 AM – 8:00 PM" },
    { days: "Saturday – Sunday", time: "9:00 AM – 9:00 PM" },
  ],
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
  },
};

export const whatsappLink = (text = "Hello Aura, I'd like to know more about your services.") =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export const formatDuration = (m: number) => {
  const h = Math.floor(m / 60);
  const r = m % 60;
  return [h ? `${h} hr` : "", r ? `${r} min` : ""].filter(Boolean).join(" ");
};

export const formatSlot = (t: string) => {
  const [h = 0, m = 0] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${ampm}`;
};
