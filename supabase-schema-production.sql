-- ========================================
-- MARRIAGE HALL PLATFORM - PRODUCTION SCHEMA
-- ========================================
-- Copy-paste this ENTIRE file into Supabase SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS and DROP IF EXISTS)
-- Last Updated: 2026-08-17
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- TABLE: PROFILES
-- ========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin','manager','staff','user')),
  avatar_url text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========================================
-- TABLE: SITE_SETTINGS
-- ========================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text DEFAULT 'Marriage Hall',
  tagline text DEFAULT 'Luxury Wedding Venue',
  description text,
  logo_url text,
  favicon_url text,
  cover_image_url text,
  hero_image_url text,
  hero_video_url text,
  phone text,
  whatsapp_number text,
  email text,
  address text,
  city text,
  state text,
  pincode text,
  google_maps_embed text,
  google_maps_link text,
  instagram_url text,
  facebook_url text,
  youtube_url text,
  business_hours jsonb DEFAULT '{}'::jsonb,
  meta_title text,
  meta_description text,
  og_title text,
  og_description text,
  og_image_url text,
  canonical_url text,
  theme_preset text DEFAULT 'royal_gold',
  primary_color text DEFAULT '#D4AF37',
  accent_color text DEFAULT '#F8E7A1',
  background_color text DEFAULT '#F5F1EA',
  text_color text DEFAULT '#1A1A1A',
  dark_mode boolean DEFAULT false,
  button_style text DEFAULT 'rounded',
  border_radius text DEFAULT 'lg',
  font_heading text DEFAULT 'Playfair Display',
  font_body text DEFAULT 'Inter',
  animation_intensity text DEFAULT 'medium',
  features_enabled jsonb DEFAULT '{"statistics":true,"venues":true,"rooms":true,"packages":true,"services":true,"gallery":true,"testimonials":true,"faq":true,"hero":true,"about":true,"contact":true,"booking":true}'::jsonb,
  min_guests integer DEFAULT 50,
  max_guests integer DEFAULT 500,
  advance_booking_days integer DEFAULT 30,
  cancellation_policy text,
  about_title text DEFAULT 'Creating Unforgettable Moments',
  about_subtitle text DEFAULT 'A premium venue for elegant celebrations and unforgettable memories.',
  about_description text,
  about_image_url text,
  years_experience text DEFAULT '10+',
  events_hosted text DEFAULT '500+',
  team_members text DEFAULT '50+',
  satisfaction_percentage text DEFAULT '100%',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========================================
-- TABLE: VENUES
-- ========================================
CREATE TABLE IF NOT EXISTS public.venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  short_description text,
  capacity integer DEFAULT 0,
  area_sqft integer,
  price_per_event numeric(12,2),
  images text[] DEFAULT '{}',
  amenities text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========================================
-- TABLE: ROOMS
-- ========================================
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  room_type text,
  description text,
  price_per_night numeric(12,2),
  capacity integer,
  beds text,
  amenities text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========================================
-- TABLE: PACKAGES
-- ========================================
CREATE TABLE IF NOT EXISTS public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(12,2),
  price_per_person numeric(12,2),
  inclusions text[] DEFAULT '{}',
  exclusions text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========================================
-- TABLE: SERVICES
-- ========================================
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(12,2),
  price_type text DEFAULT 'fixed' CHECK (price_type IN ('fixed','per_person','per_hour')),
  icon text,
  images text[] DEFAULT '{}',
  category text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========================================
-- TABLE: GALLERY
-- ========================================
CREATE TABLE IF NOT EXISTS public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  thumbnail_url text,
  category text DEFAULT 'hall',
  featured boolean DEFAULT false,
  focal_point jsonb DEFAULT '{"x":0.5,"y":0.5}'::jsonb,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ========================================
-- TABLE: TESTIMONIALS
-- ========================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  content text NOT NULL,
  avatar_url text,
  rating integer DEFAULT 5,
  event_date date,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ========================================
-- TABLE: FAQS
-- ========================================
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ========================================
-- TABLE: COUPONS
-- ========================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value numeric(12,2) NOT NULL DEFAULT 0,
  min_amount numeric(12,2) DEFAULT 0,
  max_discount numeric(12,2),
  start_date date,
  expiry_date date,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ========================================
-- TABLE: BOOKINGS
-- ========================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text UNIQUE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  event_type text,
  event_date date,
  guest_count integer DEFAULT 0,
  special_requirements text,
  venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
  package_id uuid REFERENCES public.packages(id) ON DELETE SET NULL,
  selected_services jsonb DEFAULT '[]'::jsonb,
  selected_rooms jsonb DEFAULT '[]'::jsonb,
  subtotal numeric(12,2) DEFAULT 0,
  discount_amount numeric(12,2) DEFAULT 0,
  coupon_code text,
  total_amount numeric(12,2) DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected','cancelled','completed')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending','partial','paid','refunded')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ========================================
-- FUNCTIONS
-- ========================================

-- Auto-create admin profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    CASE
      WHEN new.email = 'altaganigaming@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = CASE
        WHEN EXCLUDED.email = 'altaganigaming@gmail.com' THEN 'admin'
        ELSE profiles.role
      END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment coupon usage counter
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.coupons
  SET usage_count = usage_count + 1
  WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- TRIGGERS
-- ========================================

-- Auto-create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- ENABLE ROW LEVEL SECURITY
-- ========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ========================================
-- ROW LEVEL SECURITY POLICIES
-- ========================================

-- PROFILES
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
CREATE POLICY "profiles_read_all" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- SITE_SETTINGS
DROP POLICY IF EXISTS "site_settings_read_all" ON public.site_settings;
CREATE POLICY "site_settings_read_all" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "site_settings_update_admin" ON public.site_settings;
CREATE POLICY "site_settings_update_admin" ON public.site_settings FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager', 'staff')
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager', 'staff')
  )
);

DROP POLICY IF EXISTS "site_settings_insert_admin" ON public.site_settings;
CREATE POLICY "site_settings_insert_admin" ON public.site_settings FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager', 'staff')
  )
);

-- VENUES
DROP POLICY IF EXISTS "venues_read_all" ON public.venues;
CREATE POLICY "venues_read_all" ON public.venues FOR SELECT
USING (is_active = true OR (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
)));

DROP POLICY IF EXISTS "venues_crud_admin" ON public.venues;
CREATE POLICY "venues_crud_admin" ON public.venues FOR ALL
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
  )
);

-- ROOMS
DROP POLICY IF EXISTS "rooms_read_all" ON public.rooms;
CREATE POLICY "rooms_read_all" ON public.rooms FOR SELECT
USING (is_active = true OR (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
)));

DROP POLICY IF EXISTS "rooms_crud_admin" ON public.rooms;
CREATE POLICY "rooms_crud_admin" ON public.rooms FOR ALL
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
  )
);

-- PACKAGES
DROP POLICY IF EXISTS "packages_read_all" ON public.packages;
CREATE POLICY "packages_read_all" ON public.packages FOR SELECT
USING (is_active = true OR (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
)));

DROP POLICY IF EXISTS "packages_crud_admin" ON public.packages;
CREATE POLICY "packages_crud_admin" ON public.packages FOR ALL
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
  )
);

-- SERVICES
DROP POLICY IF EXISTS "services_read_all" ON public.services;
CREATE POLICY "services_read_all" ON public.services FOR SELECT
USING (is_active = true OR (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
)));

DROP POLICY IF EXISTS "services_crud_admin" ON public.services;
CREATE POLICY "services_crud_admin" ON public.services FOR ALL
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
  )
);

-- GALLERY
DROP POLICY IF EXISTS "gallery_read_all" ON public.gallery;
CREATE POLICY "gallery_read_all" ON public.gallery FOR SELECT
USING (is_active = true OR (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
)));

DROP POLICY IF EXISTS "gallery_crud_admin" ON public.gallery;
CREATE POLICY "gallery_crud_admin" ON public.gallery FOR ALL
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
  )
);

-- TESTIMONIALS
DROP POLICY IF EXISTS "testimonials_read_all" ON public.testimonials;
CREATE POLICY "testimonials_read_all" ON public.testimonials FOR SELECT
USING (is_active = true OR (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
)));

DROP POLICY IF EXISTS "testimonials_crud_admin" ON public.testimonials;
CREATE POLICY "testimonials_crud_admin" ON public.testimonials FOR ALL
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
  )
);

-- FAQS
DROP POLICY IF EXISTS "faqs_read_all" ON public.faqs;
CREATE POLICY "faqs_read_all" ON public.faqs FOR SELECT
USING (is_active = true OR (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
)));

DROP POLICY IF EXISTS "faqs_crud_admin" ON public.faqs;
CREATE POLICY "faqs_crud_admin" ON public.faqs FOR ALL
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
  )
);

-- COUPONS
DROP POLICY IF EXISTS "coupons_read_active" ON public.coupons;
CREATE POLICY "coupons_read_active" ON public.coupons FOR SELECT
USING (is_active = true OR (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
)));

DROP POLICY IF EXISTS "coupons_crud_admin" ON public.coupons;
CREATE POLICY "coupons_crud_admin" ON public.coupons FOR ALL
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
  )
);

-- BOOKINGS
DROP POLICY IF EXISTS "bookings_read_all" ON public.bookings;
CREATE POLICY "bookings_read_all" ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "bookings_insert_public" ON public.bookings;
CREATE POLICY "bookings_insert_public" ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "bookings_manage_admin" ON public.bookings;
CREATE POLICY "bookings_manage_admin" ON public.bookings FOR ALL
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')
  )
);

-- ========================================
-- STORAGE BUCKET POLICIES
-- ========================================

-- BRANDING (Public read, Admin write)
DROP POLICY IF EXISTS "branding_read_public" ON storage.objects;
CREATE POLICY "branding_read_public" ON storage.objects FOR SELECT USING (bucket_id = 'branding');

DROP POLICY IF EXISTS "branding_write_admin" ON storage.objects;
CREATE POLICY "branding_write_admin" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'branding' AND auth.uid() IS NOT NULL AND
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff'))
);

DROP POLICY IF EXISTS "branding_update_admin" ON storage.objects;
CREATE POLICY "branding_update_admin" ON storage.objects FOR UPDATE
USING (bucket_id = 'branding' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')))
WITH CHECK (bucket_id = 'branding' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')));

DROP POLICY IF EXISTS "branding_delete_admin" ON storage.objects;
CREATE POLICY "branding_delete_admin" ON storage.objects FOR DELETE
USING (bucket_id = 'branding' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')));

-- BRANDING ACTIONS (Admin only)
DROP POLICY IF EXISTS "branding_actions_admin_only" ON storage.objects;
CREATE POLICY "branding_actions_admin_only" ON storage.objects FOR ALL
USING (bucket_id = 'branding actions' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')))
WITH CHECK (bucket_id = 'branding actions' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')));

-- CONTENT (Public read, Admin write)
DROP POLICY IF EXISTS "content_read_public" ON storage.objects;
CREATE POLICY "content_read_public" ON storage.objects FOR SELECT USING (bucket_id = 'content');

DROP POLICY IF EXISTS "content_write_admin" ON storage.objects;
CREATE POLICY "content_write_admin" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'content' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')));

DROP POLICY IF EXISTS "content_update_admin" ON storage.objects;
CREATE POLICY "content_update_admin" ON storage.objects FOR UPDATE
USING (bucket_id = 'content' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')))
WITH CHECK (bucket_id = 'content' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')));

DROP POLICY IF EXISTS "content_delete_admin" ON storage.objects;
CREATE POLICY "content_delete_admin" ON storage.objects FOR DELETE
USING (bucket_id = 'content' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')));

-- CONTENT ACTIONS (Admin only)
DROP POLICY IF EXISTS "content_actions_admin_only" ON storage.objects;
CREATE POLICY "content_actions_admin_only" ON storage.objects FOR ALL
USING (bucket_id = 'content actions' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')))
WITH CHECK (bucket_id = 'content actions' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')));

-- GALLERY (Public read, Admin write)
DROP POLICY IF EXISTS "gallery_read_public" ON storage.objects;
CREATE POLICY "gallery_read_public" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "gallery_write_admin" ON storage.objects;
CREATE POLICY "gallery_write_admin" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')));

DROP POLICY IF EXISTS "gallery_update_admin" ON storage.objects;
CREATE POLICY "gallery_update_admin" ON storage.objects FOR UPDATE
USING (bucket_id = 'gallery' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')))
WITH CHECK (bucket_id = 'gallery' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')));

DROP POLICY IF EXISTS "gallery_delete_admin" ON storage.objects;
CREATE POLICY "gallery_delete_admin" ON storage.objects FOR DELETE
USING (bucket_id = 'gallery' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')));

-- GALLERY ACTIONS (Admin only)
DROP POLICY IF EXISTS "gallery_actions_admin_only" ON storage.objects;
CREATE POLICY "gallery_actions_admin_only" ON storage.objects FOR ALL
USING (bucket_id = 'gallery actions' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')))
WITH CHECK (bucket_id = 'gallery actions' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')));

-- ROOMS (Public read, Admin write)
DROP POLICY IF EXISTS "rooms_read_public" ON storage.objects;
CREATE POLICY "rooms_read_public" ON storage.objects FOR SELECT USING (bucket_id = 'rooms');

DROP POLICY IF EXISTS "rooms_write_admin" ON storage.objects;
CREATE POLICY "rooms_write_admin" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'rooms' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')));

DROP POLICY IF EXISTS "rooms_update_admin" ON storage.objects;
CREATE POLICY "rooms_update_admin" ON storage.objects FOR UPDATE
USING (bucket_id = 'rooms' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')))
WITH CHECK (bucket_id = 'rooms' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')));

DROP POLICY IF EXISTS "rooms_delete_admin" ON storage.objects;
CREATE POLICY "rooms_delete_admin" ON storage.objects FOR DELETE
USING (bucket_id = 'rooms' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')));

-- ROOMS ACTIONS (Admin only)
DROP POLICY IF EXISTS "rooms_actions_admin_only" ON storage.objects;
CREATE POLICY "rooms_actions_admin_only" ON storage.objects FOR ALL
USING (bucket_id = 'rooms actions' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')))
WITH CHECK (bucket_id = 'rooms actions' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')));

-- VENUES (Public read, Admin write)
DROP POLICY IF EXISTS "venues_read_public" ON storage.objects;
CREATE POLICY "venues_read_public" ON storage.objects FOR SELECT USING (bucket_id = 'venues');

DROP POLICY IF EXISTS "venues_write_admin" ON storage.objects;
CREATE POLICY "venues_write_admin" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'venues' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')));

DROP POLICY IF EXISTS "venues_update_admin" ON storage.objects;
CREATE POLICY "venues_update_admin" ON storage.objects FOR UPDATE
USING (bucket_id = 'venues' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')))
WITH CHECK (bucket_id = 'venues' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')));

DROP POLICY IF EXISTS "venues_delete_admin" ON storage.objects;
CREATE POLICY "venues_delete_admin" ON storage.objects FOR DELETE
USING (bucket_id = 'venues' AND auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','manager','staff')));

-- ========================================
-- INITIAL DATA
-- ========================================

-- Ensure admin profile exists
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, raw_user_meta_data->>'full_name', 'admin'
FROM auth.users
WHERE email = 'altaganigaming@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', full_name = EXCLUDED.full_name, email = EXCLUDED.email;

-- Create default site settings if none exist
INSERT INTO public.site_settings (
  site_name, tagline, description, phone, whatsapp_number, email, address, city, state,
  theme_preset, primary_color, accent_color, background_color, text_color
)
VALUES (
  'Royal Palace Wedding Hall',
  'Luxury Weddings, Perfect Moments',
  'A premium venue for elegant celebrations and unforgettable memories.',
  '+92 300 1234567',
  '+92 300 1234567',
  'hello@royalpalace.com',
  'Main Gulshan Avenue, Lahore',
  'Lahore',
  'Punjab',
  'royal_gold',
  '#D4AF37',
  '#F8E7A1',
  '#F5F1EA',
  '#1A1A1A'
)
ON CONFLICT DO NOTHING;

-- ========================================
-- SCHEMA COMPLETE - READY FOR USE
-- ========================================
