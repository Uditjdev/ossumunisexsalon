import hero from "@/assets/hero.jpg";
import interior from "@/assets/interior.jpg";
import hairColor from "@/assets/hair-color.jpg";
import hairStyling from "@/assets/hair-styling.jpg";
import hairSpa from "@/assets/hair-spa.jpg";
import facial from "@/assets/facial.jpg";
import bridal from "@/assets/bridal.jpg";
import mens from "@/assets/mens.jpg";
import s1 from "@/assets/stylist-1.jpg";
import s2 from "@/assets/stylist-2.jpg";
import s3 from "@/assets/stylist-3.jpg";
import s4 from "@/assets/stylist-4.jpg";

export const images = {
  hero,
  interior,
  "hair-color": hairColor,
  "hair-styling": hairStyling,
  "hair-spa": hairSpa,
  facial,
  bridal,
  mens,
  "stylist-1": s1,
  "stylist-2": s2,
  "stylist-3": s3,
  "stylist-4": s4,
} as const;

export const img = (key: string): string => (images as Record<string, string>)[key] ?? interior;
