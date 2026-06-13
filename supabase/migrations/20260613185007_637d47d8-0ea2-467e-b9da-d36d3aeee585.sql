CREATE OR REPLACE FUNCTION public.get_public_profile(_username text)
 RETURNS TABLE(id uuid, username text, avatar_url text, birthday_date date)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    make_date(2000, EXTRACT(MONTH FROM p.birthday_date)::int, EXTRACT(DAY FROM p.birthday_date)::int) AS birthday_date
  FROM public.profiles p
  WHERE LOWER(p.username) = LOWER(_username)
  LIMIT 1;
$function$;