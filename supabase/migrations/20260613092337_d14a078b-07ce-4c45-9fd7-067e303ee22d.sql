
DROP VIEW IF EXISTS public.profiles_public;

CREATE OR REPLACE FUNCTION public.get_public_profile(_username text)
RETURNS TABLE (
  id uuid,
  username text,
  avatar_url text,
  birthday_date date
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    make_date(2000, EXTRACT(MONTH FROM p.birthday_date)::int, EXTRACT(DAY FROM p.birthday_date)::int) AS birthday_date
  FROM public.profiles p
  WHERE p.username ILIKE _username
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile(text) TO anon, authenticated;
