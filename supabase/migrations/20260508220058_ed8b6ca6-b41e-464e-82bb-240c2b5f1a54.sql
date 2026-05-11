
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Properties
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(14,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  location TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqm NUMERIC(10,2),
  property_type TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  featured BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view properties" ON public.properties
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert properties" ON public.properties
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update properties" ON public.properties
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete properties" ON public.properties
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Property Media
CREATE TABLE public.property_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image','video')),
  url TEXT NOT NULL,
  storage_path TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.property_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view media" ON public.property_media
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert media" ON public.property_media
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update media" ON public.property_media
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete media" ON public.property_media
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_properties_updated
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('property-images', 'property-images', true),
  ('property-videos', 'property-videos', true);

CREATE POLICY "Public can view property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Admins can upload property images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update property images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'property-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete property images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'property-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view property videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-videos');

CREATE POLICY "Admins can upload property videos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update property videos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'property-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete property videos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'property-videos' AND public.has_role(auth.uid(), 'admin'));
