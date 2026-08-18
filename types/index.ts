// ============================================================
// MARRIAGE HALL PLATFORM - TYPES
// ============================================================

export interface SiteSettings {
  id: string;
  site_name: string;
  tagline: string;
  description: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  cover_image_url: string | null;
  hero_image_url: string | null;
  hero_video_url: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  google_maps_embed: string | null;
  google_maps_link: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  business_hours: Record<string, string>;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  theme_preset: string;
  primary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  dark_mode: boolean;
  button_style: string;
  border_radius: string;
  font_heading: string;
  font_body: string;
  animation_intensity: string;
  features_enabled: Record<string, boolean>;
  min_guests: number;
  max_guests: number;
  advance_booking_days: number;
  cancellation_policy: string | null;
  about_title: string;
  about_subtitle: string;
  about_description: string | null;
  about_image_url: string | null;
  years_experience: string;
  events_hosted: string;
  team_members: string;
  satisfaction_percentage: string;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  capacity: number;
  area_sqft: number | null;
  price_per_event: number | null;
  images: string[];
  amenities: string[];
  featured: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  name: string;
  room_type: string;
  description: string | null;
  price_per_night: number | null;
  capacity: number | null;
  beds: string | null;
  amenities: string[];
  images: string[];
  featured: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_per_person: number | null;
  inclusions: string[];
  exclusions: string[];
  images: string[];
  featured: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_type: "fixed" | "per_person" | "per_hour";
  icon: string | null;
  images: string[];
  category: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: string;
  title: string | null;
  image_url: string;
  thumbnail_url: string | null;
  category: string;
  featured: boolean;
  focal_point: { x: number; y: number };
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  avatar_url: string | null;
  rating: number | null;
  event_date: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_amount: number;
  max_discount: number | null;
  start_date: string | null;
  expiry_date: string | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  booking_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  event_type: string;
  event_date: string;
  guest_count: number;
  special_requirements: string | null;
  venue_id: string | null;
  package_id: string | null;
  selected_services: Array<{ id: string; name: string; price: number }>;
  selected_rooms: Array<{ id: string; name: string; price: number; nights: number }>;
  subtotal: number;
  discount_amount: number;
  coupon_code: string | null;
  total_amount: number;
  status: "pending" | "confirmed" | "rejected" | "cancelled" | "completed";
  payment_status: "pending" | "partial" | "paid" | "refunded";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  venue?: Venue;
  package?: Package;
}

export interface BlockedDate {
  id: string;
  venue_id: string | null;
  date: string;
  reason: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "manager" | "staff" | "user";
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingFormData {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  event_type: string;
  event_date: Date;
  guest_count: number;
  venue_id: string;
  package_id?: string;
  selected_services: string[];
  selected_rooms: Array<{ room_id: string; nights: number }>;
  special_requirements: string;
  coupon_code?: string;
}

export interface QuoteCalculation {
  venuePrice: number;
  packagePrice: number;
  servicesPrice: number;
  roomsPrice: number;
  subtotal: number;
  discount: number;
  total: number;
}
