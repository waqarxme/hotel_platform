-- ====================================================================
-- HOTEL BOOKING PLATFORM — SUPABASE POSTGRESQL RUNNABLE SCHEMA
-- Designed for Supabase RLS (Row Level Security) with ZERO Service Role Key leaks
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'hotel_owner', 'customer');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE hotel_status AS ENUM ('draft', 'pending_approval', 'approved', 'active', 'rejected', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE cleaning_status AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'hotel_owner',
  phone TEXT,
  avatar_url TEXT,
  hotel_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. HOTELS TABLE
CREATE TABLE IF NOT EXISTS public.hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Pakistan',
  google_maps_url TEXT,
  coordinates JSONB,
  description TEXT NOT NULL,
  total_rooms INTEGER NOT NULL DEFAULT 1,
  category TEXT NOT NULL DEFAULT '4 Star',
  business_license_url TEXT,
  cnic_url TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  gallery_images TEXT[] DEFAULT '{}'::TEXT[],
  amenities TEXT[] DEFAULT '{}'::TEXT[],
  status hotel_status NOT NULL DEFAULT 'pending_approval',
  rejection_reason TEXT,
  admin_notes TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  cleaning_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  eligible_cleanings INTEGER NOT NULL DEFAULT 0,
  used_cleanings INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Deluxe',
  price_per_night NUMERIC(10, 2) NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 2,
  total_units INTEGER NOT NULL DEFAULT 1,
  available_units INTEGER NOT NULL DEFAULT 1,
  amenities TEXT[] DEFAULT '{}'::TEXT[],
  photos TEXT[] DEFAULT '{}'::TEXT[],
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE RESTRICT,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  room_name TEXT,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  guests_count INTEGER NOT NULL DEFAULT 1,
  total_price NUMERIC(10, 2) NOT NULL,
  status booking_status NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CLEANING TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.cleaning_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  leader_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  city TEXT NOT NULL,
  active_assignments INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. CLEANING REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.cleaning_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  hotel_name TEXT NOT NULL,
  room_numbers TEXT NOT NULL,
  requested_date DATE NOT NULL,
  status cleaning_status NOT NULL DEFAULT 'pending',
  assigned_team_id UUID REFERENCES public.cleaning_teams(id) ON DELETE SET NULL,
  special_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. AUDIT LOGS TABLE (Append-Only)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
REVOKE UPDATE, DELETE ON public.audit_logs FROM authenticated, anon;

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_hotels_owner_id ON public.hotels(owner_id);
CREATE INDEX IF NOT EXISTS idx_hotels_status ON public.hotels(status);
CREATE INDEX IF NOT EXISTS idx_hotels_city ON public.hotels(city);
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON public.rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hotel_id ON public.bookings(hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON public.bookings(guest_email);
CREATE INDEX IF NOT EXISTS idx_cleaning_requests_hotel_id ON public.cleaning_requests(hotel_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_requests_status ON public.cleaning_requests(status);
CREATE INDEX IF NOT EXISTS idx_reviews_hotel_id ON public.reviews(hotel_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaning_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaning_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'),
    FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES
DROP POLICY IF EXISTS "Profiles are viewable by self or admin" ON public.profiles;
CREATE POLICY "Profiles are viewable by self or admin" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Profiles updateable by self or admin" ON public.profiles;
CREATE POLICY "Profiles updateable by self or admin" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- HOTELS
DROP POLICY IF EXISTS "Public can view approved hotels" ON public.hotels;
CREATE POLICY "Public can view approved hotels" ON public.hotels
  FOR SELECT USING (
    status IN ('approved', 'active') OR
    owner_id = auth.uid() OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Owners can submit hotel registration" ON public.hotels;
CREATE POLICY "Owners can submit hotel registration" ON public.hotels
  FOR INSERT WITH CHECK (
    owner_id = auth.uid() OR public.is_admin()
  );

DROP POLICY IF EXISTS "Owners and Admin can update hotel" ON public.hotels;
CREATE POLICY "Owners and Admin can update hotel" ON public.hotels
  FOR UPDATE USING (
    owner_id = auth.uid() OR public.is_admin()
  );

-- ROOMS
DROP POLICY IF EXISTS "Public can view active rooms of approved hotels" ON public.rooms;
CREATE POLICY "Public can view active rooms of approved hotels" ON public.rooms
  FOR SELECT USING (
    is_active = TRUE AND EXISTS (
      SELECT 1 FROM public.hotels WHERE id = rooms.hotel_id AND status IN ('approved', 'active')
    ) OR
    EXISTS (
      SELECT 1 FROM public.hotels WHERE id = rooms.hotel_id AND (owner_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Owners and Admin can manage rooms" ON public.rooms;
CREATE POLICY "Owners and Admin can manage rooms" ON public.rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.hotels WHERE id = rooms.hotel_id AND (owner_id = auth.uid() OR public.is_admin())
    )
  );

-- BOOKINGS
DROP POLICY IF EXISTS "Guests and Owners can view their bookings" ON public.bookings;
CREATE POLICY "Guests and Owners can view their bookings" ON public.bookings
  FOR SELECT USING (
    guest_email = (auth.jwt() ->> 'email') OR
    EXISTS (
      SELECT 1 FROM public.hotels WHERE id = bookings.hotel_id AND (owner_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.hotels WHERE id = bookings.hotel_id AND status IN ('approved', 'active')
    )
  );

DROP POLICY IF EXISTS "Owners and Admin can update booking status" ON public.bookings;
CREATE POLICY "Owners and Admin can update booking status" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.hotels WHERE id = bookings.hotel_id AND (owner_id = auth.uid() OR public.is_admin())
    )
  );

-- CLEANING TEAMS
DROP POLICY IF EXISTS "Cleaning teams visible to authenticated users" ON public.cleaning_teams;
CREATE POLICY "Cleaning teams visible to authenticated users" ON public.cleaning_teams
  FOR SELECT TO authenticated USING (TRUE);

DROP POLICY IF EXISTS "Only admin can manage cleaning teams" ON public.cleaning_teams;
CREATE POLICY "Only admin can manage cleaning teams" ON public.cleaning_teams
  FOR ALL USING (public.is_admin());

-- CLEANING REQUESTS
DROP POLICY IF EXISTS "Owners and Admin can view cleaning requests" ON public.cleaning_requests;
CREATE POLICY "Owners and Admin can view cleaning requests" ON public.cleaning_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.hotels WHERE id = cleaning_requests.hotel_id AND (owner_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Owners can submit cleaning requests" ON public.cleaning_requests;
CREATE POLICY "Owners can submit cleaning requests" ON public.cleaning_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.hotels WHERE id = cleaning_requests.hotel_id AND (owner_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Admin can assign cleaning requests" ON public.cleaning_requests;
CREATE POLICY "Admin can assign cleaning requests" ON public.cleaning_requests
  FOR UPDATE USING (public.is_admin());

-- REVIEWS
DROP POLICY IF EXISTS "Public can view reviews of approved hotels" ON public.reviews;
CREATE POLICY "Public can view reviews of approved hotels" ON public.reviews
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Guests can create reviews" ON public.reviews;
CREATE POLICY "Guests can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Owners can respond to reviews" ON public.reviews;
CREATE POLICY "Owners can respond to reviews" ON public.reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.hotels WHERE id = reviews.hotel_id AND (owner_id = auth.uid() OR public.is_admin())
    )
  );

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (
    recipient_id = auth.uid()::text OR
    recipient_id = 'all' OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Users can mark notifications read" ON public.notifications;
CREATE POLICY "Users can mark notifications read" ON public.notifications
  FOR UPDATE USING (
    recipient_id = auth.uid()::text OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admin can dispatch notifications" ON public.notifications;
CREATE POLICY "Admin can dispatch notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());

-- AUDIT LOGS
DROP POLICY IF EXISTS "Only admin can view audit logs" ON public.audit_logs;
CREATE POLICY "Only admin can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can append audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can append audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (TRUE);

-- ====================================================================
-- AUTOMATIC TIMESTAMPS TRIGGER
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_hotels_updated_at ON public.hotels;
CREATE TRIGGER set_hotels_updated_at
BEFORE UPDATE ON public.hotels
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_rooms_updated_at ON public.rooms;
CREATE TRIGGER set_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
