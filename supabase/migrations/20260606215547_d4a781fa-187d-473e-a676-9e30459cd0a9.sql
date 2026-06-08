
CREATE TYPE public.app_role AS ENUM ('admin','reseller','customer');
CREATE TYPE public.pkg_type AS ENUM ('data','mins_data');
CREATE TYPE public.pkg_network AS ENUM ('mtn');
CREATE TYPE public.order_status AS ENUM ('pending','processing','delivered','failed');
CREATE TYPE public.topup_status AS ENUM ('pending','credited','rejected');
CREATE TYPE public.tx_type AS ENUM ('credit','debit');
CREATE TYPE public.tx_status AS ENUM ('pending','success','failed');
CREATE TYPE public.withdrawal_status AS ENUM ('pending','accepted','rejected','paid');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text, phone text, email text,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  reseller_id uuid,
  blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role)
$$;
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id,'admin')
$$;

CREATE TABLE public.resellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name text NOT NULL, slug text NOT NULL UNIQUE,
  welcome_message text, whatsapp text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.resellers TO authenticated;
GRANT SELECT ON public.resellers TO anon;
GRANT ALL ON public.resellers TO service_role;
ALTER TABLE public.resellers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  network public.pkg_network NOT NULL DEFAULT 'mtn',
  type public.pkg_type NOT NULL, label text NOT NULL,
  volume_mb integer, minutes integer,
  cost_price numeric(10,2) NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.packages TO authenticated, anon;
GRANT ALL ON public.packages TO service_role;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.reseller_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id uuid NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  price numeric(10,2) NOT NULL, UNIQUE(reseller_id, package_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reseller_prices TO authenticated;
GRANT SELECT ON public.reseller_prices TO anon;
GRANT ALL ON public.reseller_prices TO service_role;
ALTER TABLE public.reseller_prices ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.network_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  network public.pkg_network NOT NULL,
  type public.pkg_type NOT NULL,
  online boolean NOT NULL DEFAULT true,
  UNIQUE(network, type)
);
GRANT SELECT ON public.network_status TO authenticated, anon;
GRANT ALL ON public.network_status TO service_role;
ALTER TABLE public.network_status ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.topups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ref_code text NOT NULL,
  amount numeric(10,2),
  transaction_id text,
  method text NOT NULL DEFAULT 'MoMo',
  status public.topup_status NOT NULL DEFAULT 'pending',
  raw_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_topups_user ON public.topups(user_id, created_at DESC);
CREATE INDEX idx_topups_ref ON public.topups(ref_code);
GRANT SELECT, INSERT ON public.topups TO authenticated;
GRANT ALL ON public.topups TO service_role;
ALTER TABLE public.topups ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.ref_codes (
  code text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ref_codes_user ON public.ref_codes(user_id);
GRANT SELECT, INSERT, UPDATE ON public.ref_codes TO authenticated;
GRANT ALL ON public.ref_codes TO service_role;
ALTER TABLE public.ref_codes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reseller_id uuid REFERENCES public.resellers(id) ON DELETE SET NULL,
  package_id uuid NOT NULL REFERENCES public.packages(id),
  network public.pkg_network NOT NULL,
  phone text NOT NULL,
  amount numeric(10,2) NOT NULL,
  cost_price numeric(10,2) NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_user ON public.orders(user_id, created_at DESC);
CREATE INDEX idx_orders_reseller ON public.orders(reseller_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.tx_type NOT NULL,
  description text NOT NULL,
  amount numeric(10,2) NOT NULL,
  status public.tx_status NOT NULL DEFAULT 'success',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_tx_user ON public.transactions(user_id, created_at DESC);
GRANT SELECT, INSERT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id uuid NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  status public.withdrawal_status NOT NULL DEFAULT 'pending',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.withdrawals TO authenticated;
GRANT ALL ON public.withdrawals TO service_role;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.app_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id=1),
  auto_deliver_enabled boolean NOT NULL DEFAULT false,
  auto_deliver_minutes integer NOT NULL DEFAULT 5,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO authenticated, anon;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.app_settings (id) VALUES (1);

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER t_profiles_uat BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER t_resellers_uat BEFORE UPDATE ON public.resellers FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER t_orders_uat BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER t_withdraw_uat BEFORE UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  is_admin_email boolean;
  rid uuid;
BEGIN
  is_admin_email := (NEW.email = 'donmacdatahub@gmail.com');
  rid := NULLIF(NEW.raw_user_meta_data->>'reseller_id','')::uuid;

  INSERT INTO public.profiles (id, email, full_name, phone, reseller_id)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone', rid);

  IF is_admin_email THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id,'admin') ON CONFLICT DO NOTHING;
  END IF;
  IF NEW.raw_user_meta_data->>'role' = 'reseller' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id,'reseller') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id,'customer') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles admin read" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "profiles reseller read customers" ON public.profiles FOR SELECT TO authenticated USING (
  reseller_id IN (SELECT id FROM public.resellers WHERE user_id = auth.uid())
);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles admin update" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "roles self read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "resellers public read" ON public.resellers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "resellers self insert" ON public.resellers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "resellers self update" ON public.resellers FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "packages read" ON public.packages FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "rp public read" ON public.reseller_prices FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "rp owner write" ON public.reseller_prices FOR ALL TO authenticated
  USING (reseller_id IN (SELECT id FROM public.resellers WHERE user_id = auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (reseller_id IN (SELECT id FROM public.resellers WHERE user_id = auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "ns read" ON public.network_status FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "topups self read" ON public.topups FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "topups self insert" ON public.topups FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "ref self" ON public.ref_codes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ref self insert" ON public.ref_codes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders self read" ON public.orders FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR public.is_admin(auth.uid())
  OR reseller_id IN (SELECT id FROM public.resellers WHERE user_id = auth.uid())
);
CREATE POLICY "orders self insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "orders admin update" ON public.orders FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "tx self read" ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "wd self read" ON public.withdrawals FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "wd self insert" ON public.withdrawals FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "wd admin update" ON public.withdrawals FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "settings read" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings admin write" ON public.app_settings FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

INSERT INTO public.packages (type,label,volume_mb,cost_price,sort_order) VALUES
  ('data','1.7GB',1740,6,1),('data','3.4GB',3481,12,2),('data','5.1GB',5222,18,3),
  ('data','6.8GB',6963,24,4),('data','8.5GB',8704,30,5),('data','10.2GB',10444,36,6),
  ('data','15.3GB',15667,54,7),('data','20.4GB',20889,72,8);

INSERT INTO public.packages (type,label,volume_mb,minutes,cost_price,sort_order) VALUES
  ('mins_data','350mins + 870MB',870,350,20,1),
  ('mins_data','700mins + 1.6GB',1638,700,30,2),
  ('mins_data','1000mins + 2.6GB',2662,1000,40,3),
  ('mins_data','1400mins + 3.5GB',3584,1400,50,4);

INSERT INTO public.network_status (network,type,online) VALUES ('mtn','data',true),('mtn','mins_data',true);
