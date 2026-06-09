
-- Make helper SECURITY INVOKER (profiles SELECT is already public)
CREATE OR REPLACE FUNCTION public.is_birthday_today(_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY INVOKER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _profile_id
      AND EXTRACT(MONTH FROM birthday_date) = EXTRACT(MONTH FROM (now() AT TIME ZONE 'UTC'))
      AND EXTRACT(DAY FROM birthday_date) = EXTRACT(DAY FROM (now() AT TIME ZONE 'UTC'))
  );
$$;

-- Replace overly permissive wishes insert policy
DROP POLICY "Anyone can submit wishes" ON public.wishes;
CREATE POLICY "Anyone can submit wishes" ON public.wishes FOR INSERT TO anon, authenticated
  WITH CHECK (
    profile_id IS NOT NULL
    AND length(trim(author_name)) > 0
    AND length(trim(message)) > 0
    AND length(message) <= 2000
  );
