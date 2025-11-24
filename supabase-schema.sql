-- PropertyFinder Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  saved_listings UUID[] DEFAULT '{}',
  auth_provider TEXT DEFAULT 'email',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT FALSE
);

-- Receipts table
CREATE TABLE IF NOT EXISTS public.receipts (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_address TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  transaction_hash TEXT NOT NULL,
  property_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Listings table
CREATE TABLE IF NOT EXISTS public.community_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  state TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT,
  room_type TEXT,
  amenities TEXT[],
  fake_user JSONB,
  state_laws JSONB,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Requests table
CREATE TABLE IF NOT EXISTS public.property_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL,
  property_title TEXT NOT NULL,
  requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  owner_id TEXT,
  owner_name TEXT,
  owner_email TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  response_message TEXT,
  chat_enabled BOOLEAN DEFAULT FALSE,
  chat_room_id TEXT
);

-- Admin Removed Properties table
CREATE TABLE IF NOT EXISTS public.removed_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL,
  property_title TEXT NOT NULL,
  removed_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  removed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON public.receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_property_id ON public.receipts(property_id);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON public.receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_timestamp ON public.receipts(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_community_listings_uploaded_by ON public.community_listings(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_community_listings_state ON public.community_listings(state);
CREATE INDEX IF NOT EXISTS idx_community_listings_price ON public.community_listings(price);

CREATE INDEX IF NOT EXISTS idx_property_requests_requester_id ON public.property_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_property_requests_property_id ON public.property_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_property_requests_status ON public.property_requests(status);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.removed_properties ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Receipts policies
CREATE POLICY "Users can view their own receipts"
  ON public.receipts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own receipts"
  ON public.receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receipts"
  ON public.receipts FOR UPDATE
  USING (auth.uid() = user_id);

-- Community Listings policies
CREATE POLICY "Anyone can view community listings"
  ON public.community_listings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create listings"
  ON public.community_listings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own listings"
  ON public.community_listings FOR UPDATE
  USING (auth.uid() = uploaded_by);

-- Property Requests policies
CREATE POLICY "Users can view their own requests"
  ON public.property_requests FOR SELECT
  USING (auth.uid() = requester_id);

CREATE POLICY "Users can create requests"
  ON public.property_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own requests"
  ON public.property_requests FOR UPDATE
  USING (auth.uid() = requester_id);

-- Removed Properties policies (admin only)
CREATE POLICY "Admins can view removed properties"
  ON public.removed_properties FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can create removed properties"
  ON public.removed_properties FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, auth_provider, created_at, last_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

