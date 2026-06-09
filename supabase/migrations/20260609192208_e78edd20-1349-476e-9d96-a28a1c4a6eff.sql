
-- Profiles: one per user
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  birthday_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX profiles_username_lower_idx ON public.profiles (lower(username));

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- Helper: is today the profile's birthday (month/day match)
CREATE OR REPLACE FUNCTION public.is_birthday_today(_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _profile_id
      AND EXTRACT(MONTH FROM birthday_date) = EXTRACT(MONTH FROM (now() AT TIME ZONE 'UTC'))
      AND EXTRACT(DAY FROM birthday_date) = EXTRACT(DAY FROM (now() AT TIME ZONE 'UTC'))
  );
$$;

-- Wishes
CREATE TABLE public.wishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  message TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX wishes_profile_id_idx ON public.wishes (profile_id);

GRANT SELECT, INSERT ON public.wishes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishes TO authenticated;
GRANT ALL ON public.wishes TO service_role;

ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a wish to any profile
CREATE POLICY "Anyone can submit wishes" ON public.wishes FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Profile owner can always read their wishes; otherwise only on the birthday
CREATE POLICY "Wishes visible to owner anytime, others on birthday" ON public.wishes FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = profile_id)
    OR public.is_birthday_today(profile_id)
  );

-- Birthday taps
CREATE TABLE public.birthday_taps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, visitor_identifier)
);
CREATE INDEX birthday_taps_profile_id_idx ON public.birthday_taps (profile_id);

GRANT SELECT, INSERT ON public.birthday_taps TO anon;
GRANT SELECT, INSERT ON public.birthday_taps TO authenticated;
GRANT ALL ON public.birthday_taps TO service_role;

ALTER TABLE public.birthday_taps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Taps publicly countable" ON public.birthday_taps FOR SELECT USING (true);
-- Only allow taps on the actual birthday
CREATE POLICY "Anyone can tap on birthday" ON public.birthday_taps FOR INSERT TO anon, authenticated
  WITH CHECK (public.is_birthday_today(profile_id));
