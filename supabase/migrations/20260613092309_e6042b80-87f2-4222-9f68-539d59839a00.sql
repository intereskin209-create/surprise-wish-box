
-- 1) Profiles: hide birthday year and restrict raw table reads
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON public.profiles;

CREATE POLICY "Owners can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE OR REPLACE VIEW public.profiles_public AS
  SELECT
    id,
    username,
    avatar_url,
    -- normalize year to hide age; preserve month/day for countdown & reveal
    make_date(2000, EXTRACT(MONTH FROM birthday_date)::int, EXTRACT(DAY FROM birthday_date)::int) AS birthday_date,
    created_at
  FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- 2) Birthday taps: stop exposing visitor_identifier
DROP POLICY IF EXISTS "Taps publicly countable" ON public.birthday_taps;

REVOKE SELECT ON public.birthday_taps FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_birthday_tap_count(_profile_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int FROM public.birthday_taps WHERE profile_id = _profile_id;
$$;

CREATE OR REPLACE FUNCTION public.has_visitor_tapped(_profile_id uuid, _visitor text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.birthday_taps
    WHERE profile_id = _profile_id AND visitor_identifier = _visitor
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_birthday_tap_count(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_visitor_tapped(uuid, text) TO anon, authenticated;

-- 3) Storage: require wish-photos uploads to reference a valid profile id
DROP POLICY IF EXISTS "Anyone can upload wish photos" ON storage.objects;

CREATE POLICY "Wish photo uploads must reference a valid profile"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'wish-photos'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id::text = (storage.foldername(name))[1]
    )
  );
