import { createClient } from "@/lib/supabase-server";
import { HeroSection } from "@/app/(public)/_sections/HeroSection";
import { AboutSection } from "@/app/(public)/_sections/AboutSection";
import { StatsSection } from "@/app/(public)/_sections/StatsSection";
import { VenuesSection } from "@/app/(public)/_sections/VenuesSection";
import { RoomsSection } from "@/app/(public)/_sections/RoomsSection";
import { PackagesSection } from "@/app/(public)/_sections/PackagesSection";
import { ServicesSection } from "@/app/(public)/_sections/ServicesSection";
import { GallerySection } from "@/app/(public)/_sections/GallerySection";
import { TestimonialsSection } from "@/app/(public)/_sections/TestimonialsSection";
import { FAQSection } from "@/app/(public)/_sections/FAQSection";
import { ContactSection } from "@/app/(public)/_sections/ContactSection";
import { BookingCTA } from "@/app/(public)/_sections/BookingCTA";
import type { SiteSettings, Venue, Room, Package, Service, GalleryItem, Testimonial, FAQ } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const supabase = createClient();

  // Fetch settings
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .maybeSingle();

  const features = (settings?.features_enabled as Record<string, boolean>) || {};

  // Fetch all data in parallel
  const [
    { data: venues },
    { data: rooms },
    { data: packages },
    { data: services },
    { data: gallery },
    { data: testimonials },
    { data: faqs },
  ] = await Promise.all([
    features.venues !== false ? supabase.from("venues").select("*").eq("is_active", true).order("sort_order") : { data: [] },
    features.rooms !== false ? supabase.from("rooms").select("*").eq("is_active", true).order("sort_order") : { data: [] },
    features.packages !== false ? supabase.from("packages").select("*").eq("is_active", true).order("sort_order") : { data: [] },
    features.services !== false ? supabase.from("services").select("*").eq("is_active", true).order("sort_order") : { data: [] },
    features.gallery !== false ? supabase.from("gallery").select("*").eq("is_active", true).order("sort_order") : { data: [] },
    features.testimonials !== false ? supabase.from("testimonials").select("*").eq("is_active", true).order("sort_order") : { data: [] },
    features.faq !== false ? supabase.from("faqs").select("*").eq("is_active", true).order("sort_order") : { data: [] },
  ]);

  return (
    <>
      {features.hero !== false && <HeroSection settings={settings} />}
      {features.about !== false && <AboutSection settings={settings} />}
      {features.statistics !== false && <StatsSection venues={venues || []} />}
      {features.venues !== false && <VenuesSection venues={venues || []} />}
      {features.rooms !== false && <RoomsSection rooms={rooms || []} />}
      {features.packages !== false && <PackagesSection packages={packages || []} />}
      {features.services !== false && <ServicesSection services={services || []} />}
      {features.gallery !== false && <GallerySection gallery={gallery || []} />}
      {features.testimonials !== false && <TestimonialsSection testimonials={testimonials || []} />}
      {features.faq !== false && <FAQSection faqs={faqs || []} />}
      {features.contact !== false && <ContactSection settings={settings} />}
      {features.booking !== false && <BookingCTA settings={settings} />}
    </>
  );
}
