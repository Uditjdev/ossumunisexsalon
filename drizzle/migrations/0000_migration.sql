CREATE TYPE public.appointment_status AS ENUM ('pending','confirmed','cancelled','completed');

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  price integer NOT NULL,
  duration_minutes integer NOT NULL,
  image_key text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.stylists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  specialty text NOT NULL,
  experience_years integer NOT NULL DEFAULT 5,
  image_key text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.salon_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  open_time time NOT NULL DEFAULT '10:00',
  close_time time NOT NULL DEFAULT '20:00',
  slot_times text[] NOT NULL DEFAULT ARRAY['10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00'],
  closed_weekdays integer[] NOT NULL DEFAULT ARRAY[]::integer[],
  booking_window_days integer NOT NULL DEFAULT 60,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE NOT NULL,
  stylist_id uuid NOT NULL REFERENCES public.stylists(id),
  service_ids uuid[] NOT NULL,
  service_names text[] NOT NULL,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  total_duration integer NOT NULL,
  total_price integer NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  notes text,
  status public.appointment_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX appointments_no_double_booking ON public.appointments (stylist_id, appointment_date, appointment_time) WHERE status <> 'cancelled';

CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.services, public.stylists, public.salon_settings TO anon, authenticated;
GRANT ALL ON public.services, public.stylists, public.salon_settings, public.appointments, public.contact_submissions TO service_role;
GRANT INSERT ON public.contact_submissions TO anon, authenticated;

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active services" ON public.services FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Public read active stylists" ON public.stylists FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Public read settings" ON public.salon_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can send contact" ON public.contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (
  char_length(name) BETWEEN 2 AND 100 AND char_length(email) <= 255 AND char_length(subject) BETWEEN 2 AND 150 AND char_length(message) BETWEEN 5 AND 2000
);

-- Booked slots (no personal data) for a date
CREATE OR REPLACE FUNCTION public.get_booked_slots(_date date)
RETURNS TABLE(stylist_id uuid, appointment_time text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.stylist_id, a.appointment_time FROM public.appointments a
  WHERE a.appointment_date = _date AND a.status <> 'cancelled';
$$;

CREATE OR REPLACE FUNCTION public.book_appointment(
  _service_ids uuid[], _stylist_id uuid, _date date, _time text,
  _name text, _phone text, _email text, _notes text
) RETURNS TABLE(reference text, stylist_id uuid, stylist_name text, total_price integer, total_duration integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s public.salon_settings;
  v_stylist uuid;
  v_names text[];
  v_price integer;
  v_dur integer;
  v_count integer;
  v_ref text;
  v_today date := (now() AT TIME ZONE 'Asia/Kolkata')::date;
BEGIN
  SELECT * INTO s FROM public.salon_settings WHERE id = 1;
  IF _service_ids IS NULL OR array_length(_service_ids,1) IS NULL OR array_length(_service_ids,1) > 10 THEN
    RAISE EXCEPTION 'Please select at least one service';
  END IF;
  SELECT array_agg(name ORDER BY sort_order), sum(price), sum(duration_minutes), count(*)
    INTO v_names, v_price, v_dur, v_count
    FROM public.services WHERE id = ANY(_service_ids) AND is_active;
  IF v_count <> (SELECT count(DISTINCT x) FROM unnest(_service_ids) x) THEN
    RAISE EXCEPTION 'One or more selected services are unavailable';
  END IF;
  IF _date < v_today OR _date > v_today + s.booking_window_days THEN
    RAISE EXCEPTION 'Please choose a valid date';
  END IF;
  IF EXTRACT(DOW FROM _date)::int = ANY(s.closed_weekdays) THEN
    RAISE EXCEPTION 'The salon is closed on this day';
  END IF;
  IF NOT (_time = ANY(s.slot_times)) THEN RAISE EXCEPTION 'Invalid time slot'; END IF;
  IF _date = v_today AND _time::time <= (now() AT TIME ZONE 'Asia/Kolkata')::time THEN
    RAISE EXCEPTION 'This time slot has already passed';
  END IF;
  IF char_length(trim(coalesce(_name,''))) < 2 OR char_length(_name) > 100 THEN RAISE EXCEPTION 'Invalid name'; END IF;
  IF _phone !~ '^\+?[0-9 ]{10,15}$' THEN RAISE EXCEPTION 'Invalid mobile number'; END IF;
  IF _email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR char_length(_email) > 255 THEN RAISE EXCEPTION 'Invalid email'; END IF;
  IF char_length(coalesce(_notes,'')) > 1000 THEN RAISE EXCEPTION 'Notes are too long'; END IF;

  IF _stylist_id IS NULL THEN
    SELECT st.id INTO v_stylist FROM public.stylists st
      WHERE st.is_active AND NOT EXISTS (
        SELECT 1 FROM public.appointments a WHERE a.stylist_id = st.id
          AND a.appointment_date = _date AND a.appointment_time = _time AND a.status <> 'cancelled')
      ORDER BY random() LIMIT 1;
    IF v_stylist IS NULL THEN RAISE EXCEPTION 'SLOT_TAKEN'; END IF;
  ELSE
    SELECT id INTO v_stylist FROM public.stylists WHERE id = _stylist_id AND is_active;
    IF v_stylist IS NULL THEN RAISE EXCEPTION 'Selected stylist is unavailable'; END IF;
  END IF;

  v_ref := 'AURA-' || upper(substr(md5(gen_random_uuid()::text),1,6));
  BEGIN
    INSERT INTO public.appointments(reference, stylist_id, service_ids, service_names, appointment_date, appointment_time,
      total_duration, total_price, customer_name, customer_phone, customer_email, notes)
    VALUES (v_ref, v_stylist, _service_ids, v_names, _date, _time, v_dur, v_price, trim(_name), trim(_phone), lower(trim(_email)), nullif(trim(coalesce(_notes,'')),''));
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'SLOT_TAKEN';
  END;

  RETURN QUERY SELECT v_ref, v_stylist, (SELECT name FROM public.stylists WHERE id = v_stylist), v_price, v_dur;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_booked_slots(date) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.book_appointment(uuid[], uuid, date, text, text, text, text, text) TO anon, authenticated;

INSERT INTO public.salon_settings(id) VALUES (1);

INSERT INTO public.stylists(name, role, specialty, experience_years, image_key, sort_order) VALUES
('Ananya Kapoor','Creative Director','Precision cuts & balayage',14,'stylist-1',1),
('Rohan Mehra','Senior Stylist','Men''s grooming & fades',10,'stylist-2',2),
('Meera Iyer','Colour Specialist','Global colour & highlights',9,'stylist-3',3),
('Kabir Sethi','Bridal Artist','Bridal & editorial makeup',11,'stylist-4',4);

INSERT INTO public.services(slug,name,category,description,price,duration_minutes,image_key,sort_order) VALUES
('haircut-styling','Haircut & Styling','Hair','A consultation-led cut, finished with a signature blow-dry.',1200,60,'hair-styling',1),
('wash-blow-dry','Hair Wash & Blow Dry','Hair','Luxurious cleanse, scalp massage and a glossy, voluminous finish.',800,45,'hair-styling',2),
('hair-coloring','Hair Coloring','Hair','Rich, dimensional global colour using ammonia-free formulas.',3500,120,'hair-color',3),
('highlights-balayage','Highlights & Balayage','Hair','Hand-painted, sun-kissed dimension tailored to your tone.',5500,180,'hair-color',4),
('keratin','Keratin Treatment','Hair','Frizz-free, smooth and manageable hair for months.',6500,180,'hair-spa',5),
('smoothening','Smoothening','Hair','Sleek, straight texture with lasting shine.',5000,180,'hair-spa',6),
('hair-spa','Hair Spa','Hair','Deep-nourishing ritual with steam and massage.',1800,60,'hair-spa',7),
('hair-treatment','Hair Treatment','Hair','Targeted repair for damage, breakage and scalp health.',2500,60,'hair-spa',8),
('cleanup','Cleanup','Skin & Beauty','A refreshing cleanse and exfoliation for instant radiance.',900,45,'facial',10),
('facial','Facial','Skin & Beauty','Signature hydrating facial for luminous, glowing skin.',2500,75,'facial',11),
('skin-treatment','Skin Treatment','Skin & Beauty','Advanced care for pigmentation, acne and ageing.',3500,60,'facial',12),
('detan','Detan','Skin & Beauty','Gently lifts tan and restores an even tone.',800,30,'facial',13),
('waxing','Waxing','Skin & Beauty','Smooth results with gentle, skin-friendly wax.',600,30,'facial',14),
('threading','Threading','Skin & Beauty','Precise brow and face shaping.',150,15,'facial',15),
('mens-haircut','Men''s Haircut','Men''s Grooming','Sharp, modern cuts and classic fades.',700,45,'mens',20),
('beard-styling','Beard Styling','Men''s Grooming','Sculpted beard shaping with hot towel finish.',500,30,'mens',21),
('mens-coloring','Hair Coloring (Men)','Men''s Grooming','Natural grey coverage and subtle tones.',1500,60,'mens',22),
('head-massage','Head Massage','Men''s Grooming','Relaxing aromatic oil massage to melt away stress.',600,30,'mens',23),
('bridal-makeup','Bridal Makeup','Bridal & Makeup','Flawless, long-wear HD bridal look with trial consultation.',25000,240,'bridal',30),
('party-makeup','Party Makeup','Bridal & Makeup','Glamorous evening looks for every celebration.',4000,90,'bridal',31),
('engagement-makeup','Engagement Makeup','Bridal & Makeup','Soft, radiant makeup for your special day.',12000,150,'bridal',32),
('occasion-hairstyling','Hairstyling','Bridal & Makeup','Elegant updos, braids and occasion styling.',2500,60,'bridal',33);